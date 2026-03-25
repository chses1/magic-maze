
// game.js
// 第一世界 UI ＋ Boss 戰整合版（單色背景、修正積木執行）
window.GamePage = (()=>{
  const DIRS = [
    {dx:0, dy:-1, emoji:"↑"},
    {dx:1, dy:0, emoji:"→"},
    {dx:0, dy:1, emoji:"↓"},
    {dx:-1, dy:0, emoji:"←"},
  ];

  const ASSETS = {
    worldBg: "img/world1.png",
    boss: "img/boss1.png",
    cards: {
      potion: "img/item1.png",
      dagger: "img/item2.png",
      shield: "img/item3.png",
      freeze: "img/item4.png",
    }
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
      gotCard: "你獲得了一張新卡牌！",
      trap: "小心！你踩到陷阱了！本關步數懲罰 +3",
      needFix: "再調整積木，試著走到出口 🚪",
      winToast: "恭喜通關！你可以回首頁挑戰下一關。",
      codeError: "程式錯誤：請檢查積木或重來一次。",
      exitConfirm: "確定要離開這一關嗎？目前進度將不會保留。",
      noLevel: "找不到關卡資料！"
    },
    world1: {
      introTitle: "第一世界：森林試煉",
      introBody: "你將使用程式積木控制角色穿越迷宮，學會轉向、拿鑰匙、避開陷阱，並在每一關拿到新的戰鬥卡牌。",
      bossHint: "完成所有試煉後，你將挑戰第一位關主──森林狼王！",
      cardsTitle: "本世界可獲得卡牌",
      cardsRule: "下方顯示的是本世界四關會依序獲得的不同卡牌；不是每一關都拿到同一套。每張卡牌在 Boss 戰可使用 1 次。",
      bossTitle: "森林狼王",
      bossBody: "森林的守護者正在深處等待你。完成前面所有試煉後，就能帶著卡牌挑戰牠。",
      bossStageTitle: "Boss 戰：森林狼王",
      bossStageIntro: "你已通過森林中的所有試煉，現在要用前面收集到的卡牌，挑戰第一位關主。",
    }
  };

  const CARD_DATA = {
    potion: { key: "potion", title: "補血小藥水", desc: "恢復 6 點生命值。", img: ASSETS.cards.potion },
    dagger: { key: "dagger", title: "小刀攻擊", desc: "快速出手，造成 7 點傷害。", img: ASSETS.cards.dagger },
    shield: { key: "shield", title: "木盾防禦", desc: "本回合獲得 5 點護盾。", img: ASSETS.cards.shield },
    freeze: { key: "freeze", title: "冰凍藤蔓", desc: "讓 Boss 下一回合無法行動。", img: ASSETS.cards.freeze },
  };

  const LEVEL_COPY = {
    "world1-level1": {
      title: "1-1 初入森林",
      intro: "這是你的第一場試煉。試著使用前進、左轉、右轉積木，幫助角色順利找到出口吧！",
      hint: "提示：先觀察路線，再排列積木，成功率會更高喔！",
      reward: CARD_DATA.potion.title,
      rewardDesc: CARD_DATA.potion.desc,
      rewardImg: CARD_DATA.potion.img,
      success: "你成功走出森林小路了！",
      fail: "這次沒有成功走到出口，再試一次吧！"
    },
    "world1-level2": {
      title: "1-2 鑰匙小徑",
      intro: "前方有一扇上鎖的門。想要通過，必須先拿到鑰匙！試著安排正確順序，找到出口吧！",
      hint: "提示：有些目標不能直接前進，先完成條件再行動！",
      reward: CARD_DATA.dagger.title,
      rewardDesc: CARD_DATA.dagger.desc,
      rewardImg: CARD_DATA.dagger.img,
      success: "你學會先拿鑰匙再開門了！",
      fail: "門還沒打開，想想看是不是漏掉鑰匙了？"
    },
    "world1-level3": {
      title: "1-3 陷阱草原",
      intro: "草原上藏著危險陷阱！除了找到出口，你還要盡量避開危險路線，才能獲得更高評價！",
      hint: "提示：不只是走得到，走得安全、走得漂亮也很重要！",
      reward: CARD_DATA.shield.title,
      rewardDesc: CARD_DATA.shield.desc,
      rewardImg: CARD_DATA.shield.img,
      success: "你成功避開森林陷阱！",
      fail: "這次的路線不太理想，重新規劃看看吧！"
    },
    "world1-level4": {
      title: "1-4 守衛遺跡",
      intro: "最後的迷宮試煉開始了！這一關結合了轉向、鑰匙、門與陷阱，請運用你學會的技巧，找出最好的路線吧！",
      hint: "提示：這是進入 Boss 戰前的最後準備，盡力拿高星吧！",
      reward: CARD_DATA.freeze.title,
      rewardDesc: CARD_DATA.freeze.desc,
      rewardImg: CARD_DATA.freeze.img,
      success: "你通過森林遺跡的最後試煉！森林深處傳來低沉的吼聲……",
      fail: "離成功只差一點點，再試一次，你一定可以！"
    },
    "world1-boss": {
      title: "1-BOSS 森林狼王",
      intro: "你已完成森林中的所有試煉。現在，帶著收集到的卡牌與經驗，迎戰森林狼王！",
      hint: "提示：看準狼王的攻擊節奏，再決定要攻擊、防禦或使用卡牌。",
      reward: "通往第二世界",
      rewardDesc: "擊敗森林狼王後即可開啟下一個世界。",
      rewardImg: ASSETS.boss,
      success: "你擊敗了森林狼王！",
      fail: "森林狼王仍然站在你面前，再準備一下後重來吧！"
    }
  };

  const DEFAULT_COPY = {
    title: "森林試煉",
    intro: "請用程式積木控制角色穿越迷宮，順利抵達出口。",
    hint: "請先觀察路線，再用積木排出正確順序。",
    reward: "神秘獎勵",
    rewardDesc: "完成本關後可解鎖新的冒險內容。",
    rewardImg: ASSETS.cards.potion,
    success: "你成功完成試煉了！",
    fail: "這次還沒成功，再試一次吧！"
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
  let bossState = null;

  const toast = (msg)=> {
    const el = document.getElementById("toast");
    if (el) el.textContent = msg;
  };

  function qs(name){
    const url = new URL(location.href);
    return url.searchParams.get(name);
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

  function getLevelCopy(worldId, levelId){
    return LEVEL_COPY[levelKeyRaw(worldId, levelId)] || DEFAULT_COPY;
  }

  function createFallbackBossLevel(worldId){
    const normalizedWorldId = normalizeWorldId(worldId);
    if (normalizedWorldId !== "W1") return null;
    return {
      levelId: "boss",
      name: "森林狼王 Boss 戰",
      targetSteps: 0,
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
        background: linear-gradient(180deg, #d7e0d2 0%, #c8d2c4 100%);
        color: #15281a;
      }
      body.world1-skin #title {
        color: #1d2f22 !important;
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
        width: min(1600px, calc(100vw - 16px));
        min-height: calc(100vh - 16px);
        margin: 8px auto;
        display: flex;
        flex-direction: column;
      }
      body.world1-skin .header {
        flex: 0 0 auto;
        padding-bottom: 8px;
      }
      body.world1-skin .gameLayout {
        flex: 1 1 auto;
        min-height: 0;
        display: grid;
        grid-template-columns: minmax(520px, 1.02fr) minmax(380px, .98fr);
        gap: 14px;
        align-items: stretch;
      }
      body.world1-skin .gameLayout > .card {
        min-height: 0;
        overflow: hidden;
      }
      body.world1-skin .stage {
        display: grid;
        grid-template-rows: auto minmax(0, 1fr) auto auto;
        gap: 10px;
      }
      body.world1-skin .stageTop {
        flex-wrap: wrap;
        gap: 8px;
      }
      body.world1-skin #subtitle {
        color: #39503b !important;
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
      body.world1-skin #btnReset,
      body.world1-skin #btnExit {
        color: #ffffff !important;
        font-weight: 900 !important;
        text-shadow: none !important;
        opacity: 1 !important;
      }
      body.world1-skin #btnPause,
      body.world1-skin #btnReset {
        color: #1d2f22 !important;
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
        background: #2e4131 !important;
        border: 2px solid #8ab28f !important;
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
        margin: 8px 0 10px;
        padding: 12px 14px;
        border-radius: 18px;
        background: linear-gradient(180deg, #ffffff 0%, #f3fff4 100%);
        border: 2px solid #cde8cf;
        box-shadow: 0 6px 18px rgba(0,0,0,.08);
        color: #173a1f;
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
        background: linear-gradient(rgba(248,255,248,.82), rgba(241,251,241,.90)), url('${ASSETS.worldBg}') center/cover no-repeat;
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
          min-height: auto;
          margin: 6px auto;
        }
        body.world1-skin .gameLayout {
          grid-template-columns: 1fr;
        }
        body.world1-skin #blocklyDiv {
          height: 420px !important;
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

  function applyMainContrast(){
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
    const ids = ['steps','bumps','hasKey','time'];

    if (titleEl) {
      titleEl.style.color = '#1d2f22';
      titleEl.style.fontWeight = '900';
    }
    if (subtitleEl) {
      subtitleEl.style.color = '#3a503d';
      subtitleEl.style.fontWeight = '800';
    }
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.color = '#18301e';
      el.style.fontWeight = '900';
      if (el.parentElement) {
        el.parentElement.style.color = '#18301e';
        el.parentElement.style.fontWeight = '800';
        el.parentElement.style.background = '#eef3eb';
        el.parentElement.style.borderRadius = '999px';
        el.parentElement.style.padding = '6px 12px';
        el.parentElement.style.border = '1px solid #c0cdbd';
      }
    });

    [btnRun, btnPause, btnReset, btnExit].forEach(btn => {
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
      btnPause.style.background = '#edf4ea';
      btnPause.style.color = '#1c2e21';
      btnPause.style.border = '2px solid #adbeaa';
    }
    if (btnReset) {
      btnReset.style.background = '#edf4ea';
      btnReset.style.color = '#1c2e21';
      btnReset.style.border = '2px solid #adbeaa';
    }
    if (btnExit) {
      btnExit.style.background = '#fff5f5';
      btnExit.style.color = '#8b2c2c';
      btnExit.style.border = '2px solid #e4aaaa';
    }
    if (toastEl) {
      toastEl.style.background = '#2e4131';
      toastEl.style.color = '#fff';
      toastEl.style.fontWeight = '800';
      toastEl.style.borderRadius = '18px';
      toastEl.style.padding = '14px 16px';
      toastEl.style.border = '2px solid #8ab28f';
    }
    if (resultEl) {
      resultEl.style.color = '#18231b';
    }

    if (gridEl) {
      const wrap = gridEl.parentElement;
      const panel = wrap && wrap.parentElement ? wrap.parentElement : wrap;
      setPanelTheme(wrap, {background:'#aeb8aa22', border:'1px solid #b8c8b7'});
      setPanelTheme(panel, {background:'#eef3eb', border:'1px solid #c0cdbd'});
      if (wrap) wrap.style.color = '#18301e';
    }

    if (blocklyEl) {
      const wrap = blocklyEl.parentElement;
      const panel = wrap && wrap.parentElement ? wrap.parentElement : wrap;
      setPanelTheme(panel, {background:'#eef3eb', border:'1px solid #c0cdbd'});
      if (panel) panel.style.color = '#18301e';
      if (wrap && wrap.previousElementSibling) {
        wrap.previousElementSibling.style.color = '#18301e';
        wrap.previousElementSibling.style.fontWeight = '900';
        wrap.previousElementSibling.style.textShadow = 'none';
      }
    }
  }

  function ensureInfoPanels(){
    ensureStyles();
    document.body.classList.add("world1-skin");
    applyMainContrast();
    const subtitleEl = document.getElementById("subtitle");
    const badgeEl = document.getElementById("sessionBadge");
    if (badgeEl) badgeEl.style.display = 'none';
    if (!subtitleEl) return;

    let copyCard = document.getElementById("stageCopyCard");
    if (!copyCard) {
      copyCard = document.createElement("section");
      copyCard.id = "stageCopyCard";
      copyCard.className = "stage-copy-card";
      subtitleEl.insertAdjacentElement("afterend", copyCard);
    }
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
    if (btnRun) btnRun.textContent = UI.buttons.run;
    if (btnPause) btnPause.textContent = UI.buttons.pause;
    if (btnReset) btnReset.textContent = UI.buttons.reset;
    if (btnExit) btnExit.textContent = UI.buttons.exit;
  }

  function worldCardsHtml(){
    return [CARD_DATA.potion, CARD_DATA.dagger, CARD_DATA.shield, CARD_DATA.freeze].map(card => `
      <div class="stage-reward-item">
        <img src="${card.img}" alt="${card.title}">
        <div><b>${card.title}</b><br>${card.desc}</div>
      </div>
    `).join("");
  }

  function fillInfoPanels(){
    ensureInfoPanels();
    const copy = getLevelCopy(world.worldId, level.levelId);
    const copyCard = document.getElementById("stageCopyCard");

    if (copyCard) {
      copyCard.innerHTML = `
        <h3>${copy.title}</h3>
        <p>${copy.intro}</p>
        <p class="stage-copy-hint">${copy.hint}</p>
        <div class="stage-stars-reward">⭐ 三星成績通關可獲得神秘道具：<b>${copy.reward}</b></div>
      `;
    }
  }

  
  function getCardsForBoss(){
    return [CARD_DATA.potion, CARD_DATA.dagger, CARD_DATA.shield, CARD_DATA.freeze].map(card => ({...card, used:false}));
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
            <img src="${ASSETS.boss}" alt="${UI.world1.bossTitle}">
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
    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++){
        if(grid[y][x] === "S"){
          px=x; py=y;
        }
      }
    }
  }

  function cellClass(ch){
    if(ch==="#") return "wall";
    if(ch==="S") return "start";
    if(ch==="E") return "exit";
    if(ch==="K") return "key";
    if(ch==="D") return "door";
    if(ch==="T") return "trap";
    if(ch==="I") return "item";
    return "";
  }

  function render(){
    const gridEl = document.getElementById("grid");
    if (!gridEl) return;
    gridEl.style.gridTemplateColumns = `repeat(${W}, 34px)`;
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
          if(ch==="E") div.textContent = "🚪";
          else if(ch==="K") div.textContent = "🗝️";
          else if(ch==="D") div.textContent = "🔒";
          else if(ch==="T") div.textContent = "🕳️";
          else if(ch==="I") div.textContent = "✨";
          else div.textContent = "";
        }

        gridEl.appendChild(div);
      }
    }

    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };
    setText("steps", steps);
    setText("bumps", bumps);
    setText("hasKey", hasKey ? "是" : "否");
    const t = running ? Math.max(0, Date.now()-startAt) : (startAt ? Math.max(0, Date.now()-startAt) : 0);
    setText("time", Math.floor(t/1000));
  }

  function isWall(x,y){
    const ch = grid[y]?.[x];
    return ch === "#" || ch === undefined;
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
    }
    if(ch==="I"){
      grid[py][px] = ".";
      toast(UI.common.gotCard);
    }
    if(ch==="T"){
      toast(UI.common.trap);
    }
  }

  function reachedExit(){
    return grid[py][px] === "E";
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

  async function ensureNotPaused(){
    while(paused && !abortRun){
      await sleep(80);
    }
    if(abortRun) throw new Error("aborted");
  }

  function scoreAndStars(){
    const timeMs = Math.max(0, Date.now()-startAt);
    const base = 1000;
    const score = Math.max(0, base - steps*5 - bumps*30 - Math.floor(timeMs/1000)*2);

    let stars = 1;
    if(steps <= level.targetSteps + 5) stars = 2;
    if(steps <= level.targetSteps + 1 && bumps === 0) stars = 3;

    return {score, stars, timeMs};
  }

  function levelKey(){
    return `${world.worldId}-${level.levelId}`;
  }

  function showResult(text){
    const el = document.getElementById("result");
    if (el) el.innerHTML = text;
  }

  function stopTimers(){
    if(tickTimer) clearInterval(tickTimer);
    tickTimer = null;
  }

  function resetRunState(){
    running = false;
    paused = false;
    abortRun = false;
    stopTimers();
  }

  function buildResultCard(kind, title, body, statsHtml = ""){
    const cls = kind === "good" ? "result-card result-good" : kind === "warn" ? "result-card result-warn" : "result-card result-bad";
    return `<div class="${cls}"><h3>${title}</h3><div>${body}</div>${statsHtml}</div>`;
  }

  function resetLevel(){
    const pack = findLevel(qs("world"), qs("level"));
    world = pack.w;
    level = pack.lv;
    const copy = getLevelCopy(world.worldId, level.levelId);

    document.getElementById("title").textContent = `${copy.title}`;
    document.getElementById("subtitle").textContent = isBossLevel() ? `卡牌回合戰（擊敗森林狼王）` : `目標步數：${level.targetSteps}｜三星可獲得：${copy.reward}`;

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
    resetRunState();
    showResult(buildResultCard(
      "warn",
      "關卡開始",
      `${copy.intro}<br><br><b>提示：</b>${copy.hint}`
    ));
    toast(UI.common.startTip);
    render();
  }

  function startClock(){
    startAt = Date.now();
    tickTimer = setInterval(()=>render(), 300);
  }

  function makeAPI(){
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
        await ensureNotPaused();
        if(abortRun) throw new Error("aborted");

        const d = DIRS[dir];
        const nx = px + d.dx;
        const ny = py + d.dy;

        steps++;

        if(!canMoveTo(nx, ny)){
          bumps++;
          toast(doorBlockedAhead(nx,ny) ? UI.common.doorLocked : UI.common.wall);
          render();
          await sleep(220);
          return;
        }

        if(grid[ny][nx] === "D" && hasKey){
          grid[ny][nx] = ".";
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
        await ensureNotPaused();
        dir = (dir + 3) % 4;
        render();
        await sleep(120);
      },

      async turnRight(){
        await ensureNotPaused();
        dir = (dir + 1) % 4;
        render();
        await sleep(120);
      }
    };
  }

  async function runProgram(){
    if (isBossLevel()) return;
    if(running) return;

    running = true;
    paused = false;
    abortRun = false;
    showResult("");
    toast(UI.common.running);
    startClock();

    const api = makeAPI();
    const code = BlocklySetup.workspaceToAsyncCode(workspace);

    try{
      const wrapped = `return (async () => {\n${code}\n})();`;
      const fn = new Function("api", wrapped);
      await fn(api);

      resetRunState();
      const {score, stars} = scoreAndStars();
      const copy = getLevelCopy(world.worldId, level.levelId);
      showResult(buildResultCard(
        "bad",
        "這次還沒成功",
        `${copy.fail}<br><br>程式跑完了，但角色還沒走到出口。`,
        `<div class="result-stats">
          <span class="result-badge">分數：${score}</span>
          <span class="result-badge">星等：★${stars}</span>
          <span class="result-badge">未通關不存檔</span>
        </div>`
      ));
      toast(UI.common.needFix);
    }catch(err){
      if(err?.message === "WIN"){
        stopTimers();
        running = false;

        const {score, stars, timeMs} = scoreAndStars();
        const record = { score, stars, steps, timeMs, bumps, at: Date.now() };

        const session = StorageAPI.getSession();
        const improved = StorageAPI.upsertBest(session.userId, levelKey(), record);
        StorageAPI.updateLeaderboard(session, levelKey(), record);
        const copy = getLevelCopy(world.worldId, level.levelId);

        const isFinalTrialOfWorld1 = normalizeWorldId(world.worldId) === "W1" && normalizeLevelId(level.levelId) === "L5";

        showResult(buildResultCard(
          "good",
          "通關成功！",
          `${copy.success}<br>${isFinalTrialOfWorld1 ? '你已完成第一世界所有關卡！請回首頁從第五關後方的 Boss 按鈕再次挑戰森林狼王。' : `獲得三星神秘道具：<b>${copy.reward}</b>`}`,
          `<div class="result-stats">
            <span class="result-badge">分數：${score}</span>
            <span class="result-badge">星等：★${stars}</span>
            <span class="result-badge">步數：${steps}</span>
            <span class="result-badge">撞牆：${bumps}</span>
            <span class="result-badge">時間：${Math.round(timeMs/1000)} 秒</span>
          </div>
          <div class="stage-current-reward" style="margin-top:12px;">
            <img src="${copy.rewardImg}" alt="${copy.reward}">
            <div><b>${isFinalTrialOfWorld1 ? 'Boss 挑戰資格已開啟' : '三星神秘道具'}：${copy.reward}</b><br>${copy.rewardDesc}</div>
          </div>
          ${isFinalTrialOfWorld1 ? `<div style="margin-top:10px;display:flex;gap:10px;flex-wrap:wrap;"><button type="button" onclick="location.href='index.html'" style="border:none;border-radius:14px;padding:10px 16px;font-weight:900;background:linear-gradient(180deg,#6dc87b,#4aae5d);color:#fff;cursor:pointer;">回首頁挑戰 Boss</button></div>` : ''}
          <div style="margin-top:8px;">${improved ? "🎉 這是你的最佳紀錄，已存檔！" : "已完成本關，紀錄已更新。"}</div>`
        ));

        toast(isFinalTrialOfWorld1 ? '第一世界全數完成！請回首頁挑戰 Boss。' : UI.common.winToast);
      }else if(err?.message === "aborted"){
        resetRunState();
        toast(UI.common.stopped);
      }else{
        resetRunState();
        showResult(buildResultCard(
          "warn",
          "程式執行發生錯誤",
          `請檢查積木是否完整。<br><b>${String(err?.message || err)}</b>`
        ));
        toast(UI.common.codeError);
      }
    }
  }

  function bindUI(){
    document.getElementById("btnRun").onclick = ()=> runProgram();

    document.getElementById("btnPause").onclick = ()=>{
      if (isBossLevel()) {
        toast('Boss 戰不需要暫停鍵。');
        return;
      }
      if(!running){
        toast(UI.common.notStarted);
        return;
      }
      paused = !paused;
      toast(paused ? UI.common.paused : UI.common.resumed);
    };

    document.getElementById("btnReset").onclick = ()=>{
      abortRun = true;
      resetLevel();
    };

    document.getElementById("btnExit").onclick = ()=>{
      if(!confirm(UI.common.exitConfirm)) return;
      abortRun = true;
      location.href = "index.html";
    };
  }

  function init(){
    const worldId = qs("world");
    const levelId = qs("level");
    if (/^boss$/i.test(String(levelId || ''))) {
      location.replace(`boss.html?world=${encodeURIComponent(worldId || 'world1')}`);
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
    workspace = BlocklySetup.createWorkspace("blocklyDiv");
    bindUI();
    resetLevel();
    applyMainContrast();
  }

  return { init };
})();
