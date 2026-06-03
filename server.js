require('dotenv').config();

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = Number(process.env.PORT || 10000);
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const TEACHER_PASSWORD = process.env.TEACHER_PASSWORD;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';
const DB_NAME = process.env.DB_NAME || 'magic_maze';
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'magic-maze-39321';
const TEACHER_EMAILS = process.env.TEACHER_EMAILS || 'cairo1680@apps.chses.tyc.edu.tw';

if (!MONGODB_URI) throw new Error('缺少 MONGODB_URI，請在 .env 或 Render Environment 設定。');
if (!JWT_SECRET) throw new Error('缺少 JWT_SECRET，請在 .env 或 Render Environment 設定。');
if (!TEACHER_PASSWORD) throw new Error('缺少 TEACHER_PASSWORD，請在 .env 或 Render Environment 設定。');

const teacherEmailSet = new Set(
  TEACHER_EMAILS
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean)
);

function isAllowedOrigin(origin) {
  // 沒有 origin 的請求通常是 Render 健康檢查、瀏覽器直接開 API、Postman 或 curl。
  if (!origin) return true;

  // 教學部署階段先採寬鬆策略，避免 GitHub Pages 網址少打一個斜線或換 repo 名就被 CORS 擋住。
  if (FRONTEND_ORIGIN === '*') return true;

  const allowed = FRONTEND_ORIGIN.split(',').map(s => s.trim()).filter(Boolean);
  if (allowed.includes(origin)) return true;

  try {
    const url = new URL(origin);
    const host = url.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1') return true;
    if (host.endsWith('.github.io')) return true;
    if (host.endsWith('.onrender.com')) return true;
  } catch (_err) {}

  return false;
}

