// storage.js
// ✅ 前端仍由 GitHub Pages 開啟；Render 後端只負責登入、成績、排行榜與 MongoDB 存取。
// ✅ 這個檔案保留 localStorage 當快取，並在可連線時同步到後端。

const API_BASE = "https://cheng-shi-mi-gong-da-mou-xian.onrender.com";

const LS_KEYS = {
  session: "mw_session",
  progress: "mw_progress",
  leaderboard: "mw_leaderboard",
};

const PROGRAM_STORE_KEY = "maze_saved_programs_v1";
const PENDING_PROGRESS_SYNC_KEY = "mw_pending_progress_sync_v1";
const PROTECTED_KEYS = new Set([
  "mw_teacher_best_v1",
  "mw_published_level_overrides_v1",
]);

function loadJSON(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    if(!raw) return fallback;
    return JSON.parse(raw);
  }catch{
    return fallback;
  }
}

function saveJSON(key, value){
  localStorage.setItem(key, JSON.stringify(value));
}

function getToken(){
  const s = loadJSON(LS_KEYS.session, null);
  return s?.token || "";
}

async function apiFetch(path, options = {}){
  const headers = Object.assign({ "Content-Type": "application/json" }, options.headers || {});
  const token = getToken();
  if(token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  let data = null;
  try{ data = await res.json(); }catch{ data = null; }

  if(!res.ok || data?.ok === false){
    const msg = data?.message || `API 錯誤：${res.status}`;
    throw new Error(msg);
  }
  return data;
}

function isProtectedKey(key){ return PROTECTED_KEYS.has(String(key || "")); }

function looksLikeProgramKey(key){
  const k = String(key || "").toLowerCase();
  return (
    k.includes("blockly") ||
    k.includes("xml") ||
    k.includes("program") ||
    k.includes("code") ||
    k.includes("steps") ||
    k.includes("save") ||
    k.includes("saved") ||
    k.includes("workspace")
  );
}

function isGameKey(key){
  const k = String(key || "");
  if(isProtectedKey(k)) return false;
  return (
    k.startsWith("mw_") ||
    k.startsWith("mm_") ||
    k.includes("magic-maze") ||
    k.includes("magic_maze")
  );
}

function removeUserFromJsonValue(value, userId){
  const uid = String(userId);

  if(value && typeof value === "object" && !Array.isArray(value)){
    if(Object.prototype.hasOwnProperty.call(value, uid)){
      const copy = {...value};
      delete copy[uid];
      return { changed: true, newValue: copy };
    }

    let changed = false;
    const copy = {...value};
    for(const prop of Object.keys(copy)){
      const v = copy[prop];
      if(Array.isArray(v)){
        const before = v.length;
        const filtered = v.filter(item => !(item && typeof item === "object" && String(item.userId) === uid));
        if(filtered.length !== before){
          copy[prop] = filtered;
          changed = true;
        }
      }
    }
    return { changed, newValue: changed ? copy : value };
  }

  if(Array.isArray(value)){
    const before = value.length;
    const filtered = value.filter(item => !(item && typeof item === "object" && String(item.userId) === uid));
    return { changed: filtered.length !== before, newValue: filtered };
  }

  return { changed: false, newValue: value };
}

function purgeUserProgramStore(userId){
  const uid = String(userId);
  try{
    const raw = localStorage.getItem(PROGRAM_STORE_KEY);
    if(!raw) return;
    const store = JSON.parse(raw || "{}");
    let changed = false;

    Object.keys(store).forEach(k=>{
      if(String(k).startsWith(uid + "::")){
        delete store[k];
        changed = true;
      }
    });

    if(!changed) return;
    if(Object.keys(store).length === 0){
      localStorage.removeItem(PROGRAM_STORE_KEY);
    }else{
      localStorage.setItem(PROGRAM_STORE_KEY, JSON.stringify(store));
    }
  }catch{
    localStorage.removeItem(PROGRAM_STORE_KEY);
  }
}

function purgeUserLocalStorageArtifacts(userId){
  const uid = String(userId);
  purgeUserProgramStore(uid);

  const keys = [];
  for(let i=0; i<localStorage.length; i++) keys.push(localStorage.key(i));

  keys.forEach((k)=>{
    if(!k) return;
    const key = String(k);
    if(key === LS_KEYS.session) return;
    if(isProtectedKey(key)) return;
    if(!isGameKey(key)) return;

    const keyLower = key.toLowerCase();
    if(keyLower.includes(uid) && looksLikeProgramKey(keyLower)){
      localStorage.removeItem(key);
      return;
    }

    if(looksLikeProgramKey(keyLower)){
      const raw = localStorage.getItem(key);
      if(!raw) return;
      try{
        const parsed = JSON.parse(raw);
        const { changed, newValue } = removeUserFromJsonValue(parsed, uid);
        if(changed) localStorage.setItem(key, JSON.stringify(newValue));
      }catch{
        if(raw.includes(uid)) localStorage.removeItem(key);
      }
    }
  });
}

function normalizeProgressArrayToMap(progressArray){
  const out = {};
  (Array.isArray(progressArray) ? progressArray : []).forEach(item=>{
    // ✅ 相容不同後端版本或 Mongo 手動檢視時可能看到的欄位名稱。
    const rawId = item?.userId || item?.studentId || item?.id || item?._id || '';
    const userId = String(rawId || '').trim();
    if(!/^\d{5}$/.test(userId)) return;

    const classId = String(item.classId || userId.slice(0,3)).trim();
    const seat = String(item.seat || userId.slice(3,5)).trim();
    const best = (item.best && typeof item.best === 'object') ? item.best : {};
    const meta = (item.meta && typeof item.meta === 'object') ? item.meta : {};

    out[userId] = {
      best,
      meta,
      classId,
      seat,
      updatedAt: item.updatedAt || item.at || '',
    };
  });
  return out;
}

function getPendingProgressSync(){
  return loadJSON(PENDING_PROGRESS_SYNC_KEY, []);
}

function savePendingProgressSync(list){
  const safe = Array.isArray(list) ? list : [];
  if(safe.length === 0){
    localStorage.removeItem(PENDING_PROGRESS_SYNC_KEY);
    return;
  }
  saveJSON(PENDING_PROGRESS_SYNC_KEY, safe.slice(-200));
}

function queuePendingProgressSync(userId, levelKey, record, meta = {}){
  if(!userId || !levelKey) return;
  const list = getPendingProgressSync();
  const idx = list.findIndex(item => String(item.userId) === String(userId) && String(item.levelKey) === String(levelKey));
  const item = { userId:String(userId), levelKey:String(levelKey), record:record || {}, meta:meta || {}, queuedAt:Date.now() };
  if(idx >= 0) list[idx] = item;
  else list.push(item);
  savePendingProgressSync(list);
}

function emitProgressSyncStatus(detail){
  try{ window.dispatchEvent(new CustomEvent('maze:progressSyncStatus', { detail })); }catch(_err){}
}

window.StorageAPI = {
  API_BASE,

  async apiFetch(path, options){
    return apiFetch(path, options);
  },

  getSession(){
    return loadJSON(LS_KEYS.session, null);
  },

  setSession(session){
    saveJSON(LS_KEYS.session, session);
    try{ window.dispatchEvent(new CustomEvent('maze:sessionChanged', { detail:{ session } })); }catch(_err){}
  },

  clearSession(){
    localStorage.removeItem(LS_KEYS.session);
  },

  getProgress(){
    return loadJSON(LS_KEYS.progress, {});
  },

  saveProgress(progress){
    saveJSON(LS_KEYS.progress, progress || {});
  },

  getLeaderboard(){
    return loadJSON(LS_KEYS.leaderboard, []);
  },

  saveLeaderboard(list){
    saveJSON(LS_KEYS.leaderboard, Array.isArray(list) ? list : []);
  },

  async syncMyProgressFromBackend(){
    const s = this.getSession();
    if(!s?.token || s.role !== "student") return this.getProgress();

    const data = await apiFetch("/api/progress/me");
    const progress = this.getProgress();
    const p = data.progress || { best:{}, meta:{} };
    progress[s.userId] = {
      best: p.best || {},
      meta: p.meta || {},
      classId: s.classId || String(s.userId).slice(0,3),
      seat: s.seat || String(s.userId).slice(3,5),
    };
    this.saveProgress(progress);
    return progress;
  },

  async syncTeacherProgressFromBackend(classId = ""){
    const s = this.getSession();
    if(!s?.token || s.role !== "teacher") {
      throw new Error("教師登入狀態沒有後端 token，請回首頁重新登入教師帳號。");
    }

    const safeClassId = String(classId || '').trim();
    const q = safeClassId && safeClassId !== "all" ? `?classId=${encodeURIComponent(safeClassId)}` : "";
    const data = await apiFetch(`/api/teacher/progress${q}`);
    const remoteMap = normalizeProgressArrayToMap(data.progress || []);

    // 記錄最近一次雲端同步結果，教師後台可以直接顯示，方便判斷是「沒有抓到」還是「表格沒有渲染」。
    try{
      sessionStorage.setItem('mw_last_teacher_sync_result', JSON.stringify({
        at: Date.now(),
        classId: safeClassId || 'all',
        apiCount: Array.isArray(data.progress) ? data.progress.length : 0,
        renderedCount: Object.keys(remoteMap).length,
        apiBase: API_BASE
      }));
    }catch(_err){}

    // 教師查詢全部時直接以雲端為主；查單班時只覆蓋該班。
    if(!safeClassId || safeClassId === "all"){
      this.saveProgress(remoteMap);
      return remoteMap;
    }

    const local = this.getProgress();
    Object.keys(local).forEach(uid=>{
      if(String(uid).slice(0,3) === String(safeClassId)) delete local[uid];
    });
    Object.assign(local, remoteMap);
    this.saveProgress(local);
    return local;
  },

  async syncLeaderboardFromBackend(params = {}){
    const qs = new URLSearchParams();
    if(params.classId && params.classId !== "all") qs.set("classId", params.classId);
    if(params.levelKey) qs.set("levelKey", params.levelKey);
    const query = qs.toString() ? `?${qs.toString()}` : "";
    const data = await apiFetch(`/api/leaderboard${query}`);
    this.saveLeaderboard(data.leaderboard || []);
    return data.leaderboard || [];
  },

  upsertBest(userId, levelKey, record){
    const progress = this.getProgress();
    progress[userId] ??= { best: {}, meta: {} };
    progress[userId].best ??= {};
    progress[userId].meta ??= {};

    const prev = progress[userId].best[levelKey];
    const nextScore = Number(record?.score || 0);
    const prevScore = Number(prev?.score || 0);
    const nextSteps = Number(record?.steps || 999999);
    const prevSteps = Number(prev?.steps || 999999);
    const improved = !prev || nextScore > prevScore || (nextScore === prevScore && nextSteps < prevSteps);

    if(improved){
      progress[userId].best[levelKey] = record;
      this.saveProgress(progress);
    }

    // ✅ 不管是否刷新最佳紀錄，都嘗試同步到 MongoDB。
    // 這樣即使只是補寫 meta（道具、裝備、三星加成），教師後台也能讀到。
    const s = this.getSession();
    if(s?.role === "student" && String(s.userId) === String(userId)){
      if(s?.token){
        this.syncLevelRecordToBackend(levelKey, record)
          .then(()=> emitProgressSyncStatus({ ok:true, levelKey }))
          .catch(err=>{
            queuePendingProgressSync(userId, levelKey, record, progress[userId].meta || {});
            emitProgressSyncStatus({ ok:false, levelKey, message:err.message || String(err) });
            console.warn("成績雲端同步失敗，已先保存在本機待補傳：", err.message || err);
          });
      }else{
        queuePendingProgressSync(userId, levelKey, record, progress[userId].meta || {});
        emitProgressSyncStatus({ ok:false, levelKey, message:"目前登入狀態沒有後端 token，請回首頁重新登入一次。" });
        console.warn("目前登入狀態沒有後端 token，成績已先存在本機，請回首頁重新登入後補傳。")
      }
    }

    return improved;
  },


  async syncLevelRecordToBackend(levelKey, record){
    const s = this.getSession();
    if(!s?.token || s.role !== "student"){
      const progress = this.getProgress();
      queuePendingProgressSync(s?.userId || "", levelKey, record, progress?.[s?.userId]?.meta || {});
      throw new Error("尚未取得後端登入 token，請回首頁重新登入。");
    }
    const progress = this.getProgress();
    const meta = progress?.[s.userId]?.meta || {};
    const data = await apiFetch("/api/progress/level", {
      method: "PUT",
      body: JSON.stringify({ levelKey, record, meta })
    });
    if(data?.progress){
      const latest = this.getProgress();
      latest[s.userId] = {
        best: data.progress.best || {},
        meta: data.progress.meta || {},
        classId: data.progress.classId || s.classId || String(s.userId).slice(0,3),
        seat: data.progress.seat || s.seat || String(s.userId).slice(3,5),
      };
      this.saveProgress(latest);
    }
    return data;
  },

  async flushPendingProgressToBackend(){
    const s = this.getSession();
    if(!s?.token || s.role !== "student") return { ok:false, remaining:getPendingProgressSync().length };

    const pending = getPendingProgressSync();
    const mine = pending.filter(item => String(item.userId) === String(s.userId));
    const others = pending.filter(item => String(item.userId) !== String(s.userId));
    const failed = [];

    for(const item of mine){
      try{
        await this.syncLevelRecordToBackend(item.levelKey, item.record || {});
      }catch(err){
        failed.push(item);
        console.warn("補傳成績失敗：", item.levelKey, err.message || err);
      }
    }

    savePendingProgressSync(others.concat(failed));
    return { ok: failed.length === 0, sent: mine.length - failed.length, failed: failed.length, remaining: others.length + failed.length };
  },

  updateLeaderboard(session, levelKey, record){
    const list = this.getLeaderboard();
    const userId = session?.userId;
    if(!userId) return list;

    const item = {
      userId,
      classId: session.classId || String(userId).slice(0,3),
      seat: session.seat || String(userId).slice(3,5),
      name: session.name || `學生${String(userId).slice(3,5)}`,
      levelKey,
      score: Number(record?.score || 0),
      stars: Number(record?.stars || 0),
      steps: Number(record?.steps || 0),
      timeMs: Number(record?.timeMs || 0),
      at: Date.now(),
    };

    const idx = list.findIndex(x=> String(x.userId) === String(userId) && String(x.levelKey) === String(levelKey));
    if(idx >= 0) list[idx] = item;
    else list.push(item);

    list.sort((a,b)=> (Number(b.score || 0) - Number(a.score || 0)) || (Number(a.steps || 999999) - Number(b.steps || 999999)));
    this.saveLeaderboard(list);
    return list;
  },

  clearStudentTotal(userId){
    const uid = String(userId || "").trim();
    if(!uid) return;

    const progress = this.getProgress();
    delete progress[uid];
    this.saveProgress(progress);

    const board = this.getLeaderboard().filter(x => String(x.userId) !== uid);
    this.saveLeaderboard(board);
    purgeUserLocalStorageArtifacts(uid);

    const s = this.getSession();
    if(s?.role === "teacher" && s?.token){
      apiFetch(`/api/teacher/student/${encodeURIComponent(uid)}`, { method:"DELETE" })
        .catch(err=> console.warn("雲端刪除學生資料失敗：", err.message || err));
    }
  },

  clearClassTotal(classId){
    const cid = String(classId || "").trim();
    if(!/^\d{3}$/.test(cid)) return;

    const progress = this.getProgress();
    Object.keys(progress).forEach(uid=>{
      if(String(uid).slice(0,3) === cid){
        delete progress[uid];
        purgeUserLocalStorageArtifacts(uid);
      }
    });
    this.saveProgress(progress);

    const board = this.getLeaderboard().filter(x => String(x.classId || x.userId?.slice?.(0,3)) !== cid);
    this.saveLeaderboard(board);

    const s = this.getSession();
    if(s?.role === "teacher" && s?.token){
      apiFetch(`/api/teacher/class/${encodeURIComponent(cid)}`, { method:"DELETE" })
        .catch(err=> console.warn("雲端刪除班級資料失敗：", err.message || err));
    }
  },

  clearAllStudentsTotal(){
    const progress = this.getProgress();
    const classIds = [...new Set(Object.keys(progress).filter(uid=>/^\d{5}$/.test(uid)).map(uid=>uid.slice(0,3)))];
    Object.keys(progress).forEach(uid=>{
      if(/^\d{5}$/.test(uid)) purgeUserLocalStorageArtifacts(uid);
    });
    this.saveProgress({});
    this.saveLeaderboard([]);

    const s = this.getSession();
    if(s?.role === "teacher" && s?.token){
      classIds.forEach(cid=>{
        apiFetch(`/api/teacher/class/${encodeURIComponent(cid)}`, { method:"DELETE" })
          .catch(err=> console.warn(`雲端刪除 ${cid} 班資料失敗：`, err.message || err));
      });
    }
  },
};
