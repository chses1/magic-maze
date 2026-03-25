(function(){
  const ASSETS = {
    boss: 'img/boss1.png',
    cards: {
      potion: 'img/item1.png',
      dagger: 'img/item2.png',
      shield: 'img/item3.png',
      freeze: 'img/item4.png',
    }
  };

  const CARD_DATA = {
    potion: { key: 'potion', title: '補血小藥水', desc: '立刻補滿生命值。', img: ASSETS.cards.potion },
    dagger: { key: 'dagger', title: '小刀攻擊', desc: '快速出手，造成 9 點傷害。', img: ASSETS.cards.dagger },
    shield: { key: 'shield', title: '木盾防禦', desc: '本回合獲得 12 點護盾。', img: ASSETS.cards.shield },
    freeze: { key: 'freeze', title: '冰凍藤蔓', desc: '讓 Boss 連續 2 回合無法行動。', img: ASSETS.cards.freeze },
  };

  function qs(key){
    const url = new URL(location.href);
    return url.searchParams.get(key) || '';
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
      bossMaxHp: 26,
      bossHp: 26,
      turn: 1,
      bossFreezeTurns: 0,
      bossPatternIndex: 0,
      phase: 1,
      cards: getCardsForBoss(),
      log: ['戰鬥開始！先觀察狼王的下一招，再決定是否防禦或進攻。'],
      finished: false,
      startedAt: Date.now(),
      fxText: '⚔️ Boss 戰開始！',
      lastBossAction: '尚未行動',
      lastPlayerAction: '尚未行動',
    };
  }

  let bossState = createBossState();
  const worldId = qs('world') || 'world1';

  function getBossPhase(){
    if (!bossState) return 1;
    return bossState.bossHp <= Math.ceil(bossState.bossMaxHp * 0.5) ? 2 : 1;
  }

  function getBossPattern(phase){
    if (phase >= 2) {
      return [
        {type:'attack', label:'飛撲猛擊', damage:6, icon:'⚡', hint:'較高傷害，適合先補血或防禦。'},
        {type:'multi', label:'雙爪連擊', hits:[4,4], icon:'🌀', hint:'連續兩次傷害，護盾很有用。'},
        {type:'skill', label:'狼王怒嚎', damage:9, icon:'🔥', hint:'第二階段大招，沒準備會很痛。'},
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
    if (!bossState) return { icon:'❔', label:'未知', hint:'準備載入中…' };
    return bossPatternAction(bossState.bossPatternIndex, getBossPhase());
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
    if (sourceLabel) pushBossLog(`<strong>狼王：</strong>${sourceLabel}，你受到 ${damage} 點傷害。`);
    bossState.fxText = damage > 0 ? `😵 你受到 ${damage} 點傷害！` : '🛡️ 你完全擋住了這次攻擊！';
    return damage;
  }

  function bossTakeTurn(){
    if (bossState.finished) return;
    if (bossState.bossFreezeTurns > 0) {
      bossState.bossFreezeTurns -= 1;
      bossState.lastBossAction = '被冰凍，無法行動';
      bossState.fxText = '❄️ 狼王被冰凍，這回合無法行動！';
      pushBossLog('<strong>狼王：</strong>被冰凍藤蔓纏住，這回合無法行動！');
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

  function scoreKey(){
    return `${worldId}-boss`;
  }

  function saveBossResult(win){
    if (!win) return;
    const turnsUsed = bossState.turn;
    const score = Math.max(100, 1500 - (turnsUsed - 1) * 70 - Math.max(0, bossState.playerMaxHp - bossState.playerHp) * 5);
    const record = { score, stars: 3, steps: turnsUsed, timeMs: Date.now() - bossState.startedAt, bumps: 0, at: Date.now() };

    if (window.StorageAPI) {
      try {
        const session = typeof StorageAPI.getSession === 'function' ? StorageAPI.getSession() : null;
        if (session && typeof StorageAPI.upsertBest === 'function') StorageAPI.upsertBest(session.userId, scoreKey(), record);
        if (session && typeof StorageAPI.updateLeaderboard === 'function') StorageAPI.updateLeaderboard(session, scoreKey(), record);
      } catch (err) {
        console.warn('saveBossResult failed', err);
      }
    }

    try {
      localStorage.setItem('boss_last_result', JSON.stringify(record));
    } catch (err) {
      console.warn(err);
    }
  }

  function getNextWorldId(currentWorldId){
    const raw = String(currentWorldId || '').trim();
    const match = raw.match(/(\d+)/);
    if (!match) return 'world2';
    return `world${Number(match[1]) + 1}`;
  }

  function goHome(){
    location.href = 'index.html';
  }

  function goToNextWorldFirstLevel(){
    const nextWorld = getNextWorldId(worldId);
    location.href = `game.html?world=${encodeURIComponent(nextWorld)}&level=level1`;
  }

  function goToRetryBoss(){
    bossState = createBossState();
    const resultEl = document.getElementById('resultCard');
    resultEl.hidden = true;
    render();
  }

  function finishBossBattle(win){
    bossState.finished = true;
    saveBossResult(win);
    render();

    const resultEl = document.getElementById('resultCard');
    const turnsUsed = bossState.turn;
    const score = Math.max(100, 1500 - (turnsUsed - 1) * 70 - Math.max(0, bossState.playerMaxHp - bossState.playerHp) * 5);

    if (win) {
      resultEl.className = 'result-card good';
      resultEl.innerHTML = `
        <div class="result-inner">
          <h3>Boss 戰勝利！</h3>
          <p>你成功擊敗森林狼王，第一世界正式通關！<br>現在可以前往下一個世界的第一關，或留在這裡重新挑戰一次。</p>
          <div class="result-badges">
            <span>回合數：${turnsUsed}</span>
            <span>剩餘生命：${bossState.playerHp}</span>
            <span>Boss 分數：${score}</span>
          </div>
          <div class="result-actions">
            <button type="button" class="next" id="resultNextWorld">進入下一世界第 1 關</button>
            <button type="button" class="retry" id="resultRetryWin">重新挑戰</button>
          </div>
        </div>
      `;
    } else {
      resultEl.className = 'result-card bad';
      resultEl.innerHTML = `
        <div class="result-inner">
          <h3>挑戰失敗</h3>
          <p>這次被森林狼王擊退了。<br>系統將返回首頁，請先挑戰未達三星的關卡取得神秘道具，再回來挑戰。</p>
          <div class="result-actions single">
            <button type="button" class="back" id="resultBackHome">回首頁</button>
          </div>
        </div>
      `;
    }

    resultEl.hidden = false;

    const nextBtn = document.getElementById('resultNextWorld');
    const retryWinBtn = document.getElementById('resultRetryWin');
    const backHomeBtn = document.getElementById('resultBackHome');

    if (nextBtn) nextBtn.onclick = goToNextWorldFirstLevel;
    if (retryWinBtn) retryWinBtn.onclick = goToRetryBoss;
    if (backHomeBtn) backHomeBtn.onclick = goHome;

    if (!win) {
      setTimeout(() => {
        if (bossState && bossState.finished) goHome();
      }, 1200);
    }
  }

  function playerBossAction(actionKey){
    if (!bossState || bossState.finished) return;

    if (actionKey === 'basic') {
      const extra = bossState.playerPower;
      const total = 3 + extra;
      applyDamageToBoss(total, `普通攻擊${extra > 0 ? `（含蓄力 +${extra}）` : ''}`);
      bossState.lastPlayerAction = `普通攻擊 ${total}`;
      bossState.playerPower = 0;
    } else if (actionKey === 'defend') {
      bossState.playerShield += 8;
      bossState.lastPlayerAction = '防禦姿態';
      bossState.fxText = '🛡️ 你架起防禦姿態，護盾 +8！';
      pushBossLog('<strong>玩家：</strong>進入防禦姿態，護盾增加 8。');
    } else if (actionKey === 'focus') {
      bossState.playerPower += 3;
      bossState.lastPlayerAction = '專注蓄力';
      bossState.fxText = '✨ 你正在蓄力，下次普通攻擊會更痛！';
      pushBossLog('<strong>玩家：</strong>專注蓄力，下次普通攻擊 +3 傷害。');
    } else if (actionKey === 'skip') {
      bossState.lastPlayerAction = '略過回合';
      bossState.fxText = '👀 你選擇觀察狼王。';
      pushBossLog('<strong>玩家：</strong>先觀察狼王的動作。');
    } else {
      const card = bossState.cards.find(c => c.key === actionKey);
      if (!card || card.used) return;
      card.used = true;
      bossState.lastPlayerAction = `使用卡牌：${card.title}`;
      if (card.key === 'potion') {
        bossState.playerHp = bossState.playerMaxHp;
        bossState.fxText = '💚 生命值完全恢復！';
        pushBossLog(`<strong>玩家卡牌：</strong>${card.title}讓生命值完全恢復。`);
      } else if (card.key === 'dagger') {
        applyDamageToBoss(9, card.title);
      } else if (card.key === 'shield') {
        bossState.playerShield += 12;
        bossState.fxText = '🪵 木盾展開，護盾 +12！';
        pushBossLog(`<strong>玩家卡牌：</strong>${card.title}提供 12 點護盾。`);
      } else if (card.key === 'freeze') {
        bossState.bossFreezeTurns = 2;
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
    render();
  }

  function bossCardsHtml(){
    return bossState.cards.map(card => `
      <div class="boss-card ${card.used ? 'is-used' : ''}">
        <div class="boss-card-art">
          <img src="${card.img}" alt="${card.title}">
        </div>
        <div class="boss-card-title">${card.title}</div>
        <div class="boss-card-desc">${card.desc}</div>
        <div class="boss-card-tag">${card.used ? '已使用' : '可使用 1 次'}</div>
        <button type="button" data-card="${card.key}" ${card.used || bossState.finished ? 'disabled' : ''}>使用</button>
      </div>
    `).join('');
  }

  function logPillsHtml(){
    const recentLogs = (bossState.log || []).slice(0, 4);
    return recentLogs.length
      ? recentLogs.map(item => `<span class="boss-log-pill">${item.replace(/<[^>]*>/g, '')}</span>`).join('')
      : '<span class="boss-log-pill">戰鬥開始！</span>';
  }

  function bindButtons(){
    document.getElementById('bossBasicAttack').onclick = () => playerBossAction('basic');
    document.getElementById('bossDefend').onclick = () => playerBossAction('defend');
    document.getElementById('bossFocus').onclick = () => playerBossAction('focus');
    document.getElementById('bossEndTurn').onclick = () => playerBossAction('skip');
    document.getElementById('btnRetry').onclick = () => {
      goToRetryBoss();
    };
    document.getElementById('btnExit').onclick = goHome;
    document.getElementById('btnBackGame').onclick = goHome;
    document.querySelectorAll('#bossCards [data-card]').forEach(btn => {
      btn.onclick = () => playerBossAction(btn.dataset.card);
    });
  }

  function render(){
    syncBossPhase();
    const intent = getBossIntentPreview();
    const playerPct = Math.max(0, bossState.playerHp) / bossState.playerMaxHp * 100;
    const bossPct = Math.max(0, bossState.bossHp) / bossState.bossMaxHp * 100;

    document.getElementById('playerHpText').textContent = `${bossState.playerHp} / ${bossState.playerMaxHp}`;
    document.getElementById('bossHpText').textContent = `${bossState.bossHp} / ${bossState.bossMaxHp}`;
    document.getElementById('playerShield').textContent = bossState.playerShield;
    document.getElementById('playerPower').textContent = bossState.playerPower;
    document.getElementById('bossPhase').textContent = bossState.phase === 1 ? '森林試探' : '狂暴模式';
    document.getElementById('bossFreeze').textContent = bossState.bossFreezeTurns;
    document.getElementById('turnText').textContent = `第 ${bossState.turn} 回合｜狼王下一招`;
    document.getElementById('intentMain').textContent = `${intent.icon} ${intent.label}`;
    document.getElementById('intentSub').textContent = intent.hint;
    document.getElementById('fxText').textContent = bossState.fxText || '準備行動中…';
    document.getElementById('playerHpBar').style.width = `${playerPct}%`;
    document.getElementById('bossHpBar').style.width = `${bossPct}%`;
    document.getElementById('bossCards').innerHTML = bossCardsHtml();
    document.getElementById('battleLog').innerHTML = logPillsHtml();

    bindButtons();

    const disabled = bossState.finished;
    ['bossBasicAttack','bossDefend','bossFocus','bossEndTurn'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = disabled;
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('bossImg').src = ASSETS.boss;
    render();
  });
})();