app.use(cors({
  origin(origin, callback) {
    // 重要：不要 callback(new Error)，否則前端只會看到「後端未啟動」，很難判斷。
    callback(null, isAllowedOrigin(origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
app.use(express.json({ limit: '1mb' }));

let db;
let collections;

function now() {
  return new Date();
}

function createToken(user) {
  return jwt.sign(
    {
      role: user.role,
      userId: user.userId,
      classId: user.classId || '',
      seat: user.seat || '',
      character: user.character || ''
    },
    JWT_SECRET,
    { expiresIn: '14d' }
  );
}

function publicUser(user) {
  return {
    role: user.role,
    userId: user.userId,
    classId: user.classId || '',
    seat: user.seat || '',
    name: user.name || '',
    character: user.character || 'boy',
    loginAt: Date.now()
  };
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ ok: false, message: '尚未登入。' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (err) {
    return res.status(401).json({ ok: false, message: '登入已過期，請重新登入。' });
  }
}

function requireTeacher(req, res, next) {
  if (req.user?.role !== 'teacher') {
    return res.status(403).json({ ok: false, message: '需要教師權限。' });
  }
  return next();
}

function normalizeStudentId(studentId) {
  const uid = String(studentId || '').trim();
  if (!/^\d{5}$/.test(uid)) return null;
  return uid;
}

function publicGoogleProfile(payload = {}) {
  return {
    googleSub: String(payload.uid || payload.sub || ''),
    email: String(payload.email || '').trim().toLowerCase(),
    emailVerified: payload.email_verified === true,
    displayName: String(payload.name || ''),
    picture: String(payload.picture || '')
  };
}

let firebaseCertCache = { expiresAt: 0, certs: {} };

function decodeBase64UrlJson(value) {
  const text = Buffer.from(String(value || ''), 'base64url').toString('utf8');
  return JSON.parse(text);
}

async function getFirebaseCerts() {
  if (firebaseCertCache.expiresAt > Date.now() && Object.keys(firebaseCertCache.certs).length) {
    return firebaseCertCache.certs;
  }

  const res = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
  if (!res.ok) throw new Error('無法取得 Firebase 驗證公鑰。');

  const certs = await res.json();
  const cacheControl = String(res.headers.get('cache-control') || '');
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const maxAgeMs = maxAgeMatch ? Number(maxAgeMatch[1]) * 1000 : 60 * 60 * 1000;
  firebaseCertCache = { expiresAt: Date.now() + maxAgeMs, certs };
  return certs;
}

async function verifyGoogleIdToken(idToken) {
  const token = String(idToken || '').trim();
  if (!token) throw new Error('缺少 Firebase 登入憑證。');

  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Firebase 登入憑證格式錯誤。');

  let header;
  let payload;
  try {
    header = decodeBase64UrlJson(parts[0]);
    payload = decodeBase64UrlJson(parts[1]);
  } catch (_err) {
    throw new Error('Firebase 登入憑證內容無法解析。');
  }

  if (header.alg !== 'RS256') throw new Error('Firebase 登入憑證演算法不正確。');
  if (!header.kid) throw new Error('Firebase 登入憑證缺少 key id。');

  const certs = await getFirebaseCerts();
  const cert = certs[header.kid];
  if (!cert) throw new Error('找不到 Firebase 登入憑證對應的公鑰。');

  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(`${parts[0]}.${parts[1]}`);
  verifier.end();
  const signatureOk = verifier.verify(cert, parts[2], 'base64url');
  if (!signatureOk) throw new Error('Firebase 登入憑證簽章驗證失敗。');

  const nowSec = Math.floor(Date.now() / 1000);
  const expectedIssuer = `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`;
  if (payload.aud !== FIREBASE_PROJECT_ID) throw new Error('Firebase 專案 ID 不符合。');
  if (payload.iss !== expectedIssuer) throw new Error('Firebase 登入憑證發行者不符合。');
  if (!payload.sub) throw new Error('Firebase 登入憑證缺少使用者 ID。');
  if (Number(payload.exp || 0) <= nowSec) throw new Error('Firebase 登入已過期，請重新登入。');
  if (Number(payload.iat || 0) > nowSec + 300) throw new Error('Firebase 登入憑證時間不正確。');

  const profile = publicGoogleProfile({ ...payload, uid: payload.sub });

  if (!profile.googleSub || !profile.email) throw new Error('Firebase 帳號資料不完整。');
  if (!profile.emailVerified) throw new Error('Firebase 信箱尚未驗證。');
  return profile;
}

function requireTeacherEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  return normalized && teacherEmailSet.has(normalized);
}

function normalizeLevelKey(levelKey) {
  return String(levelKey || '').trim();
}

function normalizeOpenWorldMax(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return 0;
  if (n <= 0) return 0;
  return Math.max(1, Math.min(4, Math.floor(n)));
}

function publicClassSettings(item = {}, classId = '') {
  const cid = String(item.classId || classId || '').trim();
  return {
    classId: cid,
    openWorldMax: normalizeOpenWorldMax(item.openWorldMax),
    mode: normalizeOpenWorldMax(item.openWorldMax) > 0 ? 'teacher' : 'progress',
    updatedAt: item.updatedAt || null
  };
}

function sanitizeRecord(record = {}) {
  return {
    score: Number(record.score || 0),
    stars: Number(record.stars || 0),
    steps: Number(record.steps || 0),
    timeMs: Number(record.timeMs || 0),
    updatedAt: now()
  };
}

function isBetterRecord(prev, next) {
  if (!prev) return true;
  if (Number(next.score || 0) > Number(prev.score || 0)) return true;
  if (Number(next.score || 0) === Number(prev.score || 0)) {
    const prevSteps = Number(prev.steps || 999999);
    const nextSteps = Number(next.steps || 999999);
    return nextSteps < prevSteps;
  }
  return false;
}


function normalizePublicProgressDoc(item = {}) {
  const userId = String(item.userId || item.studentId || '').trim();
  if (!/^\d{5}$/.test(userId)) return null;
  return {
    ...item,
    userId,
    classId: String(item.classId || userId.slice(0, 3)),
    seat: String(item.seat || userId.slice(3, 5)),
    best: (item.best && typeof item.best === 'object') ? item.best : {},
    meta: (item.meta && typeof item.meta === 'object') ? item.meta : {}
  };
}

function leaderboardRecordToProgressRecord(item = {}) {
  return {
    score: Number(item.score || 0),
    stars: Number(item.stars || 0),
    steps: Number(item.steps || 0),
    timeMs: Number(item.timeMs || 0),
    updatedAt: item.at || item.updatedAt || now()
  };
}

function buildBestFromLeaderboardItems(items = []) {
  const best = {};
  for (const item of Array.isArray(items) ? items : []) {
    const levelKey = normalizeLevelKey(item.levelKey);
    if (!levelKey) continue;
    const record = leaderboardRecordToProgressRecord(item);
    if (isBetterRecord(best[levelKey], record)) best[levelKey] = record;
  }
  return best;
}

async function mergeLeaderboardIntoProgressDoc(doc = {}) {
  const normalized = normalizePublicProgressDoc(doc);
  if (!normalized) return null;

  const boardItems = await collections.leaderboard
    .find({ userId: normalized.userId }, { projection: { _id: 0 } })
    .toArray();

  if (!boardItems.length) return normalized;

  const boardBest = buildBestFromLeaderboardItems(boardItems);
  const mergedBest = { ...(normalized.best || {}) };
  const setPatch = {};

  for (const [levelKey, record] of Object.entries(boardBest)) {
    const prev = mergedBest[levelKey];
    if (!prev || isBetterRecord(prev, record)) {
      mergedBest[levelKey] = record;
      setPatch[`best.${levelKey}`] = record;
    }
  }

  if (Object.keys(setPatch).length > 0) {
    await collections.progress.updateOne(
      { userId: normalized.userId },
      {
        $setOnInsert: {
          userId: normalized.userId,
          meta: {},
          createdAt: now()
        },
        $set: {
          ...setPatch,
          classId: normalized.classId,
          seat: normalized.seat,
          updatedAt: now()
        }
      },
      { upsert: true }
    );
  }

  return { ...normalized, best: mergedBest };
}

function buildClassQuery(classId) {
  if (!classId) return {};
  return {
    $or: [
      { classId },
      { userId: { $regex: `^${classId}` } },
      { studentId: { $regex: `^${classId}` } }
    ]
  };
}

// ✅ Render 根網址測試頁：直接點 Render 網址時會看到這裡
app.get('/', (req, res) => {
  res.type('html').send(`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>Magic Maze Backend</title><style>body{font-family:system-ui,-apple-system,"Noto Sans TC",sans-serif;background:#0b1020;color:#e7ecff;padding:32px;line-height:1.7}.card{max-width:760px;margin:auto;background:#111a33;border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:24px;box-shadow:0 16px 40px rgba(0,0,0,.35)}code{background:rgba(255,255,255,.08);padding:3px 6px;border-radius:6px}a{color:#31d0ff}</style></head><body><div class="card"><h1>✅ 程式迷宮後端已啟動</h1><p>這個 Render 網址是後端 API，不是遊戲前端首頁。</p><p>請用 GitHub Pages 開啟遊戲前端；後端只負責登入、成績、排行榜與 MongoDB 存取。</p><p>健康檢查：<a href="/api/health"><code>/api/health</code></a></p></div></body></html>`);
});

// ✅ API 路由清單，方便老師檢查後端功能
app.get('/api', (req, res) => {
  res.json({ ok: true, service: 'magic-maze-backend', message: '後端 API 正常運作。遊戲前端請使用 GitHub Pages 開啟。', endpoints: ['GET /api/health','GET /api/config','POST /api/auth/student','POST /api/auth/teacher','POST /api/auth/google/lobby','POST /api/auth/google/student','POST /api/auth/google/teacher','GET /api/progress/me','GET /api/progress/class','PUT /api/progress/level','GET /api/leaderboard','GET /api/teacher/progress'] });
});

app.get('/api/config', (req, res) => {
  res.json({
    ok: true,
    firebaseProjectId: FIREBASE_PROJECT_ID,
    googleAuthEnabled: true,
    teacherGoogleAuthEnabled: teacherEmailSet.size > 0
  });
});

app.get('/api/health', async (req, res) => {
  try {
    await db.command({ ping: 1 });
    res.json({ ok: true, service: 'magic-maze-backend', db: 'connected', at: now() });
  } catch (err) {
    res.status(500).json({ ok: false, message: '資料庫連線失敗。' });
  }
});

app.post('/api/auth/student', async (req, res) => {
  const studentId = normalizeStudentId(req.body.studentId);
  if (!studentId) return res.status(400).json({ ok: false, message: '學生代碼必須是 5 碼數字，例如 30105。' });

  const character = ['boy', 'girl'].includes(String(req.body.character || '').trim())
    ? String(req.body.character).trim()
    : 'boy';

  const user = {
    role: 'student',
    userId: studentId,
    classId: studentId.slice(0, 3),
    seat: studentId.slice(3, 5),
    name: '',
    character,
    updatedAt: now(),
    createdAt: now()
  };

  await collections.users.updateOne(
    { userId: studentId },
    {
      $set: {
        role: 'student',
        classId: user.classId,
        seat: user.seat,
        character,
        updatedAt: now()
      },
      $setOnInsert: { userId: studentId, name: '', createdAt: now() }
    },
    { upsert: true }
  );

  await collections.progress.updateOne(
    { userId: studentId },
    { $setOnInsert: { userId: studentId, classId: user.classId, seat: user.seat, best: {}, meta: {}, createdAt: now() } },
    { upsert: true }
  );

  res.json({ ok: true, token: createToken(user), user: publicUser(user) });
});

app.post('/api/auth/google/lobby', async (req, res) => {
  let profile;
  try {
    profile = await verifyGoogleIdToken(req.body.idToken);
  } catch (err) {
    return res.status(401).json({ ok: false, message: err.message || 'Google 登入驗證失敗。' });
  }

  if (requireTeacherEmail(profile.email)) {
    const user = { role: 'teacher', userId: 'teacher', name: '教師' };
    return res.json({ ok: true, status: 'authenticated', token: createToken(user), user: publicUser(user) });
  }

  const existingByGoogle = await collections.users.findOne({ googleSub: profile.googleSub, role: 'student' });
  if (!existingByGoogle) {
    return res.json({ ok: true, status: 'needsStudentSetup', role: 'student' });
  }

  const userId = normalizeStudentId(existingByGoogle.userId);
  if (!userId) {
    return res.status(409).json({ ok: false, message: '這個 Google 帳號的學生資料不完整，請聯絡老師處理。' });
  }

  const user = {
    role: 'student',
    userId,
    classId: existingByGoogle.classId || userId.slice(0, 3),
    seat: existingByGoogle.seat || userId.slice(3, 5),
    name: existingByGoogle.name || '',
    character: existingByGoogle.character || 'boy'
  };

  await collections.progress.updateOne(
    { userId },
    {
      $set: {
        classId: user.classId,
        seat: user.seat,
        updatedAt: now()
      },
      $setOnInsert: { userId, best: {}, meta: {}, createdAt: now() }
    },
    { upsert: true }
  );

  res.json({ ok: true, status: 'authenticated', token: createToken(user), user: publicUser(user) });
});

app.post('/api/auth/google/student', async (req, res) => {
  let profile;
  try {
    profile = await verifyGoogleIdToken(req.body.idToken);
  } catch (err) {
    return res.status(401).json({ ok: false, message: err.message || 'Google 登入驗證失敗。' });
  }

  const requestedStudentId = normalizeStudentId(req.body.studentId);
  const existingByGoogle = await collections.users.findOne({ googleSub: profile.googleSub, role: 'student' });
  const studentId = existingByGoogle?.userId || requestedStudentId;

  if (!studentId) {
    return res.status(400).json({ ok: false, message: '第一次使用 Google 登入時，請輸入 5 碼班級座號。' });
  }

  if (existingByGoogle && requestedStudentId && requestedStudentId !== existingByGoogle.userId) {
    return res.status(409).json({ ok: false, message: `這個 Google 帳號已綁定 ${existingByGoogle.userId}，請使用原本的班級座號。` });
  }

  const existingByStudentId = await collections.users.findOne({ userId: studentId, role: 'student' });
  if (existingByStudentId?.googleSub && existingByStudentId.googleSub !== profile.googleSub) {
    return res.status(409).json({ ok: false, message: '這個班級座號已綁定其他 Google 帳號，請聯絡老師處理。' });
  }

  const character = ['boy', 'girl'].includes(String(req.body.character || existingByStudentId?.character || '').trim())
    ? String(req.body.character || existingByStudentId.character).trim()
    : 'boy';

  const user = {
    role: 'student',
    userId: studentId,
    classId: studentId.slice(0, 3),
    seat: studentId.slice(3, 5),
    name: existingByStudentId?.name || profile.displayName || '',
    character,
    email: profile.email,
    googleSub: profile.googleSub,
    displayName: profile.displayName,
    picture: profile.picture,
    updatedAt: now(),
    createdAt: existingByStudentId?.createdAt || now()
  };

  await collections.users.updateOne(
    { userId: studentId },
    {
      $set: {
        role: 'student',
        classId: user.classId,
        seat: user.seat,
        character,
        email: profile.email,
        googleSub: profile.googleSub,
        displayName: profile.displayName,
        picture: profile.picture,
        updatedAt: now()
      },
      $setOnInsert: { userId: studentId, name: user.name, createdAt: now() }
    },
    { upsert: true }
  );

  await collections.progress.updateOne(
    { userId: studentId },
    {
      $set: {
        classId: user.classId,
        seat: user.seat,
        updatedAt: now()
      },
      $setOnInsert: { userId: studentId, best: {}, meta: {}, createdAt: now() }
    },
    { upsert: true }
  );

  res.json({ ok: true, token: createToken(user), user: publicUser(user), linkedExistingStudent: !!existingByGoogle });
});

app.post('/api/auth/teacher', async (req, res) => {
  const teacherCode = String(req.body.teacherCode || '');
  if (teacherCode !== TEACHER_PASSWORD) {
    return res.status(401).json({ ok: false, message: '教師密碼錯誤。' });
  }

  const user = { role: 'teacher', userId: 'teacher', name: '教師' };
  res.json({ ok: true, token: createToken(user), user: publicUser(user) });
});

app.post('/api/auth/google/teacher', async (req, res) => {
  let profile;
  try {
    profile = await verifyGoogleIdToken(req.body.idToken);
  } catch (err) {
    return res.status(401).json({ ok: false, message: err.message || 'Google 登入驗證失敗。' });
  }

  if (!requireTeacherEmail(profile.email)) {
    return res.status(403).json({ ok: false, message: '這個 Google 帳號不在教師白名單內。' });
  }

  const user = {
    role: 'teacher',
    userId: 'teacher',
    name: '教師'
  };

  res.json({ ok: true, token: createToken(user), user: publicUser(user) });
});

app.get('/api/me', requireAuth, (req, res) => {
  res.json({ ok: true, user: publicUser(req.user) });
});

app.get('/api/progress/me', requireAuth, async (req, res) => {
  if (req.user.role !== 'student') return res.json({ ok: true, progress: { best: {}, meta: {} } });

  const fallback = {
    userId: req.user.userId,
    classId: req.user.classId || String(req.user.userId).slice(0, 3),
    seat: req.user.seat || String(req.user.userId).slice(3, 5),
    best: {},
    meta: {}
  };

  const progress = await collections.progress.findOne({ userId: req.user.userId }, { projection: { _id: 0 } });
  const merged = await mergeLeaderboardIntoProgressDoc(progress || fallback);
  res.json({ ok: true, progress: merged || fallback });
});

// ✅ 學生首頁「本班闖關總覽」使用：只允許學生讀取自己班級的進度。
app.get('/api/progress/class', requireAuth, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ ok: false, message: '只有學生可以讀取本班進度。' });
  }

  const userId = normalizeStudentId(req.user.userId);
  const classId = String(req.user.classId || userId?.slice(0, 3) || '').trim();
  if (!userId || !/^\d{3}$/.test(classId)) {
    return res.status(400).json({ ok: false, message: '找不到學生班級資料，請重新登入。' });
  }

  const query = buildClassQuery(classId);
  const [progressDocs, userDocs] = await Promise.all([
    collections.progress.find(query, { projection: { _id: 0 } }).sort({ classId: 1, seat: 1, userId: 1 }).toArray(),
    collections.users.find({ ...query, role: 'student' }, { projection: { _id: 0 } }).sort({ classId: 1, seat: 1, userId: 1 }).toArray()
  ]);

  const byUser = new Map();
  for (const doc of progressDocs) {
    const normalized = normalizePublicProgressDoc(doc);
    if (normalized && normalized.classId === classId) byUser.set(normalized.userId, normalized);
  }

  for (const user of userDocs) {
    const normalized = normalizePublicProgressDoc({
      userId: user.userId,
      classId: user.classId,
      seat: user.seat,
      best: {},
      meta: {},
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
    if (normalized && normalized.classId === classId && !byUser.has(normalized.userId)) byUser.set(normalized.userId, normalized);
  }

  if (!byUser.has(userId)) {
    byUser.set(userId, { userId, classId, seat: String(req.user.seat || userId.slice(3, 5)), best: {}, meta: {} });
  }

  const normalized = (await Promise.all([...byUser.values()].map(item => mergeLeaderboardIntoProgressDoc(item))))
    .filter(Boolean)
    .filter(item => String(item.classId || '') === classId)
    .sort((a, b) => String(a.seat || '').localeCompare(String(b.seat || '')) || String(a.userId || '').localeCompare(String(b.userId || '')));

  const settingsDoc = await collections.classSettings.findOne({ classId }, { projection: { _id: 0 } });
  res.json({ ok: true, classId, count: normalized.length, progress: normalized, classSettings: publicClassSettings(settingsDoc || {}, classId) });
});

app.put('/api/progress/level', requireAuth, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ ok: false, message: '只有學生可寫入關卡成績。' });

  const levelKey = normalizeLevelKey(req.body.levelKey);
  if (!levelKey) return res.status(400).json({ ok: false, message: '缺少 levelKey。' });

  const record = sanitizeRecord(req.body.record || {});
  const current = await collections.progress.findOne({ userId: req.user.userId });
  const prev = current?.best?.[levelKey] || null;
  const shouldUpdate = isBetterRecord(prev, record);

  const update = {
    $setOnInsert: {
      userId: req.user.userId,
      createdAt: now()
    },
    $set: {
      classId: req.user.classId,
      seat: req.user.seat,
      updatedAt: now()
    }
  };

  if (shouldUpdate) {
    update.$set[`best.${levelKey}`] = record;
    await collections.leaderboard.updateOne(
      { userId: req.user.userId, levelKey },
      {
        $set: {
          userId: req.user.userId,
          classId: req.user.classId,
          seat: req.user.seat,
          name: req.user.name || `學生${req.user.seat}`,
          levelKey,
          score: record.score,
          stars: record.stars,
          steps: record.steps,
          timeMs: record.timeMs,
          at: now()
        }
      },
      { upsert: true }
    );
  }

  if (req.body.meta && typeof req.body.meta === 'object') {
    update.$set.meta = req.body.meta;
  }

  await collections.progress.updateOne({ userId: req.user.userId }, update, { upsert: true });
  const progress = await collections.progress.findOne({ userId: req.user.userId }, { projection: { _id: 0 } });

  res.json({ ok: true, updated: shouldUpdate, progress });
});

