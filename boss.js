(function(){
  function qs(key){
    const url = new URL(location.href);
    return url.searchParams.get(key) || '';
  }

  function normalizeWorldId(value){
    const raw = String(value || '').trim();
    if (!raw) return 'world1';
    const m = raw.match(/(?:world|w)\s*(\d+)/i);
    if (m) return `world${m[1]}`;
    return raw.toLowerCase();
  }

  const worldId = normalizeWorldId(qs('world') || 'world1');

  const WORLD_CONFIG = {
    world1: {
      worldLabel: '世界1｜魔法學院',
      pageTitle: 'Boss 戰：教授',
      intro: '完全獨立頁模式。若挑戰失敗會回到首頁，請先補齊未達三星關卡的神秘道具再回來挑戰。',
      bossName: '魔法教授',
      bossShortName: '教授',
      winText: '你成功擊敗魔法教授，第一世界正式通關！',
      nextText: '進入第二世界第 1 關',
      nextWorld: 'world2',
      bodyBg: "linear-gradient(rgba(238,242,247,.84),rgba(226,232,240,.90)), url('img/world1_bg_boss_magic_hall.png') center/cover no-repeat fixed",
      arenaBg: "linear-gradient(rgba(248,252,255,.22), rgba(241,247,253,.26)), url('img/world1_bg_boss_magic_hall.png') center 56% / cover no-repeat",
      bossImg: 'img/world1_boss_professor.png',
      stats: { playerMaxHp: 30, bossMaxHp: 28, basicDamage: 4, defendShield: 7, focusGain: 3 },
      cards: {
        potion: { key: 'potion', title: '魔力水晶', desc: '回復 10 點生命，並獲得 1 點蓄力。', img: 'img/world1_item_01_mana_crystal.png', effect(state){ state.playerHp = Math.min(state.playerMaxHp, state.playerHp + 10); state.playerPower += 1; state.fxText = '🔷 魔力充能，恢復 10 點生命並蓄力 +1！'; return '恢復了 10 點生命，並獲得 1 點蓄力。'; } },
        dagger: { key: 'dagger', title: '新生魔杖', desc: '立刻造成 8 點魔法傷害。', img: 'img/world1_item_02_novice_wand.png', effect(state){ return { damage: 8, fxText: '✨ 新生魔杖命中，造成 8 點魔法傷害！', log: '新生魔杖造成 8 點傷害。' }; } },
        shield: { key: 'shield', title: '學院法袍', desc: '獲得 10 點護盾。', img: 'img/world1_item_03_academy_robe.png', effect(state){ state.playerShield += 10; state.fxText = '🧥 學院法袍展開結界，護盾 +10！'; return '提供 10 點護盾。'; } },
        freeze: { key: 'freeze', title: '封印卷軸', desc: '讓教授下一回合無法行動。', img: 'img/world1_item_04_seal_scroll.png', effect(state){ state.bossFreezeTurns = Math.max(state.bossFreezeTurns, 1); state.fxText = '📜 封印卷軸啟動，教授下一回合無法行動！'; return '讓教授下一回合無法行動。'; } }
      },
      phaseNames: ['考核模式', '終極試煉'],
      patterns: {
        1: [
          {type:'attack', label:'粉筆飛射', damage:5, icon:'✏️', hint:'單次普通傷害。'},
          {type:'attack', label:'魔法彈', damage:6, icon:'🔮', hint:'穩定輸出，先補血也可以。'},
          {type:'skill', label:'考卷風暴', damage:8, icon:'📚', hint:'第一階段重擊，最好先防禦。'},
        ],
        2: [
          {type:'attack', label:'雷電批改', damage:7, icon:'⚡', hint:'傷害偏高，建議先上盾。'},
          {type:'multi', label:'雙重咒文', hits:[4,5], icon:'🪄', hint:'連續兩段攻擊，護盾特別好用。'},
          {type:'skill', label:'禁書解放', damage:10, icon:'📘', hint:'第二階段大招，別硬吃。'},
        ]
      }
    },
    world2: {
      worldLabel: '世界2｜符文森林',
      pageTitle: 'Boss 戰：狼王',
      intro: '完全獨立頁模式。若挑戰失敗會回到首頁，請先補齊未達三星關卡的神秘道具再回來挑戰。',
      bossName: '森林狼王',
      bossShortName: '狼王',
      winText: '你成功擊敗森林狼王，第二世界正式通關！',
      nextText: '進入第三世界第 1 關',
      nextWorld: 'world3',
      bodyBg: "linear-gradient(rgba(223,232,220,.84),rgba(213,223,211,.90)), url('img/world2_bg_boss_forest_arena.png') center/cover no-repeat fixed",
      arenaBg: "linear-gradient(rgba(248,252,246,.20), rgba(241,248,239,.26)), url('img/world2_bg_boss_forest_arena.png') center 56% / cover no-repeat",
      bossImg: 'img/world2_boss_wolf_king.png',
      stats: { playerMaxHp: 30, bossMaxHp: 26, basicDamage: 3, defendShield: 8, focusGain: 3 },
      cards: {
        potion: { key: 'potion', title: '補血小藥水', desc: '立刻補滿生命值。', img: 'img/world2_item_01_healing_potion.png', effect(state){ state.playerHp = state.playerMaxHp; state.fxText = '💚 生命值完全恢復！'; return '讓生命值完全恢復。'; } },
        dagger: { key: 'dagger', title: '小刀攻擊', desc: '快速出手，造成 9 點傷害。', img: 'img/world2_item_02_dagger_attack.png', effect(state){ return { damage: 9, fxText: '🗡️ 小刀攻擊命中，造成 9 點傷害！', log: '小刀攻擊造成 9 點傷害。' }; } },
        shield: { key: 'shield', title: '木盾防禦', desc: '本回合獲得 12 點護盾。', img: 'img/world2_item_03_wooden_shield.png', effect(state){ state.playerShield += 12; state.fxText = '🪵 木盾展開，護盾 +12！'; return '提供 12 點護盾。'; } },
        freeze: { key: 'freeze', title: '冰凍藤蔓', desc: '讓 Boss 連續 2 回合無法行動。', img: 'img/world2_item_04_frozen_vine.png', effect(state){ state.bossFreezeTurns = Math.max(state.bossFreezeTurns, 2); state.fxText = '❄️ 狼王將被凍住接下來 2 回合！'; return '讓狼王連續 2 回合無法行動。'; } }
      },
      phaseNames: ['森林試探', '狂暴模式'],
      patterns: {
        1: [
          {type:'attack', label:'利爪攻擊', damage:5, icon:'🩸', hint:'普通攻擊。'},
          {type:'attack', label:'利爪攻擊', damage:5, icon:'🩸', hint:'普通攻擊。'},
          {type:'skill', label:'撲擊咆哮', damage:7, icon:'🐺', hint:'比普通攻擊更痛，建議先防禦。'},
        ],
        2: [
          {type:'attack', label:'飛撲猛擊', damage:6, icon:'⚡', hint:'較高傷害，適合先補血或防禦。'},
          {type:'multi', label:'雙爪連擊', hits:[4,4], icon:'🌀', hint:'連續兩次傷害，護盾很有用。'},
          {type:'skill', label:'狼王怒嚎', damage:9, icon:'🔥', hint:'第二階段大招，沒準備會很痛。'},
        ]
      }
    },
    world3: {
      worldLabel: '世界3｜時光圖書館',
      pageTitle: 'Boss 戰：館長',
      intro: '完全獨立頁模式。若挑戰失敗會回到首頁，請先補齊未達三星關卡的神秘道具再回來挑戰。',
      bossName: '時光館長',
      bossShortName: '館長',
      winText: '你成功擊敗時光館長，第三世界正式通關！',
      nextText: '進入第四世界第 1 關',
      nextWorld: 'world4',
      bodyBg: "linear-gradient(rgba(246,237,206,.84),rgba(234,222,184,.90)), url('img/world3_bg_boss_time_library_hall.png') center/cover no-repeat fixed",
      arenaBg: "linear-gradient(rgba(255,250,234,.20), rgba(250,243,219,.26)), url('img/world3_bg_boss_time_library_hall.png') center 56% / cover no-repeat",
      bossImg: 'img/world3_boss_librarian.png',
      stats: { playerMaxHp: 32, bossMaxHp: 30, basicDamage: 4, defendShield: 7, focusGain: 2 },
      cards: {
        potion: { key: 'potion', title: '時光沙漏', desc: '回復 9 點生命，並讓館長速度減慢。', img: 'img/world3_item_01_time_hourglass.png', effect(state){ state.playerHp = Math.min(state.playerMaxHp, state.playerHp + 9); state.bossFreezeTurns = Math.max(state.bossFreezeTurns, 1); state.fxText = '⏳ 時光沙漏逆轉，恢復 9 點生命並延遲館長行動！'; return '恢復 9 點生命，並讓館長下一回合無法行動。'; } },
        dagger: { key: 'dagger', title: '館藏羽毛筆', desc: '寫下反擊咒文，造成 8 點傷害並獲得 1 點蓄力。', img: 'img/world3_item_02_magic_quill.png', effect(state){ state.playerPower += 1; return { damage: 8, fxText: '🪶 羽毛筆寫下反擊咒文，造成 8 點傷害並蓄力 +1！', log: '館藏羽毛筆造成 8 點傷害，並獲得 1 點蓄力。' }; } },
        shield: { key: 'shield', title: '預言書頁', desc: '預見攻擊，獲得 11 點護盾。', img: 'img/world3_item_03_prophecy_page.png', effect(state){ state.playerShield += 11; state.fxText = '📄 預言書頁發光，護盾 +11！'; return '提供 11 點護盾。'; } },
        freeze: { key: 'freeze', title: '時空鑰匙', desc: '造成 6 點傷害，並凍結館長 1 回合。', img: 'img/world3_item_04_time_key.png', effect(state){ state.bossFreezeTurns = Math.max(state.bossFreezeTurns, 1); return { damage: 6, fxText: '🗝️ 時空鑰匙啟動，造成 6 點傷害並鎖住時間！', log: '時空鑰匙造成 6 點傷害，並讓館長下一回合無法行動。' }; } }
      },
      phaseNames: ['整理書庫', '時空錯位'],
      patterns: {
        1: [
          {type:'attack', label:'飛頁切割', damage:5, icon:'📄', hint:'單次攻擊，先觀察也行。'},
          {type:'skill', label:'倒帶封印', damage:6, icon:'⏪', hint:'傷害不高，但節奏很煩。'},
          {type:'attack', label:'書架撞擊', damage:7, icon:'📚', hint:'直線重擊，建議先上盾。'},
        ],
        2: [
          {type:'multi', label:'時鐘連震', hits:[3,4,3], icon:'🕰️', hint:'三段攻擊，護盾很有價值。'},
          {type:'attack', label:'歷史回聲', damage:8, icon:'📜', hint:'中高傷害，快補血。'},
          {type:'skill', label:'時間崩解', damage:10, icon:'⌛', hint:'第二階段大招，最好不要硬吃。'},
        ]
      }
    },
    world4: {
      worldLabel: '世界4｜機械城堡',
      pageTitle: 'Boss 戰：機械主宰',
      intro: '完全獨立頁模式。這是最終世界 Boss 戰；若挑戰失敗會回到首頁，請重新整理前面世界的道具與節奏再來挑戰。',
      bossName: '機械主宰',
      bossShortName: '主宰',
      winText: '你成功擊敗機械主宰，第四世界正式通關！',
      nextText: '返回首頁',
      nextWorld: null,
      bodyBg: "linear-gradient(rgba(224,234,245,.84),rgba(208,220,235,.90)), url('img/world4_bg_boss_mech_throne.png') center/cover no-repeat fixed",
      arenaBg: "linear-gradient(rgba(244,249,255,.20), rgba(236,244,252,.26)), url('img/world4_bg_boss_mech_throne.png') center 56% / cover no-repeat",
      bossImg: 'img/world4_boss_mech_overlord.png',
      stats: { playerMaxHp: 34, bossMaxHp: 34, basicDamage: 5, defendShield: 8, focusGain: 2 },
      cards: {
        potion: { key: 'potion', title: '齒輪核心', desc: '回復 8 點生命，並讓下次普通攻擊 +2。', img: 'img/world4_item_01_gear_core.png', effect(state){ state.playerHp = Math.min(state.playerMaxHp, state.playerHp + 8); state.playerPower += 2; state.fxText = '⚙️ 齒輪核心啟動，恢復 8 點生命並蓄力 +2！'; return '恢復 8 點生命，並獲得 2 點蓄力。'; } },
        dagger: { key: 'dagger', title: '蒸汽手套', desc: '重擊造成 10 點傷害。', img: 'img/world4_item_02_steam_gauntlet.png', effect(state){ return { damage: 10, fxText: '👊 蒸汽手套重擊，造成 10 點傷害！', log: '蒸汽手套造成 10 點傷害。' }; } },
        shield: { key: 'shield', title: '機械咒語晶片', desc: '展開護罩，獲得 12 點護盾。', img: 'img/world4_item_03_spell_chip.png', effect(state){ state.playerShield += 12; state.fxText = '💠 機械咒語晶片展開護罩，護盾 +12！'; return '提供 12 點護盾。'; } },
        freeze: { key: 'freeze', title: '傳動發條鑰匙', desc: '卡住齒輪，讓主宰下一回合無法行動並造成 5 點傷害。', img: 'img/world4_item_04_clockwork_key.png', effect(state){ state.bossFreezeTurns = Math.max(state.bossFreezeTurns, 1); return { damage: 5, fxText: '🗝️ 發條鑰匙卡住核心，主宰暫時停機！', log: '傳動發條鑰匙造成 5 點傷害，並讓主宰下一回合無法行動。' }; } }
      },
      phaseNames: ['系統掃描', '過載暴走'],
      patterns: {
        1: [
          {type:'attack', label:'鋼臂重砸', damage:6, icon:'🔩', hint:'單次高傷害，護盾很好用。'},
          {type:'multi', label:'飛輪掃射', hits:[3,3,3], icon:'⚙️', hint:'三段攻擊，別小看。'},
          {type:'skill', label:'蒸汽衝擊', damage:8, icon:'💨', hint:'第一階段大招。'},
        ],
        2: [
          {type:'attack', label:'雷射校準', damage:7, icon:'🔵', hint:'穩定高傷害，注意血量。'},
          {type:'multi', label:'齒輪追擊', hits:[4,4], icon:'🛞', hint:'連續兩次重擊。'},
          {type:'skill', label:'核心過載', damage:11, icon:'🤖', hint:'最危險的大招，建議先防禦或封鎖。'},
        ]
      }
    }
  };

  const config = WORLD_CONFIG[worldId] || WORLD_CONFIG.world1;



  async function findWorkingImagePath(rawPath){
    const path = String(rawPath || '').trim();
    if (!path) return '';

    const cleaned = path.replace(/^\.?\/?/, '');
    const candidates = [
      path,
      `./${cleaned}`,
      `../${cleaned}`,
      `../../${cleaned}`,
      `/${cleaned}`,
    ];

    for (const candidate of [...new Set(candidates)]) {
      try {
        const testUrl = new URL(candidate, location.href).toString();
        const loaded = await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(testUrl);
          img.onerror = () => resolve('');
          img.src = testUrl;
        });
        if (loaded) return loaded;
      } catch (_err) {}
    }

    return '';
  }

  function extractBgImagePath(bgValue){
    const text = String(bgValue || '');
    const match = text.match(/url\((['"]?)(.*?)\1\)/i);
    return match ? match[2] : '';
  }

  async function buildSafeBackground(bgValue, fallbackValue){
    const raw = String(bgValue || '').trim();
    if (!raw) return fallbackValue || '';

    const imagePath = extractBgImagePath(raw);
    if (!imagePath) return raw;

    const resolved = await findWorkingImagePath(imagePath);
    if (!resolved) return fallbackValue || raw.replace(/,?\s*url\((['"]?)(.*?)\1\)[^,]*/i, '');

    return raw.replace(imagePath, resolved);
  }

  async function resolveConfigAssets(){
    config._resolvedBodyBg = await buildSafeBackground(
      config.bodyBg,
      'linear-gradient(rgba(238,242,247,.84),rgba(226,232,240,.90))'
    );
    config._resolvedArenaBg = await buildSafeBackground(
      config.arenaBg,
      'linear-gradient(rgba(248,252,255,.22), rgba(241,247,253,.26))'
    );
    config._resolvedBossImg = await findWorkingImagePath(config.bossImg);

    const cardEntries = Object.values(config.cards || {});
    await Promise.all(cardEntries.map(async (card) => {
      card.resolvedImg = await findWorkingImagePath(card.img);
    }));
  }

  function scoreKey(){
    return `${worldId}-boss`;
  }

  function getCardsForBoss(){
    return Object.values(config.cards).map(card => ({ ...card, used:false }));
  }

  function createBossState(){
    return {
      playerMaxHp: config.stats.playerMaxHp,
      playerHp: config.stats.playerMaxHp,
      playerShield: 0,
      playerPower: 0,
      bossMaxHp: config.stats.bossMaxHp,
      bossHp: config.stats.bossMaxHp,
      turn: 1,
      bossFreezeTurns: 0,
      bossPatternIndex: 0,
      phase: 1,
      cards: getCardsForBoss(),
      log: [`戰鬥開始！先觀察${config.bossShortName}的下一招，再決定是否防禦或進攻。`],
      finished: false,
      startedAt: Date.now(),
      fxText: '⚔️ Boss 戰開始！',
      lastBossAction: '尚未行動',
      lastPlayerAction: '尚未行動',
    };
  }

  let bossState = createBossState();

  function getBossPhase(){
    if (!bossState) return 1;
    return bossState.bossHp <= Math.ceil(bossState.bossMaxHp * 0.5) ? 2 : 1;
  }

  function getBossPattern(phase){
    return config.patterns[phase >= 2 ? 2 : 1];
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
    bossState.fxText = `💥 對${config.bossShortName}造成 ${damage} 點傷害！`;
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
    if (sourceLabel) pushBossLog(`<strong>${config.bossShortName}：</strong>${sourceLabel}，你受到 ${damage} 點傷害。`);
    bossState.fxText = damage > 0 ? `😵 你受到 ${damage} 點傷害！` : '🛡️ 你完全擋住了這次攻擊！';
    return damage;
  }

  function bossTakeTurn(){
    if (bossState.finished) return;
    if (bossState.bossFreezeTurns > 0) {
      bossState.bossFreezeTurns -= 1;
      bossState.lastBossAction = '被控制，無法行動';
      bossState.fxText = `❄️ ${config.bossShortName}被控制住，這回合無法行動！`;
      pushBossLog(`<strong>${config.bossShortName}：</strong>被道具效果困住，這回合無法行動！`);
      return;
    }

    const action = bossPatternAction(bossState.bossPatternIndex, getBossPhase());
    bossState.bossPatternIndex += 1;
    bossState.lastBossAction = action.label;

    if (action.type === 'multi') {
      let total = 0;
      for (const hit of action.hits) total += applyDamageToPlayer(hit, `${action.label}（${hit}）`);
      pushBossLog(`<strong>${config.bossShortName}連擊：</strong>${action.label}總共造成 ${total} 點傷害。`);
    } else {
      applyDamageToPlayer(action.damage, action.label);
    }
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

  function goHome(){
    location.href = 'index.html';
  }

  function goToNextWorldFirstLevel(){
    if (!config.nextWorld) {
      goHome();
      return;
    }
    location.href = `game.html?world=${encodeURIComponent(config.nextWorld)}&level=level1`;
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
          <p>${config.winText}<br>${config.nextWorld ? '現在可以前往下一個世界的第一關，或留在這裡重新挑戰一次。' : '你已完成目前所有世界，現在可以回首頁繼續整理內容。'}</p>
          <div class="result-badges">
            <span>回合數：${turnsUsed}</span>
            <span>剩餘生命：${bossState.playerHp}</span>
            <span>Boss 分數：${score}</span>
          </div>
          <div class="result-actions">
            <button type="button" class="next" id="resultNextWorld">${config.nextText}</button>
            <button type="button" class="retry" id="resultRetryWin">重新挑戰</button>
          </div>
        </div>
      `;
    } else {
      resultEl.className = 'result-card bad';
      resultEl.innerHTML = `
        <div class="result-inner">
          <h3>挑戰失敗</h3>
          <p>這次被${config.bossShortName}擊退了。<br>系統將返回首頁，請先挑戰未達三星的關卡取得神秘道具，再回來挑戰。</p>
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
      const total = config.stats.basicDamage + extra;
      applyDamageToBoss(total, `普通攻擊${extra > 0 ? `（含蓄力 +${extra}）` : ''}`);
      bossState.lastPlayerAction = `普通攻擊 ${total}`;
      bossState.playerPower = 0;
    } else if (actionKey === 'defend') {
      bossState.playerShield += config.stats.defendShield;
      bossState.lastPlayerAction = '防禦姿態';
      bossState.fxText = `🛡️ 你架起防禦姿態，護盾 +${config.stats.defendShield}！`;
      pushBossLog(`<strong>玩家：</strong>進入防禦姿態，護盾增加 ${config.stats.defendShield}。`);
    } else if (actionKey === 'focus') {
      bossState.playerPower += config.stats.focusGain;
      bossState.lastPlayerAction = '專注蓄力';
      bossState.fxText = `✨ 你正在蓄力，下次普通攻擊 +${config.stats.focusGain}！`;
      pushBossLog(`<strong>玩家：</strong>專注蓄力，下次普通攻擊 +${config.stats.focusGain} 傷害。`);
    } else if (actionKey === 'skip') {
      bossState.lastPlayerAction = '略過回合';
      bossState.fxText = `👀 你選擇觀察${config.bossShortName}。`;
      pushBossLog(`<strong>玩家：</strong>先觀察${config.bossShortName}的動作。`);
    } else {
      const card = bossState.cards.find(c => c.key === actionKey);
      if (!card || card.used) return;
      card.used = true;
      bossState.lastPlayerAction = `使用卡牌：${card.title}`;
      const result = typeof card.effect === 'function' ? card.effect(bossState) : null;
      if (typeof result === 'string' && result) {
        pushBossLog(`<strong>玩家卡牌：</strong>${card.title}${result}`);
      } else if (result && typeof result === 'object') {
        if (result.damage) applyDamageToBoss(result.damage, card.title);
        if (result.log) pushBossLog(`<strong>玩家卡牌：</strong>${result.log}`);
        if (result.fxText) bossState.fxText = result.fxText;
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
    return bossState.cards.map(card => {
      const cardImg = card.resolvedImg || card.img || '';
      const cardImgHtml = cardImg
        ? `<img src="${cardImg}" alt="${card.title}" onerror="this.style.display='none'; this.parentElement.textContent='🧩';">`
        : '🧩';
      return `
        <div class="boss-card ${card.used ? 'is-used' : ''}">
          <div class="boss-card-art">${cardImgHtml}</div>
          <div class="boss-card-title">${card.title}</div>
          <div class="boss-card-desc">${card.desc}</div>
          <div class="boss-card-tag">${card.used ? '已使用' : '可使用 1 次'}</div>
          <button type="button" data-card="${card.key}" ${card.used || bossState.finished ? 'disabled' : ''}>使用</button>
        </div>
      `;
    }).join('');
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
    document.getElementById('btnRetry').onclick = () => goToRetryBoss();
    document.getElementById('btnExit').onclick = goHome;
    document.getElementById('btnBackGame').onclick = goHome;
    document.querySelectorAll('#bossCards [data-card]').forEach(btn => {
      btn.onclick = () => playerBossAction(btn.dataset.card);
    });
  }

  async function applyTheme(){
    document.title = `${config.pageTitle}｜魔法迷宮`;
    document.documentElement.style.setProperty('--bg','#dfe8dc');

    const title = document.getElementById('pageTitle');
    const intro = document.getElementById('pageIntro');
    const bossName = document.getElementById('bossName');
    const bossImg = document.getElementById('bossImg');
    const arena = document.querySelector('.arena');
    const phase = document.getElementById('bossPhase');
    const turnText = document.getElementById('turnText');

    if (title) title.textContent = config.pageTitle;
    if (intro) intro.textContent = config.intro;
    if (bossName) bossName.textContent = config.bossName;
    if (phase) phase.textContent = config.phaseNames[0];
    if (turnText) turnText.textContent = `第 1 回合｜${config.bossShortName}下一招`;

    const basic = document.getElementById('bossBasicAttack');
    const defend = document.getElementById('bossDefend');
    const focus = document.getElementById('bossFocus');
    if (basic) basic.textContent = `普通攻擊（${config.stats.basicDamage}＋蓄力）`;
    if (defend) defend.textContent = `防禦姿態（+${config.stats.defendShield} 護盾）`;
    if (focus) focus.textContent = `專注蓄力（下次 +${config.stats.focusGain}）`;

    await resolveConfigAssets();

    if (config._resolvedBodyBg) {
      document.body.style.background = config._resolvedBodyBg;
    }

    if (arena && config._resolvedArenaBg) {
      arena.style.background = config._resolvedArenaBg;
    }

    if (bossImg) {
      if (config._resolvedBossImg) {
        bossImg.src = config._resolvedBossImg;
        bossImg.alt = config.bossName;
        bossImg.style.display = 'block';
      } else {
        bossImg.removeAttribute('src');
        bossImg.alt = `${config.bossName}（圖片未找到）`;
        bossImg.style.display = 'none';
        console.warn('Boss 圖片找不到：', config.bossImg);
      }
    }
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
    document.getElementById('bossPhase').textContent = bossState.phase === 1 ? config.phaseNames[0] : config.phaseNames[1];
    document.getElementById('bossFreeze').textContent = bossState.bossFreezeTurns;
    document.getElementById('turnText').textContent = `第 ${bossState.turn} 回合｜${config.bossShortName}下一招`;
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

  document.addEventListener('DOMContentLoaded', async () => {
    await applyTheme();
    render();
  });
})();
