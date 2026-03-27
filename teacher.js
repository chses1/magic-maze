
// teacher.js
window.TeacherPage = (()=>{

  const STORAGE_PREFIX = 'maze_best_solution::';

  const WORLD_NAME_MAP = {
    W1: '世界1｜魔法學院（序列）',
    W2: '世界2｜符文森林（迴圈）',
    W3: '世界3｜敬請期待',
    W4: '世界4｜敬請期待'
  };

  const LEVEL_NAME_MAP = {
    W1: {
      L1: '第1關：學院大門',
      L2: '第2關：分岔路口',
      L3: '第3關：岔路不通',
      L4: '第4關：小心陷阱',
      boss: '第5關：教授 Boss 戰'
    },
    W2: {
      L1: '第1關：符文護身',
      L2: '第2關：傳送門捷徑',
      L3: '第3關：藤蔓陷阱',
      L4: '第4關：採集蘑菇',
      boss: '第5關：狼王 Boss 戰'
    },
    W3: {
      L1: '第1關（教學）：條件轉彎練習',
      L2: '第2關：迷路書架（轉彎很多）',
      L3: '第3關：陷阱書頁（T）',
      L4: '第4關：傳送書庫（P）',
      boss: '第5關：館長 Boss 戰'
    },
    W4: {
      L1: '第1關（教學）：咒語入門（重複走法）',
      L2: '第2關：齒輪核心（I / P）',
      L3: '第3關：蒸汽陷阱（T / I）',
      L4: '第4關：管線傳送（P）',
      boss: '第5關：機械主宰 Boss 戰'
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

  function solutionKey(world, level){
    return `${STORAGE_PREFIX}${world}::${level}`;
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
      'btnClearAll', 'btnRefresh', 'filterClass',
      'teacherWorld', 'teacherLevel',
      'btnOpenBoss', 'btnSaveBest', 'btnLoadBest', 'btnClearBest'
    ];

    ids.forEach(id => {
      const el = document.getElementById(id);
      if(el) el.disabled = !isTeacher;
    });

    const tableCard = document.getElementById('tableCard');
    if(tableCard) tableCard.style.display = isTeacher ? '' : 'none';

    const teacherToolsCard = document.getElementById('teacherToolsCard');
    if(teacherToolsCard) teacherToolsCard.style.display = isTeacher ? '' : 'none';
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

  function render(){
    const area = document.getElementById('tableArea');
    if(!area) return;

    if(!isTeacherLoggedIn()){
      area.textContent = '請先登入教師帳號。';
      return;
    }

    const filterClass = (document.getElementById('filterClass')?.value || '').trim();
    const progress = StorageAPI.getProgress();

    const students = Object.keys(progress)
      .filter(uid => uid !== 'teacher')
      .filter(uid => /^\d{5}$/.test(uid))
      .map(uid=>{
        const classId = uid.slice(0,3);
        const seat = uid.slice(3,5);
        const best = progress[uid]?.best || {};
        const passed = Object.keys(best).length;
        const totalScore = calcTotalScore(best);
        return { userId: uid, classId, seat, passed, totalScore };
      })
      .filter(stu => !filterClass || stu.classId === filterClass)
      .sort((a,b)=> a.classId.localeCompare(b.classId) || a.seat.localeCompare(b.seat));

    if(students.length === 0){
      area.textContent = '沒有資料（或篩選條件下無學生）。';
      return;
    }

    const table = document.createElement('table');
    table.className = 'table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>班級</th>
          <th>座號</th>
          <th>通關數</th>
          <th>總分</th>
          <th>清除該生總分</th>
        </tr>
      </thead>
      <tbody>
        ${students.map(stu=>`
          <tr>
            <td>${stu.classId}</td>
            <td>${stu.seat}</td>
            <td>${stu.passed}</td>
            <td>${stu.totalScore}</td>
            <td>
              <button class="danger" data-uid="${stu.userId}">清除</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    `;

    area.innerHTML = '';
    area.appendChild(table);

    area.querySelectorAll('button.danger').forEach(btn=>{
      btn.onclick = ()=>{
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
      };
    }

    if(levelSelect){
      levelSelect.onchange = ()=>{
        const value = normalizeLevelId(levelSelect.value, getToolWorld());
        if(value) levelSelect.value = value;
      };
    }
  }

  async function openBoss(){
    const picked = validateToolSelection('前往關卡', true);
    if(!picked) return;

    if(isBossLevel(picked.level)){
      await goToAppPage('boss.html', `world=${encodeURIComponent(picked.world)}&level=boss`);
      return;
    }

    await goToAppPage('game.html', `world=${encodeURIComponent(picked.world)}&level=${encodeURIComponent(picked.level)}`);
  }

  function saveBestPlaceholder(){
    const picked = validateToolSelection('儲存最佳解法', false);
    if(!picked) return;
    toast(`請進入 ${picked.world} / ${picked.level} 的遊戲關卡後，再使用遊戲頁中的教師快捷功能儲存最佳解法。`);
  }

  function loadBestSolution(){
    const picked = validateToolSelection('載入最佳解法', false);
    if(!picked) return;
    const raw = localStorage.getItem(solutionKey(picked.world, picked.level));
    if(!raw){
      toast(`這一關還沒有儲存最佳解法：${picked.world} / ${picked.level}`);
      return;
    }
    try{
      JSON.parse(raw);
      toast(`已找到最佳解法：${picked.world} / ${picked.level}（請進入遊戲關卡自動載入）`);
    }catch(err){
      toast('最佳解法資料損壞，請重新儲存。');
    }
  }

  function clearBestSolution(){
    const picked = validateToolSelection('清除最佳解法', true);
    if(!picked) return;
    const key = solutionKey(picked.world, picked.level);
    if(!localStorage.getItem(key)){
      toast(`目前沒有可清除的最佳解法：${picked.world} / ${picked.level}`);
      return;
    }
    const ok = confirm(`確定要清除 ${picked.world} / ${picked.level} 的最佳解法嗎？`);
    if(!ok) return;
    localStorage.removeItem(key);
    toast(`✅ 已清除 ${picked.world} / ${picked.level} 的最佳解法`);
  }

  function bindUI(){
    document.getElementById('btnTeacherLogin').onclick = ()=>{
      const code = document.getElementById('teacherCode').value.trim();
      const s = Auth.loginTeacher({teacherCode: code});
      if(!s){
        toast('教師密碼錯誤。');
        setBadge();
        return;
      }
      toast('教師登入成功！');
      setBadge();
      render();
    };

    document.getElementById('btnTeacherLogout').onclick = ()=>{
      Auth.logout();
      toast('已登出。');
      setBadge();
      render();
    };

    document.getElementById('btnBack').onclick = async ()=>{
      await goToAppPage('index.html');
    };

    document.getElementById('btnRefresh').onclick = ()=>{
      if(!requireTeacherOrBlock('更新列表')) return;
      render();
      toast('已更新列表。');
    };

    document.getElementById('btnClearAll').onclick = ()=>{
      if(!requireTeacherOrBlock('清除全部學生總分')) return;

      const ok = confirm('⚠️ 確定要清除「全部學生」的總分嗎？（會清空所有學生的最佳紀錄與排行榜）');
      if(!ok) return;

      StorageAPI.clearAllStudentsTotal();
      toast('✅ 已清除全部學生總分');
      render();
    };

    const btnOpenBoss = document.getElementById('btnOpenBoss');
    const btnSaveBest = document.getElementById('btnSaveBest');
    const btnLoadBest = document.getElementById('btnLoadBest');
    const btnClearBest = document.getElementById('btnClearBest');

    if(btnOpenBoss) btnOpenBoss.onclick = ()=> openBoss();
    if(btnSaveBest) btnSaveBest.onclick = saveBestPlaceholder;
    if(btnLoadBest) btnLoadBest.onclick = loadBestSolution;
    if(btnClearBest) btnClearBest.onclick = clearBestSolution;
  }

  function init(){
    setupToolSelectors();
    setBadge();
    bindUI();
    updateControlsLock();
    render();
  }

  return { init };
})();
