(function(){
  const STORAGE_PREFIX = 'maze_best_solution::';
  const LEVEL_STEP_OVERRIDE_KEY = 'mw_published_level_overrides_v1';

  function qs(name){
    try { return new URL(location.href).searchParams.get(name); } catch(e){ return null; }
  }

  function detectValue(selectors){
    for (const sel of selectors){
      const el = document.querySelector(sel);
      if (!el) continue;
      const value = (el.value ?? el.textContent ?? '').trim();
      if (value) return value;
    }
    return '';
  }

  function detectWorldLevel(){
    const world = qs('world') || detectValue([
      '#worldSelect', '#teacherWorld', '#world', '[name="world"]', '[name="worldId"]'
    ]);
    const level = qs('level') || detectValue([
      '#levelSelect', '#teacherLevel', '#level', '[name="level"]', '[name="levelId"]'
    ]);
    return { world, level };
  }

  function isBossLevel(levelId){
    return /boss/i.test(String(levelId || ''));
  }

  function solutionKey(world, level){
    return `${STORAGE_PREFIX}${world}::${level}`;
  }

  function normalizeWorldId(value){
    const raw = String(value || '').trim();
    if (!raw) return '';
    const m = raw.match(/^(?:world|w)\s*(\d+)$/i);
    if (m) return `W${m[1]}`;
    return raw.toUpperCase();
  }

  function normalizeLevelId(value){
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (/boss/i.test(raw)) return 'boss';
    const m = raw.match(/^(?:level|l)\s*(\d+)$/i);
    if (m) return `L${m[1]}`;
    return raw.toUpperCase();
  }

  function levelOverrideKey(world, level){
    return `${normalizeWorldId(world)}-${normalizeLevelId(level)}`;
  }

  function getCurrentDisplayedSteps(){
    const el = document.getElementById('steps');
    const num = Number(String(el?.textContent || '').trim());
    return Number.isFinite(num) && num > 0 ? num : 0;
  }

  function getStoredStepOverrides(){
    try{
      const raw = localStorage.getItem(LEVEL_STEP_OVERRIDE_KEY);
      const data = raw ? JSON.parse(raw) : {};
      return data && typeof data === 'object' ? data : {};
    }catch(err){
      console.warn('讀取最佳步數覆寫失敗', err);
      return {};
    }
  }

  function saveStoredStepOverrides(data){
    localStorage.setItem(LEVEL_STEP_OVERRIDE_KEY, JSON.stringify(data || {}));
  }

  function updatePageBestSteps(world, level, bestSteps){
    try{
      window.dispatchEvent(new CustomEvent('maze:bestStepsSynced', {
        detail: {
          world: normalizeWorldId(world),
          level: normalizeLevelId(level),
          bestSteps: Number(bestSteps || 0)
        }
      }));
    }catch(err){
      console.warn('派送最佳步數同步事件失敗', err);
    }
  }

  function getBlocklyWorkspace(){
    if (window.Blockly?.getMainWorkspace) return window.Blockly.getMainWorkspace();
    if (window.workspace) return window.workspace;
    return null;
  }

  function workspaceToText(workspace){
    if (!workspace || !window.Blockly) return '';
    if (Blockly.serialization?.workspaces?.save) {
      return JSON.stringify(Blockly.serialization.workspaces.save(workspace));
    }
    if (Blockly.Xml?.workspaceToDom && Blockly.Xml?.domToText) {
      return Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));
    }
    return '';
  }

  function textToWorkspace(text, workspace){
    if (!text || !workspace || !window.Blockly) return false;
    try{
      workspace.clear();
      if (text.trim().startsWith('{') && Blockly.serialization?.workspaces?.load) {
        Blockly.serialization.workspaces.load(JSON.parse(text), workspace);
        return true;
      }
      if (Blockly.Xml?.textToDom && Blockly.Xml?.domToWorkspace) {
        Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(text), workspace);
        return true;
      }
    }catch(err){
      console.error('載入最佳解法失敗', err);
    }
    return false;
  }

  function toast(msg){
    let el = document.getElementById('teacherPatchToast');
    if (!el){
      el = document.createElement('div');
      el.id = 'teacherPatchToast';
      el.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:99999;background:#1f2937;color:#fff;padding:10px 14px;border-radius:12px;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,.22);max-width:320px;';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    clearTimeout(el._timer);
    el._timer = setTimeout(()=>{ if(el) el.remove(); }, 2400);
  }

  function saveBestSolution(){
    const { world, level } = detectWorldLevel();
    if (!world || !level) return toast('找不到目前關卡，請先選擇世界與關卡。');
    if (isBossLevel(level)) return toast('Boss 戰不是積木關，不能儲存 Blockly 最佳解法。');
    const workspace = getBlocklyWorkspace();
    const data = workspaceToText(workspace);
    if (!data) return toast('目前沒有可儲存的積木內容。');
    const currentSteps = getCurrentDisplayedSteps();
    const payload = {
      world,
      level,
      savedAt: Date.now(),
      blockly: data,
      bestSteps: currentSteps > 0 ? currentSteps : undefined
    };
    localStorage.setItem(solutionKey(world, level), JSON.stringify(payload));
    toast(currentSteps > 0
      ? `已儲存 ${world} / ${level} 的最佳解法（最佳步數：${currentSteps}）`
      : `已儲存 ${world} / ${level} 的最佳解法`);
  }

  function loadBestSolution(auto = false){
    const { world, level } = detectWorldLevel();
    if (!world || !level || isBossLevel(level)) return false;
    const raw = localStorage.getItem(solutionKey(world, level));
    if (!raw) {
      if (!auto) toast('這一關還沒有儲存最佳解法。');
      return false;
    }
    const workspace = getBlocklyWorkspace();
    if (!workspace) {
      if (!auto) toast('Blockly 還沒準備好，稍後再試。');
      return false;
    }
    try{
      const payload = JSON.parse(raw);
      const ok = textToWorkspace(payload.blockly, workspace);
      if (ok && !auto) toast(`已載入 ${world} / ${level} 的最佳解法`);
      return ok;
    }catch(err){
      console.error(err);
      if (!auto) toast('最佳解法資料損壞，請重新儲存。');
      return false;
    }
  }

  function syncBestSteps(){
    const { world, level } = detectWorldLevel();
    if (!world || !level) return toast('找不到目前關卡。');
    if (isBossLevel(level)) return toast('Boss 戰沒有一般關卡的最佳步數設定。');

    const raw = localStorage.getItem(solutionKey(world, level));
    if (!raw) return toast('這一關還沒有儲存最佳解法，不能同步最佳步數。');

    try{
      const payload = JSON.parse(raw);
      const currentSteps = getCurrentDisplayedSteps();
      let bestSteps = Number(payload?.bestSteps || payload?.steps || 0);

      if (currentSteps > 0) {
        bestSteps = currentSteps;
      }

      if (!Number.isFinite(bestSteps) || bestSteps <= 0) {
        return toast('找不到已儲存的最佳步數。請先載入最佳解法並執行一次，再按「同步最佳步數」。');
      }

      payload.bestSteps = bestSteps;
      payload.syncedAt = Date.now();
      localStorage.setItem(solutionKey(world, level), JSON.stringify(payload));

      const overrides = getStoredStepOverrides();
      overrides[levelOverrideKey(world, level)] = {
        targetSteps: bestSteps,
        updatedAt: Date.now(),
        source: 'teacher_best_solution'
      };
      saveStoredStepOverrides(overrides);
      updatePageBestSteps(world, level, bestSteps);
      toast(`已同步 ${world} / ${level} 的最佳步數為 ${bestSteps} 步`);
    }catch(err){
      console.error('同步最佳步數失敗', err);
      toast('同步最佳步數失敗，請確認最佳解法資料是否正常。');
    }
  }

  function clearBestSolution(){
    const { world, level } = detectWorldLevel();
    if (!world || !level) return toast('找不到目前關卡。');
    localStorage.removeItem(solutionKey(world, level));
    toast(`已清除 ${world} / ${level} 的最佳解法`);
  }

  function openBoss(){
    const world = detectWorldLevel().world || 'world1';
    location.href = `boss.html?world=${encodeURIComponent(world)}`;
  }

  function injectPanel(){
    if (document.getElementById('teacherPatchPanel')) return;
    const panel = document.createElement('div');
    panel.id = 'teacherPatchPanel';
    panel.style.cssText = [
      'position:fixed','right:16px','top:16px','z-index:99998','width:min(320px,calc(100vw - 24px))',
      'background:#ffffff','border:2px solid #d1d5db','border-radius:18px','padding:14px',
      'box-shadow:0 10px 30px rgba(0,0,0,.16)','font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'
    ].join(';');
    panel.innerHTML = `
      <div style="font-size:18px;font-weight:900;color:#111827;margin-bottom:8px;">教師模式快捷工具</div>
      <div style="font-size:13px;line-height:1.6;color:#374151;margin-bottom:10px;">
        一般關卡會自動載入已儲存的最佳解法；Boss 戰可用下方按鈕快速預覽。
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <button id="tpBossBtn" type="button" style="padding:10px 12px;border:none;border-radius:12px;background:#7c3aed;color:#fff;font-weight:800;cursor:pointer;">查看 Boss 戰</button>
        <button id="tpSaveBtn" type="button" style="padding:10px 12px;border:none;border-radius:12px;background:#059669;color:#fff;font-weight:800;cursor:pointer;">儲存最佳解法</button>
        <button id="tpLoadBtn" type="button" style="padding:10px 12px;border:none;border-radius:12px;background:#2563eb;color:#fff;font-weight:800;cursor:pointer;">載入最佳解法</button>
        <button id="tpClearBtn" type="button" style="padding:10px 12px;border:none;border-radius:12px;background:#dc2626;color:#fff;font-weight:800;cursor:pointer;">同步最佳步數</button>
      </div>
      <div style="margin-top:10px;font-size:12px;color:#6b7280;line-height:1.5;">
        儲存位置：本機瀏覽器 localStorage。<br>鍵名格式：<code style="background:#f3f4f6;padding:2px 4px;border-radius:6px;">maze_best_solution::世界::關卡</code>
      </div>
    `;
    document.body.appendChild(panel);
    panel.querySelector('#tpBossBtn').addEventListener('click', openBoss);
    panel.querySelector('#tpSaveBtn').addEventListener('click', saveBestSolution);
    panel.querySelector('#tpLoadBtn').addEventListener('click', () => loadBestSolution(false));
    panel.querySelector('#tpClearBtn').addEventListener('click', syncBestSteps);
  }

  function setupAutoLoad(){
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      const workspace = getBlocklyWorkspace();
      const { level } = detectWorldLevel();
      if (workspace && level && !isBossLevel(level)) {
        loadBestSolution(true);
        clearInterval(timer);
      }
      if (tries > 40) clearInterval(timer);
    }, 300);
  }

  function setupReloadOnSelectionChange(){
    const selectors = ['#worldSelect', '#teacherWorld', '#world', '[name="world"]', '[name="worldId"]', '#levelSelect', '#teacherLevel', '#level', '[name="level"]', '[name="levelId"]'];
    document.addEventListener('change', (e) => {
      if (!selectors.some(sel => {
        try { return e.target.matches(sel); } catch(_) { return false; }
      })) return;
      setTimeout(() => loadBestSolution(true), 250);
    });
  }

  function init(){
    injectPanel();
    setupAutoLoad();
    setupReloadOnSelectionChange();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.TeacherModePatch = {
    saveBestSolution,
    loadBestSolution,
    syncBestSteps,
    clearBestSolution,
    detectWorldLevel,
    solutionKey
  };
})();
