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
  const progress = await collections.progress.findOne({ userId: req.user.userId }, { projection: { _id: 0 } });
  res.json({ ok: true, progress: progress || { userId: req.user.userId, best: {}, meta: {} } });
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
  const query = {};
  if (req.query.classId) query.classId = String(req.query.classId);

  const progress = await collections.progress
    .find(query, { projection: { _id: 0 } })
    .sort({ classId: 1, seat: 1 })
    .toArray();

  res.json({ ok: true, progress });
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
