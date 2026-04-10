(function(){
  const STORAGE_PREFIX = 'maze_best_solution::';
  const LEVEL_TARGET_BLOCK_OVERRIDE_KEY = 'mw_published_level_overrides_v1';
  const PANEL_SHORTCUT_TOGGLE = 'Ctrl+Shift+T';
  const PANEL_SHORTCUT_LOAD = 'Ctrl+Shift+L';

  function getSession(){
    try{
      return window.StorageAPI?.getSession?.() || null;
    }catch(_err){
      return null;
    }
  }

  function isTeacherMode(){
    return getSession()?.role === 'teacher';
  }

  function canUseDeveloperTools(){
    const role = getSession()?.role;
    return role === 'teacher' || role === 'student';
  }

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

  function saveStoredStepOverrides(data){
    localStorage.setItem(LEVEL_TARGET_BLOCK_OVERRIDE_KEY, JSON.stringify(data || {}));
  }

  function updatePageBestCode(world, level, targetBlocks){
    try{
      window.dispatchEvent(new CustomEvent('maze:bestCodeSynced', {
        detail: {
          world: normalizeWorldId(world),
          level: normalizeLevelId(level),
          targetBlocks: Number(targetBlocks || 0)
        }
      }));
    }catch(err){
      console.warn('派送最佳程式碼數同步事件失敗', err);
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

  function getCurrentProgramBlockCount(){
    const workspace = getBlocklyWorkspace();
    try{
      return Number(window.BlocklySetup?.countScoringBlocks?.(workspace) || 0);
    }catch(_err){
      return 0;
    }
  }

  function textToWorkspace(text, workspace){
    if (!text || !workspace || !window.Blockly) return false;
    try{
      window.BlocklySetup?.ensureDefinitions?.();
      if (text.trim().startsWith('{')) {
        const ok = window.BlocklySetup?.loadSerializedText?.(workspace, text);
        if (ok) return true;
      }
      if (Blockly.Xml?.textToDom && Blockly.Xml?.domToWorkspace) {
        workspace.clear();
        Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(text), workspace);
        window.BlocklySetup?.ensureStartBlock?.(workspace);
        window.BlocklySetup?.lockStartBlocks?.(workspace);
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
    if (!canUseDeveloperTools()) return false;
    const { world, level } = detectWorldLevel();
    if (!world || !level) return toast('找不到目前關卡，請先選擇世界與關卡。');
    if (isBossLevel(level)) return toast('Boss 戰不是積木關，不能儲存 Blockly 最佳解法。');
    const workspace = getBlocklyWorkspace();
    const data = workspaceToText(workspace);
    if (!data) return toast('目前沒有可儲存的積木內容。');
    const currentCodeBlocks = getCurrentProgramBlockCount();
    const payload = {
      world,
      level,
      savedAt: Date.now(),
      blockly: data,
      targetBlocks: currentCodeBlocks > 0 ? currentCodeBlocks : undefined
    };
    localStorage.setItem(solutionKey(world, level), JSON.stringify(payload));
    toast(currentCodeBlocks > 0
      ? `已儲存 ${world} / ${level} 的最佳解法（最佳程式碼數：${currentCodeBlocks}）`
      : `已儲存 ${world} / ${level} 的最佳解法`);
    return true;
  }

  function loadBestSolution(auto = false){
    if (!canUseDeveloperTools()) return false;
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

  function syncBestCode(){
    if (!canUseDeveloperTools()) return false;
    const { world, level } = detectWorldLevel();
    if (!world || !level) return toast('找不到目前關卡。');
    if (isBossLevel(level)) return toast('Boss 戰沒有一般關卡的最佳程式碼數設定。');

    const raw = localStorage.getItem(solutionKey(world, level));
    if (!raw) return toast('這一關還沒有儲存最佳解法，不能同步最佳程式碼數。');

    try{
      const payload = JSON.parse(raw);
      const currentCodeBlocks = getCurrentProgramBlockCount();
      let targetBlocks = Number(payload?.targetBlocks || payload?.bestSteps || payload?.steps || 0);

      if (currentCodeBlocks > 0) {
        targetBlocks = currentCodeBlocks;
      }

      if (!Number.isFinite(targetBlocks) || targetBlocks <= 0) {
        return toast('找不到已儲存的最佳程式碼數。請先載入最佳解法並確認工作區有積木，再按「同步最佳程式碼數」。');
      }

      payload.targetBlocks = targetBlocks;
      payload.syncedAt = Date.now();
      localStorage.setItem(solutionKey(world, level), JSON.stringify(payload));

      const overrides = getStoredTargetBlockOverrides();
      overrides[levelOverrideKey(world, level)] = {
        targetBlocks,
        updatedAt: Date.now(),
        source: 'teacher_best_solution'
      };
      saveStoredStepOverrides(overrides);
      updatePageBestCode(world, level, targetBlocks);
      toast(`已同步 ${world} / ${level} 的最佳程式碼數為 ${targetBlocks}`);
      return true;
    }catch(err){
      console.error('同步最佳程式碼數失敗', err);
      toast('同步最佳程式碼數失敗，請確認最佳解法資料是否正常。');
      return false;
    }
  }

  function clearBestSolution(){
    if (!canUseDeveloperTools()) return false;
    const { world, level } = detectWorldLevel();
    if (!world || !level) return toast('找不到目前關卡。');
    localStorage.removeItem(solutionKey(world, level));
    toast(`已清除 ${world} / ${level} 的最佳解法`);
    return true;
  }

  function openBoss(){
    if (!canUseDeveloperTools()) return false;
    const world = detectWorldLevel().world || 'world1';
    location.href = `boss.html?world=${encodeURIComponent(world)}`;
    return true;
  }

  function injectPanel(){
    if (!canUseDeveloperTools()) return null;
    let panel = document.getElementById('teacherPatchPanel');
    if (panel) return panel;

    panel = document.createElement('div');
    panel.id = 'teacherPatchPanel';
    panel.hidden = true;
    panel.setAttribute('aria-hidden', 'true');
    panel.style.cssText = [
      'position:fixed','right:16px','top:16px','z-index:99998','width:min(320px,calc(100vw - 24px))',
      'background:#ffffff','border:2px solid #d1d5db','border-radius:18px','padding:14px',
      'box-shadow:0 10px 30px rgba(0,0,0,.16)','font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'
    ].join(';');
    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;">
        <div style="font-size:18px;font-weight:900;color:#111827;">開發／教師快捷工具</div>
        <button id="tpCloseBtn" type="button" aria-label="關閉教師工具" style="width:34px;height:34px;border:none;border-radius:999px;background:#f3f4f6;color:#374151;font-weight:900;cursor:pointer;">✕</button>
      </div>
      <div style="font-size:13px;line-height:1.6;color:#374151;margin-bottom:10px;">
        登入後可開啟。<br>快捷鍵：<b>${PANEL_SHORTCUT_TOGGLE}</b> 顯示 / 隱藏，<b>${PANEL_SHORTCUT_LOAD}</b> 載入最佳解法。
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <button id="tpBossBtn" type="button" style="padding:10px 12px;border:none;border-radius:12px;background:#7c3aed;color:#fff;font-weight:800;cursor:pointer;">查看 Boss 戰</button>
        <button id="tpSaveBtn" type="button" style="padding:10px 12px;border:none;border-radius:12px;background:#059669;color:#fff;font-weight:800;cursor:pointer;">儲存最佳解法</button>
        <button id="tpLoadBtn" type="button" style="padding:10px 12px;border:none;border-radius:12px;background:#2563eb;color:#fff;font-weight:800;cursor:pointer;">載入最佳解法</button>
        <button id="tpClearBtn" type="button" style="padding:10px 12px;border:none;border-radius:12px;background:#dc2626;color:#fff;font-weight:800;cursor:pointer;">同步最佳程式碼數</button>
      </div>
      <div style="margin-top:10px;font-size:12px;color:#6b7280;line-height:1.5;">
        儲存位置：本機瀏覽器 localStorage。<br>鍵名格式：<code style="background:#f3f4f6;padding:2px 4px;border-radius:6px;">maze_best_solution::世界::關卡</code>
      </div>
    `;
    document.body.appendChild(panel);
    panel.querySelector('#tpCloseBtn').addEventListener('click', hidePanel);
    panel.querySelector('#tpBossBtn').addEventListener('click', openBoss);
    panel.querySelector('#tpSaveBtn').addEventListener('click', saveBestSolution);
    panel.querySelector('#tpLoadBtn').addEventListener('click', () => loadBestSolution(false));
    panel.querySelector('#tpClearBtn').addEventListener('click', syncBestCode);
    return panel;
  }

  function showPanel(){
    if (!canUseDeveloperTools()) return false;
    const panel = injectPanel();
    if (!panel) return false;
    panel.hidden = false;
    panel.setAttribute('aria-hidden', 'false');
    return true;
  }

  function hidePanel(){
    const panel = document.getElementById('teacherPatchPanel');
    if (!panel) return false;
    panel.hidden = true;
    panel.setAttribute('aria-hidden', 'true');
    return true;
  }

  function togglePanel(){
    if (!canUseDeveloperTools()) return false;
    const panel = injectPanel();
    if (!panel) return false;
    if (panel.hidden) {
      showPanel();
      toast(`已開啟快捷工具（${PANEL_SHORTCUT_TOGGLE}）`);
    } else {
      hidePanel();
      toast('已隱藏快捷工具');
    }
    return true;
  }

  function setupKeyboardShortcut(){
    document.addEventListener('keydown', (e) => {
      if (!canUseDeveloperTools()) return;
      const tag = String(e.target?.tagName || '').toLowerCase();
      const isEditing = e.target?.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select';
      if (isEditing) return;
      const key = String(e.key || '').toLowerCase();
      if (!(e.ctrlKey && e.shiftKey)) return;

      if (key === 't') {
        e.preventDefault();
        togglePanel();
        return;
      }

      if (key === 'l') {
        e.preventDefault();
        const ok = loadBestSolution(false);
        if (!ok) toast('目前無法載入最佳解法。');
      }
    });
  }

  function init(){
    if (!canUseDeveloperTools()) {
      hidePanel();
      return;
    }
    injectPanel();
    setupKeyboardShortcut();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once:true });
  } else {
    init();
  }

  window.TeacherModePatch = {
    saveBestSolution,
    loadBestSolution,
    syncBestCode,
    clearBestSolution,
    detectWorldLevel,
    solutionKey,
    showPanel,
    hidePanel,
    togglePanel,
    isTeacherMode,
    canUseDeveloperTools
  };
})();