app.get('/api/leaderboard', requireAuth, async (req, res) => {
  const query = {};
  if (req.query.classId) query.classId = String(req.query.classId);
  if (req.query.levelKey) query.levelKey = String(req.query.levelKey);

  const list = await collections.leaderboard
    .find(query, { projection: { _id: 0 } })
    .sort({ score: -1, steps: 1, timeMs: 1 })
    .limit(200)
    .toArray();

  res.json({ ok: true, leaderboard: list });
});

app.get('/api/teacher/classes', requireAuth, requireTeacher, async (req, res) => {
  const [progressClasses, userClasses] = await Promise.all([
    collections.progress.distinct('classId'),
    collections.users.distinct('classId', { role: 'student' })
  ]);

  const classIds = [...new Set([...(progressClasses || []), ...(userClasses || [])]
    .map(classId => String(classId || '').trim())
    .filter(classId => /^\d{3}$/.test(classId)))]
    .sort((a, b) => a.localeCompare(b));

  res.json({ ok: true, classIds });
});

app.get('/api/teacher/class-settings/:classId', requireAuth, requireTeacher, async (req, res) => {
  const classId = String(req.params.classId || '').trim();
  if (!/^\d{3}$/.test(classId)) return res.status(400).json({ ok: false, message: '班級代碼必須是 3 碼數字。' });

  const settings = await collections.classSettings.findOne({ classId }, { projection: { _id: 0 } });
  res.json({ ok: true, settings: publicClassSettings(settings || {}, classId) });
});

