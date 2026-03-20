// storage_patched.js
// ✅ 版本重點：清除「總分」時，同步清除該生所有已存步驟/程式/XML 等 localStorage 殘留
// 使用方式：用此檔覆蓋你的 storage.js（或改 teacher.html 引用此檔）

const LS_KEYS = {
  session: "mw_session",
  progress: "mw_progress",
  leaderboard: "mw_leaderboard",
};

// ✅ 遊戲「已存積木/步驟」的獨立儲存 key（來自 game.js）
const PROGRAM_STORE_KEY = "maze_saved_programs_v1";


// ✅ 不可被「清除學生資料」誤刪的 key（教師最佳解、老師發布地圖等）
const PROTECTED_KEYS = new Set([
  "mw_teacher_best_v1",              // 教師最佳解（localStorage）
  "mw_published_level_overrides_v1", // 老師發布給學生的地圖覆寫
]);
function isProtectedKey(key){ return PROTECTED_KEYS.has(String(key || "")); }

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

// ✅ 判斷某 key 是否「很可能」是程式/步驟/存檔/積木相關資料
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

// ✅ 只針對「遊戲相關」key（避免誤刪其他網站資料）
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

// ✅ 深度清除：如果某個 key 的 JSON 內容內含 userId（物件 key / 陣列 item.userId），就移除它
function removeUserFromJsonValue(value, userId){
  const uid = String(userId);

  // case 1: 物件以 userId 當 key
  if(value && typeof value === "object" && !Array.isArray(value)){
    if(Object.prototype.hasOwnProperty.call(value, uid)){
      const copy = {...value};
      delete copy[uid];
      return { changed: true, newValue: copy };
    }

    // case 2: 物件裡面有 records 陣列或類似結構（保守：只處理常見欄位）
    // 例如 { list:[{userId:"30101",...}] } 或 { programs:[...] }
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

  // case 3: 陣列資料
  if(Array.isArray(value)){
    const before = value.length;
    const filtered = value.filter(item => !(item && typeof item === "object" && String(item.userId) === uid));
    return { changed: filtered.length !== before, newValue: filtered };
  }

  return { changed: false, newValue: value };
}

// ✅ 清掉某個學生所有相關 localStorage（包含：已存程式 / 步驟 / XML 等）
// 兩種策略並行：
// A) key 名稱包含 userId → 直接刪 key
// B) key 名稱像程式/存檔，且 JSON 內容含 userId → 移除該 userId 的資料後覆寫回去
// ✅ 清除某位學生在「maze_saved_programs_v1」裡的所有關卡積木存檔
function purgeUserProgramStore(userId){
  const uid = String(userId);
  try{
    const raw = localStorage.getItem(PROGRAM_STORE_KEY);
    if(!raw) return;
    const store = JSON.parse(raw || "{}");
    let changed = false;

    // store 的 key 格式： "30101::W1-L1"
    Object.keys(store).forEach(k=>{
      if(String(k).startsWith(uid + "::")){
        delete store[k];
        changed = true;
      }
    });

    if(!changed) return;

    // 刪到空了就直接移除整個 key
    if(Object.keys(store).length === 0){
      localStorage.removeItem(PROGRAM_STORE_KEY);
    }else{
      localStorage.setItem(PROGRAM_STORE_KEY, JSON.stringify(store));
    }
  }catch(e){
    // 解析失敗就保守：直接移除整個 key（避免殘留）
    localStorage.removeItem(PROGRAM_STORE_KEY);
  }
}


function purgeUserLocalStorageArtifacts(userId){
  const uid = String(userId);

  // ✅ 先清掉 game.js 的積木存檔（maze_saved_programs_v1）
  purgeUserProgramStore(uid);

  // 先收集 key 再處理（避免迭代中刪除造成跳漏）
  const keys = [];
  for(let i=0; i<localStorage.length; i++){
    keys.push(localStorage.key(i));
  }

  keys.forEach((k)=>{
    if(!k) return;
    const key = String(k);

    // 不動 session（登入狀態）
    if(key === LS_KEYS.session) return;
    if(isProtectedKey(key)) return;

    // 只動遊戲相關 key
    if(!isGameKey(key)) return;

    const keyLower = key.toLowerCase();

    // ✅ A) key 名稱含 uid 且像程式/步驟/存檔 → 直接刪
    if(keyLower.includes(uid) && looksLikeProgramKey(keyLower)){
      localStorage.removeItem(key);
      return;
    }

    // ✅ B) key 名稱不像 uid，但看起來是程式/步驟/存檔 → 嘗試移除 JSON 裡的 uid
    if(looksLikeProgramKey(keyLower)){
      const raw = localStorage.getItem(key);
      if(!raw) return;

      // 很多資料是 JSON，嘗試解析
      try{
        const parsed = JSON.parse(raw);
        const { changed, newValue } = removeUserFromJsonValue(parsed, uid);
        if(changed){
          localStorage.setItem(key, JSON.stringify(newValue));
        }
      }catch{
        // 非 JSON：若內容本身直接含 uid，也刪掉（保守）
        if(raw.includes(uid)){
          localStorage.removeItem(key);
        }
      }
    }
  });
}

window.StorageAPI = {
  getSession(){
    return loadJSON(LS_KEYS.session, null);
  },
  setSession(session){
    saveJSON(LS_KEYS.session, session);
  },
  clearSession(){
    localStorage.removeItem(LS_KEYS.session);
  },

  getProgress(){
    return loadJSON(LS_KEYS.progress, {});
  },
  saveProgress(progress){
    saveJSON(LS_KEYS.progress, progress);
  },

  getLeaderboard(){
    return loadJSON(LS_KEYS.leaderboard, []);
  },
  saveLeaderboard(list){
    saveJSON(LS_KEYS.leaderboard, list);
  },

  // 更新某位學生某關最佳成績
  upsertBest(userId, levelKey, record){
    const progress = this.getProgress();
    progress[userId] ??= { best: {}, meta: {} };

    const prev = progress[userId].best[levelKey];
    // 以「分數高」為優先；同分比步數少
    const isBetter = !prev
      || record.score > prev.score
      || (record.score === prev.score && record.steps < prev.steps);

    if(isBetter){
      progress[userId].best[levelKey] = record;
      this.saveProgress(progress);
    }
    return isBetter;
  },

  // 班級排行榜：同一關只保留每個人最佳
  updateLeaderboard(user, levelKey, record){
    const list = this.getLeaderboard();
    const filtered = list.filter(x => !(x.userId === user.userId && x.levelKey === levelKey));
    filtered.push({
      userId: user.userId,
      classId: user.classId,
      seat: user.seat,
      name: user.name || `學生${user.seat}`,
      levelKey,
      score: record.score,
      stars: record.stars,
      steps: record.steps,
      timeMs: record.timeMs,
      at: Date.now()
    });
    this.saveLeaderboard(filtered);
  },

  // （保留）清除個別關卡最佳（舊功能）
  clearStudentLevel(userId, levelKey){
    const progress = this.getProgress();
    if(progress[userId]?.best?.[levelKey]){
      delete progress[userId].best[levelKey];
      this.saveProgress(progress);
    }
    const lb = this.getLeaderboard().filter(x => !(x.userId === userId && x.levelKey === levelKey));
    this.saveLeaderboard(lb);
  },

  // ✅ 清除某位學生「總分」＝清掉該學生所有最佳紀錄 + 排行榜紀錄 + 已存步驟/程式/XML 殘留
  clearStudentTotal(userId){
    const uid = String(userId);

    const progress = this.getProgress();
    if(progress[uid]){
      delete progress[uid];
      this.saveProgress(progress);
    }

    const lb = this.getLeaderboard().filter(x => String(x.userId) !== uid);
    this.saveLeaderboard(lb);

    // ✅ 關鍵：清掉該生可能殘留的「步驟/存檔/積木」資料
    purgeUserLocalStorageArtifacts(uid);
  },

  // ✅ 清除全部學生「總分」＝清掉所有 progress + leaderboard + 所有遊戲程式/存檔 key（保留 session）
  clearAllStudentsTotal(){
    this.saveProgress({});
    this.saveLeaderboard([]);

    // ✅ 清掉所有學生的積木存檔（game.js 的 maze_saved_programs_v1）
    localStorage.removeItem(PROGRAM_STORE_KEY);

    // 清掉所有遊戲資料（保留 session）
    const keys = [];
    for(let i=0; i<localStorage.length; i++){
      keys.push(localStorage.key(i));
    }
    keys.forEach(k=>{
      if(!k) return;
      const key = String(k);
      if(key === LS_KEYS.session) return;
      if(isProtectedKey(key)) return;
      if(isGameKey(key)){
        localStorage.removeItem(key);
      }
    });
  }
};
