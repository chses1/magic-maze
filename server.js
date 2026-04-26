require('dotenv').config();

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = Number(process.env.PORT || 10000);
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const TEACHER_PASSWORD = process.env.TEACHER_PASSWORD;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';
const DB_NAME = process.env.DB_NAME || 'magic_maze';

if (!MONGODB_URI) throw new Error('缺少 MONGODB_URI，請在 .env 或 Render Environment 設定。');
if (!JWT_SECRET) throw new Error('缺少 JWT_SECRET，請在 .env 或 Render Environment 設定。');
if (!TEACHER_PASSWORD) throw new Error('缺少 TEACHER_PASSWORD，請在 .env 或 Render Environment 設定。');

app.use(cors({
  origin(origin, callback) {
    // 允許 Postman / curl / 本機沒有 origin 的測試請求
    if (!origin) return callback(null, true);
    if (FRONTEND_ORIGIN === '*') return callback(null, true);

    const allowed = FRONTEND_ORIGIN.split(',').map(s => s.trim()).filter(Boolean);
    if (allowed.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true
}));
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

function normalizeLevelKey(levelKey) {
  return String(levelKey || '').trim();
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
          classId: normalized.classId,
          seat: normalized.seat,
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
  res.json({ ok: true, service: 'magic-maze-backend', message: '後端 API 正常運作。遊戲前端請使用 GitHub Pages 開啟。', endpoints: ['GET /api/health','POST /api/auth/student','POST /api/auth/teacher','GET /api/progress/me','PUT /api/progress/level','GET /api/leaderboard','GET /api/teacher/progress'] });
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

app.post('/api/auth/teacher', async (req, res) => {
  const teacherCode = String(req.body.teacherCode || '');
  if (teacherCode !== TEACHER_PASSWORD) {
    return res.status(401).json({ ok: false, message: '教師密碼錯誤。' });
  }

  const user = { role: 'teacher', userId: 'teacher', name: '教師' };
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
      classId: req.user.classId,
      seat: req.user.seat,
      meta: {},
      createdAt: now()
    },
    $set: { updatedAt: now() }
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
    leaderboard: db.collection('leaderboard')
  };

  await collections.users.createIndex({ userId: 1 }, { unique: true });
  await collections.progress.createIndex({ userId: 1 }, { unique: true });
  await collections.progress.createIndex({ classId: 1, seat: 1 });
  await collections.leaderboard.createIndex({ userId: 1, levelKey: 1 }, { unique: true });
  await collections.leaderboard.createIndex({ classId: 1, levelKey: 1, score: -1, steps: 1 });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Magic Maze backend running on port ${PORT}`);
  });
}

start().catch(err => {
  console.error('Backend start failed:', err);
  process.exit(1);
});
