# 魔法迷宮後端 API（MongoDB + Render）

這是一個第一階段可部署版本，用來把教師密碼、學生進度、排行榜從前端 localStorage 移到後端資料庫。

## 本機測試

```bash
cd backend
npm install
cp .env.example .env
# 修改 .env 裡的 MONGODB_URI、JWT_SECRET、TEACHER_PASSWORD、FRONTEND_ORIGIN
npm run dev
```

打開：

```text
http://localhost:10000/api/health
```

看到 `{ "ok": true }` 表示 API 和 MongoDB 都有連線成功。

## Render 設定

建立 Web Service 時：

- Language: Node
- Build Command: `npm install`
- Start Command: `npm start`
- Root Directory: `backend`

Environment Variables：

- `MONGODB_URI`
- `JWT_SECRET`
- `TEACHER_PASSWORD`
- `FRONTEND_ORIGIN`
- `DB_NAME`，可不填，預設 `magic_maze`

## 主要 API

### 健康檢查

`GET /api/health`

### 學生登入

`POST /api/auth/student`

```json
{
  "studentId": "30105",
  "character": "boy"
}
```

### 教師登入

`POST /api/auth/teacher`

```json
{
  "teacherCode": "老師密碼"
}
```

### 讀取學生自己的進度

`GET /api/progress/me`

Header：

```text
Authorization: Bearer <token>
```

### 寫入單關成績

`PUT /api/progress/level`

```json
{
  "levelKey": "W1-L1",
  "record": {
    "score": 100,
    "stars": 3,
    "steps": 16,
    "timeMs": 30000
  }
}
```

### 教師讀取全班進度

`GET /api/teacher/progress`

可加：

```text
?classId=301
```

### 教師清除單一學生資料

`DELETE /api/teacher/student/30105`

### 教師清除整班資料

`DELETE /api/teacher/class/301`
