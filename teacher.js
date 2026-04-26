// teacher.js
window.TeacherPage = (()=>{

  const STORAGE_PREFIX = 'maze_best_solution::';
  const TEACHER_ACTION_KEY = 'maze_teacher_pending_action';
  const LEVEL_TARGET_BLOCK_OVERRIDE_KEY = 'mw_published_level_overrides_v1';
  const LEVEL_EDIT_OVERRIDE_KEY = 'mw_teacher_level_edits_v1';
  const TEACHER_TOOLS_COLLAPSED_KEY = 'mw_teacher_tools_collapsed_v1';
  const TEACHER_PROGRESS_AUTO_SYNC_MS = 5000;

  let teacherProgressSyncTimer = null;
  let teacherProgressSyncBusy = false;

  const WORLD_NAME_MAP = {
    W1: '世界1｜魔法學院（序列）',
    W2: '世界2｜符文森林（迴圈）',
    W3: '世界3｜時光圖書館（條件式）',
    W4: '世界4｜機械城堡（函式）'
  };

  const LEVEL_NAME_MAP = {
    W1: {
      L1: '第1關：學院走廊',
      L2: '第2關：分岔教室',
      L3: '第3關：圖書樓梯',
      L4: '第4關：秘密試驗室',
      boss: '第5關：教授 Boss 戰'
    },
    W2: {
      L1: '第1關：森林入口',
      L2: '第2關：狼跡岔道',
      L3: '第3關：藤蔓迷徑',
      L4: '第4關：月影祭壇',
      boss: '第5關：狼王 Boss 戰'
    },
    W3: {
      L1: '第1關：書架走廊',
      L2: '第2關：迷路書庫',
      L3: '第3關：斷頁回廊',
      L4: '第4關：時鐘大廳',
      boss: '第5關：館長 Boss 戰'
    },
    W4: {
      L1: '第1關：齒輪入口',
      L2: '第2關：蒸汽鍋爐室',
      L3: '第3關：傳動核心',
      L4: '第4關：王座控制室',
      boss: '第5關：機械主宰 Boss 戰'
    }
  };


  const MAP_SYMBOLS = {
    '#': { label:'牆壁', emoji:'⬛', className:'wall' },
    '.': { label:'道路', emoji:'·', className:'path' },
    'S': { label:'起點', emoji:'🚩', className:'start' },
    'K': { label:'鑰匙', emoji:'🗝️', className:'key' },
    'D': { label:'出口門', emoji:'🚪', className:'exit' },
    'T': { label:'陷阱', emoji:'🕳️', className:'trap' },

    'P': { label:'傳送門（藍）', emoji:'🌀', className:'portal portal-blue' },
    'Q': { label:'傳送門（紫）', emoji:'🌀', className:'portal portal-purple' },
    'R': { label:'傳送門（紅）', emoji:'🌀', className:'portal portal-red' },

    'C': { label:'道具寶箱', emoji:'🎁', className:'item' },
    'G': { label:'裝備寶箱', emoji:'', className:'equipment' },

    'M': { label:'齒輪牆', emoji:'⚙️', className:'gear' },
    'N': { label:'樹木', emoji:'🌲', className:'tree' },
    'B': { label:'書櫃', emoji:'📚', className:'bookshelf' },

    'X': { label:'冰塊', emoji:'🧊', className:'ice' },
    'L': { label:'河流', emoji:'🌊', className:'lava' },
    'O': { label:'妖怪', emoji:'👾', className:'monster' },
    'F': { label:'火焰', emoji:'🔥', className:'flame' }
  };

  let currentPaintSymbol = '#';
  let isPainting = false;

  const START_DIR_OPTIONS = [
    { value: 0, label: '上方 ↑' },
    { value: 1, label: '右方 →' },
    { value: 2, label: '下方 ↓' },
    { value: 3, label: '左方 ←' }
  ];

  const WORLD_REWARD_OPTIONS = {
    W1: {
      items: ['魔力水晶', '新生魔杖', '學院法袍', '封印卷軸'],
      equipments: ['頭盔', '劍', '盔甲', '盾牌']
    },
    W2: {
      items: ['補血小藥水', '小刀攻擊', '木盾防禦', '冰凍藤蔓'],
      equipments: ['頭盔', '盾牌', '盔甲', '劍']
    },
    W3: {
      items: ['時光沙漏', '館藏羽毛筆', '預言書頁', '時空鑰匙'],
      equipments: ['頭盔', '盾牌', '盔甲', '劍']
    },
    W4: {
      items: ['齒輪核心', '蒸汽手套', '機械咒語晶片', '傳動發條鑰匙'],
      equipments: ['頭盔', '盾牌', '盔甲', '劍']
    }
  };

  const toast = (msg)=> {
    const el = document.getElementById('toast');
    if(el) el.textContent = msg;
  };

  function getSession(){
    return StorageAPI.getSession();
  }

  function isTeacherLoggedIn(){
    const s = getSession();
    return !!s && s.role === 'teacher';
  }

  function requireTeacherOrBlock(actionName = '此操作'){
    if(!isTeacherLoggedIn()){
      toast(`❌ 需要教師登入才可執行：${actionName}`);
      alert(`❌ 需要教師登入才可執行：${actionName}`);
      return false;
    }
    return true;
  }

  function setTeacherSyncBadge(text){
    const badge = document.getElementById('teacherAutoSyncBadge');
    if(badge) badge.textContent = text;
  }

  function getLastTeacherSyncResult(){
    try{
      const raw = sessionStorage.getItem('mw_last_teacher_sync_result');
      return raw ? JSON.parse(raw) : null;
    }catch(_err){
      return null;
    }
  }

  function getCurrentFilterClass(){
    return String(document.getElementById('filterClass')?.value || 'all').trim();
  }

  async function refreshTeacherProgressFromCloud(options = {}){
    if(!isTeacherLoggedIn()) return false;
    if(teacherProgressSyncBusy) return false;

    const silent = options.silent === true;
    const classId = getCurrentFilterClass();
    teacherProgressSyncBusy = true;
    setTeacherSyncBadge('成績同步中…');

    try{
      const remoteMap = await StorageAPI.syncTeacherProgressFromBackend(classId);
      render();
      const count = Object.keys(remoteMap || {}).filter(uid => /^\d{5}$/.test(uid)).length;
      const timeText = new Date().toLocaleTimeString('zh-TW', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
      setTeacherSyncBadge(`已同步 ${timeText}｜雲端 ${count} 人｜每 5 秒`);
      if(!silent) toast('✅ 已從 MongoDB 更新學生通關成績。');
      return true;
    }catch(err){
      console.warn('教師後台雲端同步失敗：', err);
      setTeacherSyncBadge('同步失敗，顯示本機快取');
      if(!silent) toast('⚠️ 雲端同步失敗，暫時顯示本機快取資料。');
      return false;
    }finally{
      teacherProgressSyncBusy = false;
    }
  }

  function stopTeacherProgressAutoSync(){
    if(teacherProgressSyncTimer) clearInterval(teacherProgressSyncTimer);
    teacherProgressSyncTimer = null;
  }

  function startTeacherProgressAutoSync(){
    stopTeacherProgressAutoSync();
    if(!isTeacherLoggedIn()) return;
    teacherProgressSyncTimer = setInterval(()=>{
      if(document.hidden) return;
      refreshTeacherProgressFromCloud({ silent:true });
    }, TEACHER_PROGRESS_AUTO_SYNC_MS);
  }

  function setTeacherToolsCollapsed(collapsed){
    const card = document.getElementById('teacherToolsCard');
    const body = document.getElementById('teacherToolsBody');
    const btn = document.getElementById('btnToggleTeacherTools');
    const isCollapsed = !!collapsed;

    if(card) card.classList.toggle('is-collapsed', isCollapsed);
    if(body){
      body.hidden = isCollapsed;
      body.style.display = isCollapsed ? 'none' : '';
    }
    if(btn){
      btn.textContent = isCollapsed ? '展開 ▼' : '最小化 ▲';
      btn.setAttribute('aria-expanded', String(!isCollapsed));
      btn.dataset.collapsed = isCollapsed ? '1' : '0';
    }

    try{ localStorage.setItem(TEACHER_TOOLS_COLLAPSED_KEY, isCollapsed ? '1' : '0'); }catch(_err){}
  }

  function toggleTeacherToolsCollapsed(){
    const btn = document.getElementById('btnToggleTeacherTools');
    const card = document.getElementById('teacherToolsCard');
    const currentlyCollapsed = btn?.dataset?.collapsed === '1' || card?.classList.contains('is-collapsed');
    setTeacherToolsCollapsed(!currentlyCollapsed);
  }

  function initTeacherToolsCollapse(){
    const btn = document.getElementById('btnToggleTeacherTools');
    const saved = (()=>{
      try{ return localStorage.getItem(TEACHER_TOOLS_COLLAPSED_KEY) === '1'; }catch(_err){ return false; }
    })();
    setTeacherToolsCollapsed(saved);
    if(btn && !btn.dataset.collapseBound){
      // ✅ 之前同時綁 onclick 和 capture click，會造成「收合後立刻又展開」，看起來像按鈕沒作用。
      btn.dataset.collapseBound = '1';
      btn.addEventListener('click', (e)=>{
        e.preventDefault();
        e.stopPropagation();
        toggleTeacherToolsCollapsed();
      });
    }
  }

  function solutionKey(world, level){
    return `${STORAGE_PREFIX}${world}::${level}`;
  }

  function levelOverrideKey(world, level){
    return `${normalizeWorldId(world)}-${normalizeLevelId(level, world)}`;
  }

  function getStoredTargetBlockOverrides(){
    try{
      const raw = localStorage.getItem(LEVEL_TARGET_BLOCK_OVERRIDE_KEY);
      const data = raw ? JSON.parse(raw) : {};
      return data && typeof data === 'object' ? data : {};
    }catch(err){
      console.warn('讀取最佳程式碼數覆寫失敗', err);
      return {};
    }
  }

  function saveStoredTargetBlockOverrides(data){
    localStorage.setItem(LEVEL_TARGET_BLOCK_OVERRIDE_KEY, JSON.stringify(data || {}));
  }

  function getLevelsData(){
    if(typeof LEVELS === 'undefined' || !Array.isArray(LEVELS)) return [];
    return LEVELS;
  }

  function normalizeWorldId(value){
    const raw = String(value || '').trim();
    if(!raw) return '';
    const direct = getLevelsData().find(w => String(w.worldId).toLowerCase() === raw.toLowerCase());
    if(direct) return direct.worldId;
    const m = raw.match(/^world\s*(\d+)$/i);
    if(m){
      const alt = `W${m[1]}`;
      const found = getLevelsData().find(w => String(w.worldId).toLowerCase() === alt.toLowerCase());
      if(found) return found.worldId;
    }
    return raw;
  }

  function normalizeLevelId(value, worldId = ''){
    const raw = String(value || '').trim();
    if(!raw) return '';
    if(/boss/i.test(raw)) return 'boss';

    const world = getLevelsData().find(w => String(w.worldId) === String(worldId));
    if(world && Array.isArray(world.levels)){
      const direct = world.levels.find(l => String(l.levelId).toLowerCase() === raw.toLowerCase());
      if(direct) return direct.levelId;

      const m = raw.match(/^level\s*(\d+)$/i);
      if(m){
        const alt = `L${m[1]}`;
        const found = world.levels.find(l => String(l.levelId).toLowerCase() === alt.toLowerCase());
        if(found) return found.levelId;
      }
    }
    return raw;
  }

  function getToolWorld(){
    const el = document.getElementById('teacherWorld');
    return normalizeWorldId(el?.value || '');
  }

  function getToolLevel(){
    const el = document.getElementById('teacherLevel');
    return normalizeLevelId(el?.value || '', getToolWorld());
  }

  function getToolSelection(){
    return { world: getToolWorld(), level: getToolLevel() };
  }

  function isBossLevel(levelId){
    return /boss/i.test(String(levelId || ''));
  }

  function validateToolSelection(actionName, allowBoss = true){
    if(!requireTeacherOrBlock(actionName)) return null;
    const { world, level } = getToolSelection();
    if(!world || !level){
      toast('請先選擇世界與關卡。');
      return null;
    }
    if(!allowBoss && isBossLevel(level)){
      toast('Boss 戰不是積木關，不能使用這個功能。');
      return null;
    }
    return { world, level };
  }

  function updateControlsLock(){
    const isTeacher = isTeacherLoggedIn();

    const ids = [
      'btnClearAll', 'btnRefresh', 'filterClass', 'sortMode',
      'teacherWorld', 'teacherLevel',
      'btnOpenBoss', 'btnSaveBest', 'btnLoadBest', 'btnClearBest', 'btnExportBestCode',
      'btnLoadLevelData', 'btnSaveLevelEdit', 'btnPreviewLevelEdit', 'btnExportLevelJson', 'btnClearLevelEdit',
      'editLevelName', 'editTargetBlocks', 'editMapSize', 'editStartDir', 'editItemReward', 'editEquipmentReward', 'editMapText',
      'btnLoadLevelEditor', 'btnSaveLevelEditor', 'btnPreviewLevelEditor', 'btnExportEditedLevelJson', 'btnResetLevelEditor',
      'editLevelName', 'editTargetBlocks', 'editMapSize', 'editStartDir', 'editItemReward', 'editEquipmentReward', 'editMapText'
    ];

    ids.forEach(id => {
      const el = document.getElementById(id);
      if(el) el.disabled = !isTeacher;
    });

    const tableCard = document.getElementById('tableCard');
    if(tableCard) tableCard.style.display = isTeacher ? '' : 'none';

    const teacherToolsCard = document.getElementById('teacherToolsCard');
    if(teacherToolsCard) teacherToolsCard.style.display = isTeacher ? '' : 'none';
    const btnToggleTeacherTools = document.getElementById('btnToggleTeacherTools');
    if(btnToggleTeacherTools) btnToggleTeacherTools.disabled = false;

    const levelEditorCard = document.getElementById('levelEditorCard');
    if(levelEditorCard) levelEditorCard.style.display = isTeacher ? '' : 'none';
  }

  function setBadge(){
    const badge = document.getElementById('sessionBadge');
    if(!badge) return;
    badge.textContent = isTeacherLoggedIn() ? '教師已登入' : '教師未登入';
    updateControlsLock();
  }

  function buildCandidatePath(page){
    const current = new URL(window.location.href);
    const pathname = current.pathname;
    const lastSlash = pathname.lastIndexOf('/') + 1;
    const basePath = pathname.slice(0, lastSlash);

    const candidates = [
      new URL('./' + page, current.href).toString(),
      new URL('../' + page, current.href).toString(),
      new URL('../../' + page, current.href).toString(),
      new URL(page, current.origin + basePath).toString(),
      new URL('/' + page, current.origin).toString(),
    ];

    return [...new Set(candidates)];
  }

  async function urlLooksReachable(url){
    const testUrl = new URL(url);
    testUrl.searchParams.set('_navcheck', Date.now().toString());

    try{
      const headRes = await fetch(testUrl.toString(), { method:'HEAD', cache:'no-store' });
      if(headRes.ok) return true;
      if(headRes.status && headRes.status !== 405) return false;
    }catch(_e){}

    try{
      const getRes = await fetch(testUrl.toString(), { method:'GET', cache:'no-store' });
      return getRes.ok;
    }catch(_e){
      return false;
    }
  }

  async function goToAppPage(page, query = ''){
    const candidates = buildCandidatePath(page);
    const q = query ? (query.startsWith('?') ? query : '?' + query) : '';

    try{
      sessionStorage.setItem('maze_nav_candidates', JSON.stringify(candidates));
    }catch(_e){}

    if(location.protocol === 'file:'){
      const currentPath = location.pathname.toLowerCase();
      const preferParent = /\/(teacher|admin|backend)\//.test(currentPath);
      const picked = preferParent && candidates[1] ? candidates[1] : candidates[0];
      location.href = picked + q;
      return;
    }

    for(const candidate of candidates){
      const ok = await urlLooksReachable(candidate);
      if(ok){
        location.href = candidate + q;
        return;
      }
    }

    toast(`❌ 找不到 ${page}，請檢查檔案路徑是否正確。`);
    alert(`找不到 ${page}\n\n已嘗試：\n${candidates.join('\n')}`);
  }

  function calcTotalScore(bestObj){
    if(!bestObj) return 0;
    return Object.keys(bestObj).reduce((sum, k)=> sum + (Number(bestObj[k]?.score) || 0), 0);
  }

  function normalizeLevelKey(value){
    const raw = String(value || '').trim();
    if(!raw) return '';
    const parts = raw.split('-');
    if(parts.length < 2) return raw;
    const worldId = normalizeWorldId(parts[0]);
    const levelId = normalizeLevelId(parts.slice(1).join('-'), worldId);
    return `${worldId}-${levelId}`;
  }

  function getNormalizedBestMap(bestObj){
    const out = {};
    Object.entries(bestObj || {}).forEach(([key, record])=>{
      out[normalizeLevelKey(key)] = record;
    });
    return out;
  }

  function getAllDisplayLevels(){
    const worlds = getLevelsData();
    return worlds.flatMap(world => {
      const worldId = normalizeWorldId(world.worldId);
      const normalLevels = (Array.isArray(world.levels) ? world.levels : [])
        .filter(level => !/boss/i.test(String(level.levelId || level.id || '')))
        .slice(0, 4)
        .map(level => ({
          worldId,
          levelId: normalizeLevelId(level.levelId || level.id, worldId),
          worldName: getDisplayWorldName(world),
          levelName: getDisplayLevelName(worldId, level),
          isBoss: false
        }));
      normalLevels.push({
        worldId,
        levelId: 'boss',
        worldName: getDisplayWorldName(world),
        levelName: getDisplayLevelName(worldId, { id: 'boss', name: '第5關：Boss 戰' }),
        isBoss: true
      });
      return normalLevels;
    });
  }

  function getRecordStatus(record, levelMeta){
    if(!record){
      return {
        statusClass: 'none',
        main: '－',
        sub: '',
        title: '尚未通關'
      };
    }

    const stars = Number(record.stars || 0);
    const score = Number(record.score || 0);
    const steps = Number(record.steps || 0);
    const timeMs = Number(record.timeMs || 0);

    let statusClass = 'hasScoreOnly';
    if(levelMeta?.isBoss){
      statusClass = 'boss';
    }else if(stars >= 3){
      statusClass = 'three';
    }else if(stars === 2){
      statusClass = 'two';
    }else if(stars === 1){
      statusClass = 'one';
    }

    const timeText = timeMs > 0 ? `｜${(timeMs / 1000).toFixed(1)}秒` : '';
    return {
      statusClass,
      main: levelMeta?.isBoss ? 'B' : `${Math.max(stars, 1)}★`,
      sub: score > 0 ? String(score) : '',
      title: `${levelMeta.worldName} ${levelMeta.levelName}\n分數：${score || 0}\n星數：${stars || 0}\n步數：${steps || 0}${timeText}`
    };
  }

  function render(){
    const area = document.getElementById('tableArea');
    if(!area) return;

    if(!isTeacherLoggedIn()){
      area.textContent = '請先登入教師帳號。';
      return;
    }

    const filterClass = String(document.getElementById('filterClass')?.value || '').trim();
    const sortMode = String(document.getElementById('sortMode')?.value || 'seat');
    const progress = StorageAPI.getProgress();
    const allLevels = getAllDisplayLevels();

    const allClassIds = [...new Set(Object.keys(progress)
      .filter(uid => uid !== 'teacher')
      .filter(uid => /^\d{5}$/.test(uid))
      .map(uid => uid.slice(0,3)))].sort((a,b)=> a.localeCompare(b));
    const filterSelect = document.getElementById('filterClass');
    if(filterSelect){
      const currentValue = filterClass || 'all';
      filterSelect.innerHTML = ['<option value="all">全部學生</option>']
        .concat(allClassIds.map(classId => `<option value="${classId}">${classId} 班</option>`))
        .join('');
      filterSelect.value = allClassIds.includes(currentValue) || currentValue === 'all' ? currentValue : 'all';
    }

    const allStudents = Object.keys(progress)
      .filter(uid => uid !== 'teacher')
      .filter(uid => /^\d{5}$/.test(uid))
      .map(uid=>{
        const classId = uid.slice(0,3);
        const seat = uid.slice(3,5);
        const bestRaw = progress[uid]?.best || {};
        const best = getNormalizedBestMap(bestRaw);
        const passed = Object.keys(best).length;
        const totalScore = calcTotalScore(best);
        return { userId: uid, classId, seat, best, passed, totalScore };
      })
      .filter(stu => !filterClass || filterClass === 'all' || stu.classId === filterClass);

    if(allStudents.length === 0){
      const last = getLastTeacherSyncResult();
      const extra = last ? `<br><br><strong>最近一次 MongoDB 同步：</strong><br>API 讀到 ${Number(last.apiCount || 0)} 筆，前端可辨識 ${Number(last.renderedCount || 0)} 位學生。<br>查詢班級：${last.classId || 'all'}<br>後端：${last.apiBase || ''}` : '';
      area.innerHTML = `<div class="teacherEmptyState">目前沒有符合條件的學生資料。${extra}<br><br>若 MongoDB 明明有資料，請按「更新列表」；若仍是 0，通常代表教師端還在使用舊版後端或教師登入 token 已過期，請從首頁重新登入教師帳號。</div>`;
      return;
    }

    const classOrder = [...new Set(allStudents.map(stu => stu.classId))].sort((a,b)=> a.localeCompare(b));
    const groupedStudents = classOrder.map(classId => {
      const list = allStudents
        .filter(stu => stu.classId === classId)
        .sort((a,b)=> {
          if(sortMode === 'score'){
            return (b.totalScore - a.totalScore) || a.seat.localeCompare(b.seat);
          }
          return a.seat.localeCompare(b.seat) || (b.totalScore - a.totalScore);
        });
      return { classId, students: list };
    });

    const students = groupedStudents.flatMap(group => group.students);
    const totalStudents = students.length;
    const totalPassRecords = students.reduce((sum, stu)=> sum + stu.passed, 0);
    const totalCells = totalStudents * allLevels.length;
    const completedRate = totalCells > 0 ? Math.round((totalPassRecords / totalCells) * 100) : 0;
    const threeStarCount = students.reduce((sum, stu) => {
      return sum + Object.values(stu.best || {}).filter(record => Number(record?.stars || 0) >= 3).length;
    }, 0);

    const worldGroups = [];
    allLevels.forEach(level => {
      const last = worldGroups[worldGroups.length - 1];
      if(last && last.worldId === level.worldId){
        last.count += 1;
      }else{
        worldGroups.push({ worldId: level.worldId, worldName: level.worldName, count: 1 });
      }
    });

    const summaryHtml = `
      <div class="teacherSummaryGrid teacherSummaryGridCompact">
        <div class="teacherSummaryCard">
          <div class="small">班級數</div>
          <div class="num">${groupedStudents.length}</div>
        </div>
        <div class="teacherSummaryCard">
          <div class="small">學生人數</div>
          <div class="num">${totalStudents}</div>
        </div>
        <div class="teacherSummaryCard">
          <div class="small">已通關紀錄總數</div>
          <div class="num">${totalPassRecords}</div>
        </div>
        <div class="teacherSummaryCard">
          <div class="small">三星紀錄總數</div>
          <div class="num">${threeStarCount}</div>
        </div>
        <div class="teacherSummaryCard">
          <div class="small">整體完成率</div>
          <div class="num">${completedRate}%</div>
        </div>
      </div>
      <div class="teacherLegend">
        <span class="teacherLegendItem"><span class="teacherDot none"></span>尚未通關</span>
        <span class="teacherLegendItem"><span class="teacherDot one"></span>1 星通關</span>
        <span class="teacherLegendItem"><span class="teacherDot two"></span>2 星通關</span>
        <span class="teacherLegendItem"><span class="teacherDot three"></span>3 星通關</span>
        <span class="teacherLegendItem"><span class="teacherDot boss"></span>Boss 通關</span>
      </div>
    `;

    const bodyHtml = groupedStudents.map(group => {
      const classTotalScore = group.students.reduce((sum, stu) => sum + Number(stu.totalScore || 0), 0);
      const classPassed = group.students.reduce((sum, stu) => sum + Number(stu.passed || 0), 0);

      const classHeaderRow = `
        <tr>
          <td colspan="${allLevels.length + 3}" style="padding:10px 14px;background:rgba(124,92,255,.16);color:#fff;font-weight:900;text-align:left;border-bottom:1px solid rgba(255,255,255,.10);">
            班級 ${group.classId}｜${group.students.length} 人｜通關 ${classPassed} 關｜班級總分 ${classTotalScore}
          </td>
        </tr>
      `;

      const studentRows = group.students.map(stu => {
        const cells = allLevels.map(level => {
          const key = `${level.worldId}-${level.levelId}`;
          const record = stu.best?.[key] || null;
          const view = getRecordStatus(record, level);
          return `
            <td class="statusCell" title="${view.title}">
              <button class="statusBtn ${view.statusClass}" type="button" tabindex="-1">
                <span class="cellMain">${view.main}</span>
                <span class="cellSub">${view.sub}</span>
              </button>
            </td>
          `;
        }).join('');

        return `
          <tr>
            <td class="studentCol">
              <div class="studentMeta">
                <div class="studentName">${stu.classId}-${stu.seat}</div>
                <div class="studentSub">通關 ${stu.passed} 關（含 Boss）｜${sortMode === 'score' ? '本班總分排序' : '本班座號排序'}</div>
              </div>
            </td>
            ${cells}
            <td class="rowAction">
              <button class="danger" data-uid="${stu.userId}">清除</button>
            </td>
            <td class="actionCol" style="min-width:92px;background:#0f1730;color:#fff;font-weight:900;">${stu.totalScore}</td>
          </tr>
        `;
      }).join('');

      return classHeaderRow + studentRows;
    }).join('');

    const boardHtml = `
      <div class="progressBoardWrap">
        <table class="progressBoard">
          <thead>
            <tr>
              <th class="studentCol" rowspan="2">學生</th>
              ${worldGroups.map(group => `<th class="worldHead world-${group.worldId}" colspan="${group.count}">${group.worldName}</th>`).join('')}
              <th class="actionCol" rowspan="2">操作</th>
              <th class="actionCol" rowspan="2">總分</th>
            </tr>
            <tr>
              ${allLevels.map(level => `<th class="levelHead" title="${level.worldName}｜${level.levelName}">${String(level.levelId).toLowerCase() === 'boss' ? 'Boss' : level.levelId}</th>`).join('')}
            </tr>
          </thead>
          <tbody>${bodyHtml}</tbody>
        </table>
      </div>
    `;

    area.innerHTML = summaryHtml + boardHtml;

    area.querySelectorAll('button.danger[data-uid]').forEach(btn => {
      btn.onclick = () => {
        if(!requireTeacherOrBlock('清除個別學生總分')) return;

        const uid = btn.getAttribute('data-uid');
        const ok = confirm(`確定要清除 ${uid} 的「總分」嗎？（會清空該生所有關卡最佳紀錄與排行榜紀錄）`);
        if(!ok) return;

        StorageAPI.clearStudentTotal(uid);
        toast(`✅ 已清除 ${uid} 的總分`);
        render();
      };
    });
  }

  function getDisplayWorldName(world){
    const worldId = String(world?.id || world?.worldId || '');
    return WORLD_NAME_MAP[worldId] || String(world?.name || world?.worldName || worldId);
  }

  function getDisplayLevelName(worldId, level){
    const levelId = String(level?.id || level?.levelId || '');
    const mapped = LEVEL_NAME_MAP[String(worldId)]?.[levelId];
    return mapped || String(level?.name || level?.levelName || levelId);
  }


  function populateSelectOptions(selectId, options, selectedValue = ''){
    const el = document.getElementById(selectId);
    if(!el) return;
    const normalizedSelected = String(selectedValue ?? '').trim();
    el.innerHTML = options.map(option => {
      const value = String(option.value ?? '');
      const label = String(option.label ?? value);
      return `<option value="${value}">${label}</option>`;
    }).join('');
    if(options.some(option => String(option.value ?? '') === normalizedSelected)){
      el.value = normalizedSelected;
    }else if(options[0]){
      el.value = String(options[0].value ?? '');
    }
  }

  function setupEditorDropdowns(levelData = null){
    populateSelectOptions('editStartDir', START_DIR_OPTIONS, levelData?.startDir ?? 1);

    const worldId = getToolWorld();
    const rewardSet = WORLD_REWARD_OPTIONS[worldId] || { items: [], equipments: [] };

    populateSelectOptions(
      'editItemReward',
      rewardSet.items.map(value => ({ value, label: value })),
      levelData?.itemReward || rewardSet.items[0] || ''
    );

    populateSelectOptions(
      'editEquipmentReward',
      rewardSet.equipments.map(value => ({ value, label: value })),
      levelData?.equipmentReward || rewardSet.equipments[0] || ''
    );
  }

  function getWorldList(){
    return getLevelsData().map(world => ({
      id: String(world.worldId),
      name: String(world.worldName || world.worldId),
      levels: Array.isArray(world.levels) ? world.levels : []
    }));
  }

  function renderWorldOptions(){
    const worldSelect = document.getElementById('teacherWorld');
    if(!worldSelect) return;

    const worlds = getWorldList();
    if(worlds.length === 0){
      worldSelect.innerHTML = '<option value="">找不到世界資料</option>';
      return;
    }

    const current = normalizeWorldId(worldSelect.value) || worlds[0].id;
    worldSelect.innerHTML = worlds.map(world => (
      `<option value="${world.id}">${world.id}｜${getDisplayWorldName(world)}</option>`
    )).join('');

    worldSelect.value = worlds.some(w => w.id === current) ? current : worlds[0].id;
  }

  function renderLevelOptions(preferredLevel = ''){
    const levelSelect = document.getElementById('teacherLevel');
    const worldId = getToolWorld();
    if(!levelSelect) return;

    const worlds = getWorldList();
    const world = worlds.find(w => w.id === worldId);

    if(!world){
      levelSelect.innerHTML = '<option value="">找不到關卡資料</option>';
      return;
    }

    const levelOptions = world.levels
      .filter(level => !/boss/i.test(String(level.levelId || level.id || '')))
      .slice(0, 4)
      .map(level => ({
        id: String(level.levelId || level.id),
        name: getDisplayLevelName(worldId, level)
      }));

    const bossOption = { id: 'boss', name: getDisplayLevelName(worldId, { id: 'boss', name: '第5關：Boss 戰' }) };
    const allOptions = [...levelOptions, bossOption];

    levelSelect.innerHTML = allOptions.map(level => (
      `<option value="${level.id}">${level.id}｜${level.name}</option>`
    )).join('');

    const normalized = normalizeLevelId(preferredLevel || levelSelect.value || levelOptions[0]?.id || 'boss', worldId);
    levelSelect.value = allOptions.some(item => item.id === normalized) ? normalized : (levelOptions[0]?.id || 'boss');
  }

  function setupToolSelectors(){
    renderWorldOptions();
    renderLevelOptions();

    const worldSelect = document.getElementById('teacherWorld');
    const levelSelect = document.getElementById('teacherLevel');

    if(worldSelect){
      worldSelect.onchange = ()=>{
        renderLevelOptions();
        setupEditorDropdowns();
        loadSelectedLevelIntoEditor();
      };
    }

    if(levelSelect){
      levelSelect.onchange = ()=>{
        const value = normalizeLevelId(levelSelect.value, getToolWorld());
        if(value) levelSelect.value = value;
        loadSelectedLevelIntoEditor();
      };
    }
  }

  function rememberTeacherAction(action, picked){
    try{
      sessionStorage.setItem(TEACHER_ACTION_KEY, JSON.stringify({
        action,
        world: picked.world,
        level: picked.level,
        at: Date.now()
      }));
    }catch(_err){}
  }

  async function openSelectedLevel(picked){
    const queryBase = `world=${encodeURIComponent(picked.world)}&from=teacher`;
    if(isBossLevel(picked.level)){
      await goToAppPage('boss.html', `${queryBase}&level=boss`);
      return;
    }
    await goToAppPage('game.html', `${queryBase}&level=${encodeURIComponent(picked.level)}`);
  }

  async function openBoss(){
    const picked = validateToolSelection('前往關卡', true);
    if(!picked) return;
    await openSelectedLevel(picked);
  }

  async function saveBestSolution(){
    const picked = validateToolSelection('儲存最佳解法', false);
    if(!picked) return;
    rememberTeacherAction('saveBest', picked);
    toast(`即將前往 ${picked.world} / ${picked.level}。請在遊戲頁面排好積木後，再按右上角教師工具的「儲存最佳解法」。`);
    await openSelectedLevel(picked);
  }

  async function loadBestSolution(){
    const picked = validateToolSelection('載入最佳解法', false);
    if(!picked) return;

    const raw = localStorage.getItem(solutionKey(picked.world, picked.level));
    if(!raw){
      toast(`這一關還沒有儲存最佳解法：${picked.world} / ${picked.level}`);
      return;
    }

    try{
      JSON.parse(raw);
      rememberTeacherAction('loadBest', picked);
      toast(`已找到最佳解法，將前往 ${picked.world} / ${picked.level}。進入後可用教師工具載入。`);
      await openSelectedLevel(picked);
    }catch(err){
      toast('最佳解法資料損壞，請重新儲存。');
    }
  }

  function syncBestCode(){
    const picked = validateToolSelection('同步最佳程式碼數', false);
    if(!picked) return;

    const raw = localStorage.getItem(solutionKey(picked.world, picked.level));
    if(!raw){
      toast(`這一關還沒有儲存最佳解法：${picked.world} / ${picked.level}`);
      return;
    }

    try{
      const payload = JSON.parse(raw);
      const targetBlocks = Number(payload?.targetBlocks || payload?.bestSteps || payload?.steps || 0);
      if(!(targetBlocks > 0)){
        toast('這份最佳解法還沒有程式碼數資訊。請先進入關卡整理好最佳解法後重新儲存，再同步。');
        return;
      }

      const overrides = getStoredTargetBlockOverrides();
      overrides[levelOverrideKey(picked.world, picked.level)] = {
        targetBlocks,
        updatedAt: Date.now(),
        source: 'teacher_best_solution'
      };
      saveStoredTargetBlockOverrides(overrides);
      toast(`✅ 已同步 ${picked.world} / ${picked.level} 的最佳程式碼數為 ${targetBlocks}`);
    }catch(err){
      console.warn(err);
      toast('同步最佳程式碼數失敗，最佳解法資料可能損壞。');
    }
  }
  function normalizeSolutionPayload(raw){
    try{
      const payload = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if(!payload || typeof payload !== 'object') return null;
      const blockly = typeof payload.blockly === 'string' ? payload.blockly : '';
      const targetBlocks = Number(payload?.targetBlocks || payload?.bestSteps || payload?.steps || 0);
      return {
        blockly,
        targetBlocks: Number.isFinite(targetBlocks) && targetBlocks > 0 ? targetBlocks : 0
      };
    }catch(err){
      return null;
    }
  }

  function getCandidateSolutionKeys(worldId, levelId){
    const worldNum = String(normalizeWorldId(worldId)).replace(/^W/i, '');
    const levelNum = String(normalizeLevelId(levelId, worldId)).replace(/^L/i, '');
    return Array.from(new Set([
      solutionKey(worldId, levelId),
      solutionKey(normalizeWorldId(worldId), normalizeLevelId(levelId, worldId)),
      solutionKey(`world${worldNum}`, `level${levelNum}`),
      solutionKey(`W${worldNum}`, `L${levelNum}`)
    ]));
  }

  function findStoredBestSolution(worldId, levelId){
    const keys = getCandidateSolutionKeys(worldId, levelId);
    for(const key of keys){
      const raw = localStorage.getItem(key);
      if(!raw) continue;
      const payload = normalizeSolutionPayload(raw);
      if(payload) return payload;
    }
    return null;
  }

  function downloadTextFile(filename, content){
    const type = String(filename).endsWith('.json')
      ? 'application/json;charset=utf-8'
      : 'application/javascript;charset=utf-8';
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=> URL.revokeObjectURL(url), 1000);
  }

  function exportBestSolutionsToLevels(){
    if(!requireTeacherOrBlock('匯出最佳解法到 levels.js')) return;

    const worlds = getLevelsData();
    if(!Array.isArray(worlds) || worlds.length === 0){
      toast('找不到 LEVELS 資料，無法匯出。');
      return;
    }

    const overrides = getStoredTargetBlockOverrides();
    const levelEdits = getStoredLevelEdits();
    const exported = worlds.map(world => ({
      ...world,
      levels: (Array.isArray(world.levels) ? world.levels : []).map(level => {
        const editPatch = levelEdits[getLevelEditStorageKey(world.worldId, level.levelId)] || {};
        const cloned = {
          ...level,
          ...editPatch,
          map: Array.isArray(editPatch.map) ? editPatch.map.slice() : (Array.isArray(level.map) ? level.map.slice() : [])
        };
        if(isBossLevel(cloned.levelId)) return cloned;

        const best = findStoredBestSolution(world.worldId, cloned.levelId);
        const override = overrides[levelOverrideKey(world.worldId, cloned.levelId)];
        const overrideBlocks = Number(override?.targetBlocks || override?.targetSteps || 0);

        if(best?.blockly){
          cloned.bestXml = best.blockly;
        }
        if(overrideBlocks > 0){
          cloned.targetBlocks = overrideBlocks;
        }else if(best?.targetBlocks > 0){
          cloned.targetBlocks = best.targetBlocks;
        }
        delete cloned.updatedAt;
        delete cloned.source;
        return cloned;
      })
    }));

    let solutionCount = 0;
    let stepCount = 0;
    exported.forEach(world => {
      (world.levels || []).forEach(level => {
        if(isBossLevel(level.levelId)) return;
        if(level.bestXml) solutionCount += 1;
        if(Number(level.targetBlocks || level.targetSteps || 0) > 0) stepCount += 1;
      });
    });

    const js = `// levels.js
// ✅ 此檔由教師後台匯出，已內嵌目前瀏覽器儲存的最佳解法與最佳程式碼數
window.LEVELS = ${JSON.stringify(exported, null, 2)};
`;
    downloadTextFile('levels.js', js);
    toast(`✅ 已匯出 levels.js（含 ${solutionCount} 筆最佳解法、${stepCount} 筆最佳程式碼數）`);
  }


  function getStoredLevelEdits(){
    try{
      const raw = localStorage.getItem(LEVEL_EDIT_OVERRIDE_KEY);
      const data = raw ? JSON.parse(raw) : {};
      return data && typeof data === 'object' ? data : {};
    }catch(err){
      console.warn('讀取關卡修改失敗', err);
      return {};
    }
  }

  function saveStoredLevelEdits(data){
    localStorage.setItem(LEVEL_EDIT_OVERRIDE_KEY, JSON.stringify(data || {}));
  }

  function getLevelEditStorageKey(worldId, levelId){
    return `${normalizeWorldId(worldId)}-${normalizeLevelId(levelId, worldId)}`;
  }

  function findOriginalLevel(worldId, levelId){
    const world = getLevelsData().find(w => String(w.worldId) === String(normalizeWorldId(worldId)));
    if(!world || !Array.isArray(world.levels)) return null;
    return world.levels.find(l => String(l.levelId) === String(normalizeLevelId(levelId, worldId))) || null;
  }

  function getMergedLevelData(worldId, levelId){
    const base = findOriginalLevel(worldId, levelId);
    if(!base) return null;
    const edits = getStoredLevelEdits();
    const patch = edits[getLevelEditStorageKey(worldId, levelId)] || {};
    return {
      ...base,
      ...patch,
      map: Array.isArray(patch.map) ? patch.map.slice() : (Array.isArray(base.map) ? base.map.slice() : [])
    };
  }


  function getMapTextEl(){
    return document.getElementById('editMapText');
  }

  function parseMapText(rawText){
    const rows = String(rawText || '').replace(/\r/g, '').split('\n').map(row => row.trimEnd()).filter(Boolean);
    if(!rows.length) return [];
    const width = rows[0].length;
    if(!width) return [];
    if(!rows.every(row => row.length === width)) return [];
    return rows;
  }

  function getEditorMapRows(){
    const text = getMapTextEl()?.value || '';
    return parseMapText(text);
  }

  function setEditorMapRows(rows){
    const el = getMapTextEl();
    if(!el) return;
    el.value = Array.isArray(rows) ? rows.join('\n') : '';
  }

  function clampMapSize(value){
    const size = Number(value || 0);
    if(!Number.isFinite(size)) return 0;
    return Math.max(3, Math.min(15, Math.round(size)));
  }

  function buildEmptyMapRows(size){
    const finalSize = clampMapSize(size);
    if(!(finalSize > 0)) return [];
    const rows = [];
    for(let y=0; y<finalSize; y++) {
      if(y === 0 || y === finalSize - 1){
        rows.push('#'.repeat(finalSize));
      }else{
        rows.push('#' + '.'.repeat(Math.max(0, finalSize - 2)) + '#');
      }
    }
    return rows;
  }

  function resizeEditorMapRows(rows, size){
    const finalSize = clampMapSize(size);
    if(!(finalSize > 0)) return Array.isArray(rows) ? rows : [];
    const source = Array.isArray(rows) && rows.length ? rows : buildEmptyMapRows(finalSize);
    const oldHeight = source.length;
    const oldWidth = source[0]?.length || 0;
    const next = [];
    for(let y=0; y<finalSize; y++) {
      const row = [];
      for(let x=0; x<finalSize; x++) {
        let ch = '.';
        if(y < oldHeight && x < oldWidth){
          ch = source[y][x] || '.';
        }
        if(y === 0 || x === 0 || y === finalSize - 1 || x === finalSize - 1){
          ch = '#';
        }
        row.push(ch);
      }
      next.push(row.join(''));
    }

    const symbols = ['S','K','D'];
    symbols.forEach(symbol => {
      let found = null;
      next.forEach((row, y)=>{
        row.split('').forEach((cell, x)=>{
          if(cell === symbol && !found) found = {x,y};
        });
      });
      if(found) return;
      const fallback = symbol === 'S' ? {x:1,y:1} : (symbol === 'K' ? {x:Math.max(1, finalSize - 2), y:1} : {x:Math.max(1, finalSize - 2), y:Math.max(1, finalSize - 2)});
      const chars = next.map(r=>r.split(''));
      chars[fallback.y][fallback.x] = symbol;
      for(let y=0; y<chars.length; y++) {
        for(let x=0; x<chars[y].length; x++) {
          if((x !== fallback.x || y !== fallback.y) && chars[y][x] === symbol) chars[y][x] = '.';
        }
      }
      for(let y=0; y<chars.length; y++) next[y] = chars[y].join('');
    });

    return next;
  }

  function syncEditorMapSize(forceSize = null){
    const sizeEl = document.getElementById('editMapSize');
    if(!sizeEl) return;
    const targetSize = clampMapSize(forceSize ?? sizeEl.value);
    if(!(targetSize > 0)) return;
    sizeEl.value = String(targetSize);
    const nextRows = resizeEditorMapRows(getEditorMapRows(), targetSize);
    setEditorMapRows(nextRows);
  }

  function updateCurrentPaintLabel(){
    const el = document.getElementById('currentPaintLabel');
    const meta = MAP_SYMBOLS[currentPaintSymbol] || MAP_SYMBOLS['#'];
    if(el) el.textContent = `${meta.label} ${currentPaintSymbol}`;
  }

  function renderMapPalette(){
    const wrap = document.getElementById('mapPalette');
    if(!wrap) return;
    wrap.innerHTML = Object.entries(MAP_SYMBOLS).map(([symbol, meta])=> `
      <button type="button" class="mapToolBtn ${symbol === currentPaintSymbol ? 'active' : ''}" data-symbol="${symbol}">
        <div style="font-size:20px;">${getMapSymbolHtml(symbol)}</div>
        <div>${meta.label}</div>
        <small>${symbol}</small>
      </button>
    `).join('');
    wrap.querySelectorAll('[data-symbol]').forEach(btn => {
      btn.onclick = ()=>{
        currentPaintSymbol = btn.getAttribute('data-symbol') || '#';
        renderMapPalette();
        updateCurrentPaintLabel();
      };
    });
    updateCurrentPaintLabel();
  }


  function getMapSymbolHtml(symbol){
    const s = String(symbol || '').toUpperCase();
    if(s === 'P') return '<img class="mapSymbol mapSymbolImg portal-img portal-img-blue" src="img/door1.jpeg" alt="藍色傳送門">';
    if(s === 'Q') return '<img class="mapSymbol mapSymbolImg portal-img portal-img-purple" src="img/door2.jpeg" alt="紫色傳送門">';
    if(s === 'R') return '<img class="mapSymbol mapSymbolImg portal-img portal-img-red" src="img/door3.jpeg" alt="紅色傳送門">';
    if(s === 'G') return '<img class="mapSymbol mapSymbolImg symbol-gold-img" src="img/gold.png" alt="裝備寶箱">';
    const meta = MAP_SYMBOLS[s] || MAP_SYMBOLS['.'];
    return `<span class="mapSymbol">${meta.emoji}</span>`;
  }

  function normalizeSingleSymbolRows(rows, symbol, x, y){
    if(!['S','K','D'].includes(symbol)) return rows;
    return rows.map((row, rowIndex)=> row.split('').map((cell, colIndex)=> {
      if(rowIndex === y && colIndex === x) return cell;
      return cell === symbol ? '.' : cell;
    }).join(''));
  }

  function paintCellAt(x, y, symbol = currentPaintSymbol){
    const rows = getEditorMapRows();
    if(!rows.length || y < 0 || y >= rows.length || x < 0 || x >= rows[0].length) return;
    const chars = rows.map(row => row.split(''));
    chars[y][x] = symbol;
    let nextRows = chars.map(row => row.join(''));
    nextRows = normalizeSingleSymbolRows(nextRows, symbol, x, y);
    setEditorMapRows(nextRows);
    renderMapEditorGrid();
  }

  function renderMapEditorGrid(){
    const grid = document.getElementById('mapEditorGrid');
    if(!grid) return;
    const rows = getEditorMapRows();
    if(!rows.length){
      grid.style.gridTemplateColumns = 'repeat(1, 34px)';
      grid.innerHTML = '<div class="small">請先載入關卡資料</div>';
      return;
    }
    const width = rows[0].length;
    grid.style.gridTemplateColumns = `repeat(${width}, 34px)`;
    grid.innerHTML = '';
    rows.forEach((row, y)=>{
      row.split('').forEach((symbol, x)=>{
        const meta = MAP_SYMBOLS[symbol] || MAP_SYMBOLS['.'];
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = `mapEditorCell ${meta.className}`;
        cell.innerHTML = getMapSymbolHtml(symbol);
        cell.title = `(${x+1},${y+1}) ${meta.label} ${symbol}`;
        cell.onmousedown = (e)=>{
          e.preventDefault();
          isPainting = true;
          paintCellAt(x, y);
        };
        cell.onmouseenter = ()=>{
          if(isPainting) paintCellAt(x, y);
        };
        grid.appendChild(cell);
      });
    });
  }

  function bindMapEditorTextSync(){
    const text = getMapTextEl();
    if(!text) return;
    text.addEventListener('input', ()=>{
      renderMapEditorGrid();
    });
    window.addEventListener('mouseup', ()=>{ isPainting = false; });
    window.addEventListener('mouseleave', ()=>{ isPainting = false; });
  }

  function fillLevelEditor(levelData){
    if(!levelData) return;
    const setValue = (id, value)=>{
      const el = document.getElementById(id);
      if(el) el.value = value == null ? '' : String(value);
    };
    setupEditorDropdowns(levelData);
    setValue('editLevelName', levelData.name || '');
    setValue('editTargetBlocks', levelData.targetBlocks || levelData.targetSteps || '');
    setValue('editMapSize', levelData.mapSize || '');
    setValue('editStartDir', levelData.startDir ?? 1);
    setValue('editItemReward', levelData.itemReward || '');
    setValue('editEquipmentReward', levelData.equipmentReward || '');
    setValue('editMapText', Array.isArray(levelData.map) ? levelData.map.join('\n') : '');
    renderMapEditorGrid();
  }

  function loadSelectedLevelIntoEditor(){
    const picked = validateToolSelection('載入關卡資料', false);
    if(!picked) return;
    const levelData = getMergedLevelData(picked.world, picked.level);
    if(!levelData){
      toast('找不到這一關的資料。');
      return;
    }
    fillLevelEditor(levelData);
    toast(`已載入 ${picked.world} / ${picked.level} 的關卡資料。`);
  }

  function buildLevelPatchFromEditor(picked){
    const name = document.getElementById('editLevelName')?.value.trim() || '';
    const targetBlocks = Number(document.getElementById('editTargetBlocks')?.value || 0);
    const mapSize = Number(document.getElementById('editMapSize')?.value || 0);
    const startDir = Number(document.getElementById('editStartDir')?.value || 0);
    const itemReward = document.getElementById('editItemReward')?.value.trim() || '';
    const equipmentReward = document.getElementById('editEquipmentReward')?.value.trim() || '';
    const mapText = document.getElementById('editMapText')?.value || '';

    const map = mapText.split(/\r?\n/).map(x => x.trimEnd()).filter(Boolean);
    if(map.length === 0) throw new Error('地圖不可空白。');

    const width = map[0].length;
    if(width === 0) throw new Error('地圖每一列至少要有 1 個字元。');
    if(!map.every(row => row.length === width)) throw new Error('地圖每一列長度必須一致。');

    const joined = map.join('');
    const countChar = (ch)=>(joined.split(ch).length - 1);
    if(countChar('S') !== 1) throw new Error('地圖必須剛好有 1 個起點 S。');
    if(countChar('K') !== 1) throw new Error('地圖必須剛好有 1 個鑰匙 K。');
    if(countChar('D') !== 1) throw new Error('地圖必須剛好有 1 個出口門 D。');
    if(!/^[#\.SKDTPQRCGMNBXLOF]+$/.test(joined)) throw new Error('地圖只能使用 # . S K D T P Q R C G M N B X L O F 這些符號。');
    ['P','Q','R'].forEach(portalSymbol => {
      const count = countChar(portalSymbol);
      if(count !== 0 && count < 2){
        throw new Error(`傳送門 ${portalSymbol} 至少要放 2 個，學生才知道會傳送到哪裡。`);
      }
    });
    if(!(targetBlocks > 0)) throw new Error('最佳程式碼數必須大於 0。');
    const inferredMapSize = map.length;
    const finalMapSize = mapSize > 0 ? mapSize : inferredMapSize;
    if(!(finalMapSize > 0)) throw new Error('地圖大小必須大於 0。');
    if(map.length !== finalMapSize || width !== finalMapSize) throw new Error('地圖大小與地圖文字不一致，請先調整地圖大小後再儲存。');
    if(!(startDir >= 0 && startDir <= 3)) throw new Error('起始方向只能是 0、1、2、3。');

    return {
      levelId: normalizeLevelId(picked.level, picked.world),
      name,
      targetBlocks,
      mapSize: finalMapSize,
      startDir,
      itemReward,
      equipmentReward,
      map,
      updatedAt: Date.now(),
      source: 'teacher_level_editor'
    };
  }

  function saveEditedLevel(){
    const picked = validateToolSelection('儲存關卡修改', false);
    if(!picked) return;
    try{
      const patch = buildLevelPatchFromEditor(picked);
      const edits = getStoredLevelEdits();
      edits[getLevelEditStorageKey(picked.world, picked.level)] = patch;
      saveStoredLevelEdits(edits);
      toast(`✅ 已儲存 ${picked.world} / ${picked.level} 的關卡修改`);
    }catch(err){
      toast(`❌ ${String(err?.message || err)}`);
    }
  }

  function clearEditedLevel(){
    const picked = validateToolSelection('清除此關修改', false);
    if(!picked) return;
    const key = getLevelEditStorageKey(picked.world, picked.level);
    const edits = getStoredLevelEdits();
    if(!edits[key]){
      toast('這一關目前沒有已儲存的修改。');
      return;
    }
    const ok = confirm(`確定要清除 ${picked.world} / ${picked.level} 的關卡修改嗎？`);
    if(!ok) return;
    delete edits[key];
    saveStoredLevelEdits(edits);
    const original = findOriginalLevel(picked.world, picked.level);
    if(original) fillLevelEditor(original);
    toast(`✅ 已清除 ${picked.world} / ${picked.level} 的關卡修改`);
  }

  function exportEditedLevelJson(){
    const picked = validateToolSelection('匯出此關 JSON', false);
    if(!picked) return;
    try{
      const patch = buildLevelPatchFromEditor(picked);
      downloadTextFile(`${normalizeWorldId(picked.world)}-${normalizeLevelId(picked.level, picked.world)}.json`, JSON.stringify(patch, null, 2));
      toast(`✅ 已匯出 ${picked.world} / ${picked.level} 的 JSON`);
    }catch(err){
      toast(`❌ ${String(err?.message || err)}`);
    }
  }

  async function previewEditedLevel(){
    const picked = validateToolSelection('前往此關預覽', false);
    if(!picked) return;
    try{
      const patch = buildLevelPatchFromEditor(picked);
      const edits = getStoredLevelEdits();
      edits[getLevelEditStorageKey(picked.world, picked.level)] = patch;
      saveStoredLevelEdits(edits);
      await openSelectedLevel(picked);
    }catch(err){
      toast(`❌ ${String(err?.message || err)}`);
    }
  }

  function bindUI(){
    document.getElementById('btnTeacherLogin').onclick = async ()=>{
      const code = document.getElementById('teacherCode').value.trim();
      toast('正在連線驗證教師密碼，請稍候…');
      const s = await Auth.loginTeacher({teacherCode: code});
      if(!s){
        toast('教師密碼錯誤，或後端連線失敗。');
        setBadge();
        return;
      }
      toast('教師登入成功，正在同步雲端資料…');
      await refreshTeacherProgressFromCloud({ silent:true });
      setBadge();
      startTeacherProgressAutoSync();
      loadSelectedLevelIntoEditor();
    };

    document.getElementById('btnTeacherLogout').onclick = ()=>{
      Auth.logout();
      stopTeacherProgressAutoSync();
      toast('已登出。');
      setBadge();
      render();
    };

    document.getElementById('btnBack').onclick = async ()=>{
      await goToAppPage('index.html');
    };

    document.getElementById('btnRefresh').onclick = async ()=>{
      if(!requireTeacherOrBlock('更新列表')) return;
      toast('正在從 MongoDB 更新列表…');
      await refreshTeacherProgressFromCloud({ silent:false });
    };

    const filterClassEl = document.getElementById('filterClass');
    const sortModeEl = document.getElementById('sortMode');
    if(filterClassEl) filterClassEl.onchange = async ()=>{
      if(!requireTeacherOrBlock('切換班級顯示')) return;
      render();
      await refreshTeacherProgressFromCloud({ silent:true });
      const btnClearAll = document.getElementById('btnClearAll');
      if(btnClearAll){
        const selected = String(filterClassEl.value || 'all').trim();
        btnClearAll.textContent = (selected && selected !== 'all')
          ? `清除 ${selected} 班學生總分`
          : '清除全部學生總分';
      }
    };
    if(sortModeEl) sortModeEl.onchange = ()=>{ if(requireTeacherOrBlock('切換排序方式')) render(); };

    const btnClearAll = document.getElementById('btnClearAll');
    const updateClearButtonText = ()=>{
      if(!btnClearAll) return;
      const filterClass = String(document.getElementById('filterClass')?.value || 'all').trim();
      btnClearAll.textContent = (filterClass && filterClass !== 'all')
        ? `清除 ${filterClass} 班學生總分`
        : '清除全部學生總分';
    };

    updateClearButtonText();

    document.getElementById('btnClearAll').onclick = ()=>{
      if(!requireTeacherOrBlock('清除學生總分')) return;

      const filterClass = String(document.getElementById('filterClass')?.value || 'all').trim();

      if(filterClass && filterClass !== 'all'){
        const ok = confirm(`⚠️ 確定要清除「${filterClass} 班」全部學生的總分嗎？（會清空該班所有最佳紀錄、排行榜與積木存檔）`);
        if(!ok) return;

        StorageAPI.clearClassTotal(filterClass);
        toast(`✅ 已清除 ${filterClass} 班全部學生總分`);
      }else{
        const ok = confirm('⚠️ 確定要清除「全部學生」的總分嗎？（會清空所有學生的最佳紀錄、排行榜與積木存檔）');
        if(!ok) return;

        StorageAPI.clearAllStudentsTotal();
        toast('✅ 已清除全部學生總分');
      }

      render();
      updateClearButtonText();
    };

    const btnOpenBoss = document.getElementById('btnOpenBoss');
    const btnSaveBest = document.getElementById('btnSaveBest');
    const btnLoadBest = document.getElementById('btnLoadBest');
    const btnClearBest = document.getElementById('btnClearBest');
    const btnExportBestCode = document.getElementById('btnExportBestCode');
    const btnLoadLevelData = document.getElementById('btnLoadLevelData');
    const btnSaveLevelEdit = document.getElementById('btnSaveLevelEdit');
    const btnPreviewLevelEdit = document.getElementById('btnPreviewLevelEdit');
    const btnExportLevelJson = document.getElementById('btnExportLevelJson');
    const btnClearLevelEdit = document.getElementById('btnClearLevelEdit');
    const editMapSizeEl = document.getElementById('editMapSize');
    if (btnClearBest) btnClearBest.textContent = '同步最佳程式碼數';

    if(btnOpenBoss) btnOpenBoss.onclick = ()=> openBoss();
    if(btnSaveBest) btnSaveBest.onclick = ()=> saveBestSolution();
    if(btnLoadBest) btnLoadBest.onclick = ()=> loadBestSolution();
    if(btnClearBest) btnClearBest.onclick = syncBestCode;
    if(btnExportBestCode) btnExportBestCode.onclick = exportBestSolutionsToLevels;
    if(editMapSizeEl){
      editMapSizeEl.addEventListener('change', ()=>{
        syncEditorMapSize();
        renderMapEditorGrid();
      });
    }

    if(btnLoadLevelData) btnLoadLevelData.onclick = loadSelectedLevelIntoEditor;
    if(btnSaveLevelEdit) btnSaveLevelEdit.onclick = saveEditedLevel;
    if(btnPreviewLevelEdit) btnPreviewLevelEdit.onclick = previewEditedLevel;
    if(btnExportLevelJson) btnExportLevelJson.onclick = exportEditedLevelJson;
    if(btnClearLevelEdit) btnClearLevelEdit.onclick = clearEditedLevel;
  }

  async function init(){
    setupToolSelectors();
    setupEditorDropdowns();
    renderMapPalette();
    bindMapEditorTextSync();
    renderMapEditorGrid();
    setBadge();
    bindUI();
    initTeacherToolsCollapse();
    updateControlsLock();
    if(isTeacherLoggedIn()){
      toast('正在從 MongoDB 讀取學生資料…');
      await refreshTeacherProgressFromCloud({ silent:true });
      startTeacherProgressAutoSync();
    }
    render();
    if(isTeacherLoggedIn()) loadSelectedLevelIntoEditor();

    document.addEventListener('visibilitychange', ()=>{
      if(!document.hidden && isTeacherLoggedIn()) refreshTeacherProgressFromCloud({ silent:true });
    });
  }

  return { init };
})();
