// game.js
// 第一世界 UI 文案強化版：保留原本迷宮邏輯，直接把文案插進現有畫面
window.GamePage = (()=>{
  const DIRS = [
    {dx:0, dy:-1, emoji:"↑"},
    {dx:1, dy:0, emoji:"→"},
    {dx:0, dy:1, emoji:"↓"},
    {dx:-1, dy:0, emoji:"←"},
  ];

  const UI = {
    buttons: {
      run: "執行程式",
      pause: "暫停 / 繼續",
      reset: "重設關卡",
      exit: "離開關卡",
    },
    status: {
      steps: "步數",
      bumps: "撞牆",
      hasKey: "鑰匙",
      time: "時間",
    },
    common: {
      resultTitle: "試煉結算",
      programTip: "請先觀察路線，再用積木排出正確順序。",
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
    }
  };

  const LEVEL_COPY = {
    "world1-level1": {
      title: "1-1 初入森林",
      intro: "這是你的第一場試煉。試著使用前進、左轉、右轉積木，幫助角色順利找到出口吧！",
      hint: "提示：先觀察路線，再排列積木，成功率會更高喔！",
      reward: "補血小藥水",
      rewardDesc: "恢復 6 點生命值。",
      success: "你成功走出森林小路了！",
      fail: "這次沒有成功走到出口，再試一次吧！"
    },
    "world1-level2": {
      title: "1-2 鑰匙小徑",
      intro: "前方有一扇上鎖的門。想要通過，必須先拿到鑰匙！試著安排正確順序，找到出口吧！",
      hint: "提示：有些目標不能直接前進，先完成條件再行動！",
      reward: "小刀攻擊",
      rewardDesc: "快速出手，造成 7 點傷害。",
      success: "你學會先拿鑰匙再開門了！",
      fail: "門還沒打開，想想看是不是漏掉鑰匙了？"
    },
    "world1-level3": {
      title: "1-3 陷阱草原",
      intro: "草原上藏著危險陷阱！除了找到出口，你還要盡量避開危險路線，才能獲得更高評價！",
      hint: "提示：不只是走得到，走得安全、走得漂亮也很重要！",
      reward: "木盾防禦",
      rewardDesc: "本回合獲得 5 點護盾。",
      success: "你成功避開森林陷阱！",
      fail: "這次的路線不太理想，重新規劃看看吧！"
    },
    "world1-level4": {
      title: "1-4 守衛遺跡",
      intro: "最後的迷宮試煉開始了！這一關結合了轉向、鑰匙、門與陷阱，請運用你學會的技巧，找出最好的路線吧！",
      hint: "提示：這是進入 Boss 戰前的最後準備，盡力拿高星吧！",
      reward: "冰凍藤蔓",
      rewardDesc: "纏住敵人，讓 Boss 下一回合無法行動。",
      success: "你通過森林遺跡的最後試煉！森林深處傳來低沉的吼聲……",
      fail: "離成功只差一點點，再試一次，你一定可以！"
    }
  };

  const DEFAULT_COPY = {
    title: "森林試煉",
    intro: "請用程式積木控制角色穿越迷宮，順利抵達出口。",
    hint: UI.common.programTip,
    reward: "神秘獎勵",
    rewardDesc: "完成本關後可解鎖新的冒險內容。",
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

  function ensureStyles(){
    if (document.getElementById("world1-ui-style")) return;
    const style = document.createElement("style");
    style.id = "world1-ui-style";
    style.textContent = `
      .stage-copy-card, .stage-reward-card { 
        background: linear-gradient(180deg, #ffffff 0%, #f3fff4 100%);
        border: 2px solid #cde8cf; border-radius: 16px; padding: 14px 16px; margin: 10px 0;
        box-shadow: 0 6px 18px rgba(0,0,0,.08); color: #173a1f;
      }
      .stage-copy-card h3, .stage-reward-card h3 { margin: 0 0 8px; font-size: 20px; }
      .stage-copy-card p, .stage-reward-card p { margin: 6px 0; line-height: 1.6; }
      .stage-copy-hint { color: #2d6c3d; font-weight: 700; }
      .stage-reward-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px; margin-top: 10px; }
      .stage-reward-item { background: #eff9f0; border: 1px solid #d4ead6; border-radius: 12px; padding: 10px; font-size: 14px; }
      .result-card { background: #fff; border: 2px solid #dce7ff; border-radius: 16px; padding: 14px 16px; line-height: 1.7; }
      .result-card h3 { margin: 0 0 8px; font-size: 20px; }
      .result-good { border-color: #bfe3c5; background: #f4fff6; }
      .result-bad { border-color: #ffd3d3; background: #fff6f6; }
      .result-warn { border-color: #ffe3ae; background: #fffaf0; }
      .result-stats { display: flex; flex-wrap: wrap; gap: 12px; margin: 8px 0; }
      .result-badge { background: rgba(0,0,0,.05); border-radius: 999px; padding: 4px 10px; font-weight: 700; }
    `;
    document.head.appendChild(style);
  }

  function ensureInfoPanels(){
    ensureStyles();
    const titleEl = document.getElementById("title");
    const subtitleEl = document.getElementById("subtitle");
    if (!titleEl || !subtitleEl) return;

    let copyCard = document.getElementById("stageCopyCard");
    if (!copyCard) {
      copyCard = document.createElement("section");
      copyCard.id = "stageCopyCard";
      copyCard.className = "stage-copy-card";
      subtitleEl.insertAdjacentElement("afterend", copyCard);
    }

    let rewardCard = document.getElementById("stageRewardCard");
    if (!rewardCard) {
      rewardCard = document.createElement("section");
      rewardCard.id = "stageRewardCard";
      rewardCard.className = "stage-reward-card";
      copyCard.insertAdjacentElement("afterend", rewardCard);
    }
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

  function fillInfoPanels(){
    ensureInfoPanels();
    const copy = getLevelCopy(world.worldId, level.levelId);
    const copyCard = document.getElementById("stageCopyCard");
    const rewardCard = document.getElementById("stageRewardCard");
    if (copyCard) {
      copyCard.innerHTML = `
        <h3>${copy.title}</h3>
        <p><b>${UI.world1.introTitle}</b></p>
        <p>${copy.intro}</p>
        <p class="stage-copy-hint">${copy.hint}</p>
      `;
    }
    if (rewardCard) {
      rewardCard.innerHTML = `
        <h3>${UI.world1.cardsTitle}</h3>
        <p>${UI.world1.cardsRule}</p>
        <div class="stage-reward-list">
          <div class="stage-reward-item"><b>補血小藥水</b><br>恢復 6 點生命值。</div>
          <div class="stage-reward-item"><b>小刀攻擊</b><br>快速出手，造成 7 點傷害。</div>
          <div class="stage-reward-item"><b>木盾防禦</b><br>本回合獲得 5 點護盾。</div>
          <div class="stage-reward-item"><b>冰凍藤蔓</b><br>讓 Boss 下一回合無法行動。</div>
        </div>
      `;
    }
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
    document.getElementById("subtitle").textContent = `目標步數：${level.targetSteps}（走到出口 🚪）`;

    parseMap(level.map);
    dir = level.startDir ?? 1;
    hasKey = false;
    steps = 0;
    bumps = 0;
    startAt = 0;
    resetRunState();
    fillInfoPanels();
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
    return {
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
      const fn = new Function("api", code);
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
