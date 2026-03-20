
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
      cardsRule: "每張卡牌之後可在 Boss 戰使用 1 次。",
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
    return `${worldId}-${levelId}`;
  }

  function getLevelCopy(worldId, levelId){
    return LEVEL_COPY[levelKeyRaw(worldId, levelId)] || DEFAULT_COPY;
  }

  function findLevel(worldId, levelId){
    const w = LEVELS.find(x=>x.worldId===worldId);
    if(!w) return null;
    const lv = w.levels.find(x=>x.levelId===levelId);
    if(!lv) return null;
    return {w, lv};
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
        background: linear-gradient(180deg, #eff8ef 0%, #e8f2e8 100%);
      }
      .stage-world-hero {
        position: relative;
        overflow: hidden;
        border-radius: 22px;
        min-height: 160px;
        margin: 12px 0 14px;
        border: 2px solid rgba(166, 219, 174, .95);
        box-shadow: 0 10px 28px rgba(0,0,0,.12);
        background: linear-gradient(180deg, rgba(255,255,255,.96) 0%, rgba(245,255,246,.96) 100%);
        display: grid;
        grid-template-columns: minmax(0,1fr) 180px;
        gap: 10px;
        align-items: center;
        padding: 18px;
      }
      .stage-world-hero h3 { margin: 0 0 8px; font-size: 28px; color: #1b4e27; }
      .stage-world-hero p { margin: 6px 0; line-height: 1.65; color: #22452b; }
      .stage-world-hero-boss { display:flex; align-items:flex-end; justify-content:center; min-height:140px; }
      .stage-world-hero-boss img { max-width: 170px; max-height: 170px; object-fit: contain; filter: drop-shadow(0 8px 16px rgba(0,0,0,.16)); }
      .stage-copy-card, .stage-reward-card {
        background: linear-gradient(180deg, #ffffff 0%, #f3fff4 100%);
        border: 2px solid #cde8cf; border-radius: 18px; padding: 14px 16px; margin: 10px 0;
        box-shadow: 0 6px 18px rgba(0,0,0,.08); color: #173a1f;
      }
      .stage-copy-card h3, .stage-reward-card h3 { margin: 0 0 8px; font-size: 20px; }
      .stage-copy-card p, .stage-reward-card p { margin: 6px 0; line-height: 1.6; }
      .stage-copy-hint { color: #2d6c3d; font-weight: 700; }
      .stage-reward-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 10px; margin-top: 10px; }
      .stage-reward-item {
        background: #eff9f0; border: 1px solid #d4ead6; border-radius: 14px; padding: 10px; font-size: 14px;
        display:flex; gap:10px; align-items:center;
      }
      .stage-reward-item img { width: 56px; height: 56px; object-fit: contain; flex: 0 0 56px; border-radius: 10px; background: rgba(255,255,255,.88); }
      .stage-current-reward {
        display:flex; gap:12px; align-items:center; margin-top:12px; padding:10px 12px; border-radius:14px;
        background: #ecf8ef; border: 1px dashed #9fd0a6;
      }
      .stage-current-reward img { width:64px; height:64px; object-fit:contain; border-radius:12px; background:#fff; }
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
        margin: 14px 0;
        border-radius: 24px;
        overflow: hidden;
        border: 2px solid #bed7c3;
        box-shadow: 0 12px 32px rgba(0,0,0,.14);
        background: linear-gradient(rgba(248,255,248,.82), rgba(241,251,241,.88)), url('${ASSETS.worldBg}') center/cover no-repeat;
      }
      .boss-stage-top {
        padding: 18px;
        background: linear-gradient(180deg, rgba(255,255,255,.92), rgba(255,255,255,.76));
        border-bottom: 1px solid rgba(140,180,145,.35);
      }
      .boss-stage-top h3 { margin: 0 0 6px; font-size: 28px; color: #1b4e27; }
      .boss-stage-top p { margin: 4px 0; line-height: 1.6; color: #23472c; }
      .boss-stage-main {
        display: grid;
        grid-template-columns: minmax(250px, 340px) minmax(0, 1fr);
        gap: 16px;
        padding: 18px;
        align-items: start;
      }
      .boss-art-panel {
        background: rgba(255,255,255,.82);
        border-radius: 20px;
        padding: 16px;
        border: 1px solid rgba(180,210,184,.85);
        text-align: center;
      }
      .boss-art-panel img { width: 100%; max-width: 240px; max-height: 280px; object-fit: contain; filter: drop-shadow(0 12px 20px rgba(0,0,0,.18)); }
      .hp-bar-wrap { margin-top: 10px; }
      .hp-label { display:flex; justify-content:space-between; font-weight:700; margin-bottom:6px; color:#22452b; }
      .hp-bar { height: 16px; border-radius: 999px; background: rgba(40,60,40,.14); overflow: hidden; }
      .hp-fill-player, .hp-fill-boss { height:100%; border-radius:999px; transition: width .25s ease; }
      .hp-fill-player { background: linear-gradient(90deg, #61c06c, #3ea654); }
      .hp-fill-boss { background: linear-gradient(90deg, #ff8d75, #dd4f3b); }
      .boss-panel-grid { display:grid; grid-template-columns: 1fr; gap: 14px; }
      .boss-card-box, .boss-log-box, .boss-action-box, .boss-status-box {
        background: rgba(255,255,255,.88);
        border-radius: 18px;
        border: 1px solid rgba(180,210,184,.86);
        padding: 14px;
      }
      .boss-section-title { font-size: 18px; font-weight: 800; color: #1c4a28; margin-bottom: 10px; }
      .boss-status-row { display:flex; flex-wrap:wrap; gap:10px; }
      .boss-pill { background: #eff9f0; border-radius: 999px; padding: 6px 12px; font-weight: 700; }
      .boss-cards { display:grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 10px; }
      .boss-card {
        display:grid; grid-template-columns: 62px 1fr; gap: 10px; align-items:center;
        background:#f7fff7; border:1px solid #d5ead7; border-radius:16px; padding:10px;
      }
      .boss-card img { width:62px; height:62px; object-fit:contain; border-radius:12px; background:#fff; }
      .boss-card button, .boss-action-buttons button {
        border:none; border-radius:12px; padding:10px 12px; font-weight:800; cursor:pointer;
        background: linear-gradient(180deg, #6dc87b, #4aae5d); color:#fff; box-shadow:0 4px 10px rgba(0,0,0,.12);
      }
      .boss-card button[disabled], .boss-action-buttons button[disabled] { opacity:.45; cursor:not-allowed; }
      .boss-action-buttons { display:flex; flex-wrap:wrap; gap:10px; }
      .boss-action-buttons .danger { background: linear-gradient(180deg, #ef8b6f, #dd5a47); }
      .boss-log {
        min-height: 140px; max-height: 220px; overflow:auto; background:#f8fff8; border-radius:14px; padding:10px 12px;
        border:1px dashed #bfd9c3; line-height:1.65;
      }
      .boss-log-entry { margin: 0 0 6px; }
      .boss-log-entry strong { color:#1e4f2a; }
      .boss-empty-tip { color:#4d6c54; }
      .boss-footer-tip { margin-top:8px; font-size:14px; color:#3d5b45; }
      @media (max-width: 860px) {
        .stage-world-hero { grid-template-columns: 1fr; }
        .stage-world-hero-boss { justify-content:flex-start; }
        .boss-stage-main { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureInfoPanels(){
    ensureStyles();
    document.body.classList.add("world1-skin");
    const titleEl = document.getElementById("title");
    const subtitleEl = document.getElementById("subtitle");
    if (!titleEl || !subtitleEl) return;

    let heroCard = document.getElementById("stageWorldHero");
    if (!heroCard) {
      heroCard = document.createElement("section");
      heroCard.id = "stageWorldHero";
      heroCard.className = "stage-world-hero";
      subtitleEl.insertAdjacentElement("afterend", heroCard);
    }

    let copyCard = document.getElementById("stageCopyCard");
    if (!copyCard) {
      copyCard = document.createElement("section");
      copyCard.id = "stageCopyCard";
      copyCard.className = "stage-copy-card";
      heroCard.insertAdjacentElement("afterend", copyCard);
    }

    let rewardCard = document.getElementById("stageRewardCard");
    if (!rewardCard) {
      rewardCard = document.createElement("section");
      rewardCard.id = "stageRewardCard";
      rewardCard.className = "stage-reward-card";
      copyCard.insertAdjacentElement("afterend", rewardCard);
    }
  }

  function ensureBossStage(){
    let bossEl = document.getElementById("bossStage");
    if (!bossEl) {
      bossEl = document.createElement("section");
      bossEl.id = "bossStage";
      bossEl.className = "boss-stage";
      const rewardCard = document.getElementById("stageRewardCard");
      if (rewardCard) rewardCard.insertAdjacentElement("afterend", bossEl);
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
    const heroCard = document.getElementById("stageWorldHero");
    const copyCard = document.getElementById("stageCopyCard");
    const rewardCard = document.getElementById("stageRewardCard");

    if (heroCard) {
      heroCard.innerHTML = `
        <div>
          <h3>${UI.world1.introTitle}</h3>
          <p>${UI.world1.introBody}</p>
          <p><b>${UI.world1.bossHint}</b></p>
        </div>
        <div class="stage-world-hero-boss">
          <img src="${ASSETS.boss}" alt="${UI.world1.bossTitle}">
        </div>
      `;
    }

    if (copyCard) {
      copyCard.innerHTML = `
        <h3>${copy.title}</h3>
        <p>${copy.intro}</p>
        <p class="stage-copy-hint">${copy.hint}</p>
        <div class="stage-current-reward">
          <img src="${copy.rewardImg}" alt="${copy.reward}">
          <div>
            <b>${isBossLevel() ? '本關目標' : '本關可獲得卡牌'}：${copy.reward}</b><br>
            ${copy.rewardDesc}
          </div>
        </div>
      `;
    }
    if (rewardCard) {
      rewardCard.innerHTML = `
        <h3>${UI.world1.cardsTitle}</h3>
        <p>${UI.world1.cardsRule}</p>
        <div class="stage-reward-list">${worldCardsHtml()}</div>
        <div class="boss-preview">
          <img src="${ASSETS.boss}" alt="${UI.world1.bossTitle}">
          <div>
            <b>${UI.world1.bossTitle}</b><br>
            ${UI.world1.bossBody}
          </div>
        </div>
      `;
    }
  }

  function getCardsForBoss(){
    return [CARD_DATA.potion, CARD_DATA.dagger, CARD_DATA.shield, CARD_DATA.freeze].map(card => ({...card, used:false}));
  }

  function createBossState(){
    return {
      playerMaxHp: 28,
      playerHp: 28,
      playerShield: 0,
      bossMaxHp: 28,
      bossHp: 28,
      turn: 1,
      bossFreezeTurns: 0,
      bossPatternIndex: 0,
      cards: getCardsForBoss(),
      log: ["戰鬥開始！輪到你行動。"],
      finished: false,
      startedAt: Date.now(),
    };
  }

  function bossPatternAction(index){
    return index % 3 === 2 ? {type:'skill', damage:8, label:'狂暴撕咬'} : {type:'attack', damage:5, label:'利爪攻擊'};
  }

  function bossCardsHtml(){
    return bossState.cards.map(card => `
      <div class="boss-card">
        <img src="${card.img}" alt="${card.title}">
        <div>
          <div><b>${card.title}</b></div>
          <div style="font-size:13px; color:#41624a; margin:4px 0 8px;">${card.desc}</div>
          <button type="button" data-card="${card.key}" ${card.used || bossState.finished ? 'disabled' : ''}>${card.used ? '已使用' : '使用卡牌'}</button>
        </div>
      </div>
    `).join('');
  }

  function bossLogHtml(){
    if (!bossState.log.length) return `<div class="boss-empty-tip">戰鬥紀錄會顯示在這裡。</div>`;
    return bossState.log.map(line => `<div class="boss-log-entry">${line}</div>`).join('');
  }

  function updateBossButtons(){
    const useBasic = document.getElementById('bossBasicAttack');
    const endTurn = document.getElementById('bossEndTurn');
    if (useBasic) useBasic.disabled = bossState.finished;
    if (endTurn) endTurn.disabled = bossState.finished;

    document.querySelectorAll('#bossCards [data-card]').forEach(btn => {
      const card = bossState.cards.find(c => c.key === btn.dataset.card);
      if (!card) return;
      btn.disabled = bossState.finished || !!card.used;
    });
  }

  function renderBossStage(){
    const bossEl = ensureBossStage();
    if (!bossEl || !bossState) return;
    const playerPct = Math.max(0, bossState.playerHp) / bossState.playerMaxHp * 100;
    const bossPct = Math.max(0, bossState.bossHp) / bossState.bossMaxHp * 100;

    bossEl.innerHTML = `
      <div class="boss-stage-top">
        <h3>${UI.world1.bossStageTitle}</h3>
        <p>${UI.world1.bossStageIntro}</p>
        <p><b>背景圖已改為只在 Boss 戰區域顯示，避免主畫面文字看不清楚。</b></p>
      </div>
      <div class="boss-stage-main">
        <div class="boss-art-panel">
          <img src="${ASSETS.boss}" alt="${UI.world1.bossTitle}">
          <div class="hp-bar-wrap">
            <div class="hp-label"><span>森林狼王</span><span>${bossState.bossHp} / ${bossState.bossMaxHp}</span></div>
            <div class="hp-bar"><div class="hp-fill-boss" style="width:${bossPct}%"></div></div>
          </div>
          <div class="hp-bar-wrap">
            <div class="hp-label"><span>玩家生命值</span><span>${bossState.playerHp} / ${bossState.playerMaxHp}</span></div>
            <div class="hp-bar"><div class="hp-fill-player" style="width:${playerPct}%"></div></div>
          </div>
        </div>
        <div class="boss-panel-grid">
          <div class="boss-status-box">
            <div class="boss-section-title">戰鬥狀態</div>
            <div class="boss-status-row">
              <span class="boss-pill">第 ${bossState.turn} 回合</span>
              <span class="boss-pill">護盾：${bossState.playerShield}</span>
              <span class="boss-pill">冰凍剩餘：${bossState.bossFreezeTurns}</span>
            </div>
            <div class="boss-footer-tip">狼王攻擊節奏：普通攻擊、普通攻擊、狂暴撕咬，接著循環。</div>
          </div>
          <div class="boss-action-box">
            <div class="boss-section-title">玩家行動</div>
            <div class="boss-action-buttons">
              <button type="button" id="bossBasicAttack">木棒敲擊（4 傷害）</button>
              <button type="button" class="danger" id="bossEndTurn">略過回合</button>
            </div>
            <div class="boss-footer-tip">你每回合可以用一次行動。使用卡牌後也會直接結束你的行動。</div>
          </div>
          <div class="boss-card-box">
            <div class="boss-section-title">可用卡牌</div>
            <div class="boss-cards" id="bossCards">${bossCardsHtml()}</div>
          </div>
          <div class="boss-log-box">
            <div class="boss-section-title">戰鬥紀錄</div>
            <div class="boss-log" id="bossLog">${bossLogHtml()}</div>
          </div>
        </div>
      </div>
    `;

    const basicBtn = document.getElementById('bossBasicAttack');
    const endBtn = document.getElementById('bossEndTurn');
    if (basicBtn) basicBtn.onclick = ()=> playerBossAction('basic');
    if (endBtn) endBtn.onclick = ()=> playerBossAction('skip');
    document.querySelectorAll('#bossCards [data-card]').forEach(btn => {
      btn.onclick = ()=> playerBossAction(btn.dataset.card);
    });
    updateBossButtons();
  }

  function pushBossLog(html){
    bossState.log.unshift(html);
    bossState.log = bossState.log.slice(0, 12);
  }

  function applyDamageToPlayer(rawDamage){
    let damage = rawDamage;
    if (bossState.playerShield > 0) {
      const blocked = Math.min(bossState.playerShield, damage);
      bossState.playerShield -= blocked;
      damage -= blocked;
      if (blocked > 0) pushBossLog(`<strong>防禦：</strong>木盾抵擋了 ${blocked} 點傷害。`);
    }
    bossState.playerHp = Math.max(0, bossState.playerHp - damage);
    return damage;
  }

  function bossTakeTurn(){
    if (bossState.finished) return;
    if (bossState.bossFreezeTurns > 0) {
      bossState.bossFreezeTurns -= 1;
      pushBossLog(`<strong>狼王：</strong>被冰凍藤蔓纏住，這回合無法行動！`);
      return;
    }

    const action = bossPatternAction(bossState.bossPatternIndex);
    bossState.bossPatternIndex += 1;
    const dealt = applyDamageToPlayer(action.damage);
    if (action.type === 'skill') {
      pushBossLog(`<strong>狼王技能：</strong>${action.label}！你受到 ${dealt} 點傷害。`);
    } else {
      pushBossLog(`<strong>狼王攻擊：</strong>${action.label}，你受到 ${dealt} 點傷害。`);
    }
  }

  function finishBossBattle(win){
    bossState.finished = true;
    renderBossStage();
    const turnsUsed = bossState.turn;
    const session = (window.StorageAPI && typeof StorageAPI.getSession === 'function') ? StorageAPI.getSession() : null;
    if (win) {
      const score = Math.max(100, 1200 - (turnsUsed-1)*80 - Math.max(0, bossState.playerMaxHp - bossState.playerHp) * 6);
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
        `你擊敗了森林狼王！<br>通往下一個世界的道路已經開啟。`,
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
        `你被森林狼王擊退了……<br>先回去補強迷宮關卡，再回來挑戰。`
      ));
      toast('森林狼王擊退了你，再試一次！');
    }
  }

  function playerBossAction(actionKey){
    if (!bossState || bossState.finished) return;

    if (actionKey === 'basic') {
      bossState.bossHp = Math.max(0, bossState.bossHp - 4);
      pushBossLog(`<strong>玩家：</strong>木棒敲擊造成 4 點傷害。`);
    } else if (actionKey === 'skip') {
      pushBossLog(`<strong>玩家：</strong>這回合先觀察狼王的動作。`);
    } else {
      const card = bossState.cards.find(c => c.key === actionKey);
      if (!card || card.used) return;
      card.used = true;
      if (card.key === 'potion') {
        bossState.playerHp = Math.min(bossState.playerMaxHp, bossState.playerHp + 6);
        pushBossLog(`<strong>玩家卡牌：</strong>${card.title}恢復了 6 點生命值。`);
      } else if (card.key === 'dagger') {
        bossState.bossHp = Math.max(0, bossState.bossHp - 7);
        pushBossLog(`<strong>玩家卡牌：</strong>${card.title}造成 7 點傷害。`);
      } else if (card.key === 'shield') {
        bossState.playerShield += 5;
        pushBossLog(`<strong>玩家卡牌：</strong>${card.title}提供 5 點護盾。`);
      } else if (card.key === 'freeze') {
        bossState.bossFreezeTurns = 1;
        pushBossLog(`<strong>玩家卡牌：</strong>${card.title}讓狼王下一回合無法行動。`);
      }
    }

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
    renderBossStage();
    showResult(buildResultCard(
      'warn',
      'Boss 戰說明',
      '你每回合可以選擇基本攻擊、使用卡牌，或略過回合。請注意狼王每三回合會使出一次狂暴撕咬。'
    ));
    toast('Boss 戰開始！輪到你行動。');
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

    document.getElementById("title").textContent = `${UI.world1.introTitle}｜${copy.title}`;
    document.getElementById("subtitle").textContent = isBossLevel() ? `卡牌回合戰（擊敗森林狼王）` : `目標步數：${level.targetSteps}（走到出口 🚪）`;

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
  // Blockly 產生的程式常常會呼叫 api.__highlight(blockId)
  // 這裡提供一個安全版本：有就高亮，沒有就當作 no-op
  async function __highlight(blockId){
    try{
      if (workspace && typeof workspace.highlightBlock === "function"){
        workspace.highlightBlock(blockId);
      } else if (window.Blockly && typeof Blockly.getMainWorkspace === "function"){
        Blockly.getMainWorkspace().highlightBlock(blockId);
      }
    }catch(e){
      // 不要讓高亮失敗影響主程式
    }
  }

  async function __unhighlight(){
    try{
      if (workspace && typeof workspace.highlightBlock === "function"){
        workspace.highlightBlock(null);
      } else if (window.Blockly && typeof Blockly.getMainWorkspace === "function"){
        Blockly.getMainWorkspace().highlightBlock(null);
      }
    }catch(e){}
  }

  async function __sleep(ms){
    return new Promise(r=>setTimeout(r, ms || 0));
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
        await __sleep(220);
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

      await __sleep(220);
    },

    async turnLeft(){
      await ensureNotPaused();
      dir = (dir + 3) % 4;
      render();
      await __sleep(120);
    },

    async turnRight(){
      await ensureNotPaused();
      dir = (dir + 1) % 4;
      render();
      await __sleep(120);
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

        showResult(buildResultCard(
          "good",
          "通關成功！",
          `${copy.success}<br>獲得卡牌：<b>${copy.reward}</b>`,
          `<div class="result-stats">
            <span class="result-badge">分數：${score}</span>
            <span class="result-badge">星等：★${stars}</span>
            <span class="result-badge">步數：${steps}</span>
            <span class="result-badge">撞牆：${bumps}</span>
            <span class="result-badge">時間：${Math.round(timeMs/1000)} 秒</span>
          </div>
          <div class="stage-current-reward" style="margin-top:12px;">
            <img src="${copy.rewardImg}" alt="${copy.reward}">
            <div><b>新卡牌解鎖：${copy.reward}</b><br>${copy.rewardDesc}</div>
          </div>
          <div style="margin-top:8px;">${improved ? "🎉 這是你的最佳紀錄，已存檔！" : "已完成本關，紀錄已更新。"}</div>`
        ));
        toast(UI.common.winToast);
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
  }

  return { init };
})();
