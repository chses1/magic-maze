
// game.js
// 第一世界 UI ＋ Boss 戰整合版（單色背景、修正積木執行）
window.GamePage = (()=>{
  const DIRS = [
    {dx:0, dy:-1, emoji:"↑"},
    {dx:1, dy:0, emoji:"→"},
    {dx:0, dy:1, emoji:"↓"},
    {dx:-1, dy:0, emoji:"←"},
  ];

  const CHARACTER_OUTCOME_IMAGES = {
    boy: { win: 'img/boy-win.png', lose: 'img/boy-lose.png' },
    girl: { win: 'img/girl-win.png', lose: 'img/girl-lose.png' }
  };

  const WORLD_ASSETS = {
    W1: {
      worldBg: "img/world1_bg_magic_academy.png",
      boss: "img/world1_boss_professor.png",
      cards: {
        potion: "img/world1_item_01_mana_crystal.png",
        dagger: "img/world1_item_02_novice_wand.png",
        shield: "img/world1_item_03_academy_robe.png",
        freeze: "img/world1_item_04_seal_scroll.png",
      }
    },
    W2: {
      worldBg: "img/world2_bg_runic_forest.png",
      boss: "img/world2_boss_wolf_king.png",
      cards: {
        potion: "img/world2_item_01_healing_potion.png",
        dagger: "img/world2_item_02_dagger_attack.png",
        shield: "img/world2_item_03_wooden_shield.png",
        freeze: "img/world2_item_04_frozen_vine.png",
      }
    },
    W3: {
      worldBg: "img/world3_bg_time_library.png",
      boss: "img/world3_boss_librarian.png",
      cards: {
        potion: "img/world3_item_01_time_hourglass.png",
        dagger: "img/world3_item_02_magic_quill.png",
        shield: "img/world3_item_03_prophecy_page.png",
        freeze: "img/world3_item_04_time_key.png",
      }
    },
    W4: {
      worldBg: "img/world4_bg_mech_castle.png",
      boss: "img/world4_boss_mech_overlord.png",
      cards: {
        potion: "img/world4_item_01_gear_core.png",
        dagger: "img/world4_item_02_steam_gauntlet.png",
        shield: "img/world4_item_03_spell_chip.png",
        freeze: "img/world4_item_04_clockwork_key.png",
      }
    }
  };

  const WORLD_COPY = {
    W1: {
      introTitle: "第一世界：魔法學院",
      introBody: "你將在魔法學院中學會最基礎的程式控制，透過前進與轉向走出迷宮，並蒐集四個魔法道具。",
      bossHint: "完成所有一般關後，你將挑戰第一位關主──教授！",
      cardsTitle: "本世界可獲得道具",
      cardsRule: "下方顯示的是本世界四關會依序獲得的不同道具；每個道具之後都可作為 Boss 戰卡牌使用一次。",
      bossTitle: "教授",
      bossBody: "魔法學院的最終考驗已經開始。帶著你在各關蒐集到的道具，挑戰學院教授。",
      bossStageTitle: "Boss 戰：教授",
      bossStageIntro: "你已通過魔法學院的所有試煉，現在要用前面收集到的道具，挑戰教授。",
      rewards: [
        { key: "potion", title: "魔力水晶", desc: "恢復魔力並強化下一次攻擊。" },
        { key: "dagger", title: "新生魔杖", desc: "發射基礎魔法，直接造成傷害。" },
        { key: "shield", title: "學院法袍", desc: "提供防護，減少受到的傷害。" },
        { key: "freeze", title: "封印卷軸", desc: "暫時封住敵人的下一次行動。" },
      ],
      levelRewards: ["魔力水晶","新生魔杖","學院法袍","封印卷軸"],
      rewardDescs: [
        "恢復魔力並強化下一次攻擊。",
        "發射基礎魔法，直接造成傷害。",
        "提供防護，減少受到的傷害。",
        "暫時封住敵人的下一次行動。"
      ],
      bossReward: "通往第二世界",
      bossRewardDesc: "擊敗教授後即可開啟第二世界。"
    },
    W2: {
      introTitle: "第二世界：符文森林",
      introBody: "在符文森林中，你將開始運用迴圈與規律路線，並蒐集適合野外戰鬥的四個生存道具。",
      bossHint: "完成所有一般關後，你將挑戰第二位關主──狼王！",
      cardsTitle: "本世界可獲得道具",
      cardsRule: "每個道具都能在狼王戰中使用一次，請觀察狼王的出招節奏再決定時機。",
      bossTitle: "狼王",
      bossBody: "森林最深處的守護者正在等待你。用你在迷宮中得到的道具突破牠的攻勢。",
      bossStageTitle: "Boss 戰：狼王",
      bossStageIntro: "你已通過符文森林的所有試煉，現在要用前面收集到的道具，挑戰狼王。",
      rewards: [
        { key: "potion", title: "補血小藥水", desc: "立刻補滿生命值。" },
        { key: "dagger", title: "小刀攻擊", desc: "快速出手，造成高傷害。" },
        { key: "shield", title: "木盾防禦", desc: "立刻獲得大量護盾。" },
        { key: "freeze", title: "冰凍藤蔓", desc: "讓 Boss 暫時無法行動。" },
      ],
      levelRewards: ["補血小藥水","小刀攻擊","木盾防禦","冰凍藤蔓"],
      rewardDescs: [
        "立刻補滿生命值。",
        "快速出手，造成高傷害。",
        "立刻獲得大量護盾。",
        "讓 Boss 暫時無法行動。"
      ],
      bossReward: "通往第三世界",
      bossRewardDesc: "擊敗狼王後即可開啟第三世界。"
    },
    W3: {
      introTitle: "第三世界：時光圖書館",
      introBody: "在時光圖書館中，你將學習條件判斷，觀察前方是否有路，並收集四個與時間和知識有關的道具。",
      bossHint: "完成所有一般關後，你將挑戰第三位關主──館長！",
      cardsTitle: "本世界可獲得道具",
      cardsRule: "這些道具擅長干擾與預判，很適合在館長戰中掌握節奏。",
      bossTitle: "館長",
      bossBody: "圖書館深處的守護館長已經甦醒。善用時間系道具，破解他的攻擊節奏。",
      bossStageTitle: "Boss 戰：館長",
      bossStageIntro: "你已通過時光圖書館的所有試煉，現在要用前面收集到的道具，挑戰館長。",
      rewards: [
        { key: "potion", title: "時光沙漏", desc: "回復生命並延緩敵人行動。" },
        { key: "dagger", title: "館藏羽毛筆", desc: "寫下反擊咒文，造成傷害。" },
        { key: "shield", title: "預言書頁", desc: "預見危機，獲得護盾。" },
        { key: "freeze", title: "時空鑰匙", desc: "鎖住時間，限制敵人下一步。" },
      ],
      levelRewards: ["時光沙漏","館藏羽毛筆","預言書頁","時空鑰匙"],
      rewardDescs: [
        "回復生命並延緩敵人行動。",
        "寫下反擊咒文，造成傷害。",
        "預見危機，獲得護盾。",
        "鎖住時間，限制敵人下一步。"
      ],
      bossReward: "通往第四世界",
      bossRewardDesc: "擊敗館長後即可開啟第四世界。"
    },
    W4: {
      introTitle: "第四世界：機械城堡",
      introBody: "在機械城堡中，你將學習函式與重複走法，把複雜路線整理成可重用的咒語流程。",
      bossHint: "完成所有一般關後，你將挑戰最終關主──機械主宰！",
      cardsTitle: "本世界可獲得道具",
      cardsRule: "這些道具偏向蓄力、爆發與停機控制，適合最終 Boss 戰。",
      bossTitle: "機械主宰",
      bossBody: "城堡深處的核心控制者已經啟動。帶上所有機械道具，挑戰最後的主宰。",
      bossStageTitle: "Boss 戰：機械主宰",
      bossStageIntro: "你已通過機械城堡的所有試煉，現在要用前面收集到的道具，挑戰機械主宰。",
      rewards: [
        { key: "potion", title: "齒輪核心", desc: "恢復生命並強化下次攻擊。" },
        { key: "dagger", title: "蒸汽手套", desc: "重擊造成大量傷害。" },
        { key: "shield", title: "機械咒語晶片", desc: "展開護罩，獲得護盾。" },
        { key: "freeze", title: "傳動發條鑰匙", desc: "卡住齒輪，短暫停機敵人。" },
      ],
      levelRewards: ["齒輪核心","蒸汽手套","機械咒語晶片","傳動發條鑰匙"],
      rewardDescs: [
        "恢復生命並強化下次攻擊。",
        "重擊造成大量傷害。",
        "展開護罩，獲得護盾。",
        "卡住齒輪，短暫停機敵人。"
      ],
      bossReward: "最終通關證明",
      bossRewardDesc: "擊敗機械主宰後，你就完成了整個冒險。"
    }
  };

  function getWorldAssets(worldId = world?.worldId){
    return WORLD_ASSETS[normalizeWorldId(worldId)] || WORLD_ASSETS.W1;
  }

  function getWorldCopy(worldId = world?.worldId){
    return WORLD_COPY[normalizeWorldId(worldId)] || WORLD_COPY.W1;
  }

  function getCardData(worldId = world?.worldId){
    const assets = getWorldAssets(worldId);
    const copy = getWorldCopy(worldId);
    const rewards = copy.rewards || [];
    return {
      potion: { key: rewards[0]?.key || "potion", title: rewards[0]?.title || "道具1", desc: rewards[0]?.desc || "", img: assets.cards.potion },
      dagger: { key: rewards[1]?.key || "dagger", title: rewards[1]?.title || "道具2", desc: rewards[1]?.desc || "", img: assets.cards.dagger },
      shield: { key: rewards[2]?.key || "shield", title: rewards[2]?.title || "道具3", desc: rewards[2]?.desc || "", img: assets.cards.shield },
      freeze: { key: rewards[3]?.key || "freeze", title: rewards[3]?.title || "道具4", desc: rewards[3]?.desc || "", img: assets.cards.freeze },
    };
  }

  function buildLevelCopyMap(){
    const map = {};
    Object.keys(WORLD_COPY).forEach(worldKey => {
      const copy = WORLD_COPY[worldKey];
      const worldSlug = `world${String(worldKey).replace(/^W/i, '')}`;
      const cards = getCardData(worldKey);
      const cardList = [cards.potion, cards.dagger, cards.shield, cards.freeze];
      for (let i = 0; i < 4; i++) {
        map[`${worldSlug}-level${i+1}`] = {
          title: `第${i+1}關`,
          intro: "請用程式積木控制角色穿越迷宮，先拿鑰匙，再走到出口門。",
          hint: "請先觀察路線，再用積木排出正確順序。",
          reward: cardList[i].title,
          rewardDesc: cardList[i].desc,
          rewardImg: cardList[i].img,
          success: "你成功走出迷宮了！",
          fail: "這次還沒成功，再試一次吧！"
        };
      }
      map[`${worldSlug}-boss`] = {
        title: copy.bossStageTitle,
        intro: copy.bossStageIntro,
        hint: "提示：看準 Boss 的攻擊節奏，再決定要攻擊、防禦或使用道具。",
        reward: copy.bossReward,
        rewardDesc: copy.bossRewardDesc,
        rewardImg: getWorldAssets(worldKey).boss,
        success: `你擊敗了${copy.bossTitle}！`,
        fail: `${copy.bossTitle}仍然站在你面前，再準備一下後重來吧！`
      };
    });
    return map;
  }

  const LEVEL_COPY = buildLevelCopyMap();

  const DEFAULT_COPY = {
    title: "迷宮試煉",
    intro: "請用程式積木控制角色穿越迷宮，先拿鑰匙，再走到出口門。",
    hint: "請先觀察路線，再用積木排出正確順序。",
    reward: "神秘獎勵",
    rewardDesc: "完成本關後可解鎖新的冒險內容。",
    rewardImg: WORLD_ASSETS.W1.cards.potion,
    success: "你成功完成試煉了！",
    fail: "這次還沒成功，再試一次吧！"
  };


  const UI = {
    buttons: {
      run: "執行程式",
      pause: "暫停 / 繼續",
      reset: "重設關卡",
      exit: "離開關卡",
    },
    common: {
      startTip: "請用積木寫好程式後按「執行程式」",
      running: "程式執行中…（可按暫停）",
      notStarted: "還沒開始執行喔，先按「執行程式」",
      paused: "已暫停，按一次可繼續執行。",
      resumed: "已繼續執行！",
      stopped: "已停止執行。",
      wall: "前方有牆，角色無法前進！",
      doorLocked: "門鎖住了！先拿鑰匙 🗝️",
      doorOpen: "門打開了！🔓",
      gotKey: "你拿到鑰匙了！",
      gotCard: "你獲得了一個新道具！",
      trap: "小心！你踩到陷阱了！本關步數懲罰 +3",
      needFix: "再調整積木，試著拿到鑰匙後走到出口門 🚪",
      winToast: "恭喜通關！你可以回首頁挑戰下一關。",
      codeError: "程式錯誤：請檢查積木或重來一次。",
      exitConfirm: "確定要離開這一關嗎？目前進度將不會保留。",
      noLevel: "找不到關卡資料！"
    }
  };
  let workspace = null;
  let level = null;
  let world = null;
  let grid = [];
  let W=0,H=0;
  let px=0, py=0, dir=0;
  let hasKey=false;
  let steps=0, bumps=0;
  let startAt=0;
  let tickTimer = null;
  let running = false;
  let paused = false;
  let abortRun = false;
  let stepMode = false;
  let stepCredits = 0;
  let stepWaiterResolve = null;
  let bossState = null;
  let runGeneration = 0;

  const PROGRAM_STORE_KEY = "maze_saved_programs_v1";
  const WORLD4_HINT_ONCE_KEY = "mw_world4_hint_seen_v1";
  const LEVEL_TARGET_BLOCK_OVERRIDE_KEY = "mw_published_level_overrides_v1";
  const LEVEL_EDIT_OVERRIDE_KEY = 'mw_teacher_level_edits_v1';

  const PLAYER_BUILD_KEY = "mw_player_build_v1";
  const EQUIPMENT_EFFECTS = {
    "頭盔": { defBonus: 1 },
    "盔甲": { defBonus: 2 },
    "盾牌": { defBonus: 2 },
    "劍": { atkBonus: 2 }
  };

  const MAX_BUMPS_BEFORE_SAFE_STOP = 3; // ✅ 撞牆達 3 次就安全停止，避免學生程式卡住

  let startX = 0, startY = 0;
  let openedItemChest = false;
  let openedEquipmentChest = false;
  let collectedItemName = "";
  let collectedEquipmentName = "";
  let portalPositions = {};
  let legendTimer = null;
  let legendIndex = 0;
  let mazeScale = 1;
  let mazeManualScale = 1;

  const LEGEND_CARDS = [
    { icon: '🗝️', title: '鑰匙', desc: '先拿到鑰匙，鎖住的出口門才會打開。' },
    { icon: '🚪🔒', title: '鎖住的出口門', desc: '門就是出口；沒有鑰匙時不能通過。' },
    { icon: '🎁', title: '道具寶箱', desc: '拿到本關道具，Boss 戰時就能使用一次。' },
    { icon: '🧰', title: '裝備寶箱', desc: '拿到裝備後，Boss 戰會提升攻擊或防禦。' },
    { icon: '🕳️', title: '陷阱', desc: '踩到陷阱會被懲罰，可能回起點或被傳送。' },
    { icon: '🌀', title: '同色傳送門', desc: '藍、紫、紅傳送門會把角色送到同顏色的另一個位置。' },
    { icon: '🧊', title: '特殊地形', desc: '冰塊、河流、妖怪、火焰目前都會擋路，之後可再搭配對應咒語。' }
  ];

  function getSessionSafe(){
    try{
      return StorageAPI?.getSession?.() || null;
    }catch(_err){
      return null;
    }
  }

  function ensureUserMeta(progress, userId){
    progress[userId] ??= { best: {}, meta: {} };
    progress[userId].meta ??= {};
    const meta = progress[userId].meta;
    meta.itemsByWorld ??= {};
    meta.equipmentsByWorld ??= {};
    meta.itemLevels ??= {};
    meta.equipmentLevels ??= {};
    meta.threeStarLevels ??= {};
    meta.hpBonus ??= 0;
    meta.atkBonus ??= 0;
    meta.defBonus ??= 0;
    return meta;
  }

  function loadPlayerBuild(userId){
    if (!userId) {
      return { itemsByWorld:{}, equipmentsByWorld:{}, itemLevels:{}, equipmentLevels:{}, threeStarLevels:{}, hpBonus:0, atkBonus:0, defBonus:0 };
    }
    try{
      const progress = StorageAPI?.getProgress?.() || {};
      const meta = ensureUserMeta(progress, userId);
      return JSON.parse(JSON.stringify(meta));
    }catch(_err){
      return { itemsByWorld:{}, equipmentsByWorld:{}, itemLevels:{}, equipmentLevels:{}, threeStarLevels:{}, hpBonus:0, atkBonus:0, defBonus:0 };
    }
  }

  function savePlayerBuild(userId, updater){
    if (!userId || typeof updater !== 'function') return null;
    try{
      const progress = StorageAPI?.getProgress?.() || {};
      const meta = ensureUserMeta(progress, userId);
      updater(meta, progress);
      StorageAPI?.saveProgress?.(progress);
      try{
        localStorage.setItem(PLAYER_BUILD_KEY, JSON.stringify({
          userId: String(userId),
          savedAt: Date.now(),
          build: meta
        }));
      }catch(_err){}
      return meta;
    }catch(err){
      console.warn('savePlayerBuild failed', err);
      return null;
    }
  }

  function addUnique(list, value){
    if (!value) return false;
    if (!Array.isArray(list)) return false;
    if (list.includes(value)) return false;
    list.push(value);
    return true;
  }

  function getEquipmentEffect(name){
    return EQUIPMENT_EFFECTS[String(name || '').trim()] || {};
  }

  function getPlayerBuildSummary(userId = getSessionSafe()?.userId){
    const meta = loadPlayerBuild(userId);
    return {
      hpBonus: Number(meta.hpBonus || 0),
      atkBonus: Number(meta.atkBonus || 0),
      defBonus: Number(meta.defBonus || 0),
      itemsByWorld: meta.itemsByWorld || {},
      equipmentsByWorld: meta.equipmentsByWorld || {}
    };
  }

  function persistLevelRewards(stars){
    const session = getSessionSafe();
    if (!session?.userId || !world || !level) return null;
    const key = levelKey();
    return savePlayerBuild(session.userId, (meta)=>{
      const worldId = String(world.worldId || '');
      meta.itemsByWorld[worldId] ??= [];
      meta.equipmentsByWorld[worldId] ??= [];

      if (openedItemChest && collectedItemName) {
        meta.itemLevels[key] = collectedItemName;
        addUnique(meta.itemsByWorld[worldId], collectedItemName);
      }
      if (openedEquipmentChest && collectedEquipmentName) {
        const wasNew = !meta.equipmentLevels[key];
        meta.equipmentLevels[key] = collectedEquipmentName;
        addUnique(meta.equipmentsByWorld[worldId], collectedEquipmentName);
        if (wasNew) {
          const effect = getEquipmentEffect(collectedEquipmentName);
          meta.atkBonus = Number(meta.atkBonus || 0) + Number(effect.atkBonus || 0);
          meta.defBonus = Number(meta.defBonus || 0) + Number(effect.defBonus || 0);
        }
      }
      if (stars >= 3 && !meta.threeStarLevels[key]) {
        meta.threeStarLevels[key] = true;
        meta.hpBonus = Number(meta.hpBonus || 0) + 4;
      }
    });
  }

  function isPortalSymbol(ch){
    return ['P','Q','R'].includes(String(ch || '').toUpperCase());
  }

  function getTeleportDestination(x, y, symbol = ''){
    const list = portalPositions[String(symbol || '').toUpperCase()] || [];
    if (!Array.isArray(list) || list.length < 2) return null;
    const idx = list.findIndex(p => p.x === x && p.y === y);
    if (idx === -1) return null;
    return list[(idx + 1) % list.length];
  }

  function formatWorldInventory(worldId, build){
    const items = build?.itemsByWorld?.[worldId] || [];
    const equips = build?.equipmentsByWorld?.[worldId] || [];
    return `
      <div class="stage-stars-reward">
        目前本世界已取得道具：${items.length ? items.join('、') : '尚未取得'}<br>
        目前本世界已取得裝備：${equips.length ? equips.join('、') : '尚未取得'}<br>
        玩家加成：生命 +${Number(build?.hpBonus || 0)}、攻擊 +${Number(build?.atkBonus || 0)}、防禦 +${Number(build?.defBonus || 0)}
      </div>
    `;
  }

  function getMazeBaseScale(){
    const size = Number(level?.mapSize || Math.max(W, H) || 9);
    if (size >= 15) return 0.9;
    if (size >= 13) return 1;
    if (size >= 11) return 1.08;
    return 1.16;
  }

  function getAutoFitMazeScale(){
    const wrap = document.getElementById('gridWrap');
    if (!wrap || !W || !H) return getMazeBaseScale();

    const styles = window.getComputedStyle(wrap);
    const padX = parseFloat(styles.paddingLeft || '0') + parseFloat(styles.paddingRight || '0');
    const padY = parseFloat(styles.paddingTop || '0') + parseFloat(styles.paddingBottom || '0');
    const availW = Math.max(120, wrap.clientWidth - padX - 4);
    const availH = Math.max(120, wrap.clientHeight - padY - 4);

    const baseGap = 6;
    const baseCell = 34;
    const fitByWidth = (availW - baseGap * Math.max(0, W - 1)) / (baseCell * W);
    const fitByHeight = (availH - baseGap * Math.max(0, H - 1)) / (baseCell * H);
    const fitted = Math.min(getMazeBaseScale(), fitByWidth, fitByHeight) * 0.98;

    if (!Number.isFinite(fitted) || fitted <= 0) return getMazeBaseScale();
    return Math.max(0.52, Math.min(1.9, fitted));
  }

  function applyMazeScale(){
    const gridEl = document.getElementById('grid');
    if (!gridEl) return;
    const autoScale = getAutoFitMazeScale();
    const finalScale = Math.max(0.52, Math.min(1.9, autoScale * mazeManualScale));
    mazeScale = Math.round(finalScale * 100) / 100;
    const cellSize = Math.max(20, Math.round(34 * mazeScale));
    const gap = Math.max(3, Math.round(6 * mazeScale));
    gridEl.style.setProperty('--maze-cell-size', `${cellSize}px`);
    gridEl.style.setProperty('--maze-gap', `${gap}px`);
  }

  function setMazeScale(nextScale){
    const clamped = Math.max(0.7, Math.min(1.9, Number(nextScale || 1)));
    mazeManualScale = Math.round(clamped * 100) / 100;
    applyMazeScale();
  }

  function zoomMaze(delta){
    setMazeScale(mazeManualScale + delta);
  }

  function resetMazeScale(){
    mazeManualScale = 1;
    applyMazeScale();
  }

  function lockTouchZoomGestures(){
    try{
      let lastTouchEnd = 0;
      const preventGesture = (e)=>{
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
      };

      ['gesturestart','gesturechange','gestureend'].forEach(type=>{
        document.addEventListener(type, preventGesture, { passive:false });
      });

      document.addEventListener('touchmove', (e)=>{
        if (e.touches && e.touches.length > 1) {
          preventGesture(e);
        }
      }, { passive:false });

      document.addEventListener('touchend', (e)=>{
        const now = Date.now();
        if (now - lastTouchEnd <= 320) {
          preventGesture(e);
        }
        lastTouchEnd = now;
      }, { passive:false });
    }catch(err){
      console.warn('lockTouchZoomGestures failed', err);
    }
  }

  function bindMazeGestureZoom(){
    const wrap = document.getElementById('gridWrap');
    if (!wrap) return;

    wrap.addEventListener('wheel', (e)=>{
      e.preventDefault();
      const delta = Number(e.deltaY || 0);
      if (!Number.isFinite(delta) || delta === 0) return;
      zoomMaze(delta < 0 ? 0.08 : -0.08);
    }, { passive:false });

    let pinchStartDistance = 0;
    let pinchStartScale = 1;

    const getTouchDistance = (touches)=>{
      if (!touches || touches.length < 2) return 0;
      const [a, b] = [touches[0], touches[1]];
      const dx = a.clientX - b.clientX;
      const dy = a.clientY - b.clientY;
      return Math.hypot(dx, dy);
    };

    wrap.addEventListener('touchstart', (e)=>{
      if (e.touches && e.touches.length === 2) {
        pinchStartDistance = getTouchDistance(e.touches);
        pinchStartScale = mazeManualScale;
      }
    }, { passive:false });

    wrap.addEventListener('touchmove', (e)=>{
      if (!(e.touches && e.touches.length === 2)) return;
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches);
      if (!pinchStartDistance || !currentDistance) return;
      const ratio = currentDistance / pinchStartDistance;
      setMazeScale(pinchStartScale * ratio);
    }, { passive:false });

    wrap.addEventListener('touchend', ()=>{
      pinchStartDistance = 0;
    }, { passive:true });
  }

  function bindMazeAutoFit(){
    const rerenderFit = ()=>{
      applyMazeScale();
    };
    window.addEventListener('resize', rerenderFit, { passive:true });
    window.addEventListener('orientationchange', rerenderFit, { passive:true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', rerenderFit, { passive:true });
    }
    try{
      const wrap = document.getElementById('gridWrap');
      if (wrap && window.ResizeObserver) {
        const ro = new ResizeObserver(()=> rerenderFit());
        ro.observe(wrap);
      }
    }catch(_err){}
  }

  function renderLegendCard(){
    const infoEl = document.getElementById('info');
    if (!infoEl) return;
    const item = LEGEND_CARDS[legendIndex % LEGEND_CARDS.length];
    const dots = LEGEND_CARDS.map((_, idx) => `<span class="legendDot ${idx === (legendIndex % LEGEND_CARDS.length) ? 'active' : ''}"></span>`).join('');
    infoEl.innerHTML = `
      <div class="legendIcon">${item.icon}</div>
      <div class="legendText">
        <div class="legendTitle">圖示說明｜${item.title}</div>
        <div class="legendDesc">${item.desc}</div>
      </div>
      <div class="legendDots" aria-hidden="true">${dots}</div>
    `;
  }

  function startLegendTicker(){
    stopLegendTicker();
    legendIndex = 0;
    renderLegendCard();
    legendTimer = setInterval(()=>{
      legendIndex = (legendIndex + 1) % LEGEND_CARDS.length;
      renderLegendCard();
    }, 2200);
  }

  function stopLegendTicker(){
    if (legendTimer) clearInterval(legendTimer);
    legendTimer = null;
  }

  const toast = (msg)=> {
    const el = document.getElementById("toast");
    if (el) el.textContent = msg;
  };

  function qs(name){
    const url = new URL(location.href);
    return url.searchParams.get(name);
  }

  function cameFromTeacherPage(){
    const from = String(qs("from") || qs("source") || "").trim().toLowerCase();
    return from === "teacher" || from === "teacherpage" || from === "teacher_mode";
  }

  function getExitTargetPage(){
    return cameFromTeacherPage() ? "teacher.html" : "index.html";
  }

  function levelKeyRaw(worldId, levelId){
    return `${normalizeWorldId(worldId)}-${normalizeLevelId(levelId)}`;
  }


  function normalizeWorldId(worldId){
    const raw = String(worldId || '').trim();
    if(!raw) return '';
    const m = raw.match(/^world\s*(\d+)$/i);
    if(m) return `W${m[1]}`;
    const w = raw.match(/^w\s*(\d+)$/i);
    if(w) return `W${w[1]}`;
    return raw.toUpperCase();
  }

  function normalizeLevelId(levelId){
    const raw = String(levelId || '').trim();
    if(!raw) return '';
    if(/^boss$/i.test(raw)) return 'boss';
    const m = raw.match(/^level\s*(\d+)$/i);
    if(m) return `L${m[1]}`;
    const l = raw.match(/^l\s*(\d+)$/i);
    if(l) return `L${l[1]}`;
    return raw;
  }


  function levelOverrideKey(worldId, levelId){
    return `${normalizeWorldId(worldId)}-${normalizeLevelId(levelId)}`;
  }


  function getStoredLevelEdits(){
    try{
      const raw = localStorage.getItem(LEVEL_EDIT_OVERRIDE_KEY);
      const data = raw ? JSON.parse(raw) : {};
      return data && typeof data === 'object' ? data : {};
    }catch(err){
      console.warn('讀取教師關卡修改失敗', err);
      return {};
    }
  }

  function applyLevelEditOverride(worldId, levelData){
    if (!levelData || normalizeLevelId(levelData.levelId) === 'boss') return levelData;
    const edits = getStoredLevelEdits();
    const patch = edits[levelOverrideKey(worldId, levelData.levelId)];
    if (!patch || typeof patch !== 'object') return levelData;
    return {
      ...levelData,
      ...patch,
      map: Array.isArray(patch.map) ? patch.map.slice() : (Array.isArray(levelData.map) ? levelData.map.slice() : [])
    };
  }

  function getStoredLevelTargetBlockOverrides(){
    try{
      const raw = localStorage.getItem(LEVEL_TARGET_BLOCK_OVERRIDE_KEY);
      const data = raw ? JSON.parse(raw) : {};
      return data && typeof data === 'object' ? data : {};
    }catch(err){
      console.warn('讀取最佳程式碼數覆寫失敗', err);
      return {};
    }
  }

  function getOverriddenTargetBlocks(worldId, levelId){
    const overrides = getStoredLevelTargetBlockOverrides();
    const entry = overrides[levelOverrideKey(worldId, levelId)];
    const targetBlocks = Number(entry?.targetBlocks || entry?.targetSteps || 0);
    return Number.isFinite(targetBlocks) && targetBlocks > 0 ? targetBlocks : null;
  }

  function applyLevelTargetBlockOverride(worldId, levelData){
    if (!levelData || normalizeLevelId(levelData.levelId) === 'boss') return levelData;
    const overriddenTarget = getOverriddenTargetBlocks(worldId, levelData.levelId);
    if (!(overriddenTarget > 0)) return levelData;
    return { ...levelData, targetBlocks: overriddenTarget };
  }

  function refreshSubtitleText(){
    const subtitleEl = document.getElementById("subtitle");
    if (!subtitleEl || !level) return;
    subtitleEl.textContent = isBossLevel()
      ? `Boss 戰過關標準：擊敗 Boss`
      : `過關標準：一星=過關、二星=拿到2個寶箱、三星=拿到2個寶箱且達成目標程式碼數`;
  }

  function getLevelCopy(worldId, levelId){
    return LEVEL_COPY[levelKeyRaw(worldId, levelId)] || DEFAULT_COPY;
  }

  function getSpellObstacleSymbolsFromMap(mapRows){
    const rows = Array.isArray(mapRows) ? mapRows : [];
    const found = new Set();
    rows.forEach(row => {
      String(row || '').split('').forEach(ch => {
        if(['X','F','O','L'].includes(ch)) found.add(ch);
      });
    });
    return Array.from(found);
  }


  function draftRecordKey(userId, worldId, levelId){
    return `${String(userId || '').trim()}::${normalizeWorldId(worldId)}-${normalizeLevelId(levelId)}`;
  }

  function getProgramStore(){
    try{
      const raw = localStorage.getItem(PROGRAM_STORE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    }catch(err){
      console.warn('讀取積木草稿失敗', err);
      return {};
    }
  }

  function saveProgramStore(store){
    try{
      if (!store || typeof store !== 'object' || Object.keys(store).length === 0) {
        localStorage.removeItem(PROGRAM_STORE_KEY);
        return true;
      }
      localStorage.setItem(PROGRAM_STORE_KEY, JSON.stringify(store));
      return true;
    }catch(err){
      console.warn('儲存積木草稿失敗', err);
      return false;
    }
  }

  function workspaceToDraftText(ws){
    if (!ws || !window.Blockly) return '';
    try{
      if (Blockly.serialization?.workspaces?.save) {
        return JSON.stringify(Blockly.serialization.workspaces.save(ws));
      }
      if (Blockly.Xml?.workspaceToDom && Blockly.Xml?.domToText) {
        return Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(ws));
      }
    }catch(err){
      console.warn('轉換積木草稿失敗', err);
    }
    return '';
  }

  function loadDraftTextToWorkspace(textValue, ws){
    if (!textValue || !ws || !window.Blockly) return false;
    try{
      BlocklySetup?.ensureDefinitions?.();
      if (String(textValue).trim().startsWith('{')) {
        const ok = BlocklySetup?.loadSerializedText?.(ws, textValue);
        if (ok) return true;
      }
      if (Blockly.Xml?.textToDom && Blockly.Xml?.domToWorkspace) {
        ws.clear();
        Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(textValue), ws);
        BlocklySetup?.ensureStartBlock?.(ws);
        BlocklySetup?.lockStartBlocks?.(ws);
        return true;
      }
    }catch(err){
      console.warn('載入積木草稿失敗', err);
    }
    return false;
  }

  function saveProgramDraft(){
    try{
      const session = StorageAPI.getSession?.();
      if (!session?.userId || !workspace || !world || !level || isBossLevel()) return false;

      const blocklyText = workspaceToDraftText(workspace);
      if (!blocklyText) return false;

      const store = getProgramStore();
      store[draftRecordKey(session.userId, world.worldId, level.levelId)] = {
        userId: String(session.userId),
        worldId: normalizeWorldId(world.worldId),
        levelId: normalizeLevelId(level.levelId),
        savedAt: Date.now(),
        blockly: blocklyText
      };
      return saveProgramStore(store);
    }catch(err){
      console.warn('saveProgramDraft failed', err);
      return false;
    }
  }

  function loadProgramDraft(){
    try{
      const session = StorageAPI.getSession?.();
      if (!session?.userId || !workspace || !world || !level || isBossLevel()) return false;

      const store = getProgramStore();
      const payload = store[draftRecordKey(session.userId, world.worldId, level.levelId)];
      if (!payload?.blockly) return false;
      return loadDraftTextToWorkspace(payload.blockly, workspace);
    }catch(err){
      console.warn('loadProgramDraft failed', err);
      return false;
    }
  }
  function loadEmbeddedBestSolution(){
    try{
      if (!workspace || !level || isBossLevel()) return false;
      const bestXml = String(level?.bestXml || '').trim();
      if (!bestXml) return false;
      return loadDraftTextToWorkspace(bestXml, workspace);
    }catch(err){
      console.warn('loadEmbeddedBestSolution failed', err);
      return false;
    }
  }

  function clearProgramDraft(worldId = world?.worldId, levelId = level?.levelId){
    try{
      const session = StorageAPI.getSession?.();
      if (!session?.userId || !worldId || !levelId) return false;

      const store = getProgramStore();
      const key = draftRecordKey(session.userId, worldId, levelId);
      if (!(key in store)) return false;
      delete store[key];
      return saveProgramStore(store);
    }catch(err){
      console.warn('clearProgramDraft failed', err);
      return false;
    }
  }

  function getWorld4HintSeenStore(){
    try{
      const raw = localStorage.getItem(WORLD4_HINT_ONCE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    }catch(err){
      console.warn('讀取世界4提示狀態失敗', err);
      return {};
    }
  }

  function saveWorld4HintSeenStore(store){
    try{
      if (!store || typeof store !== 'object' || Object.keys(store).length === 0) {
        localStorage.removeItem(WORLD4_HINT_ONCE_KEY);
        return true;
      }
      localStorage.setItem(WORLD4_HINT_ONCE_KEY, JSON.stringify(store));
      return true;
    }catch(err){
      console.warn('儲存世界4提示狀態失敗', err);
      return false;
    }
  }

  function world4HintRecordKey(userId, worldId, levelId){
    return `${String(userId || '').trim()}::${normalizeWorldId(worldId)}-${normalizeLevelId(levelId)}`;
  }

  function hasSeenWorld4Hint(userId, worldId, levelId){
    if (!userId || !worldId || !levelId) return false;
    const store = getWorld4HintSeenStore();
    return !!store[world4HintRecordKey(userId, worldId, levelId)];
  }

  function markWorld4HintSeen(userId, worldId, levelId){
    if (!userId || !worldId || !levelId) return false;
    const store = getWorld4HintSeenStore();
    store[world4HintRecordKey(userId, worldId, levelId)] = Date.now();
    return saveWorld4HintSeenStore(store);
  }

  function maybeShowWorld4HintSpell(){
    try{
      const session = StorageAPI.getSession?.();
      if (!session?.userId || !workspace || !world || !level) return false;
      if (normalizeWorldId(world.worldId) !== 'W4') return false;
      if (hasSeenWorld4Hint(session.userId, world.worldId, level.levelId)) return false;
      const ok = BlocklySetup?.enforceWorld4SingleSpell?.(workspace, normalizeLevelId(level.levelId || ''), { reposition:false });
      if (ok) markWorld4HintSeen(session.userId, world.worldId, level.levelId);
      return !!ok;
    }catch(err){
      console.warn('maybeShowWorld4HintSpell failed', err);
      return false;
    }
  }
  
  function getWorldDisplayName(worldId){
    const key = normalizeWorldId(worldId);
    if (key === "W1") return "魔法學院";
    if (key === "W2") return "符文森林";
    return String(world?.worldName || worldId || "世界");
  }

  function getCleanLevelTitle(){
    const raw = String(level?.name || getLevelCopy(world?.worldId, level?.levelId).title || '').trim();
    if (!raw) return '關卡';
    if (/boss/i.test(raw)) return 'Boss 戰';
    return raw.replace(/^第\s*\d+\s*關\s*[:：]\s*/, '').trim();
  }

  function createFallbackBossLevel(worldId){
    const normalizedWorldId = normalizeWorldId(worldId);
    if (normalizedWorldId !== "W1") return null;
    return {
      levelId: "boss",
      name: "森林狼王 Boss 戰",
      targetBlocks: 0,
      map: ["S"],
      startDir: 1,
      isBoss: true,
    };
  }

  function findLevel(worldId, levelId){
    const normalizedWorldId = normalizeWorldId(worldId);
    const normalizedLevelId = normalizeLevelId(levelId);

    if (!normalizedWorldId || !normalizedLevelId || typeof LEVELS === "undefined" || !Array.isArray(LEVELS)) {
      return null;
    }

    const w = LEVELS.find(x=>normalizeWorldId(x.worldId)===normalizedWorldId);
    if(!w) return null;

    let lv = Array.isArray(w.levels) ? w.levels.find(x=>normalizeLevelId(x.levelId)===normalizedLevelId) : null;

    // 相容舊版 levels.js：如果世界資料裡還沒真的加入 boss 關卡，
    // 但網址已經指定 level=boss，就自動補一個虛擬 Boss 關卡。
    if(!lv && String(normalizedLevelId).toLowerCase() === 'boss'){
      lv = createFallbackBossLevel(normalizedWorldId);
    }

    if(!lv) return null;
    if (lv && normalizeLevelId(lv.levelId) !== 'boss') {
      lv = { ...lv, levelId: normalizeLevelId(lv.levelId) };
      lv = applyLevelEditOverride(normalizedWorldId, lv);
      lv = applyLevelTargetBlockOverride(normalizedWorldId, lv);
    }
    return {w: { ...w, worldId: normalizedWorldId }, lv};
  }

  function isBossLevel(){
    const id = String(level?.levelId || "").toLowerCase();
    const name = String(level?.name || "").toLowerCase();
    return id.includes("boss") || name.includes("boss") || name.includes("狼王");
  }

  function ensureStyles(){
    if (document.getElementById("world1-ui-style")) return;
    const style = document.createElement("style");
    style.id = "world1-ui-style";
    style.textContent = `
      body.world1-skin {
        background: linear-gradient(180deg, #e7e9e5 0%, #d9ddd7 100%);
        color: #1f2937;
      }
      body.world1-skin #title {
        color: #1f2937 !important;
        font-size: clamp(28px, 4vw, 42px);
        font-weight: 900;
        letter-spacing: .5px;
        text-shadow: none !important;
      }
      body.world1-skin {
        min-height: 100vh;
        overflow: hidden;
      }
      body.world1-skin .container {
        width: min(calc((100vh - 16px) * 16 / 9), calc(100vw - 16px));
        height: min(calc(100vw * 9 / 16), calc(100vh - 16px));
        margin: 8px auto;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      body.world1-skin .header {
        flex: 0 0 auto;
        padding-bottom: 6px;
      }
      body.world1-skin .brand .logo {
        display: none !important;
      }
      body.world1-skin .brand {
        align-items: flex-start;
      }
      body.world1-skin .gameLayout {
        flex: 1 1 auto;
        min-height: 0;
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 12px;
        align-items: stretch;
      }
      body.world1-skin .gameLayout > .card {
        min-height: 0;
        overflow: hidden;
      }
      body.world1-skin .stage {
        display: grid;
        grid-template-rows: auto minmax(0, 1fr) auto;
        gap: 10px;
      }
      body.world1-skin .editorCard {
        display: grid;
        grid-template-rows: auto minmax(0, 1fr) auto;
        gap: 10px;
      }
      body.world1-skin .blocklyWrap {
        min-height: 0;
        height: 100%;
      }
      body.world1-skin .stageFooter {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 8px;
      }
      body.world1-skin .stageTop {
        flex-wrap: wrap;
        gap: 8px;
      }
      body.world1-skin #subtitle {
        color: #4b5563 !important;
        font-size: clamp(15px, 1.6vw, 20px);
        font-weight: 800;
        text-shadow: none !important;
      }
      body.world1-skin #steps,
      body.world1-skin #bumps,
      body.world1-skin #hasKey,
      body.world1-skin #time {
        color: #18301e !important;
        font-weight: 900 !important;
      }
      body.world1-skin #btnRun,
      body.world1-skin #btnPause,
      body.world1-skin #btnStep,
      body.world1-skin #btnReset,
      body.world1-skin #btnExit {
        color: #ffffff !important;
        font-weight: 900 !important;
        text-shadow: none !important;
        opacity: 1 !important;
      }
      body.world1-skin #btnPause,
      body.world1-skin #btnStep,
      body.world1-skin #btnReset {
        color: #1f2937 !important;
        background: #edf4ea !important;
        border: 2px solid #a5b9a3 !important;
      }
      body.world1-skin #btnExit {
        color: #8b2c2c !important;
        background: #fff5f5 !important;
        border: 2px solid #e6a9a9 !important;
      }
      body.world1-skin #toast {
        color: #ffffff !important;
        background: #374151 !important;
        border: 2px solid #9ca3af !important;
        font-weight: 800 !important;
        text-shadow: none !important;
      }
      body.world1-skin #result {
        color: #1a251c !important;
      }
      .stage-world-hero,
      .stage-reward-card {
        display: none !important;
      }
      .stage-copy-card {
        display: none !important;
      }
      body.world1-skin .stage .hr,
      body.world1-skin #result:empty,
      body.world1-skin #info:empty {
        display: none;
      }
      body.world1-skin .stageFooter #toast,
      body.world1-skin .stageFooter #info,
      body.world1-skin .stageFooter #result {
        margin-top: 0;
      }
      body.world1-skin #result:not(:empty) {
        padding: 10px 12px;
        border-radius: 14px;
        background: rgba(255,255,255,.72);
        border: 1px solid #c7d4c5;
      }
      .stage-world-hero h3 { margin: 0 0 8px; font-size: 28px; color: #1b4e27; }
      .stage-world-hero p { margin: 6px 0; line-height: 1.65; color: #17351f; }
      .stage-world-hero-boss { display:flex; align-items:flex-end; justify-content:center; min-height:140px; }
      .stage-world-hero-boss img { max-width: 170px; max-height: 170px; object-fit: contain; filter: drop-shadow(0 8px 16px rgba(0,0,0,.16)); }
      .stage-copy-card h3 { margin: 0 0 6px; font-size: 18px; }
      .stage-copy-card p { margin: 4px 0; line-height: 1.55; }
      .stage-copy-hint { color: #2d6c3d; font-weight: 700; }
      .stage-reward-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 10px; margin-top: 10px; }
      .stage-reward-item {
        background: #eff9f0; border: 1px solid #d4ead6; border-radius: 14px; padding: 10px; font-size: 14px;
        display:flex; gap:10px; align-items:center;
      }
      .stage-reward-item img { width: 56px; height: 56px; object-fit: contain; flex: 0 0 56px; border-radius: 10px; background: rgba(255,255,255,.88); }
      .stage-current-reward {
        display:flex; gap:10px; align-items:center; margin-top:8px; padding:10px 12px; border-radius:14px;
        background: #ecf8ef; border: 1px dashed #9fd0a6;
      }
      .stage-current-reward img { width:52px; height:52px; object-fit:contain; border-radius:12px; background:#fff; }
      .stage-stars-reward {
        margin-top: 8px;
        padding: 10px 12px;
        border-radius: 14px;
        background: #fff9ea;
        border: 1px dashed #e5cf9d;
        color: #6f5419;
        font-weight: 800;
      }
      .result-card { background: #fff; border: 2px solid #dce7ff; border-radius: 16px; padding: 14px 16px; line-height: 1.7; }
      .result-card h3 { margin: 0 0 8px; font-size: 20px; }
      .result-good { border-color: #bfe3c5; background: #f4fff6; }
      .result-bad { border-color: #ffd3d3; background: #fff6f6; }
      .result-warn { border-color: #ffe3ae; background: #fffaf0; }
      .result-stats { display: flex; flex-wrap: wrap; gap: 12px; margin: 8px 0; }
      .result-badge { background: rgba(0,0,0,.05); border-radius: 999px; padding: 4px 10px; font-weight: 700; }
      .boss-preview {
        margin-top: 12px; display:grid; grid-template-columns: 96px 1fr; gap:12px; align-items:center;
        padding: 12px; border-radius: 16px; background: linear-gradient(180deg, #f6fbf6, #ebf8ee); border: 1px solid #cde8cf;
      }
      .boss-preview img { width: 96px; height: 96px; object-fit: contain; }

 
      .boss-stage {
        margin: 12px auto 0;
        width: min(1480px, calc(100vw - 16px));
        aspect-ratio: 16 / 9;
        min-height: calc(100vh - 16px);
        max-height: calc(100vh - 16px);
        border-radius: 24px;
        overflow: hidden;
        border: 2px solid #bed7c3;
        box-shadow: 0 12px 32px rgba(0,0,0,.14);
        background: linear-gradient(rgba(248,255,248,.82), rgba(241,251,241,.90)), url('${getWorldAssets().worldBg}') center/cover no-repeat;
        display: grid;
        grid-template-rows: auto minmax(0, 1fr) auto;
      }
      .boss-stage-top {
        display:grid;
        grid-template-columns: 1fr 1.1fr 1fr;
        gap: 12px;
        align-items: stretch;
        padding: 14px 16px 10px;
      }
      .boss-top-panel,
      .boss-intent-box {
        background: rgba(255,255,255,.88);
        border-radius: 18px;
        border: 1px solid rgba(180,210,184,.86);
        padding: 12px 14px;
        box-shadow: 0 6px 18px rgba(0,0,0,.06);
      }
      .boss-top-panel.compact { padding: 12px 14px; }
      .boss-top-name {
        font-size: 13px;
        font-weight: 900;
        color: #47604b;
        margin-bottom: 8px;
        letter-spacing: .5px;
      }
      .boss-hp-head {
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:10px;
        margin-bottom:8px;
        color:#1e4427;
      }
      .boss-hp-head strong {
        font-size: 20px;
        font-weight: 900;
      }
      .boss-hp-num {
        font-size: 18px;
        font-weight: 900;
        white-space: nowrap;
      }
      .hp-bar { height: 14px; border-radius: 999px; background: rgba(40,60,40,.14); overflow: hidden; }
      .hp-fill-player, .hp-fill-boss { height:100%; border-radius:999px; transition: width .25s ease; }
      .hp-fill-player { background: linear-gradient(90deg, #61c06c, #3ea654); }
      .hp-fill-boss { background: linear-gradient(90deg, #ff8d75, #dd4f3b); }
      .boss-bar-sub {
        display:flex;
        justify-content:space-between;
        gap:8px;
        margin-top:8px;
        font-size:13px;
        font-weight:800;
        color:#58705c;
      }
      .boss-intent-box {
        display:flex;
        flex-direction:column;
        justify-content:center;
        text-align:center;
        background:linear-gradient(180deg,#fffaf1,#fff3df);
        border:1px solid #efd8a6;
      }
      .boss-intent-title { font-size:13px; font-weight:900; color:#7b5208; margin-bottom:6px; }
      .boss-intent-main { font-size:26px; font-weight:900; color:#5c3516; line-height:1.2; }
      .boss-intent-sub { margin-top:6px; font-size:13px; color:#785b3b; line-height:1.45; }
      .boss-stage-main {
        padding: 0 10px 8px;
        min-height: 0;
      }
      .boss-arena {
        position: relative;
        min-height: 0;
        height: 100%;
        border-radius: 24px;
        overflow: hidden;
        border: 1px solid rgba(180,210,184,.86);
        background:
          radial-gradient(circle at center, rgba(255,255,255,.48) 0%, rgba(255,255,255,.16) 38%, rgba(0,0,0,.04) 100%),
          linear-gradient(180deg, rgba(243,255,243,.76), rgba(231,245,234,.90));
        display:flex;
        align-items:center;
        justify-content:center;
        padding: 16px 20px 10px;
      }
      .boss-arena::after {
        content:'';
        position:absolute;
        inset:auto 10% 14px 10%;
        height:64px;
        border-radius:50%;
        background: radial-gradient(circle, rgba(0,0,0,.18) 0%, rgba(0,0,0,.08) 45%, rgba(0,0,0,0) 75%);
        filter: blur(6px);
      }
      .boss-portrait-wrap {
        position: relative;
        z-index: 1;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        text-align:center;
        width:100%;
        height:100%;
      }
      .boss-portrait-wrap img {
        width: min(100%, 430px);
        max-height: min(54vh, 500px);
        object-fit: contain;
        filter: drop-shadow(0 18px 28px rgba(0,0,0,.22));
      }
      .boss-name-badge {
        display:inline-flex;
        align-items:center;
        justify-content:center;
        gap:8px;
        margin-top:10px;
        padding:10px 18px;
        border-radius:999px;
        font-weight:900;
        font-size: 18px;
        background:#f7ead0;
        color:#8a6117;
        border:1px solid #e2c98d;
      }
      .boss-fx-box {
        margin-top: 12px;
        min-height: 54px;
        display:flex;
        align-items:center;
        justify-content:center;
        text-align:center;
        padding:10px 16px;
        border-radius:16px;
        background:rgba(255,255,255,.78);
        border:1px dashed #bfd9c3;
        color:#25452d;
        font-weight:800;
        max-width: 580px;
      }
      .boss-stage-bottom {
        padding: 0 10px 10px;
        display:grid;
        grid-template-columns: minmax(0, 1.65fr) minmax(320px, .95fr);
        gap: 12px;
        align-items: stretch;
      }
      .boss-card-box,
      .boss-action-box {
        background: rgba(255,255,255,.88);
        border-radius: 18px;
        border: 1px solid rgba(180,210,184,.86);
        padding: 12px;
        box-shadow: 0 6px 18px rgba(0,0,0,.06);
      }
      .boss-section-title { font-size: 17px; font-weight: 800; color: #1c4a28; margin-bottom: 8px; }
      .boss-cards { display:grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
      .boss-card {
        display:grid;
        grid-template-columns: 42px 1fr;
        gap: 8px;
        align-items:center;
        background:#f7fff7;
        border:1px solid #d5ead7;
        border-radius:16px;
        padding:8px;
      }
      .boss-card img { width:42px; height:42px; object-fit:contain; border-radius:12px; background:#fff; }
      .boss-card.is-used { opacity:.6; filter:grayscale(.15); }
      .boss-card-title { font-weight:900; color:#21472a; font-size:14px; }
      .boss-card-desc { font-size:12px; line-height:1.4; color:#45604a; min-height:34px; }
      .boss-card-tag {
        display:inline-block; margin-top:6px; padding:4px 8px; border-radius:999px;
        background:#eef8ef; color:#31593b; font-size:12px; font-weight:800;
      }
      .boss-card button, .boss-action-buttons button {
        border:none; border-radius:12px; padding:10px 10px; font-weight:800; cursor:pointer;
        background: linear-gradient(180deg, #6dc87b, #4aae5d); color:#fff; box-shadow:0 4px 10px rgba(0,0,0,.12);
        font-size: 14px;
      }
      .boss-card button { width:100%; margin-top:8px; }
      .boss-card button[disabled], .boss-action-buttons button[disabled] { opacity:.45; cursor:not-allowed; }
      .boss-action-buttons {
        display:grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 6px;
      }
      .boss-action-buttons .danger { background: linear-gradient(180deg, #ef8b6f, #dd5a47); }
      .boss-action-buttons button.secondary { background: linear-gradient(180deg, #8eb7ff, #5f89ec); }
      .boss-action-buttons button.utility { background: linear-gradient(180deg, #9acb9f, #69ad73); }
      .boss-footer-tip { margin-top:8px; font-size:13px; color:#3d5b45; line-height:1.5; }
      .boss-inline-log {
        margin-top: 10px;
        display:flex;
        flex-wrap:wrap;
        gap:8px;
      }
      .boss-log-pill {
        background:#f6fff6;
        border:1px solid #d4ead6;
        border-radius:999px;
        padding:6px 10px;
        font-size:12px;
        font-weight:800;
        color:#25452d;
      }
      .boss-log-entry { margin: 0 0 6px; }
      .boss-empty-tip { color:#4d6c54; }
      @media (max-width: 1100px) {
        .boss-stage {
          width: min(100%, calc(100vw - 16px));
          aspect-ratio: auto;
          min-height: auto;
          max-height: none;
        }
        .boss-stage-top {
          grid-template-columns: 1fr;
        }
        .boss-stage-main {
          grid-template-columns: 1fr;
        }
        .boss-cards {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 980px) {
        body.world1-skin { overflow: auto; }
        body.world1-skin .container {
          width: min(100vw - 12px, 1600px);
          height: auto;
          min-height: auto;
          margin: 6px auto;
          overflow: visible;
        }
        body.world1-skin .gameLayout {
          grid-template-columns: 1fr;
        }
        body.world1-skin .editorCard {
          min-height: 520px;
        }
        body.world1-skin #blocklyDiv {
          height: 100% !important;
          min-height: 420px;
        }
      }
      @media (min-width: 981px) {
        body.world1-skin #blocklyDiv {
          height: 100% !important;
          min-height: 0;
        }
        body.world1-skin .gridWrap {
          min-height: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
      }
      @media (max-width: 860px) {
        .boss-arena { min-height: 320px; }
        .boss-portrait-wrap img { max-height: 240px; }
        .boss-action-buttons,
        .boss-cards {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }


  function setPanelTheme(el, opts = {}){
    if (!el) return;
    el.style.background = opts.background || '#f5f8f3';
    el.style.border = opts.border || '1px solid #b8c8b7';
    el.style.borderRadius = opts.radius || '20px';
    el.style.boxShadow = opts.shadow || '0 10px 26px rgba(0,0,0,.10)';
    el.style.color = opts.color || '#18301e';
  }

  function getWorldUiTheme(worldId){
    const key = normalizeWorldId(worldId || world?.worldId || 'W1');
    const themes = {
      W1: {
        bodyBg: 'linear-gradient(180deg, #e7e9e5 0%, #d9ddd7 100%)',
        text: '#1f2937',
        title: '#1f2937',
        subtitle: '#4b5563',
        badgeBg: '#f3f4f6',
        badgeBd: '#cbd5e1',
        panelBg: '#f3f4f6',
        panelBd: '#cbd5e1',
        gridWrapBg: 'rgba(148, 163, 184, .12)',
        gridWrapBd: '#cbd5e1',
        toastBg: '#374151',
        toastBd: '#9ca3af',
        softBtnBg: '#f8fafc',
        softBtnBd: '#cbd5e1',
        stageBg: '#f8fafc',
        workspaceBg: '#ffffff'
      },
      W2: {
        bodyBg: 'linear-gradient(180deg, #d6ead8 0%, #bfd7c4 100%)',
        text: '#103324',
        title: '#14532d',
        subtitle: '#1f6b43',
        badgeBg: '#edf8f0',
        badgeBd: '#9ac7a6',
        panelBg: '#edf8f0',
        panelBd: '#9ac7a6',
        gridWrapBg: 'rgba(80, 140, 96, .12)',
        gridWrapBd: '#9ac7a6',
        toastBg: '#1f5131',
        toastBd: '#7ec28d',
        softBtnBg: '#f4fbf5',
        softBtnBd: '#9ac7a6',
        stageBg: '#eef8f0',
        workspaceBg: '#f8fdf8'
      },
      W3: {
        bodyBg: 'linear-gradient(180deg, #efe4c7 0%, #e4d3ab 100%)',
        text: '#3a2a12',
        title: '#6f4b0f',
        subtitle: '#8a6521',
        badgeBg: '#fbf4dd',
        badgeBd: '#d6be82',
        panelBg: '#fbf4dd',
        panelBd: '#d6be82',
        gridWrapBg: 'rgba(193, 158, 78, .12)',
        gridWrapBd: '#d6be82',
        toastBg: '#6e5421',
        toastBd: '#d8bc74',
        softBtnBg: '#fff8e8',
        softBtnBd: '#d8bc74',
        stageBg: '#fcf5df',
        workspaceBg: '#fff9eb'
      },
      W4: {
        bodyBg: 'linear-gradient(180deg, #d9e4f1 0%, #c6d4e3 100%)',
        text: '#17304b',
        title: '#1e3a5f',
        subtitle: '#33597d',
        badgeBg: '#edf4fb',
        badgeBd: '#9eb8d3',
        panelBg: '#edf4fb',
        panelBd: '#9eb8d3',
        gridWrapBg: 'rgba(90, 130, 180, .12)',
        gridWrapBd: '#9eb8d3',
        toastBg: '#2f4d67',
        toastBd: '#89abc9',
        softBtnBg: '#f3f8fd',
        softBtnBd: '#9eb8d3',
        stageBg: '#eef4fb',
        workspaceBg: '#f8fbff'
      }
    };
    return themes[key] || themes.W1;
  }

  function applyMainContrast(){
    const theme = getWorldUiTheme(world?.worldId);
    const titleEl = document.getElementById('title');
    const subtitleEl = document.getElementById('subtitle');
    const toastEl = document.getElementById('toast');
    const resultEl = document.getElementById('result');
    const gridEl = document.getElementById('grid');
    const blocklyEl = document.getElementById('blocklyDiv');
    const btnRun = document.getElementById('btnRun');
    const btnPause = document.getElementById('btnPause');
    const btnReset = document.getElementById('btnReset');
    const btnExit = document.getElementById('btnExit');
    const btnStep = document.getElementById('btnStep');
    const ids = ['codeCount','targetCodeCount','bumps','hasKey','time'];
    const containerEl = document.querySelector('.container');
    const stageEl = document.querySelector('.stage');
    const gameLayoutEl = document.querySelector('.gameLayout');

    document.body.style.setProperty('background', theme.bodyBg, 'important');
    document.body.style.setProperty('color', theme.text, 'important');
    document.body.setAttribute('data-world-theme', normalizeWorldId(world?.worldId || 'W1'));

    if (containerEl) {
      containerEl.style.background = 'transparent';
    }
    if (gameLayoutEl) {
      gameLayoutEl.style.background = 'transparent';
    }
    if (stageEl) {
      stageEl.style.background = theme.stageBg;
      stageEl.style.border = `1px solid ${theme.panelBd}`;
      stageEl.style.borderRadius = '24px';
      stageEl.style.boxShadow = '0 12px 28px rgba(0,0,0,.10)';
      stageEl.style.padding = '14px';
    }

    if (titleEl) {
      titleEl.style.color = theme.title;
      titleEl.style.fontWeight = '900';
    }
    if (subtitleEl) {
      subtitleEl.style.color = theme.subtitle;
      subtitleEl.style.fontWeight = '800';
    }
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.color = theme.text;
      el.style.fontWeight = '900';
      if (el.parentElement) {
        el.parentElement.style.color = theme.text;
        el.parentElement.style.fontWeight = '800';
        el.parentElement.style.background = theme.badgeBg;
        el.parentElement.style.borderRadius = '999px';
        el.parentElement.style.padding = '6px 12px';
        el.parentElement.style.border = `1px solid ${theme.badgeBd}`;
      }
    });

    [btnRun, btnPause, btnReset, btnExit, btnStep].forEach(btn => {
      if (!btn) return;
      btn.style.opacity = '1';
      btn.style.fontWeight = '900';
      btn.style.textShadow = 'none';
    });
    if (btnRun) {
      btnRun.style.background = 'linear-gradient(135deg, #6e6df6, #53c3ef)';
      btnRun.style.color = '#fff';
      btnRun.style.border = 'none';
    }
    if (btnPause) {
      btnPause.style.background = theme.softBtnBg;
      btnPause.style.color = theme.text;
      btnPause.style.border = `2px solid ${theme.softBtnBd}`;
    }
    if (btnStep) {
      btnStep.style.background = theme.softBtnBg;
      btnStep.style.color = theme.text;
      btnStep.style.border = `2px solid ${theme.softBtnBd}`;
    }
    if (btnReset) {
      btnReset.style.background = theme.softBtnBg;
      btnReset.style.color = theme.text;
      btnReset.style.border = `2px solid ${theme.softBtnBd}`;
    }
    if (btnExit) {
      btnExit.style.background = '#fff5f5';
      btnExit.style.color = '#8b2c2c';
      btnExit.style.border = '2px solid #e4aaaa';
    }
    if (toastEl) {
      toastEl.style.background = theme.toastBg;
      toastEl.style.color = '#fff';
      toastEl.style.fontWeight = '800';
      toastEl.style.borderRadius = '18px';
      toastEl.style.padding = '14px 16px';
      toastEl.style.border = `2px solid ${theme.toastBd}`;
    }
    if (resultEl) {
      resultEl.style.color = theme.text;
    }

    if (gridEl) {
      const wrap = gridEl.parentElement;
      const panel = wrap && wrap.parentElement ? wrap.parentElement : wrap;
      setPanelTheme(wrap, {background:theme.gridWrapBg, border:`1px solid ${theme.gridWrapBd}`, color:theme.text});
      setPanelTheme(panel, {background:theme.panelBg, border:`1px solid ${theme.panelBd}`, color:theme.text});
      if (wrap) wrap.style.color = theme.text;
    }

    if (blocklyEl) {
      const wrap = blocklyEl.parentElement;
      const panel = wrap && wrap.parentElement ? wrap.parentElement : wrap;
      if (wrap) {
        wrap.style.background = theme.workspaceBg;
        wrap.style.border = `1px solid ${theme.panelBd}`;
        wrap.style.borderRadius = '18px';
      }
      setPanelTheme(panel, {background:theme.panelBg, border:`1px solid ${theme.panelBd}`, color:theme.text});
      if (panel) panel.style.color = theme.text;
      if (wrap && wrap.previousElementSibling) {
        wrap.previousElementSibling.style.color = theme.text;
        wrap.previousElementSibling.style.fontWeight = '900';
        wrap.previousElementSibling.style.textShadow = 'none';
      }
    }
  }

  function ensureInfoPanels(){
    ensureStyles();
    document.body.classList.add("world1-skin");
    const badgeEl = document.getElementById("sessionBadge");
    if (badgeEl) badgeEl.style.display = 'none';
    const copyCard = document.getElementById("stageCopyCard");
    if (copyCard) copyCard.remove();
  }

  function ensureBossStage(){
    let bossEl = document.getElementById("bossStage");
    if (!bossEl) {
      bossEl = document.createElement("section");
      bossEl.id = "bossStage";
      bossEl.className = "boss-stage";
      const anchor = document.getElementById("stageCopyCard") || document.getElementById("stageRewardCard");
      if (anchor) anchor.insertAdjacentElement("afterend", bossEl);
    }
    return bossEl;
  }

  function applyStaticUIText(){
    const btnRun = document.getElementById("btnRun");
    const btnPause = document.getElementById("btnPause");
    const btnReset = document.getElementById("btnReset");
    const btnExit = document.getElementById("btnExit");
    const btnStep = document.getElementById("btnStep");
    if (btnRun) btnRun.textContent = UI.buttons.run;
    if (btnPause) btnPause.textContent = UI.buttons.pause;
    if (btnStep) btnStep.textContent = '步進';
    if (btnReset) btnReset.textContent = UI.buttons.reset;
    if (btnExit) btnExit.textContent = UI.buttons.exit;
  }

  function worldCardsHtml(){
    const cardData = getCardData();
    return [cardData.potion, cardData.dagger, cardData.shield, cardData.freeze].map(card => `
      <div class="stage-reward-item">
        <img src="${card.img}" alt="${card.title}">
        <div><b>${card.title}</b><br>${card.desc}</div>
      </div>
    `).join("");
  }

  function fillInfoPanels(){
    ensureInfoPanels();
  }

  
  function getCardsForBoss(){
    const cardData = getCardData();
    return [cardData.potion, cardData.dagger, cardData.shield, cardData.freeze].map(card => ({...card, used:false}));
  }

  function createBossState(){
    return {
      playerMaxHp: 30,
      playerHp: 30,
      playerShield: 0,
      playerPower: 0,
      bossMaxHp: 24,
      bossHp: 24,
      turn: 1,
      bossFreezeTurns: 0,
      bossPatternIndex: 0,
      phase: 1,
      cards: getCardsForBoss(),
      log: ["戰鬥開始！先觀察狼王的下一招，再決定是否防禦或進攻。"],
      finished: false,
      startedAt: Date.now(),
      fxText: '⚔️ Boss 戰開始！',
      lastBossAction: '尚未行動',
      lastPlayerAction: '尚未行動',
    };
  }

  function getBossPhase(){
    if (!bossState) return 1;
    return bossState.bossHp <= Math.ceil(bossState.bossMaxHp * 0.5) ? 2 : 1;
  }

  function getBossPattern(phase){
    if (phase >= 2) {
      return [
        {type:'attack', label:'飛撲猛擊', damage:6, icon:'⚡', hint:'較高傷害，適合先補血或防禦。'},
        {type:'multi', label:'雙爪連擊', hits:[4,4], icon:'🌀', hint:'連續兩次傷害，護盾很有用。'},
        {type:'skill', label:'狼王怒嚎', damage:10, icon:'🔥', hint:'第二階段大招，沒準備會很痛。'},
      ];
    }
    return [
      {type:'attack', label:'利爪攻擊', damage:5, icon:'🩸', hint:'普通攻擊。'},
      {type:'attack', label:'利爪攻擊', damage:5, icon:'🩸', hint:'普通攻擊。'},
      {type:'skill', label:'撲擊咆哮', damage:7, icon:'🐺', hint:'比普通攻擊更痛，建議先防禦。'},
    ];
  }

  function bossPatternAction(index, phase){
    const pattern = getBossPattern(phase);
    return pattern[index % pattern.length];
  }

  function syncBossPhase(){
    if (!bossState) return;
    bossState.phase = getBossPhase();
  }

  function getBossIntentPreview(){
    if (!bossState) {
      return { icon:'❔', label:'未知', hint:'準備載入中…' };
    }
    return bossPatternAction(bossState.bossPatternIndex, getBossPhase());
  }

  function bossCardsHtml(){
    if (!bossState || !Array.isArray(bossState.cards)) return '';
    return bossState.cards.map(card => `
      <div class="boss-card ${card.used ? 'is-used' : ''}">
        <img src="${card.img}" alt="${card.title}">
        <div>
          <div class="boss-card-title">${card.title}</div>
          <div class="boss-card-desc">${card.desc}</div>
          <div class="boss-card-tag">${card.used ? '已使用' : '可使用 1 次'}</div>
          <button type="button" data-card="${card.key}" ${card.used || bossState.finished ? 'disabled' : ''}>使用卡牌</button>
        </div>
      </div>
    `).join('');
  }

  function bossLogHtml(){
    if (!bossState || !Array.isArray(bossState.log) || bossState.log.length === 0) {
      return '<div class="boss-empty-tip">目前還沒有戰鬥紀錄。</div>';
    }
    return bossState.log.map(item => `<div class="boss-log-entry">${item}</div>`).join('');
  }

  function updateBossButtons(){
    const disabled = !bossState || bossState.finished;
    ['bossBasicAttack','bossDefend','bossFocus','bossEndTurn'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = disabled;
    });
    document.querySelectorAll('#bossCards [data-card]').forEach(btn => {
      if (disabled) btn.disabled = true;
    });
  }

  function renderBossStage(){
    const bossEl = ensureBossStage();
    if (!bossEl || !bossState) return;
    syncBossPhase();
    const playerPct = Math.max(0, bossState.playerHp) / bossState.playerMaxHp * 100;
    const bossPct = Math.max(0, bossState.bossHp) / bossState.bossMaxHp * 100;
    const intent = getBossIntentPreview();
    const recentLogs = (bossState.log || []).slice(0, 4);

    bossEl.innerHTML = `
      <div class="boss-stage-top">
        <div class="boss-top-panel compact">
          <div class="boss-top-name">玩家狀態</div>
          <div class="boss-hp-head">
            <strong>勇者 HP</strong>
            <span class="boss-hp-num">${bossState.playerHp} / ${bossState.playerMaxHp}</span>
          </div>
          <div class="hp-bar"><div class="hp-fill-player" style="width:${playerPct}%"></div></div>
          <div class="boss-bar-sub">
            <span>護盾：${bossState.playerShield}</span>
            <span>蓄力：${bossState.playerPower}</span>
          </div>
        </div>

        <div class="boss-intent-box">
          <div class="boss-intent-title">第 ${bossState.turn} 回合｜狼王下一招</div>
          <div class="boss-intent-main">${intent.icon} ${intent.label}</div>
          <div class="boss-intent-sub">${intent.hint}</div>
        </div>

        <div class="boss-top-panel compact">
          <div class="boss-top-name">Boss 狀態</div>
          <div class="boss-hp-head">
            <strong>森林狼王</strong>
            <span class="boss-hp-num">${bossState.bossHp} / ${bossState.bossMaxHp}</span>
          </div>
          <div class="hp-bar"><div class="hp-fill-boss" style="width:${bossPct}%"></div></div>
          <div class="boss-bar-sub">
            <span>階段：${bossState.phase === 1 ? '森林試探' : '狂暴模式'}</span>
            <span>冰凍：${bossState.bossFreezeTurns}</span>
          </div>
        </div>
      </div>

      <div class="boss-stage-main">
        <div class="boss-arena">
          <div class="boss-portrait-wrap">
            <img src="${getWorldAssets().boss}" alt="${getWorldCopy().bossTitle}">
            <div class="boss-name-badge">${bossState.phase === 1 ? '🌿 森林試探' : '🔥 狂暴模式'}</div>
            <div class="boss-fx-box">${bossState.fxText || '準備行動中…'}</div>
          </div>
        </div>
      </div>

      <div class="boss-stage-bottom">
        <div class="boss-card-box">
          <div class="boss-section-title">卡牌區</div>
          <div class="boss-cards" id="bossCards">${bossCardsHtml()}</div>
        </div>

        <div class="boss-action-box">
          <div class="boss-section-title">本回合行動</div>
          <div class="boss-action-buttons">
            <button type="button" id="bossBasicAttack">普通攻擊（4＋蓄力）</button>
            <button type="button" class="secondary" id="bossDefend">防禦姿態（+6 護盾）</button>
            <button type="button" class="utility" id="bossFocus">專注蓄力（下次 +2）</button>
            <button type="button" class="danger" id="bossEndTurn">略過回合</button>
          </div>
          <div class="boss-footer-tip">先看上方血量與預告，再選卡牌或動作。</div>
          <div class="boss-inline-log">
            ${recentLogs.length ? recentLogs.map(item => `<span class="boss-log-pill">${item.replace(/<[^>]*>/g, '')}</span>`).join('') : '<span class="boss-log-pill">戰鬥開始！</span>'}
          </div>
        </div>
      </div>
    `;

    const phaseBadge = bossEl.querySelector('.boss-name-badge');
    if (phaseBadge) phaseBadge.textContent = bossState.phase === 1 ? '🌿 森林試探' : '🔥 狂暴模式';

    const basicBtn = document.getElementById('bossBasicAttack');
    const defendBtn = document.getElementById('bossDefend');
    const focusBtn = document.getElementById('bossFocus');
    const endBtn = document.getElementById('bossEndTurn');
    if (basicBtn) basicBtn.onclick = ()=> playerBossAction('basic');
    if (defendBtn) defendBtn.onclick = ()=> playerBossAction('defend');
    if (focusBtn) focusBtn.onclick = ()=> playerBossAction('focus');
    if (endBtn) endBtn.onclick = ()=> playerBossAction('skip');
    document.querySelectorAll('#bossCards [data-card]').forEach(btn => {
      btn.onclick = ()=> playerBossAction(btn.dataset.card);
    });
    updateBossButtons();
  }

  function pushBossLog(html){
    bossState.log.unshift(html);
    bossState.log = bossState.log.slice(0, 14);
  }

  function applyDamageToBoss(rawDamage, sourceLabel){
    const damage = Math.max(0, rawDamage);
    bossState.bossHp = Math.max(0, bossState.bossHp - damage);
    if (sourceLabel) pushBossLog(`<strong>玩家：</strong>${sourceLabel}造成 ${damage} 點傷害。`);
    bossState.fxText = `💥 對狼王造成 ${damage} 點傷害！`;
    return damage;
  }

  function applyDamageToPlayer(rawDamage, sourceLabel){
    let damage = rawDamage;
    if (bossState.playerShield > 0) {
      const blocked = Math.min(bossState.playerShield, damage);
      bossState.playerShield -= blocked;
      damage -= blocked;
      if (blocked > 0) pushBossLog(`<strong>防禦：</strong>護盾擋下了 ${blocked} 點傷害。`);
    }
    bossState.playerHp = Math.max(0, bossState.playerHp - damage);
    if (sourceLabel) {
      pushBossLog(`<strong>狼王：</strong>${sourceLabel}，你受到 ${damage} 點傷害。`);
    }
    bossState.fxText = damage > 0 ? `😵 你受到 ${damage} 點傷害！` : '🛡️ 你完全擋住了這次攻擊！';
    return damage;
  }

  function bossTakeTurn(){
    if (bossState.finished) return;
    if (bossState.bossFreezeTurns > 0) {
      bossState.bossFreezeTurns -= 1;
      bossState.lastBossAction = '被冰凍，無法行動';
      bossState.fxText = '❄️ 狼王被冰凍，這回合無法行動！';
      pushBossLog(`<strong>狼王：</strong>被冰凍藤蔓纏住，這回合無法行動！`);
      return;
    }

    const action = bossPatternAction(bossState.bossPatternIndex, getBossPhase());
    bossState.bossPatternIndex += 1;
    bossState.lastBossAction = action.label;

    if (action.type === 'multi') {
      let total = 0;
      for (const hit of action.hits) total += applyDamageToPlayer(hit, `${action.label}（${hit}）`);
      pushBossLog(`<strong>狼王連擊：</strong>${action.label}總共造成 ${total} 點傷害。`);
    } else {
      applyDamageToPlayer(action.damage, action.label);
    }
  }

  function finishBossBattle(win){
    bossState.finished = true;
    renderBossStage();
    const turnsUsed = bossState.turn;
    const session = (window.StorageAPI && typeof StorageAPI.getSession === 'function') ? StorageAPI.getSession() : null;
    if (win) {
      const score = Math.max(100, 1500 - (turnsUsed-1)*70 - Math.max(0, bossState.playerMaxHp - bossState.playerHp) * 5);
      const record = { score, stars: 3, steps: turnsUsed, timeMs: Date.now() - bossState.startedAt, bumps: 0, at: Date.now() };
      if (session && window.StorageAPI) {
        try {
          StorageAPI.upsertBest(session.userId, levelKey(), record);
          StorageAPI.updateLeaderboard(session, levelKey(), record);
        } catch(e) {}
      }
      showResult(buildResultCard(
        'good',
        'Boss 戰勝利！',
        `你擊敗了森林狼王！<br>這個版本的 Boss 戰已經具有教學用的「預判 → 決策 → 結果」節奏。`,
        `<div class="result-stats">
          <span class="result-badge">回合數：${turnsUsed}</span>
          <span class="result-badge">剩餘生命：${bossState.playerHp}</span>
          <span class="result-badge">Boss 分數：${score}</span>
        </div>`
      ));
      toast('你擊敗了森林狼王！');
    } else {
      showResult(buildResultCard(
        'bad',
        '挑戰失敗',
        `你被森林狼王擊退了……<br>請孩子重新觀察「下一招預告」，思考哪一回合該先防禦。`
      ));
      toast('森林狼王擊退了你，再試一次！');
    }
  }

  function playerBossAction(actionKey){
    if (!bossState || bossState.finished) return;

    if (actionKey === 'basic') {
      const extra = bossState.playerPower;
      const total = 4 + extra;
      applyDamageToBoss(total, `普通攻擊${extra > 0 ? `（含蓄力 +${extra}）` : ''}`);
      bossState.lastPlayerAction = `普通攻擊 ${total}`;
      bossState.playerPower = 0;
    } else if (actionKey === 'defend') {
      bossState.playerShield += 6;
      bossState.lastPlayerAction = '防禦姿態';
      bossState.fxText = '🛡️ 你架起防禦姿態，護盾 +6！';
      pushBossLog(`<strong>玩家：</strong>進入防禦姿態，護盾增加 6。`);
    } else if (actionKey === 'focus') {
      bossState.playerPower += 2;
      bossState.lastPlayerAction = '專注蓄力';
      bossState.fxText = '✨ 你正在蓄力，下次攻擊會更痛！';
      pushBossLog(`<strong>玩家：</strong>專注蓄力，下次普通攻擊 +2 傷害。`);
    } else if (actionKey === 'skip') {
      bossState.lastPlayerAction = '略過回合';
      bossState.fxText = '👀 你選擇觀察狼王。';
      pushBossLog(`<strong>玩家：</strong>先觀察狼王的動作。`);
    } else {
      const card = bossState.cards.find(c => c.key === actionKey);
      if (!card || card.used) return;
      card.used = true;
      bossState.lastPlayerAction = `使用卡牌：${card.title}`;
      if (card.key === 'potion') {
        bossState.playerHp = Math.min(bossState.playerMaxHp, bossState.playerHp + 8);
        bossState.fxText = '💚 恢復 8 點生命值！';
        pushBossLog(`<strong>玩家卡牌：</strong>${card.title}恢復了 8 點生命值。`);
      } else if (card.key === 'dagger') {
        applyDamageToBoss(7, card.title);
      } else if (card.key === 'shield') {
        bossState.playerShield += 8;
        bossState.fxText = '🪵 木盾展開，護盾 +8！';
        pushBossLog(`<strong>玩家卡牌：</strong>${card.title}提供 8 點護盾。`);
      } else if (card.key === 'freeze') {
        bossState.bossFreezeTurns = 1;
        bossState.fxText = '❄️ 狼王將被凍住下一回合！';
        pushBossLog(`<strong>玩家卡牌：</strong>${card.title}讓狼王下一回合無法行動。`);
      }
    }

    syncBossPhase();
    if (bossState.bossHp <= 0) {
      finishBossBattle(true);
      return;
    }

    bossTakeTurn();
    if (bossState.playerHp <= 0) {
      finishBossBattle(false);
      return;
    }

    bossState.turn += 1;
    renderBossStage();
  }

  function toggleBossOnlyLayout(enabled){
    const rememberDisplay = (el) => {
      if (!el) return;
      if (!el.dataset.bossPrevDisplay) el.dataset.bossPrevDisplay = el.style.display || '';
    };

    const setHidden = (el, hidden) => {
      if (!el) return;
      if (hidden) {
        rememberDisplay(el);
        el.style.display = 'none';
      } else {
        el.style.display = el.dataset.bossPrevDisplay || '';
      }
    };

    const ids = ['stageWorldHero', 'stageCopyCard', 'stageRewardCard', 'title', 'subtitle', 'result', 'blocklyDiv', 'grid'];
    ids.forEach(id => setHidden(document.getElementById(id), enabled));

    const hideClosestPanel = (el) => {
      if (!el) return;
      const panel = el.closest('.card, .panel, .box, .section, .game-panel, .layout-card, .layout-panel') || el.parentElement;
      setHidden(panel || el, enabled);
    };

    hideClosestPanel(document.getElementById('blocklyDiv'));
    hideClosestPanel(document.getElementById('grid'));

    document.querySelectorAll('*').forEach(el => {
      const text = (el.textContent || '').trim();
      const id = el.id || '';
      const cls = el.className || '';
      const style = window.getComputedStyle(el);
      const isFloating = style.position === 'fixed' || style.position === 'sticky';
      const looksTeacher = /教師模式|最佳解法|teacher/i.test(text + ' ' + id + ' ' + cls);
      const looksBlocklyArea = /積木程式區|blockly/i.test(text + ' ' + id + ' ' + cls);
      const looksMazeHud = /步數|撞牆|鑰匙|時間/.test(text);
      const smallFloating = isFloating && (el.offsetWidth <= 220 || looksTeacher);

      if (enabled) {
        if (looksTeacher || looksBlocklyArea || looksMazeHud || smallFloating) {
          rememberDisplay(el);
          el.classList.add('boss-hidden-by-mode');
          el.style.display = 'none';
        }
      } else if (el.classList.contains('boss-hidden-by-mode')) {
        el.style.display = el.dataset.bossPrevDisplay || '';
        el.classList.remove('boss-hidden-by-mode');
      }
    });

    const stage = document.getElementById('bossStage');
    if (stage && enabled) {
      stage.style.marginTop = '8px';
      stage.scrollIntoView({ block: 'start' });
    }
  }

  function bossCompactLogHtml(){
    if (!bossState || !Array.isArray(bossState.log) || bossState.log.length === 0) {
      return '<div class="boss-empty-tip">目前還沒有戰鬥紀錄。</div>';
    }
    return bossState.log.slice(0, 6).map(item => `<div class="boss-log-entry">${item}</div>`).join('');
  }

  function setupBossBattleUI(){
    const blocklyDiv = document.getElementById('blocklyDiv');
    const gridEl = document.getElementById('grid');
    const btnRun = document.getElementById('btnRun');
    const btnPause = document.getElementById('btnPause');
    const btnReset = document.getElementById('btnReset');
    if (blocklyDiv) blocklyDiv.style.display = 'none';
    if (gridEl) gridEl.style.display = 'none';
    if (btnRun) btnRun.style.display = 'none';
    if (btnPause) btnPause.style.display = 'none';
    if (btnReset) btnReset.textContent = '重新挑戰 Boss';

    bossState = createBossState();
    toggleBossOnlyLayout(true);
    renderBossStage();
    showResult('');
    toast('Boss 戰開始！先看上方血量與中間預告，再選卡牌或動作。');
  }

  function teardownBossBattleUI(){
    const blocklyDiv = document.getElementById('blocklyDiv');
    const gridEl = document.getElementById('grid');
    const btnRun = document.getElementById('btnRun');
    const btnPause = document.getElementById('btnPause');
    const btnReset = document.getElementById('btnReset');
    const bossEl = document.getElementById('bossStage');
    if (blocklyDiv) blocklyDiv.style.display = '';
    if (gridEl) gridEl.style.display = '';
    if (btnRun) btnRun.style.display = '';
    if (btnPause) btnPause.style.display = '';
    if (btnReset) btnReset.textContent = UI.buttons.reset;
    if (bossEl) bossEl.remove();
    toggleBossOnlyLayout(false);
    bossState = null;
  }

  function parseMap(mapLines){
    H = mapLines.length;
    W = mapLines[0].length;
    grid = mapLines.map(line => line.split(""));
    portalPositions = { P: [], Q: [], R: [] };
    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++){
        let ch = grid[y][x];
        if(ch === "E"){
          grid[y][x] = ".";
          ch = ".";
        }
        if(ch === "S"){
          px = x;
          py = y;
          startX = x;
          startY = y;
        }
        if(isPortalSymbol(ch)){
          portalPositions[ch].push({ x, y });
        }
      }
    }
  }

  function cellClass(ch){
    if(ch==="#") return "wall";
    if(['M','N','B'].includes(ch)) return "wall obstacle";
    if(ch==="S") return "start";
    if(ch==="K") return "key";
    if(ch==="D") return "door exit";
    if(ch==="T") return "trap";
    if(ch==="P") return "portal portal-blue";
    if(ch==="Q") return "portal portal-purple";
    if(ch==="R") return "portal portal-red";
    if(ch==="C") return "item";
    if(ch==="G") return "block";
    if(ch==="I") return "item";
    if(ch==="X") return "ice";
    if(ch==="L") return "lava";
    if(ch==="O") return "monster";
    if(ch==="F") return "flame";
    return "";
  }


  function getCellSymbolHtml(ch, hasKeyNow = hasKey){
    const s = String(ch || '').toUpperCase();
    if(s === 'K') return '🗝️';
    if(s === 'D') return hasKeyNow
      ? '<span class="cell-symbol-stack"><span class="door-icon">🚪</span></span>'
      : '<span class="cell-symbol-stack"><span class="door-icon">🚪</span><span class="lock-icon">🔒</span></span>';
    if(s === 'T') return '🕳️';
    if(s === 'P') return '<img class="cell-symbol portal-img portal-img-blue" src="img/door1.jpeg" alt="藍色傳送門">';
    if(s === 'Q') return '<img class="cell-symbol portal-img portal-img-purple" src="img/door2.jpeg" alt="紫色傳送門">';
    if(s === 'R') return '<img class="cell-symbol portal-img portal-img-red" src="img/door3.jpeg" alt="紅色傳送門">';
    if(s === 'C') return '🎁';
    if(s === 'G') return '<img class="cell-symbol symbol-gold-img" src="img/gold.png" alt="裝備寶箱">';
    if(s === 'I') return '✨';
    if(s === 'M') return '⚙️';
    if(s === 'N') return '🌲';
    if(s === 'B') return '📚';
    if(s === 'X') return '🧊';
    if(s === 'L') return '🌊';
    if(s === 'O') return '👾';
    if(s === 'F') return '🔥';
    return '';
  }

  function render(){
    const gridEl = document.getElementById("grid");
    if (!gridEl) return;
    gridEl.style.gridTemplateColumns = `repeat(${W}, var(--maze-cell-size, 34px))`;
    applyMazeScale();
    gridEl.innerHTML = "";

    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++){
        const ch = grid[y][x];
        const div = document.createElement("div");
        div.className = "cell " + cellClass(ch);

        if(x===px && y===py){
          div.classList.add("player");
          div.textContent = DIRS[dir].emoji;
        }else{
          if(ch === "D") {
            const isLockedDoor = !hasKey;
            div.innerHTML = getCellSymbolHtml(ch, hasKey);
            div.setAttribute('aria-label', isLockedDoor ? '鎖住的出口門' : '已解鎖的出口門');
          } else {
            div.innerHTML = getCellSymbolHtml(ch, hasKey);
          }
        }

        gridEl.appendChild(div);
      }
    }

    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };
    const codeBlocks = getCurrentProgramBlockCount();
    const targetBlocks = Number(level?.targetBlocks || level?.targetSteps || 0);
    setText("codeCount", codeBlocks);
    setText("targetCodeCount", targetBlocks > 0 ? targetBlocks : '—');
    const codeBadge = document.getElementById("codeBadge");
    if (codeBadge) {
      const overTarget = targetBlocks > 0 && codeBlocks > targetBlocks;
      codeBadge.style.borderColor = overTarget ? "rgba(220,38,38,.45)" : "";
      codeBadge.style.background = overTarget ? "rgba(254,226,226,.85)" : "";
      const currentEl = document.getElementById("codeCount");
      const targetEl = document.getElementById("targetCodeCount");
      if (currentEl) currentEl.style.color = overTarget ? "#dc2626" : "";
      if (targetEl) targetEl.style.color = overTarget ? "#dc2626" : "";
    }
    setText("bumps", bumps);
    setText("hasKey", hasKey ? "是" : "否");
    const t = running ? Math.max(0, Date.now()-startAt) : (startAt ? Math.max(0, Date.now()-startAt) : 0);
    setText("time", Math.floor(t/1000));
  }

  function isWall(x,y){
    const ch = grid[y]?.[x];
    return ['#','M','N','B','X','L','O','F', undefined].includes(ch);
  }

  function getTileBlockMessage(ch){
    if(ch === 'M') return '前方有齒輪牆，不能直接通過。';
    if(ch === 'N') return '前方有樹木擋住，不能直接通過。';
    if(ch === 'B') return '前方有書櫃擋住，不能直接通過。';
    if(ch === 'X') return '前方有冰塊，需要破壞後才能通過。';
    if(ch === 'L') return '前方是河流，需要先施放飛行咒語。';
    if(ch === 'O') return '前方有妖怪，需要用咒語擊退。';
    if(ch === 'F') return '前方有火焰，需要用咒語熄滅。';
    return UI.common.wall;
  }

  function isInside(x,y){
    return x>=0 && x<W && y>=0 && y<H;
  }

  function checkTile(){
    const ch = grid[py][px];
    if(ch==="K"){
      hasKey = true;
      grid[py][px] = ".";
      toast(UI.common.gotKey);
      return;
    }
    if(ch==="C"){
      openedItemChest = true;
      collectedItemName = String(level?.itemReward || getLevelCopy(world?.worldId, level?.levelId).reward || '神秘道具');
      grid[py][px] = ".";
      toast(`你打開道具寶箱，獲得「${collectedItemName}」！`);
      return;
    }
    if(ch==="G"){
      openedEquipmentChest = true;
      collectedEquipmentName = String(level?.equipmentReward || '神秘裝備');
      grid[py][px] = ".";
      toast(`你打開裝備寶箱，獲得「${collectedEquipmentName}」！`);
      return;
    }
    if(ch==="I"){
      openedItemChest = true;
      collectedItemName = String(level?.itemReward || getLevelCopy(world?.worldId, level?.levelId).reward || '神秘道具');
      grid[py][px] = ".";
      toast(UI.common.gotCard);
      return;
    }
    if(ch==="T"){
      px = startX;
      py = startY;
      steps += 3;
      toast('踩到回起點陷阱！回到起點，步數 +3');
      return;
    }
    if(isPortalSymbol(ch)){
      const destination = getTeleportDestination(px, py, ch);
      if (destination) {
        px = destination.x;
        py = destination.y;
        const portalName = ch === 'P' ? '藍色' : (ch === 'Q' ? '紫色' : '紅色');
        toast(`踩到${portalName}傳送門！你被傳送到同色的另一個位置。`);
      } else {
        toast('這個傳送門還沒有同色配對位置。');
      }
    }
  }

  function reachedExit(){
    return grid[py][px] === "D";
  }

  function doorBlockedAhead(nx, ny){
    if(!isInside(nx,ny)) return false;
    const ch = grid[ny][nx];
    if(ch !== "D") return false;
    return !hasKey;
  }

  function canMoveTo(nx, ny){
    if(!isInside(nx,ny)) return false;
    if(isWall(nx,ny)) return false;
    if(doorBlockedAhead(nx,ny)) return false;
    return true;
  }

  function sleep(ms){
    return new Promise(r=>setTimeout(r, ms));
  }

  const SPELL_RULES = {
    fire: {
      label: '火焰咒語',
      sequence: ['left','right','right','left'],
      target: 'X',
      success: '🔥 火焰咒語成功！前方冰塊已融化。',
      fail: '火焰咒語順序錯了，正確應為：左、右、右、左。',
      wrongTarget: '火焰咒語只能消滅前方冰塊。'
    },
    rain: {
      label: '暴雨咒語',
      sequence: ['right','left','left','right'],
      target: 'F',
      success: '🌧️ 暴雨咒語成功！前方火焰已熄滅。',
      fail: '暴雨咒語順序錯了，正確應為：右、左、左、右。',
      wrongTarget: '暴雨咒語只能消滅前方火焰。'
    },
    purify: {
      label: '驅邪咒語',
      sequence: ['left','left','right','right'],
      target: 'O',
      success: '✨ 驅邪咒語成功！前方妖怪已被驅散。',
      fail: '驅邪咒語順序錯了，正確應為：左、左、右、右。',
      wrongTarget: '驅邪咒語只能消滅前方妖怪。'
    },
    fly: {
      label: '飛行咒語',
      sequence: ['right','right','left','left'],
      target: 'L',
      success: '🕊️ 飛行咒語成功！你已安全飛過前方河流。',
      fail: '飛行咒語順序錯了，正確應為：右、右、左、左。',
      wrongTarget: '飛行咒語只能穿過前方河流。'
    }
  };

  function getForwardPosition(){
    const d = DIRS[dir];
    return { x: px + d.dx, y: py + d.dy };
  }

  function spellSequenceMatches(name, sequence){
    const rule = SPELL_RULES[String(name || '').toLowerCase()];
    if(!rule) return false;
    if(!Array.isArray(sequence) || sequence.length !== rule.sequence.length) return false;
    return rule.sequence.every((step, index) => step === sequence[index]);
  }

  function castSpellOnForwardTile(name){
    const rule = SPELL_RULES[String(name || '').toLowerCase()];
    if(!rule) return false;
    const { x, y } = getForwardPosition();
    if(!isInside(x, y)){
      toast(`${rule.label}前方沒有可施放的目標。`);
      return false;
    }
    const ch = String(grid[y]?.[x] || '');
    if(ch !== rule.target){
      toast(rule.wrongTarget);
      return false;
    }
    grid[y][x] = '.';
    toast(rule.success);
    render();
    return true;
  }

  async function ensureNotPaused(expectedGeneration = runGeneration){
    while(paused && !abortRun && expectedGeneration === runGeneration){
      await sleep(80);
    }
    if(abortRun || expectedGeneration !== runGeneration) throw new Error("aborted");
  }

  function getCurrentProgramBlockCount(){
    try{
      return Number(BlocklySetup?.countScoringBlocks?.(workspace) || 0);
    }catch(_err){
      return 0;
    }
  }

  function scoreAndStars(){
    const timeMs = Math.max(0, Date.now()-startAt);
    const rewardCount = (openedItemChest ? 1 : 0) + (openedEquipmentChest ? 1 : 0);
    const gotBothRewards = openedItemChest && openedEquipmentChest;
    const targetBlocks = Number(level?.targetBlocks || level?.targetSteps || 0);
    const codeBlocks = getCurrentProgramBlockCount();

    let stars = 1;
    if (rewardCount >= 2) stars = 2;
    if (gotBothRewards && targetBlocks > 0 && codeBlocks > 0 && codeBlocks <= targetBlocks) stars = 3;

    const base = 1200;
    const rewardBonus = (openedItemChest ? 120 : 0) + (openedEquipmentChest ? 120 : 0) + (stars >= 3 ? 200 : 0);
    const score = Math.max(100, base + rewardBonus - steps*6 - bumps*30 - Math.floor(timeMs/1000)*2);

    return {score, stars, timeMs, rewardCount, gotBothRewards, codeBlocks, targetBlocks};
  }

  function levelKey(){
    return `${world.worldId}-${level.levelId}`;
  }

  function getSelectedCharacter(){
    const session = getSessionSafe();
    const character = String(session?.character || 'boy').trim().toLowerCase();
    return character === 'girl' ? 'girl' : 'boy';
  }

  function showCharacterOutcomeImage(isWin){
    const stageMiddle = document.querySelector('.stageMiddle');
    if(!stageMiddle) return;
    const character = getSelectedCharacter();
    const state = isWin ? 'win' : 'lose';
    const src = CHARACTER_OUTCOME_IMAGES?.[character]?.[state];
    if(!src) return;

    let wrap = document.getElementById('characterOutcomeFx');
    if(!wrap){
      wrap = document.createElement('div');
      wrap.id = 'characterOutcomeFx';
      wrap.className = 'character-outcome-fx';
      wrap.innerHTML = '<img alt="角色結果提示">';
      stageMiddle.appendChild(wrap);
    }

    const img = wrap.querySelector('img');
    if(img) img.src = src;
    wrap.classList.remove('show','win','lose');
    void wrap.offsetWidth;
    wrap.classList.add('show', state);
    clearTimeout(wrap._timer);
    wrap._timer = setTimeout(()=>{ wrap.classList.remove('show','win','lose'); }, 2000);
  }

  function showResult(text){
    const footerResult = document.getElementById("result");
    const resultWrap = document.getElementById("mazeResultWrap");
    const gridWrap = document.getElementById("gridWrap") || document.querySelector('.gridWrap');
    const hr = document.querySelector('.stage .hr');
    const hasContent = !!String(text || '').trim();

    if (footerResult) {
      footerResult.textContent = hasContent ? '已顯示結果畫面' : '';
      footerResult.style.display = hasContent ? '' : 'none';
    }

    if (resultWrap) {
      resultWrap.innerHTML = hasContent ? text : '';
      resultWrap.hidden = !hasContent;
    }

    if (gridWrap) {
      gridWrap.style.display = hasContent ? 'none' : 'flex';
    }

    if (hr) {
      hr.style.display = 'none';
    }
  }


  function showInlineRunFeedback(title, body){
    // ✅ 失敗時不要蓋住迷宮，保留目前角色位置，讓學生可以直接觀察走到哪裡。
    showCharacterOutcomeImage(false);
    const resultWrap = document.getElementById("mazeResultWrap");
    const gridWrap = document.getElementById("gridWrap") || document.querySelector('.gridWrap');
    const footerResult = document.getElementById("result");

    if (resultWrap) {
      resultWrap.innerHTML = '';
      resultWrap.hidden = true;
    }
    if (gridWrap) {
      gridWrap.style.display = 'flex';
    }
    if (footerResult) {
      footerResult.style.display = '';
      footerResult.innerHTML = `<b>${title}</b>｜${body}`;
    }
  }

  function stopTimers(){
    if(tickTimer) clearInterval(tickTimer);
    tickTimer = null;
  }

  function resolvePendingStep(){
    if (typeof stepWaiterResolve === "function") {
      const resolve = stepWaiterResolve;
      stepWaiterResolve = null;
      resolve();
    }
  }

  async function waitForNextStep(){
    while (!abortRun) {
      if (stepCredits > 0) {
        stepCredits--;
        return;
      }
      await new Promise(resolve => {
        stepWaiterResolve = resolve;
      });
    }
    throw new Error("aborted");
  }

  function resetRunState(){
    running = false;
    paused = false;
    abortRun = false;
    stepMode = false;
    stepCredits = 0;
    resolvePendingStep();
    stopTimers();
  }

  function buildResultCard(kind, title, body, statsHtml = ""){
    const cls = kind === "good" ? "result-card result-good" : kind === "warn" ? "result-card result-warn" : "result-card result-bad";
    return `<div class="${cls}"><h3>${title}</h3><div>${body}</div>${statsHtml}</div>`;
  }

  function forceStopCurrentRun(){
    runGeneration += 1;
    abortRun = true;
    paused = false;
    resolvePendingStep();
    stopTimers();
  }

  function resetLevel(){
    const pack = findLevel(qs("world"), qs("level"));
    world = pack.w;
    level = pack.lv;
    const copy = getLevelCopy(world.worldId, level.levelId);

    applyMainContrast();
    document.getElementById("title").textContent = `${getWorldDisplayName(world.worldId)} ➜ ${getCleanLevelTitle()}`;
    refreshSubtitleText();

    fillInfoPanels();

    if (isBossLevel()) {
      resetRunState();
      teardownBossBattleUI();
      setupBossBattleUI();
      return;
    }

    teardownBossBattleUI();
    parseMap(level.map);
    dir = level.startDir ?? 1;
    hasKey = false;
    steps = 0;
    bumps = 0;
    startAt = 0;
    openedItemChest = false;
    openedEquipmentChest = false;
    collectedItemName = "";
    collectedEquipmentName = "";
    resetRunState();
    showResult("");
    // 保留玩家手動調整的迷宮縮放比例；重設關卡時只重新套用目前比例，不自動還原。
    applyMazeScale();
    startLegendTicker();
    toast(UI.common.startTip);
    render();
  }

  function startClock(){
    startAt = Date.now();
    tickTimer = setInterval(()=>render(), 300);
  }

  function makeAPI(expectedGeneration = runGeneration){
    let spellContext = null;

    function recordSpellTurn(turnDir){
      if (!spellContext) return;
      spellContext.turns.push(String(turnDir || '').toLowerCase());
    }

    async function __highlight(blockId){
      try{
        if (workspace && typeof workspace.highlightBlock === "function") {
          workspace.highlightBlock(blockId || null);
        } else if (window.Blockly && typeof Blockly.getMainWorkspace === "function") {
          const ws = Blockly.getMainWorkspace();
          if (ws && typeof ws.highlightBlock === "function") ws.highlightBlock(blockId || null);
        }
      }catch(e){
        // ignore highlight errors so Blockly visual effects never break gameplay
      }
      if (stepMode) {
        toast('步進模式：按一次「步進」就執行目前反白的這一塊。');
        await waitForNextStep();
      }
      await sleep(0);
    }

    async function __unhighlight(){
      try{
        if (workspace && typeof workspace.highlightBlock === "function") {
          workspace.highlightBlock(null);
        } else if (window.Blockly && typeof Blockly.getMainWorkspace === "function") {
          const ws = Blockly.getMainWorkspace();
          if (ws && typeof ws.highlightBlock === "function") ws.highlightBlock(null);
        }
      }catch(e){}
      await sleep(0);
    }

    async function __sleep(ms){
      await sleep(ms || 0);
    }

    return {
      __highlight,
      __unhighlight,
      __sleep,

      async moveForward(){
        await ensureNotPaused(expectedGeneration);
        if(abortRun || expectedGeneration !== runGeneration) throw new Error("aborted");

        if (spellContext) {
          spellContext.invalid = true;
        }

        const d = DIRS[dir];
        const nx = px + d.dx;
        const ny = py + d.dy;

        steps++;

        if(!canMoveTo(nx, ny)){
          bumps++;
          if (bumps >= MAX_BUMPS_BEFORE_SAFE_STOP) {
            abortRun = true;
            render();
            throw new Error("SAFE_STOP_TOO_MANY_BUMPS");
          }
          const blockedCh = grid[ny]?.[nx];
          toast(doorBlockedAhead(nx,ny) ? UI.common.doorLocked : getTileBlockMessage(blockedCh));
          render();
          await sleep(220);
          return;
        }

        if(grid[ny][nx] === "D" && hasKey){
          toast(UI.common.doorOpen);
        }

        px = nx; py = ny;
        checkTile();
        render();

        if(reachedExit()){
          throw new Error("WIN");
        }

        await sleep(220);
      },

      async turnLeft(){
        await ensureNotPaused(expectedGeneration);
        if(abortRun || expectedGeneration !== runGeneration) throw new Error("aborted");
        dir = (dir + 3) % 4;
        render();
        await sleep(120);
      },

      async turnRight(){
        await ensureNotPaused(expectedGeneration);
        if(abortRun || expectedGeneration !== runGeneration) throw new Error("aborted");
        dir = (dir + 1) % 4;
        render();
        await sleep(120);
      },

      async turnDirection(turnDir){
        await ensureNotPaused(expectedGeneration);
        if(abortRun || expectedGeneration !== runGeneration) throw new Error("aborted");
        const key = String(turnDir || "left").toLowerCase();
        recordSpellTurn(key);
        dir = key === "right" ? (dir + 1) % 4 : (dir + 3) % 4;
        render();
        await sleep(120);
      },

      async canMoveForward(){
        await ensureNotPaused(expectedGeneration);
        if(abortRun || expectedGeneration !== runGeneration) throw new Error("aborted");
        const d = DIRS[dir];
        const nx = px + d.dx;
        const ny = py + d.dy;
        return !!canMoveTo(nx, ny);
      },

      async canMoveDirection(relativeDir){
        await ensureNotPaused(expectedGeneration);
        if(abortRun || expectedGeneration !== runGeneration) throw new Error("aborted");
        const key = String(relativeDir || 'ahead').toLowerCase();
        let checkDir = dir;
        if(key === 'right') checkDir = (dir + 1) % 4;
        else if(key === 'left') checkDir = (dir + 3) % 4;
        const d = DIRS[checkDir];
        const nx = px + d.dx;
        const ny = py + d.dy;
        return !!canMoveTo(nx, ny);
      },

      async __beginSpell(name){
        await ensureNotPaused(expectedGeneration);
        if(abortRun || expectedGeneration !== runGeneration) throw new Error("aborted");
        spellContext = { name: String(name || '').toLowerCase(), turns: [], invalid: false };
      },

      async __endSpell(name){
        await ensureNotPaused(expectedGeneration);
        if(abortRun || expectedGeneration !== runGeneration) throw new Error("aborted");
        const spellName = String(name || '').toLowerCase();
        const ctx = spellContext;
        spellContext = null;
        if (!ctx || ctx.name !== spellName) {
          toast('咒語施放失敗，請重新整理函式積木。');
          return false;
        }
        if (ctx.invalid || !spellSequenceMatches(spellName, ctx.turns)) {
          const rule = SPELL_RULES[spellName];
          toast(rule?.fail || '咒語順序不正確。');
          return false;
        }
        return castSpellOnForwardTile(spellName);
      },

      async isAtGoal(){
        await ensureNotPaused(expectedGeneration);
        if(abortRun || expectedGeneration !== runGeneration) throw new Error("aborted");
        return !!reachedExit();
      }
    };
  }


  async function executeSingleStep(){
    if (isBossLevel()) return;
    if (!workspace) return;

    showResult('');

    if (running) {
      if (!stepMode) {
        toast('目前正在完整執行中，請先按「重設關卡」後再使用步進。');
        return;
      }
      stepCredits += 1;
      resolvePendingStep();
      toast('已執行下一塊積木。');
      return;
    }

    const topBlocks = typeof workspace.getTopBlocks === 'function' ? workspace.getTopBlocks(false) : [];
    if (!topBlocks || topBlocks.length === 0) {
      toast('目前沒有可執行的積木。');
      return;
    }

    stepMode = true;
    stepCredits = 1;
    toast('步進模式已開始。再按一次「步進」會執行下一塊積木。');
    await runProgram({ stepMode: true });
  }

  async function runProgram(options = {}){
    if (isBossLevel()) return;
    if(running) return;

    const requestedStepMode = !!options.stepMode;

    running = true;
    paused = false;
    abortRun = false;
    const expectedGeneration = ++runGeneration;
    stepMode = requestedStepMode;
    if (!requestedStepMode) stepCredits = 0;
    showResult("");
    toast(requestedStepMode ? "步進模式進行中…" : UI.common.running);
    if (!startAt) startClock();

    const api = makeAPI(expectedGeneration);
    const code = BlocklySetup.workspaceToAsyncCode(workspace);

    try{
      const wrapped = `return (async () => {\n${code}\n})();`;
      const fn = new Function("api", wrapped);
      await fn(api);

      resetRunState();
      const {score, stars} = scoreAndStars();
      const copy = getLevelCopy(world.worldId, level.levelId);
      showInlineRunFeedback(
        "這次還沒成功",
        "程式跑完了，但角色還沒走到出口門。請看目前角色位置，調整接下來的積木。"
      );
      toast("程式已停止：請觀察目前位置，再調整積木。");
    }catch(err){
      if(err?.message === "WIN"){
        stopTimers();
        running = false;
        paused = false;
        abortRun = false;
        stepMode = false;
        stepCredits = 0;
        resolvePendingStep();

        const {score, stars, timeMs, rewardCount, gotBothRewards, codeBlocks, targetBlocks} = scoreAndStars();
        const record = { score, stars, steps, timeMs, bumps, at: Date.now() };

        const session = StorageAPI.getSession();
        const improved = StorageAPI.upsertBest(session.userId, levelKey(), record);
        StorageAPI.updateLeaderboard(session, levelKey(), record);
        const updatedBuild = persistLevelRewards(stars) || getPlayerBuildSummary(session?.userId);
        // ✅ 道具/裝備/三星加成寫入 localStorage 後，再補同步一次到 MongoDB，避免雲端缺少 meta。
        try{ StorageAPI.syncLevelRecordToBackend?.(levelKey(), record); }catch(_err){}
        const copy = getLevelCopy(world.worldId, level.levelId);

        const starDesc = stars === 3
          ? '三星通關！'
          : stars === 2
            ? '二星通關！'
            : '一星通關！';

        const rewardSummary = [];
        if (openedItemChest && collectedItemName) rewardSummary.push(`🎁 道具：<b>${collectedItemName}</b>`);
        if (openedEquipmentChest && collectedEquipmentName) rewardSummary.push(`🛡️ 裝備：<b>${collectedEquipmentName}</b>`);

        clearProgramDraft(world.worldId, level.levelId);
        showCharacterOutcomeImage(true);

        showResult(buildResultCard(
          "good",
          "通關成功！",
          `${copy.success}<br>${starDesc}`,
          `<div class="result-stats">
            <span class="result-badge">★${stars}</span>
            <span class="result-badge">分數：${score}</span>
            <span class="result-badge">程式碼：${codeBlocks}/${targetBlocks || "—"}</span>
            <span class="result-badge">時間：${Math.round(timeMs/1000)} 秒</span>
          </div>
          ${rewardSummary.length ? `<div class="stage-current-reward" style="margin-top:12px;display:block;">${rewardSummary.join('<br>')}</div>` : ''}
          <div style="margin-top:8px;">${improved ? "🎉 已刷新最佳紀錄！" : "紀錄已更新。"}</div>`
        ));

        toast(UI.common.winToast);
      }else if(err?.message === "aborted"){
        resetRunState();
        toast(UI.common.stopped);
      }else if(err?.message === "SAFE_STOP_TOO_MANY_BUMPS"){
        resetRunState();
        showInlineRunFeedback(
          "安全停止",
          `角色已撞牆達 ${MAX_BUMPS_BEFORE_SAFE_STOP} 次，系統已自動停止。請看目前位置與方向，再修改積木。`
        );
        toast(`安全停止：撞牆達 ${MAX_BUMPS_BEFORE_SAFE_STOP} 次，已保留目前迷宮位置。`);
      }else{
        resetRunState();
        showInlineRunFeedback(
          "程式執行發生錯誤",
          `請檢查積木是否完整。錯誤：${String(err?.message || err)}`
        );
        toast(UI.common.codeError);
      }
    }
  }

  function bindUI(){
    const btnRun = document.getElementById("btnRun");
    const btnReset = document.getElementById("btnReset");
    const btnExit = document.getElementById("btnExit");

    if (btnRun) btnRun.onclick = ()=> runProgram();

    if (btnReset) btnReset.onclick = ()=>{
      forceStopCurrentRun();
      resetLevel();
    };

    if (btnExit) btnExit.onclick = ()=>{
      if(!confirm("確定要離開這一關嗎？系統會先保存你目前的積木進度。")) return;
      const saved = saveProgramDraft();
      forceStopCurrentRun();
      const exitTarget = getExitTargetPage();
      const exitLabel = exitTarget === "teacher.html" ? "教師介面" : "選擇關卡頁面";
      if (!isBossLevel()) {
        toast(saved
          ? `已保存目前積木進度，返回${exitLabel}中…`
          : `這一關目前沒有可保存的積木，直接返回${exitLabel}。`);
      }
      location.href = exitTarget;
    };
  }

  function init(){
    const worldId = qs("world");
    const levelId = qs("level");
    if (/^boss$/i.test(String(levelId || ''))) {
      const from = qs("from");
      const extra = from ? `&from=${encodeURIComponent(from)}` : "";
      location.replace(`boss.html?world=${encodeURIComponent(worldId || 'world1')}${extra}`);
      return;
    }
    const pack = findLevel(worldId, levelId);
    if(!pack){
      alert(UI.common.noLevel);
      location.href = "index.html";
      return;
    }

    applyStaticUIText();
    ensureInfoPanels();
    workspace = BlocklySetup.createWorkspace("blocklyDiv", normalizeWorldId(worldId || pack.w?.worldId || "W1"), { levelId: normalizeLevelId(levelId || pack.lv?.levelId || ""), availableSpellSymbols: getSpellObstacleSymbolsFromMap(pack.lv?.map) });
    bindUI();
    bindMazeAutoFit();
    bindMazeGestureZoom();
    lockTouchZoomGestures();

    function refreshVisibleTargetBlocksText(targetBlocks){
      const resultWrap = document.getElementById("mazeResultWrap");
      if (!resultWrap || resultWrap.hidden) return;

      const html = String(resultWrap.innerHTML || "");
      if (!html) return;

      resultWrap.innerHTML = html.replace(
        /目前程式碼數／目標程式碼數：[0-9—]+\/[0-9—]+/g,
        `目前程式碼數／目標程式碼數：${getCurrentProgramBlockCount()}/${targetBlocks}`
      );
    }

    window.addEventListener('maze:bestCodeSynced', (event) => {
      const detail = event?.detail || {};
      if (!world || !level || isBossLevel()) return;
      if (normalizeWorldId(detail.world) !== normalizeWorldId(world.worldId)) return;
      if (normalizeLevelId(detail.level) !== normalizeLevelId(level.levelId)) return;

      const targetBlocks = Number(detail.targetBlocks || 0);
      if (!(targetBlocks > 0)) return;

      level = { ...level, targetBlocks };
      refreshSubtitleText();
      render();
      refreshVisibleTargetBlocksText(targetBlocks);
      toast(`本關最佳程式碼數已同步為 ${targetBlocks}`);
    });

    resetLevel();
    const hasDraft = loadProgramDraft();
    if (!hasDraft) {
      maybeShowWorld4HintSpell();
    }
    // ✅ 草稿／提示積木載入後，再固定起始積木位置。
    BlocklySetup?.ensureStartBlock?.(workspace);
    setTimeout(()=> BlocklySetup?.ensureStartBlock?.(workspace), 120);
    setTimeout(()=> BlocklySetup?.ensureStartBlock?.(workspace), 420);
    // 不再自動載入 levels.js 內嵌的最佳解法，避免學生一進關卡就看到答案。
    // 若開發測試需要，請改用快捷工具手動載入。
    applyMainContrast();
  }

  return { init };
})();