app.put('/api/teacher/class-settings/:classId', requireAuth, requireTeacher, async (req, res) => {
  const classId = String(req.params.classId || '').trim();
  if (!/^\d{3}$/.test(classId)) return res.status(400).json({ ok: false, message: '班級代碼必須是 3 碼數字。' });

  const openWorldMax = normalizeOpenWorldMax(req.body.openWorldMax);
  const next = {
    classId,
    openWorldMax,
    mode: openWorldMax > 0 ? 'teacher' : 'progress',
    updatedAt: now()
  };

  await collections.classSettings.updateOne(
    { classId },
    { $set: next, $setOnInsert: { createdAt: now() } },
    { upsert: true }
  );

  res.json({ ok: true, settings: publicClassSettings(next, classId) });
});

app.get('/api/teacher/progress', requireAuth, requireTeacher, async (req, res) => {
  const classId = String(req.query.classId || '').trim();
  const query = buildClassQuery(classId);

  const [progressDocs, userDocs] = await Promise.all([
    collections.progress
      .find(query, { projection: { _id: 0 } })
      .sort({ classId: 1, seat: 1, userId: 1 })
      .toArray(),
    collections.users
      .find({ ...query, role: 'student' }, { projection: { _id: 0 } })
      .sort({ classId: 1, seat: 1, userId: 1 })
      .toArray()
  ]);

  // ✅ 教師後台以 progress.best 為主，但舊資料可能只寫進 leaderboard。
  // 這裡會把 users、progress、leaderboard 三邊資料合併，並自動回補 progress.best。
  const byUser = new Map();

  for (const doc of progressDocs) {
    const normalized = normalizePublicProgressDoc(doc);
    if (normalized) byUser.set(normalized.userId, normalized);
  }

  for (const user of userDocs) {
    const normalized = normalizePublicProgressDoc({
      userId: user.userId,
      classId: user.classId,
      seat: user.seat,
      best: {},
      meta: {},
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
    if (normalized && !byUser.has(normalized.userId)) byUser.set(normalized.userId, normalized);
  }

  const normalized = (await Promise.all(
    [...byUser.values()].map(item => mergeLeaderboardIntoProgressDoc(item))
  ))
    .filter(Boolean)
    .sort((a, b) => {
      const ac = String(a.classId || '').localeCompare(String(b.classId || ''));
      if (ac) return ac;
      const as = String(a.seat || '').localeCompare(String(b.seat || ''));
      if (as) return as;
      return String(a.userId || '').localeCompare(String(b.userId || ''));
    });

  res.json({ ok: true, count: normalized.length, progress: normalized });
});

app.delete('/api/teacher/student/:userId', requireAuth, requireTeacher, async (req, res) => {
  const userId = normalizeStudentId(req.params.userId);
  if (!userId) return res.status(400).json({ ok: false, message: '學生代碼格式錯誤。' });

  await collections.progress.deleteOne({ userId });
  await collections.leaderboard.deleteMany({ userId });
  await collections.users.deleteOne({ userId });
  res.json({ ok: true, deletedUserId: userId });
});

app.delete('/api/teacher/class/:classId', requireAuth, requireTeacher, async (req, res) => {
  const classId = String(req.params.classId || '').trim();
  if (!/^\d{3}$/.test(classId)) return res.status(400).json({ ok: false, message: '班級代碼必須是 3 碼數字。' });

  const progressResult = await collections.progress.deleteMany({ classId });
  const boardResult = await collections.leaderboard.deleteMany({ classId });
  const userResult = await collections.users.deleteMany({ classId });

  res.json({
    ok: true,
    classId,
    deleted: {
      progress: progressResult.deletedCount,
      leaderboard: boardResult.deletedCount,
      users: userResult.deletedCount
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ ok: false, message: '伺服器發生錯誤。' });
});

async function start() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db(DB_NAME);
  collections = {
    users: db.collection('users'),
    progress: db.collection('progress'),
    leaderboard: db.collection('leaderboard'),
    classSettings: db.collection('classSettings')
  };

  async function ensureIndex(collection, keys, options = {}) {
    try {
      await collection.createIndex(keys, options);
    } catch (err) {
      // 若 MongoDB 內已有舊索引或重複資料，不能讓整個 Render 服務直接掛掉。
      console.warn('Index creation skipped:', keys, err.message);
    }
  }

  await ensureIndex(collections.users, { userId: 1 }, { unique: true });
  await ensureIndex(collections.users, { googleSub: 1 });
  await ensureIndex(collections.users, { email: 1 });
  await ensureIndex(collections.progress, { userId: 1 }, { unique: true });
  await ensureIndex(collections.progress, { classId: 1, seat: 1 });
  await ensureIndex(collections.leaderboard, { userId: 1, levelKey: 1 }, { unique: true });
  await ensureIndex(collections.leaderboard, { classId: 1, levelKey: 1, score: -1, steps: 1 });
  await ensureIndex(collections.classSettings, { classId: 1 }, { unique: true });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Magic Maze backend running on port ${PORT}`);
  });
}

start().catch(err => {
  console.error('Backend start failed:', err);
  process.exit(1);
});
