(function(){
  const I18N = window.MagicMazeI18n;
  const BOSS_LANG = I18N?.getLang?.() || 'zh';
  const EN = BOSS_LANG === 'en';
  function tx(zh, en){ return EN ? en : zh; }

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

  const CHARACTER_OUTCOME_IMAGES = {
    boy: { win: 'img/boy-win.png', lose: 'img/boy-lose.png' },
    girl: { win: 'img/girl-win.png', lose: 'img/girl-lose.png' }
  };

  function sleep(ms){
    return new Promise(resolve => window.setTimeout(resolve, ms));
  }

  const WORLD_CONFIG = {
    world1: {
      worldLabel: '世界1｜魔法學院',
      pageTitle: 'Boss 戰：教授',
      intro: '完全獨立頁模式。若挑戰失敗會顯示戰鬥結算，你可以選擇再次挑戰，或先返回關卡畫面整理道具後再回來。',
      bossName: '魔法教授',
      bossShortName: '教授',
      winText: '你成功擊敗魔法教授，第一世界正式通關！',
      nextText: '進入第二世界第 1 關',
      nextWorld: 'world2',
      bodyBg: "url('img/world1_bg_magic_academy.jpeg') center/cover no-repeat fixed",
      arenaBg: "transparent",
      bossImg: 'img/world1_boss_professor.png',
      stats: { playerMaxHp: 24, bossMaxHp: 36, basicDamage: 4, defendShield: 7, focusGain: 3 },
      mechanics: {
        armorByPhase: { 1: 0, 2: 6 },
        basicWarnAt: 3,
        basicCounterAt: 4,
        counterMode: 'retaliate',
        counterLabel: '批改反震',
        counterDamage: 3,
        enrageStartTurn: 6,
        enrageEvery: 2,
        enrageDamagePerStack: 1,
        enrageCritPerStack: 0.02,
        controlImmuneAfter: 99,
        controlDecayStep: 0,
        basicArmorBreakPenalty: 0,
        cardArmorBreakBonus: 1
      },
      cards: {
        potion: { key: 'potion', title: '魔力水晶', desc: '回復 10 點生命，並獲得 1 點蓄力。', img: 'img/world1_item_01_mana_crystal.png', effect(state){ state.playerHp = Math.min(state.playerMaxHp, state.playerHp + 10); state.playerPower += 1; state.fxText = '🔷 魔力充能，恢復 10 點生命並蓄力 +1！'; return '恢復了 10 點生命，並獲得 1 點蓄力。'; } },
        dagger: { key: 'dagger', title: '新生魔杖', desc: '立刻造成 8 點魔法傷害。', img: 'img/world1_item_02_novice_wand.png', effect(state){ return { damage: 8, fxText: '✨ 新生魔杖命中，造成 8 點魔法傷害！', log: '新生魔杖造成 8 點傷害。' }; } },
        shield: { key: 'shield', title: '學院法袍', desc: '獲得 10 點護盾。', img: 'img/world1_item_03_academy_robe.png', effect(state){ const gain = addPlayerShield(10, '學院法袍'); state.fxText = `🧥 學院法袍展開結界，護盾 +${gain}！`; return `提供 ${gain} 點護盾。`; } },
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
      intro: '完全獨立頁模式。若挑戰失敗會顯示戰鬥結算，你可以選擇再次挑戰，或先返回關卡畫面整理道具後再回來。',
      bossName: '森林狼王',
      bossShortName: '狼王',
      winText: '你成功擊敗森林狼王，第二世界正式通關！',
      nextText: '進入第三世界第 1 關',
      nextWorld: 'world3',
      bodyBg: "url('img/world2_bg_runic_forest.jpeg') center/cover no-repeat fixed",
      arenaBg: "transparent",
      bossImg: 'img/world2_boss_wolf_king.png',
      stats: { playerMaxHp: 24, bossMaxHp: 50, basicDamage: 5, defendShield: 8, focusGain: 3 },
      mechanics: {
        armorByPhase: { 1: 8, 2: 12 },
        basicWarnAt: 2,
        basicCounterAt: 3,
        counterMode: 'retaliate',
        counterLabel: '追獵反撲',
        counterDamage: 4,
        enrageStartTurn: 5,
        enrageEvery: 2,
        enrageDamagePerStack: 1,
        enrageCritPerStack: 0.03,
        controlImmuneAfter: 2,
        controlDecayStep: 1,
        basicArmorBreakPenalty: 1,
        cardArmorBreakBonus: 2
      },
      cards: {
        potion: { key: 'potion', title: '補血小藥水', desc: '立刻補滿生命值。', img: 'img/world2_item_01_healing_potion.png', effect(state){ state.playerHp = state.playerMaxHp; state.fxText = '💚 生命值完全恢復！'; return '讓生命值完全恢復。'; } },
        dagger: { key: 'dagger', title: '小刀攻擊', desc: '快速出手，造成 9 點傷害。', img: 'img/world2_item_02_dagger_attack.png', effect(state){ return { damage: 9, fxText: '🗡️ 小刀攻擊命中，造成 9 點傷害！', log: '小刀攻擊造成 9 點傷害。' }; } },
        shield: { key: 'shield', title: '木盾防禦', desc: '本回合獲得 12 點護盾。', img: 'img/world2_item_03_wooden_shield.png', effect(state){ const gain = addPlayerShield(12, '木盾防禦'); state.fxText = `🪵 木盾展開，護盾 +${gain}！`; return `提供 ${gain} 點護盾。`; } },
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
      intro: '完全獨立頁模式。若挑戰失敗會顯示戰鬥結算，你可以選擇再次挑戰，或先返回關卡畫面整理道具後再回來。',
      bossName: '時光館長',
      bossShortName: '館長',
      winText: '你成功擊敗時光館長，第三世界正式通關！',
      nextText: '進入第四世界第 1 關',
      nextWorld: 'world4',
      bodyBg: "url('img/world3_bg_time_library.jpeg') center/cover no-repeat fixed",
      arenaBg: "transparent",
      bossImg: 'img/world3_boss_librarian.png',
      stats: { playerMaxHp: 24, bossMaxHp: 66, basicDamage: 6, defendShield: 9, focusGain: 3 },
      mechanics: {
        armorByPhase: { 1: 10, 2: 14 },
        basicWarnAt: 2,
        basicCounterAt: 3,
        counterMode: 'weaken_next_basic',
        counterLabel: '時間回捲',
        weakenMultiplier: 0.5,
        enrageStartTurn: 5,
        enrageEvery: 2,
        enrageDamagePerStack: 1,
        enrageCritPerStack: 0.03,
        enrageSkillBonusPerStack: 1,
        controlImmuneAfter: 2,
        controlDecayStep: 1,
        basicArmorBreakPenalty: 1,
        cardArmorBreakBonus: 3
      },
      cards: {
        potion: { key: 'potion', title: '時光沙漏', desc: '回復 9 點生命，並讓館長速度減慢。', img: 'img/world3_item_01_time_hourglass.png', effect(state){ state.playerHp = Math.min(state.playerMaxHp, state.playerHp + 9); state.bossFreezeTurns = Math.max(state.bossFreezeTurns, 1); state.fxText = '⏳ 時光沙漏逆轉，恢復 9 點生命並延遲館長行動！'; return '恢復 9 點生命，並讓館長下一回合無法行動。'; } },
        dagger: { key: 'dagger', title: '館藏羽毛筆', desc: '寫下反擊咒文，造成 8 點傷害並獲得 1 點蓄力。', img: 'img/world3_item_02_magic_quill.png', effect(state){ state.playerPower += 1; return { damage: 8, fxText: '🪶 羽毛筆寫下反擊咒文，造成 8 點傷害並蓄力 +1！', log: '館藏羽毛筆造成 8 點傷害，並獲得 1 點蓄力。' }; } },
        shield: { key: 'shield', title: '預言書頁', desc: '預見攻擊，獲得 11 點護盾。', img: 'img/world3_item_03_prophecy_page.png', effect(state){ const gain = addPlayerShield(11, '預言書頁'); state.fxText = `📄 預言書頁發光，護盾 +${gain}！`; return `提供 ${gain} 點護盾。`; } },
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
      intro: '完全獨立頁模式。這是最終世界 Boss 戰；若挑戰失敗會顯示戰鬥結算，你可以選擇再次挑戰，或先返回關卡畫面整理前面世界的道具與節奏再來挑戰。',
      bossName: '機械主宰',
      bossShortName: '主宰',
      winText: '你成功擊敗機械主宰，第四世界正式通關！',
      nextText: '返回首頁',
      nextWorld: null,
      bodyBg: "url('img/world4_bg_mech_castle.jpeg') center/cover no-repeat fixed",
      arenaBg: "transparent",
      bossImg: 'img/world4_boss_mech_overlord.png',
      stats: { playerMaxHp: 24, bossMaxHp: 86, basicDamage: 7, defendShield: 10, focusGain: 3 },
      mechanics: {
        armorByPhase: { 1: 14, 2: 20 },
        basicWarnAt: 2,
        basicCounterAt: 3,
        counterMode: 'boss_dodge',
        counterLabel: '掃描鎖定',
        counterDodgeBonus: 0.2,
        counterArmorGain: 4,
        enrageStartTurn: 4,
        enrageEvery: 2,
        enrageDamagePerStack: 1,
        enrageCritPerStack: 0.04,
        enrageSkillBonusPerStack: 2,
        controlImmuneAfter: 1,
        controlDecayStep: 1,
        basicArmorBreakPenalty: 2,
        cardArmorBreakBonus: 4
      },
      cards: {
        potion: { key: 'potion', title: '齒輪核心', desc: '回復 8 點生命，並讓下次普通攻擊 +2。', img: 'img/world4_item_01_gear_core.png', effect(state){ state.playerHp = Math.min(state.playerMaxHp, state.playerHp + 8); state.playerPower += 2; state.fxText = '⚙️ 齒輪核心啟動，恢復 8 點生命並蓄力 +2！'; return '恢復 8 點生命，並獲得 2 點蓄力。'; } },
        dagger: { key: 'dagger', title: '蒸汽手套', desc: '重擊造成 10 點傷害。', img: 'img/world4_item_02_steam_gauntlet.png', effect(state){ return { damage: 10, fxText: '👊 蒸汽手套重擊，造成 10 點傷害！', log: '蒸汽手套造成 10 點傷害。' }; } },
        shield: { key: 'shield', title: '機械咒語晶片', desc: '展開護罩，獲得 12 點護盾。', img: 'img/world4_item_03_spell_chip.png', effect(state){ const gain = addPlayerShield(12, '機械咒語晶片'); state.fxText = `💠 機械咒語晶片展開護罩，護盾 +${gain}！`; return `提供 ${gain} 點護盾。`; } },
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

  const BOSS_COPY_EN = {
    world1: {
      worldLabel:'World 1 | Magic Academy', pageTitle:'Boss Battle: Professor',
      intro:'Independent Boss Battle mode. If you lose, you can retry or return to the level screen to prepare your items.',
      bossName:'Magic Professor', bossShortName:'Professor',
      winText:'You defeated the Magic Professor and cleared World 1!',
      nextText:'Enter World 2 Level 1',
      phaseNames:['Exam Mode','Final Trial'],
      cards:{
        potion:{title:'Mana Crystal',desc:'Recover 10 HP and gain 1 power.'},
        dagger:{title:'Novice Wand',desc:'Deal 8 magic damage immediately.'},
        shield:{title:'Academy Robe',desc:'Gain 10 shield.'},
        freeze:{title:'Seal Scroll',desc:'Stop the Professor from acting next turn.'}
      },
      patterns:{
        1:[['Chalk Shot','Single normal damage.'],['Magic Bolt','Steady damage. Healing first is also fine.'],['Exam Storm','A heavy phase-one hit. Defend first.']],
        2:[['Lightning Grading','High damage. Shield first if you can.'],['Double Spell','Two hits in a row. Shields are useful.'],['Forbidden Book Release','A big phase-two attack. Do not take it unprepared.']]
      }
    },
    world2: {
      worldLabel:'World 2 | Rune Forest', pageTitle:'Boss Battle: Wolf King',
      intro:'Independent Boss Battle mode. If you lose, you can retry or return to the level screen to prepare your items.',
      bossName:'Forest Wolf King', bossShortName:'Wolf King',
      winText:'You defeated the Forest Wolf King and cleared World 2!',
      nextText:'Enter World 3 Level 1',
      phaseNames:['Forest Probe','Rage Mode'],
      cards:{
        potion:{title:'Healing Potion',desc:'Restore all HP immediately.'},
        dagger:{title:'Dagger Strike',desc:'A quick strike that deals 9 damage.'},
        shield:{title:'Wooden Shield',desc:'Gain 12 shield this turn.'},
        freeze:{title:'Frozen Vine',desc:'Stop the Boss from acting for 2 turns.'}
      },
      patterns:{
        1:[['Claw Attack','Normal attack.'],['Claw Attack','Normal attack.'],['Pouncing Roar','Stronger than a normal attack. Defend first.']],
        2:[['Leaping Smash','High damage. Heal or defend first.'],['Double Claw Combo','Two hits in a row. Shields are useful.'],['Wolf King Howl','A big phase-two attack. It hurts if you are not ready.']]
      }
    },
    world3: {
      worldLabel:'World 3 | Time Library', pageTitle:'Boss Battle: Librarian',
      intro:'Independent Boss Battle mode. If you lose, you can retry or return to the level screen to prepare your items.',
      bossName:'Time Librarian', bossShortName:'Librarian',
      winText:'You defeated the Time Librarian and cleared World 3!',
      nextText:'Enter World 4 Level 1',
      phaseNames:['Sorting Shelves','Time Distortion'],
      cards:{
        potion:{title:'Time Hourglass',desc:'Recover 9 HP and slow the Librarian.'},
        dagger:{title:'Magic Quill',desc:'Write a counterspell, deal 8 damage, and gain 1 power.'},
        shield:{title:'Prophecy Page',desc:'Foresee the attack and gain 11 shield.'},
        freeze:{title:'Time Key',desc:'Deal 6 damage and freeze the Librarian for 1 turn.'}
      },
      patterns:{
        1:[['Flying Pages','A single attack. You can observe first.'],['Rewind Seal','Low damage, but the rhythm is tricky.'],['Bookshelf Crash','A direct heavy hit. Shield first.']],
        2:[['Clock Tremor','Three hits. Shields are valuable.'],['Echo of History','Medium-high damage. Heal soon.'],['Time Collapse','A big phase-two attack. Avoid taking it directly.']]
      }
    },
    world4: {
      worldLabel:'World 4 | Mechanical Castle', pageTitle:'Boss Battle: Mechanical Overlord',
      intro:'Independent final Boss Battle mode. If you lose, you can retry or return to prepare your items and rhythm.',
      bossName:'Mechanical Overlord', bossShortName:'Overlord',
      winText:'You defeated the Mechanical Overlord and cleared World 4!',
      nextText:'Return Home',
      phaseNames:['System Scan','Overload Rampage'],
      cards:{
        potion:{title:'Gear Core',desc:'Recover 8 HP and add +2 to your next basic attack.'},
        dagger:{title:'Steam Gauntlet',desc:'Heavy strike for 10 damage.'},
        shield:{title:'Spell Chip',desc:'Deploy a barrier and gain 12 shield.'},
        freeze:{title:'Clockwork Key',desc:'Jam the gears, stop the Overlord next turn, and deal 5 damage.'}
      },
      patterns:{
        1:[['Steel Arm Smash','Single high damage. Shields help.'],['Flywheel Barrage','Three hits. Do not underestimate it.'],['Steam Impact','A big phase-one attack.']],
        2:[['Laser Calibration','Steady high damage. Watch your HP.'],['Gear Pursuit','Two heavy hits in a row.'],['Core Overload','The most dangerous attack. Defend or lock it down.']]
      }
    }
  };

  function applyEnglishBossConfig(){
    if (!EN) return;
    const copy = BOSS_COPY_EN[worldId];
    if (!copy) return;
    ['worldLabel','pageTitle','intro','bossName','bossShortName','winText','nextText'].forEach(key => {
      if (copy[key]) config[key] = copy[key];
    });
    if (copy.phaseNames) config.phaseNames = copy.phaseNames.slice();
    Object.entries(copy.cards || {}).forEach(([key, cardCopy]) => {
      const card = config.cards?.[key];
      if (!card) return;
      card.zhTitle = card.zhTitle || card.title;
      card.title = cardCopy.title;
      card.desc = cardCopy.desc;
    });
    Object.entries(copy.patterns || {}).forEach(([phase, list]) => {
      const patterns = config.patterns?.[phase];
      if (!Array.isArray(patterns)) return;
      list.forEach((entry, idx) => {
        if (!patterns[idx]) return;
        patterns[idx].label = entry[0];
        patterns[idx].hint = entry[1];
      });
    });
  }

  applyEnglishBossConfig();

  const COMBAT_RULES = {
    basePlayerCrit: 0.18,
    baseBossCrit: 0.14,
    basePlayerDodge: 0.08,
    baseBossDodge: 0.06,
    defendDodgeBonus: 0.22,
    perfectGuardChance: 0.18,
    perfectGuardBonus: 0.5,
    critMultiplier: 1.7,
    shieldCarryRatio: 0.35,
    minShieldCarry: 1,
    maxShieldFromDefendMultiplier: 2.2,
    maxShieldFlatBonus: 4,
    equipmentDefensePointRatio: 0.35,
    equipmentDefenseMaxDamageRatio: 0.55,
    defendShieldDefRatio: 0.6,
    maxShieldDefRatio: 1
  };

  const ACTION_META = {
    basic: { icon:'⚔️', label:tx('攻擊','Attack'), buttonClass:'primary', state:tx('造成基礎傷害','Deal basic damage'), note:()=>tx(`會造成 ${config.stats.basicDamage} 點基礎傷害，再加上目前蓄力值。若連續一直用普通攻擊，Boss 可能會反制。`, `Deals ${config.stats.basicDamage} basic damage plus your current power. If you keep using basic attacks, the Boss may counter.`), confirm:tx('確認攻擊','Confirm Attack') },
    defend: { icon:'🛡️', label:tx('防禦','Defend'), buttonClass:'secondary', state:tx('先撐住這回合','Hold this turn'), note:()=>tx(`本回合獲得 ${config.stats.defendShield} 點護盾，並提高閃避率，適合用來扛 Boss 的大招。`, `Gain ${config.stats.defendShield} shield this turn and increase dodge chance. Good against big Boss attacks.`), confirm:tx('確認防禦','Confirm Defend') },
    focus: { icon:'✨', label:tx('蓄力','Focus'), buttonClass:'utility', state:tx('準備下次爆發','Prepare a stronger next hit'), note:()=>tx(`本回合不攻擊，改為累積 ${config.stats.focusGain} 點蓄力，讓下一次普通攻擊更強。`, `Do not attack this turn. Gain ${config.stats.focusGain} power to strengthen your next basic attack.`), confirm:tx('確認蓄力','Confirm Focus') },
    skip: { icon:'⏭️', label:tx('略過','Skip'), buttonClass:'danger', state:tx('直接結束這回合','End this turn'), note:()=>tx(`不做任何行動，直接輪到 Boss。通常不建議亂用，除非想故意測試 Boss 出招。`, `Take no action and let the Boss act. Usually not recommended unless you are testing the Boss pattern.`), confirm:tx('確認略過','Confirm Skip') }
  };

  const TEACHER_BOSS_SIM_KEY = 'mw_teacher_boss_sim_v1';
  const IMAGE_PROBE_TIMEOUT_MS = 2500;
  const WORLD_EQUIPMENT_OPTIONS = {
    world1: ['頭盔', '劍', '盔甲', '盾牌'],
    world2: ['頭盔', '盾牌', '盔甲', '劍'],
    world3: ['頭盔', '盾牌', '盔甲', '劍'],
    world4: ['頭盔', '盾牌', '盔甲', '劍']
  };
  const EQUIPMENT_EFFECTS = {
    '頭盔': { defBonus: 1 },
    '盔甲': { defBonus: 2 },
    '盾牌': { defBonus: 2 },
    '劍': { atkBonus: 2 }
  };

  let teacherBossSimOverride = null;
  let pendingActionPreview = null;

  function fxNode(id){
    return document.getElementById(id);
  }

  function replayFxClass(el, className, duration = 700){
    if (!el) return;
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
    window.setTimeout(() => el.classList.remove(className), duration);
  }

  function stageShake(duration = 340){
    const arena = document.querySelector('.arena');
    if (!arena) return;
    arena.classList.remove('shake-stage');
    void arena.offsetWidth;
    arena.classList.add('shake-stage');
    window.setTimeout(() => arena.classList.remove('shake-stage'), duration);
  }

  function portraitHit(side = 'boss', duration = 300){
    const selector = side === 'player' ? '.portrait.player-portrait' : '.portrait.boss-portrait';
    const el = document.querySelector(selector);
    if (!el) return;
    const className = side === 'player' ? 'hit-player' : 'hit-boss';
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
    window.setTimeout(() => el.classList.remove(className), duration);
  }

  function getPortraitEl(side = 'boss'){
    return document.querySelector(side === 'player' ? '.portrait.player-portrait' : '.portrait.boss-portrait');
  }

  function clearPortraitStatuses(){
    ['player','boss'].forEach(side => {
      const el = getPortraitEl(side);
      if (!el) return;
      el.classList.remove('status-hit','status-heal','status-seal','status-shield','dodge-player','dodge-boss');
    });
    if (bossState) {
      bossState.playerStatusFx = '';
      bossState.bossStatusFx = '';
    }
  }

  function setPortraitStatus(side = 'boss', status = ''){
    if (!bossState || !status) return;
    if (side === 'player') bossState.playerStatusFx = status;
    else bossState.bossStatusFx = status;
    applyPortraitStatusClasses();
  }

  function applyPortraitStatusClasses(){
    if (!bossState) return;
    [['player', bossState.playerStatusFx], ['boss', bossState.bossStatusFx]].forEach(([side, status]) => {
      const el = getPortraitEl(side);
      if (!el) return;
      el.classList.remove('status-hit','status-heal','status-seal','status-shield');
      if (status === 'hit') el.classList.add('status-hit');
      if (status === 'heal') el.classList.add('status-heal');
      if (status === 'seal') el.classList.add('status-seal');
      if (status === 'shield') el.classList.add('status-shield');
    });
  }

  function portraitDodge(side = 'boss', duration = 420){
    const el = getPortraitEl(side);
    if (!el) return;
    const className = side === 'player' ? 'dodge-player' : 'dodge-boss';
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
    window.setTimeout(() => el.classList.remove(className), duration);
  }

  function spawnFloatText(text, type = 'damage', side = 'boss'){
    const layer = fxNode('floatingTextLayer');
    if (!layer) return;
    const div = document.createElement('div');
    div.className = `battle-float ${type}`;
    const pos = {
      player: { left: '18%', top: '40%' },
      center: { left: '50%', top: '42%' },
      boss: { left: '76%', top: '34%' }
    }[side] || { left: '50%', top: '42%' };
    div.style.left = pos.left;
    div.style.top = pos.top;
    div.style.transform = 'translate(-50%, 0)';
    div.textContent = text;
    layer.appendChild(div);
    window.setTimeout(() => div.remove(), 950);
  }

  function setBattleBanner(mainText = '', subText = ''){
    const main = document.getElementById('fxText');
    const sub = document.getElementById('fxSubText');
    if (main && mainText) main.textContent = mainText;
    if (sub && subText) sub.textContent = subText;
  }

  function showAttackFx(target = 'boss', amount = 0, isCrit = false){
    replayFxClass(fxNode('battleSlash'), 'fx-show-slash', 340);
    replayFxClass(fxNode(target === 'boss' ? 'bossFlash' : 'playerFlash'), 'fx-show-flash', 340);
    portraitHit(target, 300);
    setPortraitStatus(target, 'hit');
    stageShake(280);
    spawnFloatText(`${isCrit ? '暴擊 ' : ''}-${amount}`, 'damage', target);
  }

  function showGuardFx(target = 'player', blocked = 0, perfect = false){
    replayFxClass(fxNode('battleShield'), 'fx-show-shield', 550);
    replayFxClass(fxNode(target === 'boss' ? 'bossFlash' : 'playerFlash'), 'fx-show-flash', 300);
    spawnFloatText(perfect ? `完美格擋 ${blocked}` : `格擋 ${blocked}`, 'guard', target);
  }

  function showHealFx(target = 'player', amount = 0){
    replayFxClass(fxNode(target === 'boss' ? 'bossAura' : 'playerAura'), 'fx-show-aura', 700);
    setPortraitStatus(target, 'heal');
    spawnFloatText(`+${amount}`, 'heal', target);
  }

  function showBuffFx(text = '強化', side = 'player'){
    replayFxClass(fxNode(side === 'boss' ? 'bossAura' : 'playerAura'), 'fx-show-aura', 700);
    spawnFloatText(text, 'buff', side);
  }

  function showFreezeFx(target = 'boss', turns = 1){
    replayFxClass(fxNode('battleVines'), 'fx-show-vines', 1000);
    const portrait = document.querySelector(target === 'boss' ? '.portrait.boss-portrait img' : '.portrait.player-portrait img');
    if (portrait) {
      portrait.classList.add('boss-frozen');
      window.setTimeout(() => portrait.classList.remove('boss-frozen'), 1100);
    }
    setPortraitStatus(target, 'seal');
    spawnFloatText(`冰凍 ${turns} 回合`, 'freeze', target);
  }

  function showWarningFx(text = 'Boss 大招預警！'){
    replayFxClass(fxNode('battleWarning'), 'fx-show-warning', 1500);
    spawnFloatText(text, 'damage', 'center');
  }

  function showDodgeFx(target = 'boss'){
    replayFxClass(fxNode(target === 'boss' ? 'bossFlash' : 'playerFlash'), 'fx-show-flash', 260);
    portraitDodge(target, 420);
    spawnFloatText('閃避', 'guard', target);
  }

  function getBossMechanics(){
    return config.mechanics || {};
  }

  function getBossArmorForPhase(phase){
    const armorMap = getBossMechanics().armorByPhase || {};
    return Math.max(0, Math.round(Number(armorMap[phase] || 0)));
  }

  function getBossEnrageStacks(turnValue){
    const mechanics = getBossMechanics();
    const startTurn = Number(mechanics.enrageStartTurn || 999);
    const every = Math.max(1, Number(mechanics.enrageEvery || 1));
    const turn = Math.max(1, Number(turnValue || 1));
    if (turn < startTurn) return 0;
    return 1 + Math.floor((turn - startTurn) / every);
  }

  function getBossCounterRisk(){
    const mechanics = getBossMechanics();
    const warnAt = Number(mechanics.basicWarnAt || 0);
    const counterAt = Number(mechanics.basicCounterAt || 0);
    const streak = Number(bossState?.consecutiveBasicCount || 0);
    return { warnAt, counterAt, streak };
  }

  function getSessionSafe(){
    try { return StorageAPI?.getSession?.() || null; } catch(_err){ return null; }
  }

  function getPlayerBuild(){
    const session = getSessionSafe();
    if (!session?.userId) return { itemsByWorld:{}, equipmentsByWorld:{}, threeStarLevels:{}, equipmentLevels:{}, hpBonus:0, atkBonus:0, defBonus:0 };
    try{
      const progress = StorageAPI?.getProgress?.() || {};
      const meta = progress?.[session.userId]?.meta || {};
      return {
        itemsByWorld: meta.itemsByWorld || {},
        equipmentsByWorld: meta.equipmentsByWorld || {},
        threeStarLevels: meta.threeStarLevels || {},
        equipmentLevels: meta.equipmentLevels || {},
        hpBonus: Number(meta.hpBonus || 0),
        atkBonus: Number(meta.atkBonus || 0),
        defBonus: Number(meta.defBonus || 0)
      };
    }catch(_err){
      return { itemsByWorld:{}, equipmentsByWorld:{}, threeStarLevels:{}, equipmentLevels:{}, hpBonus:0, atkBonus:0, defBonus:0 };
    }
  }

  function getWorldInventory(worldKey){
    if (teacherBossSimOverride && String(worldKey || '').toUpperCase() === String(teacherBossSimOverride.worldKey || '').toUpperCase()) {
      return {
        items: Array.isArray(teacherBossSimOverride.items) ? teacherBossSimOverride.items.slice() : [],
        equipments: Array.isArray(teacherBossSimOverride.equipments) ? teacherBossSimOverride.equipments.slice() : [],
        hpBonus: Number(teacherBossSimOverride.hpBonus || 0),
        atkBonus: Number(teacherBossSimOverride.atkBonus || 0),
        defBonus: Number(teacherBossSimOverride.defBonus || 0),
        simulatedThreeStars: Number(teacherBossSimOverride.simulatedThreeStars || 0)
      };
    }

    const build = getPlayerBuild();
    return {
      items: build.itemsByWorld?.[String(worldKey).toUpperCase()] || [],
      equipments: build.equipmentsByWorld?.[String(worldKey).toUpperCase()] || [],
      hpBonus: build.hpBonus || 0,
      atkBonus: build.atkBonus || 0,
      defBonus: build.defBonus || 0,
      simulatedThreeStars: null
    };
  }

  function worldKeyToConfigKey(key){
    const raw = String(key || '').trim().toUpperCase();
    const m = raw.match(/^W(\d+)$/);
    return m ? `world${m[1]}` : String(key || 'world1').toLowerCase();
  }



  const WORLD_UNLOCK_GUIDE = {
    world1: {
      title: '🎉 解鎖新指令：迴圈',
      intro: '恭喜你通過第一世界！從現在開始，你可以使用「迴圈」積木，把重複的動作合併起來。',
      exampleTitle: '迴圈怎麼用？',
      bullets: [
        '當你需要一直重複同樣動作時，就可以用「重複幾次」。',
        '例如要連續前進 3 格，不用放 3 個「向前走」，可以改成：重複 3 次 → 向前走。',
        '這樣程式會更短、更整齊，也更像真正的程式設計。'
      ],
      example: '重複 3 次 → 向前走 1 格',
      nextHint: '接下來前往第二世界第 1 關，試著用迴圈讓積木變少。'
    },
    world2: {
      title: '🎉 解鎖新指令：條件式',
      intro: '恭喜你通過第二世界！接下來你可以使用「如果…就…」判斷前方情況。',
      exampleTitle: '條件式怎麼用？',
      bullets: [
        '當路線不一定一樣時，可以先判斷，再決定要不要前進或轉彎。',
        '例如：如果前方有路，就向前走；否則就右轉。',
        '這能讓角色更聰明，不用每次都寫死固定路線。'
      ],
      example: '如果 前方有路 → 向前走；否則 → 右轉',
      nextHint: '接下來前往第三世界第 1 關，開始學會觀察再行動。'
    },
    world3: {
      title: '🎉 解鎖新指令：函式（咒語）',
      intro: '恭喜你通過第三世界！接下來你可以把常用走法整理成「咒語」重複呼叫。',
      exampleTitle: '函式怎麼用？',
      bullets: [
        '當一段走法會重複出現時，可以先定義成一個咒語。',
        '之後只要使用「施放咒語A」或「施放咒語B」，就能再次執行那段動作。',
        '這樣程式更簡潔，也更容易修改。'
      ],
      example: '定義咒語A：向前走 → 向前走 → 右轉\n施放咒語A',
      nextHint: '接下來前往第四世界第 1 關，練習把重複路線整理成函式。'
    },
    world4: {
      title: '🏆 全部世界完成！',
      intro: '你已經完成所有世界，學會了序列、迴圈、條件式與函式。',
      exampleTitle: '你已經會了',
      bullets: [
        '序列：一步一步排出指令。',
        '迴圈：重複相同動作。',
        '條件式：依情況做不同決定。',
        '函式：把常用動作整理成可重用的咒語。'
      ],
      example: '你已完成整套迷宮程式冒險。',
      nextHint: '可以回首頁重新挑戰，或繼續擴充更多關卡。'
    }
  };

  const WORLD_UNLOCK_GUIDE_EN = {
    world1: {
      title: 'New Instruction Unlocked: Loops',
      intro: 'Great job clearing World 1! You can now use loop blocks to combine repeated actions.',
      exampleTitle: 'How do loops work?',
      bullets: [
        'When you need to do the same action again and again, use repeat times.',
        'For example, instead of placing three move forward blocks, use: repeat 3 times -> move forward.',
        'This makes your program shorter, cleaner, and more like real programming.'
      ],
      example: 'repeat 3 times -> move forward 1 step',
      nextHint: 'Go to World 2 Level 1 and try using loops to reduce your block count.'
    },
    world2: {
      title: 'New Instruction Unlocked: Conditionals',
      intro: 'Great job clearing World 2! You can now use if...then...else to check the situation ahead.',
      exampleTitle: 'How do conditionals work?',
      bullets: [
        'When the route can change, check first, then decide whether to move or turn.',
        'Example: if path ahead, move forward; else, turn right.',
        'This makes your character smarter instead of following only one fixed route.'
      ],
      example: 'if path ahead -> move forward; else -> turn right',
      nextHint: 'Go to World 3 Level 1 and start learning to observe before acting.'
    },
    world3: {
      title: 'New Instruction Unlocked: Functions (Spells)',
      intro: 'Great job clearing World 3! You can now organize repeated routes into reusable spells.',
      exampleTitle: 'How do functions work?',
      bullets: [
        'When the same route appears again, define it as a spell first.',
        'Then cast that spell whenever you need to run the same actions again.',
        'This keeps programs shorter and easier to change.'
      ],
      example: 'define spell A: move forward -> move forward -> turn right\ncast spell A',
      nextHint: 'Go to World 4 Level 1 and practice organizing repeated routes into functions.'
    },
    world4: {
      title: 'All Worlds Complete!',
      intro: 'You completed every world and learned sequences, loops, conditionals, and functions.',
      exampleTitle: 'What you know now',
      bullets: [
        'Sequence: place instructions step by step.',
        'Loop: repeat the same actions.',
        'Conditional: make different choices in different situations.',
        'Function: organize common actions into reusable spells.'
      ],
      example: 'You completed the full maze programming adventure.',
      nextHint: 'Return home to replay levels or keep expanding the adventure.'
    }
  };

  function getUnlockGuide(){
    const source = EN ? WORLD_UNLOCK_GUIDE_EN : WORLD_UNLOCK_GUIDE;
    return source[worldId] || source.world1;
  }

  function renderUnlockGuideHtml(){
    const guide = getUnlockGuide();
    const bullets = (guide.bullets || []).map(item => `<li>${item}</li>`).join('');
    return `
      <div style="margin-top:16px;padding:16px 18px;border-radius:22px;background:linear-gradient(180deg,#fff9ec 0%,#f6edd6 100%);border:1px solid #e7d09a;text-align:left;box-shadow:inset 0 1px 0 rgba(255,255,255,.7);">
        <div style="font-size:24px;font-weight:900;color:#6b4a12;line-height:1.25;">${guide.title}</div>
        <div style="margin-top:8px;color:#4f3a18;line-height:1.75;font-weight:700;">${guide.intro}</div>
        <div style="margin-top:12px;font-size:18px;font-weight:900;color:#6b4a12;">${guide.exampleTitle}</div>
        <ul style="margin:8px 0 0 20px;padding:0;color:#4f3a18;line-height:1.8;font-weight:700;">
          ${bullets}
        </ul>
        <div style="margin-top:12px;padding:12px 14px;border-radius:16px;background:#fffdf7;border:1px dashed #d9be7a;color:#5a4216;font-weight:900;white-space:pre-line;">🧩 ${tx('例子', 'Example')}：${guide.example}</div>
        <div style="margin-top:12px;padding:12px 14px;border-radius:16px;background:#eef8ee;border:1px solid #b9d9bc;color:#214728;font-weight:900;">➡️ ${guide.nextHint}</div>
      </div>
    `;
  }


  function isTeacherMode(){
    return getSessionSafe()?.role === 'teacher';
  }

  function getTeacherWorldItemOptions(){
    return Object.values(config.cards || {}).map(card => String(card?.title || '').trim()).filter(Boolean);
  }

  function getTeacherWorldEquipmentOptions(){
    return (WORLD_EQUIPMENT_OPTIONS[worldId] || ['頭盔', '劍', '盔甲', '盾牌']).slice();
  }

  function worldIdToNumber(value){
    const raw = String(value || '').trim();
    const m = raw.match(/(?:world|w)\s*(\d+)/i);
    return m ? Number(m[1] || 0) : 0;
  }

  function normalizeBossWorldKey(value){
    const n = worldIdToNumber(value);
    return n > 0 ? `W${n}` : String(value || '').trim().toUpperCase();
  }

  function getCurrentWorldKey(){
    return normalizeBossWorldKey(worldId);
  }

  function getCurrentWorldNumber(){
    return worldIdToNumber(worldId);
  }

  function getTeacherBossWorldKeys(){
    const current = Math.max(1, getCurrentWorldNumber() || 1);
    return Array.from({ length: current }, (_item, idx) => `W${idx + 1}`);
  }

  function getWorldDisplayShortLabel(worldKey){
    const configKey = worldKeyToConfigKey(worldKey);
    const label = WORLD_CONFIG[configKey]?.worldLabel || worldKey;
    return label.replace('｜', ' ');
  }

  function getWorldNumberFromLevelKey(levelKey){
    return worldIdToNumber(String(levelKey || '').split('-')[0]);
  }

  function countThreeStarsForWorldRange(threeStarLevels, predicate){
    return Object.keys(threeStarLevels || {}).filter(key => {
      if (!threeStarLevels[key]) return false;
      return predicate(getWorldNumberFromLevelKey(key));
    }).length;
  }

  function calculateEquipmentBonuses(equipments){
    const result = { atkBonus: 0, defBonus: 0 };
    (Array.isArray(equipments) ? equipments : []).forEach(name => {
      const effect = EQUIPMENT_EFFECTS[String(name || '').trim()] || {};
      result.atkBonus += Number(effect.atkBonus || 0);
      result.defBonus += Number(effect.defBonus || 0);
    });
    return result;
  }

  function getEquipmentOptionsForWorldKey(worldKey){
    const configKey = worldKeyToConfigKey(worldKey);
    return (WORLD_EQUIPMENT_OPTIONS[configKey] || ['頭盔', '劍', '盔甲', '盾牌']).slice();
  }

  function clampCount(value, max = 4){
    return Math.max(0, Math.min(max, Number(value || 0) || 0));
  }

  function getEquipmentsByCount(worldKey, count){
    const options = getEquipmentOptionsForWorldKey(worldKey);
    return options.slice(0, clampCount(count, options.length));
  }

  function buildWorldProgressFromPayload(payload = {}){
    const keys = getTeacherBossWorldKeys();
    const rawProgress = payload?.worldProgress && typeof payload.worldProgress === 'object' ? payload.worldProgress : null;
    let remainingPreviousStars = clampCount(payload?.previousThreeStars, Math.max(0, (keys.length - 1) * 4));

    return keys.reduce((out, worldKey) => {
      const isCurrent = worldKey === getCurrentWorldKey();
      const raw = rawProgress?.[worldKey] || rawProgress?.[worldKey.toLowerCase()] || {};
      let stars = rawProgress
        ? raw.stars
        : (isCurrent ? payload?.simulatedThreeStars : Math.min(4, remainingPreviousStars));
      if (!rawProgress && !isCurrent) remainingPreviousStars = Math.max(0, remainingPreviousStars - Number(stars || 0));

      const fallbackEquipmentCount = isCurrent && Array.isArray(payload?.equipments) ? payload.equipments.length : 0;
      out[worldKey] = {
        stars: clampCount(stars, 4),
        equipmentCount: clampCount(raw.equipmentCount ?? fallbackEquipmentCount, 4)
      };
      return out;
    }, {});
  }

  function calculateBonusesFromWorldProgress(worldProgress){
    const result = { totalStars: 0, hpBonus: 0, atkBonus: 0, defBonus: 0 };
    getTeacherBossWorldKeys().forEach(worldKey => {
      const entry = worldProgress?.[worldKey] || {};
      const stars = clampCount(entry.stars, 4);
      const equipBonus = calculateEquipmentBonuses(getEquipmentsByCount(worldKey, entry.equipmentCount));
      result.totalStars += stars;
      result.atkBonus += equipBonus.atkBonus;
      result.defBonus += equipBonus.defBonus;
    });
    result.hpBonus = result.totalStars * 4;
    return result;
  }

  function getCurrentWorldEquipmentsFromProgress(worldProgress){
    const entry = worldProgress?.[getCurrentWorldKey()] || {};
    return getEquipmentsByCount(getCurrentWorldKey(), entry.equipmentCount);
  }

  function buildTeacherBossOverride(payload = {}){
    const safeItems = getTeacherWorldItemOptions();
    const items = (Array.isArray(payload?.items) ? payload.items : []).map(v => String(v || '').trim()).filter(v => safeItems.includes(v));
    const worldProgress = buildWorldProgressFromPayload(payload);
    const bonus = calculateBonusesFromWorldProgress(worldProgress);
    const current = worldProgress[getCurrentWorldKey()] || {};
    const previousKeys = getTeacherBossWorldKeys().filter(key => key !== getCurrentWorldKey());

    return {
      worldKey: getCurrentWorldKey(),
      items,
      equipments: getCurrentWorldEquipmentsFromProgress(worldProgress),
      worldProgress,
      simulatedThreeStars: clampCount(current.stars, 4),
      previousThreeStars: previousKeys.reduce((sum, key) => sum + clampCount(worldProgress[key]?.stars, 4), 0),
      currentHpBonus: clampCount(current.stars, 4) * 4,
      previousHpBonus: previousKeys.reduce((sum, key) => sum + clampCount(worldProgress[key]?.stars, 4) * 4, 0),
      hpBonus: bonus.hpBonus,
      atkBonus: bonus.atkBonus,
      defBonus: bonus.defBonus
    };
  }

  function readTeacherBossOverride(){
    if (!isTeacherMode()) return null;
    try {
      const raw = sessionStorage.getItem(TEACHER_BOSS_SIM_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || String(parsed.worldKey || '').toUpperCase() !== getCurrentWorldKey().toUpperCase()) return null;
      return buildTeacherBossOverride(parsed);
    } catch (_err) {
      return null;
    }
  }

  function saveTeacherBossOverride(override){
    if (!isTeacherMode()) return;
    if (!override) {
      try { sessionStorage.removeItem(TEACHER_BOSS_SIM_KEY); } catch (_err) {}
      return;
    }
    try {
      sessionStorage.setItem(TEACHER_BOSS_SIM_KEY, JSON.stringify(override));
    } catch (_err) {}
  }

  function getRealWorldInventoryForTeacherTool(){
    const build = getPlayerBuild();
    const worldKey = getCurrentWorldKey();
    const worldProgress = {};
    const threeStarKeys = Object.keys(build.threeStarLevels || {});
    const totalEstimatedThreeStars = Math.round(Number(build.hpBonus || 0) / 4);

    getTeacherBossWorldKeys().forEach(key => {
      const n = worldIdToNumber(key);
      worldProgress[key] = {
        stars: countThreeStarsForWorldRange(build.threeStarLevels, one => one === n),
        equipmentCount: clampCount((build.equipmentsByWorld?.[key] || []).length, 4)
      };
    });

    if (threeStarKeys.length === 0 && totalEstimatedThreeStars > 0) {
      let remaining = Math.max(0, totalEstimatedThreeStars);
      getTeacherBossWorldKeys().forEach(key => {
        const stars = Math.min(4, remaining);
        worldProgress[key].stars = stars;
        remaining -= stars;
      });
    }

    return {
      items: (build.itemsByWorld?.[worldKey] || []).slice(),
      worldProgress
    };
  }

  function getWorldProgressSummary(worldProgress){
    return getTeacherBossWorldKeys().map(worldKey => {
      const entry = worldProgress?.[worldKey] || {};
      const equipments = getEquipmentsByCount(worldKey, entry.equipmentCount);
      return {
        worldKey,
        label: getWorldDisplayShortLabel(worldKey),
        stars: clampCount(entry.stars, 4),
        equipmentCount: clampCount(entry.equipmentCount, 4),
        equipments
      };
    });
  }

  function teacherBossSummaryHtml(override){
    if (!override) return '目前使用學生實際進度。';
    const items = override.items.length ? override.items.join('、') : '未取得';
    const equips = override.equipments.length ? override.equipments.join('、') : '未取得';
    const rows = getWorldProgressSummary(override.worldProgress)
      .map(row => `${row.worldKey}：三星 ${row.stars}，裝備 ${row.equipmentCount}`)
      .join('｜');
    return `${rows}<br>Boss 實際套用：生命 +${override.hpBonus}｜攻擊 +${override.atkBonus}｜防禦 +${override.defBonus}<br>本世界道具：${items}<br>本世界裝備：${equips}`;
  }

  function syncTeacherBossToolUi(){
    const panel = document.getElementById('teacherBossTool');
    if (!panel) return;
    const override = teacherBossSimOverride;
    const summary = document.getElementById('teacherBossSummary');
    if (summary) summary.innerHTML = teacherBossSummaryHtml(override);
    panel.dataset.active = override ? '1' : '0';
  }

  function applyTeacherBossSimulation(options = {}){
    teacherBossSimOverride = options && typeof options === 'object' ? buildTeacherBossOverride(options) : null;
    saveTeacherBossOverride(teacherBossSimOverride);
    bossState = createBossState();
    if (teacherBossSimOverride) {
      const bonus = calculateBonusesFromWorldProgress(teacherBossSimOverride.worldProgress);
      bossState.log.unshift(`教師模擬已套用：總三星 ${bonus.totalStars} 關，本世界道具 ${teacherBossSimOverride.items.length || 0} 個，本世界裝備 ${teacherBossSimOverride.equipments.length || 0} 件。`);
      bossState.fxText = '🧪 教師模擬狀態已更新';
    } else {
      bossState.log.unshift('已恢復學生實際進度狀態。');
      bossState.fxText = '♻️ 已恢復實際進度';
    }
    render();
    syncTeacherBossToolUi();
  }

  function injectTeacherBossTool(){
    if (!isTeacherMode() || document.getElementById('teacherBossTool')) return;
    const real = getRealWorldInventoryForTeacherTool();
    const defaultOverride = readTeacherBossOverride() || buildTeacherBossOverride({
      items: real.items,
      worldProgress: real.worldProgress
    });
    teacherBossSimOverride = readTeacherBossOverride() || null;

    const itemOptions = getTeacherWorldItemOptions();
    const buildWorldRowsHtml = (worldProgress) => getWorldProgressSummary(worldProgress).map(row => `
      <div class="teacher-boss-world-row" data-world="${row.worldKey}">
        <div class="teacher-boss-world-name">${row.label}</div>
        <label><span>三星</span><input id="teacherBossStars_${row.worldKey}" type="number" min="0" max="4" step="1" value="${row.stars}" aria-label="${row.label}三星數"></label>
        <label><span>裝備</span><input id="teacherBossEquip_${row.worldKey}" type="number" min="0" max="4" step="1" value="${row.equipmentCount}" aria-label="${row.label}裝備數"></label>
        <div class="teacher-boss-world-equip" id="teacherBossEquipText_${row.worldKey}">${row.equipments.length ? row.equipments.join('、') : '尚未取得'}</div>
      </div>
    `).join('');

    const style = document.createElement('style');
    style.textContent = `
      .teacher-boss-tool{position:fixed;left:12px;bottom:12px;z-index:40;width:min(380px,calc(100vw - 24px));padding:12px;border-radius:20px;background:rgba(12,22,46,.78);border:1px solid rgba(255,255,255,.16);backdrop-filter:blur(8px);box-shadow:0 16px 34px rgba(0,0,0,.22);color:#f5f8ff}
      .teacher-boss-tool h3{margin:0;font-size:18px;line-height:1.2;color:#fff4cd}
      .teacher-boss-tool p{margin:4px 0 0;color:rgba(245,248,255,.85);font-size:12px;line-height:1.5}
      .teacher-boss-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
      .teacher-boss-head-actions{display:flex;align-items:center;gap:8px;flex:0 0 auto}
      .teacher-boss-mini-btn{width:40px;height:40px;border:none;border-radius:12px;background:rgba(255,255,255,.12);color:#fff;font-size:20px;font-weight:900;cursor:pointer}
      .teacher-boss-body{margin-top:10px}
      .teacher-boss-tool.is-collapsed{width:auto;min-width:0;padding:10px 12px}
      .teacher-boss-tool.is-collapsed .teacher-boss-body{display:none}
      .teacher-boss-tool.is-collapsed .teacher-boss-head{align-items:center}
      .teacher-boss-tool.is-collapsed h3{font-size:15px;white-space:nowrap}
      .teacher-boss-tool.is-collapsed p{display:none}
      .teacher-boss-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
      .teacher-boss-field{display:flex;flex-direction:column;gap:6px}
      .teacher-boss-field label{margin:0;font-size:12px;color:#d9e7ff}
      .teacher-boss-field input[type="number"]{min-height:38px;border-radius:12px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.94);padding:8px 10px;font-size:15px;font-weight:800;color:#17213a}
      .teacher-boss-worlds{display:grid;gap:8px;margin-top:10px}
      .teacher-boss-world-row{display:grid;grid-template-columns:minmax(86px,1fr) 70px 70px;gap:8px;align-items:end;padding:9px 10px;border-radius:14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10)}
      .teacher-boss-world-name{font-size:12px;font-weight:900;color:#fff4cd;line-height:1.35}
      .teacher-boss-world-row label{display:flex;flex-direction:column;gap:4px;margin:0;font-size:11px;color:#d9e7ff}
      .teacher-boss-world-row input[type="number"]{width:100%;min-height:34px;border-radius:10px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.94);padding:6px 8px;font-size:14px;font-weight:900;color:#17213a}
      .teacher-boss-world-equip{grid-column:1 / -1;font-size:11px;line-height:1.45;color:rgba(245,248,255,.82)}
      .teacher-boss-checks{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:10px;border-radius:14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10)}
      .teacher-boss-check{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:#fff}
      .teacher-boss-check input{width:16px;height:16px;margin:0}
      .teacher-boss-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
      .teacher-boss-actions button{flex:1 1 120px;border:none;border-radius:12px;padding:10px 12px;font-size:13px;font-weight:900;cursor:pointer}
      .teacher-boss-actions .apply{background:linear-gradient(180deg,#77d86d,#47ad51);color:#fff}
      .teacher-boss-actions .reset{background:#edf2ff;color:#243b76}
      .teacher-boss-actions .real{background:#ffe9c4;color:#6a4300}
      .teacher-boss-summary{margin-top:10px;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.10);font-size:12px;line-height:1.6;color:#f8fbff}
      .teacher-boss-tool[data-active="1"]{border-color:rgba(255,226,143,.45)}
      @media (max-width: 720px){.teacher-boss-tool{width:min(340px,calc(100vw - 20px));left:10px;right:10px;bottom:10px}.teacher-boss-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);

    const panel = document.createElement('section');
    panel.id = 'teacherBossTool';
    panel.className = 'teacher-boss-tool';
    panel.innerHTML = `
      <div class="teacher-boss-head">
        <div>
          <h3>🧪 教師 Boss 測試工具</h3>
          <p>每個世界設定三星數與裝備數；本世界道具另外設定。</p>
        </div>
        <div class="teacher-boss-head-actions">
          <button type="button" class="teacher-boss-mini-btn" id="teacherBossToggle" aria-expanded="true" title="最小化或展開">－</button>
        </div>
      </div>
      <div class="teacher-boss-body" id="teacherBossBody">
      <div class="teacher-boss-summary">每個三星關卡 = 生命 +4；裝備數會依各世界裝備順序自動換算攻擊 / 防禦加成。</div>
      <div class="teacher-boss-worlds" id="teacherBossWorldRows">
        ${buildWorldRowsHtml(defaultOverride.worldProgress)}
      </div>
      <div class="teacher-boss-summary" id="teacherBossComputedPreview"></div>
      <div class="teacher-boss-grid">
        <div class="teacher-boss-field">
          <label>${getWorldDisplayShortLabel(getCurrentWorldKey())}已取得道具</label>
          <div class="teacher-boss-checks" id="teacherBossItems"></div>
        </div>
        <div class="teacher-boss-field">
          <label>${getWorldDisplayShortLabel(getCurrentWorldKey())}裝備換算</label>
          <div class="teacher-boss-summary">請在上方本世界那一列填「裝備」數；Boss 會顯示並套用對應裝備。</div>
        </div>
      </div>
      <div class="teacher-boss-actions">
        <button type="button" class="apply" id="teacherBossApply">套用模擬</button>
        <button type="button" class="reset" id="teacherBossReset">清空成最低狀態</button>
        <button type="button" class="real" id="teacherBossUseReal">恢復實際進度</button>
      </div>
      <div class="teacher-boss-summary" id="teacherBossSummary"></div>
      </div>
    `;
    document.body.appendChild(panel);

    const toggleBtn = document.getElementById('teacherBossToggle');
    const setTeacherToolCollapsed = (collapsed) => {
      panel.classList.toggle('is-collapsed', !!collapsed);
      if (toggleBtn) {
        toggleBtn.textContent = collapsed ? '＋' : '－';
        toggleBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        toggleBtn.title = collapsed ? '展開工具' : '最小化工具';
      }
    };
    if (toggleBtn) {
      toggleBtn.onclick = () => {
        setTeacherToolCollapsed(!panel.classList.contains('is-collapsed'));
      };
    }

    const itemWrap = document.getElementById('teacherBossItems');
    itemWrap.innerHTML = itemOptions.map((name, idx) => `<label class="teacher-boss-check"><input type="checkbox" value="${name}" ${defaultOverride.items.includes(name) ? 'checked' : ''}>${idx + 1}. ${name}</label>`).join('');

    const collectWorldProgress = () => {
      const worldProgress = {};
      getTeacherBossWorldKeys().forEach(key => {
        worldProgress[key] = {
          stars: document.getElementById(`teacherBossStars_${key}`)?.value,
          equipmentCount: document.getElementById(`teacherBossEquip_${key}`)?.value
        };
      });
      return buildWorldProgressFromPayload({ worldProgress });
    };

    const updateComputedPreview = () => {
      const worldProgress = collectWorldProgress();
      getWorldProgressSummary(worldProgress).forEach(row => {
        const starInput = document.getElementById(`teacherBossStars_${row.worldKey}`);
        const equipInput = document.getElementById(`teacherBossEquip_${row.worldKey}`);
        if (starInput) starInput.value = String(row.stars);
        if (equipInput) equipInput.value = String(row.equipmentCount);
        const el = document.getElementById(`teacherBossEquipText_${row.worldKey}`);
        if (el) el.textContent = row.equipments.length ? row.equipments.join('、') : '尚未取得';
      });
      const bonus = calculateBonusesFromWorldProgress(worldProgress);
      const preview = document.getElementById('teacherBossComputedPreview');
      if (preview) preview.innerHTML = `目前換算：生命 +${bonus.hpBonus}｜攻擊 +${bonus.atkBonus}｜防禦 +${bonus.defBonus}`;
    };

    const setWorldProgressInputs = (worldProgress) => {
      getTeacherBossWorldKeys().forEach(key => {
        const entry = worldProgress?.[key] || {};
        const stars = document.getElementById(`teacherBossStars_${key}`);
        const equips = document.getElementById(`teacherBossEquip_${key}`);
        if (stars) stars.value = String(clampCount(entry.stars, 4));
        if (equips) equips.value = String(clampCount(entry.equipmentCount, 4));
      });
      updateComputedPreview();
    };

    const collect = () => ({
      worldProgress: collectWorldProgress(),
      items: Array.from(itemWrap.querySelectorAll('input:checked')).map(el => el.value)
    });

    document.querySelectorAll('.teacher-boss-world-row input[type="number"]').forEach(input => {
      input.oninput = updateComputedPreview;
      input.onchange = updateComputedPreview;
    });

    document.getElementById('teacherBossApply').onclick = () => applyTeacherBossSimulation(collect());
    document.getElementById('teacherBossReset').onclick = () => {
      setWorldProgressInputs(buildWorldProgressFromPayload({ worldProgress: {} }));
      itemWrap.querySelectorAll('input').forEach(el => { el.checked = false; });
      applyTeacherBossSimulation({ worldProgress: collectWorldProgress(), items: [] });
    };
    document.getElementById('teacherBossUseReal').onclick = () => {
      teacherBossSimOverride = null;
      saveTeacherBossOverride(null);
      setWorldProgressInputs(real.worldProgress || {});
      itemWrap.querySelectorAll('input').forEach(el => { el.checked = real.items.includes(el.value); });
      bossState = createBossState();
      bossState.log.unshift('已恢復學生實際進度狀態。');
      bossState.fxText = '♻️ 已恢復實際進度';
      render();
      syncTeacherBossToolUi();
    };

    updateComputedPreview();
    syncTeacherBossToolUi();
  }


  async function findWorkingImagePath(rawPath){
    const path = String(rawPath || '').trim();
    if (!path) return '';

    const cleaned = path.replace(/^\.?\/?/, '');
    const parts = cleaned.match(/^(.*?)(\.[a-z0-9]+)?$/i);
    const stem = parts ? parts[1] : cleaned;
    const ext = parts && parts[2] ? parts[2] : '';
    const extCandidates = ext ? [ext, '.png', '.jpg', '.jpeg', '.webp'].filter((v, i, arr) => arr.indexOf(v) === i) : ['.png', '.jpg', '.jpeg', '.webp'];

    const pathCandidates = new Set([path, cleaned, `./${cleaned}`, `../${cleaned}`, `../../${cleaned}`, `/${cleaned}`]);

    extCandidates.forEach(oneExt => {
      const file = `${stem}${oneExt}`;
      pathCandidates.add(file);
      pathCandidates.add(`./${file}`);
      pathCandidates.add(`../${file}`);
      pathCandidates.add(`../../${file}`);
      pathCandidates.add(`/${file}`);
    });

    for (const candidate of pathCandidates) {
      try {
        const testUrl = new URL(candidate, location.href).toString();
        const loaded = await new Promise((resolve) => {
          const img = new Image();
          let settled = false;
          const finish = (value) => {
            if (settled) return;
            settled = true;
            window.clearTimeout(timer);
            img.onload = null;
            img.onerror = null;
            resolve(value);
          };
          const timer = window.setTimeout(() => finish(''), IMAGE_PROBE_TIMEOUT_MS);
          img.onload = () => finish(testUrl);
          img.onerror = () => finish('');
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
    const playerMeta = getPlayerCharacterMeta();
    config._resolvedPlayerImg = await findWorkingImagePath(playerMeta.img);

    const cardEntries = Object.values(config.cards || {});
    await Promise.all(cardEntries.map(async (card) => {
      card.resolvedImg = await findWorkingImagePath(card.img);
    }));
  }



  function getPlayerCharacter(){
    const session = getSessionSafe();
    const chosen = String(session?.character || 'boy').trim().toLowerCase();
    return chosen === 'girl' ? 'girl' : 'boy';
  }

  function getPlayerCharacterMeta(){
    const key = getPlayerCharacter();
    return key === 'girl'
      ? { key, label: tx('精靈法師', 'Elf Mage'), hpLabel: tx('精靈法師 HP', 'Elf Mage HP'), img: 'img/girl.png' }
      : { key, label: tx('冒險少年', 'Adventurer'), hpLabel: tx('冒險少年 HP', 'Adventurer HP'), img: 'img/boy.png' };
  }

  function scoreKey(){
    return `${worldId}-boss`;
  }

  function getCardsForBoss(){
    const inventory = getWorldInventory(worldId.replace(/^world/i, 'W'));
    const ownedItems = inventory.items || [];
    return Object.values(config.cards).map(card => ({
      ...card,
      used: false,
      locked: !ownedItems.includes(card.zhTitle || card.title)
    }));
  }

  function createBossState(){
    const inventory = getWorldInventory(worldId.replace(/^world/i, 'W'));
    const state = {
      playerMaxHp: config.stats.playerMaxHp + Number(inventory.hpBonus || 0),
      playerHp: config.stats.playerMaxHp + Number(inventory.hpBonus || 0),
      playerShield: 0,
      playerPower: 0,
      playerAtkBonus: Number(inventory.atkBonus || 0),
      playerDefBonus: Number(inventory.defBonus || 0),
      playerEquipments: inventory.equipments || [],
      playerDodgeBonus: 0,
      bossMaxHp: config.stats.bossMaxHp,
      bossHp: config.stats.bossMaxHp,
      bossArmor: 0,
      phaseArmorApplied: {},
      turn: 1,
      bossFreezeTurns: 0,
      bossControlCount: 0,
      bossPatternIndex: 0,
      phase: 1,
      enrageStacks: 0,
      tempBossDodgeBonus: 0,
      tempBossDamageBonus: 0,
      nextBasicWeakMultiplier: 0,
      lastPlayerActionKey: '',
      repeatedActionCount: 0,
      consecutiveBasicCount: 0,
      cards: getCardsForBoss(),
      log: [
        tx(`戰鬥開始！先觀察${config.bossShortName}的下一招，再決定是否防禦或進攻。`, `Battle started! Watch ${config.bossShortName}'s next move, then choose attack, defend, or item.`),
        tx(`本世界裝備：${(inventory.equipments || []).length ? inventory.equipments.join('、') : '尚未取得'}。玩家加成：生命 +${Number(inventory.hpBonus || 0)}、攻擊 +${Number(inventory.atkBonus || 0)}、防禦 +${Number(inventory.defBonus || 0)}。`, `World equipment: ${(inventory.equipments || []).length ? inventory.equipments.join(', ') : 'none'}. Player bonuses: HP +${Number(inventory.hpBonus || 0)}, Attack +${Number(inventory.atkBonus || 0)}, Defense +${Number(inventory.defBonus || 0)}.`)
      ],
      finished: false,
      busy: false,
      startedAt: Date.now(),
      fxText: tx('⚔️ Boss 戰開始！', '⚔️ Boss Battle Start!'),
      lastBossAction: tx('尚未行動', 'No action yet'),
      lastPlayerAction: tx('尚未行動', 'No action yet'),
      lastPlayerRoll: tx('尚未觸發', 'Not triggered'),
      lastBossRoll: tx('尚未觸發', 'Not triggered'),
      playerCharacter: getPlayerCharacterMeta(),
      actionHintShown: {},
      awaitingBossContinue: false,
      continuingBossTurn: false,
      playerStatusFx: '',
      bossStatusFx: '',
      bossSupportUsed: { heal:false, seal:false, shield:false }
    };
    const openingArmor = getBossArmorForPhase(1);
    if (openingArmor > 0) {
      state.bossArmor = openingArmor;
      state.phaseArmorApplied[1] = true;
      state.log.push(`${config.bossShortName}一開始就展開 ${openingArmor} 點防護。`);
    }
    return state;
  }

  function setBossArmorForPhase(targetState, phase, announce = false){
    if (!targetState) return 0;
    targetState.phaseArmorApplied ??= {};
    if (targetState.phaseArmorApplied[phase]) return 0;
    const armorGain = getBossArmorForPhase(phase);
    targetState.phaseArmorApplied[phase] = true;
    if (armorGain > 0) {
      targetState.bossArmor = Math.max(0, Number(targetState.bossArmor || 0) + armorGain);
      if (announce) {
        pushBossLog(`<strong>${config.bossShortName}：</strong>進入新階段，展開 ${armorGain} 點防護！`);
        targetState.fxText = `🛡️ ${config.bossShortName}進入新階段，展開 ${armorGain} 點防護！`;
      }
    }
    return armorGain;
  }

  function syncBossEnrage(announce = true){
    if (!bossState) return 0;
    const nextStacks = getBossEnrageStacks(bossState.turn);
    const prevStacks = Number(bossState.enrageStacks || 0);
    bossState.enrageStacks = nextStacks;
    if (announce && nextStacks > prevStacks) {
      pushBossLog(`<strong>${config.bossShortName}：</strong>狂暴值提升到 ${nextStacks} 層，攻擊越來越危險！`);
      bossState.fxText = `🔥 ${config.bossShortName}進入狂暴 ${nextStacks} 層！`;
    }
    return nextStacks;
  }

  function registerPlayerAction(actionKey){
    const key = String(actionKey || '');
    const lastKey = String(bossState.lastPlayerActionKey || '');
    bossState.repeatedActionCount = lastKey === key ? Number(bossState.repeatedActionCount || 0) + 1 : 1;
    bossState.lastPlayerActionKey = key;
    bossState.consecutiveBasicCount = key === 'basic'
      ? (lastKey === 'basic' ? Number(bossState.consecutiveBasicCount || 0) + 1 : 1)
      : 0;
  }

  function applyBossControl(requestedTurns, sourceLabel){
    const mechanics = getBossMechanics();
    const requested = Math.max(0, Math.round(Number(requestedTurns || 0)));
    if (requested <= 0) return 0;

    const usedCount = Number(bossState.bossControlCount || 0);
    const immuneAfter = Number(mechanics.controlImmuneAfter ?? 99);
    const decayStep = Number(mechanics.controlDecayStep || 0);

    let appliedTurns = requested;
    if (usedCount >= immuneAfter) {
      appliedTurns = 0;
    } else if (usedCount > 0 && decayStep > 0) {
      appliedTurns = Math.max(0, requested - decayStep * usedCount);
    }

    bossState.bossControlCount = usedCount + 1;

    if (appliedTurns > 0) {
      bossState.bossFreezeTurns = Math.max(Number(bossState.bossFreezeTurns || 0), appliedTurns);
      pushBossLog(`<strong>控制效果：</strong>${sourceLabel || '技能'}讓${config.bossShortName} ${appliedTurns} 回合無法行動。`);
      bossState.fxText = `❄️ ${config.bossShortName}將有 ${appliedTurns} 回合無法行動！`;
    } else {
      pushBossLog(`<strong>${config.bossShortName}：</strong>已逐漸適應控制效果，這次沒有被定住。`);
      bossState.fxText = `🧠 ${config.bossShortName}已適應控制，這次沒有被定住！`;
    }

    return appliedTurns;
  }

  function applyBasicSpamCounterIfNeeded(){
    const mechanics = getBossMechanics();
    const warnAt = Number(mechanics.basicWarnAt || 0);
    const counterAt = Number(mechanics.basicCounterAt || 0);
    const streak = Number(bossState.consecutiveBasicCount || 0);

    if (warnAt > 0 && streak === warnAt) {
      pushBossLog(`<strong>${config.bossShortName}：</strong>你已連續普通攻擊 ${streak} 次，小心被看穿節奏！`);
    }

    if (!(counterAt > 0) || streak < counterAt) return false;

    bossState.consecutiveBasicCount = 0;
    const label = mechanics.counterLabel || '反制';

    if (mechanics.counterMode === 'retaliate') {
      const result = applyDamageToPlayer(Number(mechanics.counterDamage || 0), label, { canCrit:false, canDodge:false, ignoreEnrage:true });
      bossState.lastBossAction = label;
      pushBossLog(`<strong>${config.bossShortName}反制：</strong>${label}造成 ${result.damage} 點傷害。`);
      bossState.fxText = `⚠️ ${config.bossShortName}看破你的節奏，立刻反擊！`;
      return true;
    }

    if (mechanics.counterMode === 'weaken_next_basic') {
      bossState.nextBasicWeakMultiplier = Number(mechanics.weakenMultiplier || 0.5);
      bossState.lastBossAction = label;
      pushBossLog(`<strong>${config.bossShortName}反制：</strong>${label}啟動，你下一次普通攻擊只剩 ${Math.round(bossState.nextBasicWeakMultiplier * 100)}% 效果。`);
      bossState.fxText = `⏪ ${config.bossShortName}看穿你的節奏，下一次普通攻擊被削弱了！`;
      return true;
    }

    if (mechanics.counterMode === 'boss_dodge') {
      const dodgeBonus = Math.max(0, Number(mechanics.counterDodgeBonus || 0));
      const armorGain = Math.max(0, Math.round(Number(mechanics.counterArmorGain || 0)));
      bossState.tempBossDodgeBonus = Math.max(Number(bossState.tempBossDodgeBonus || 0), dodgeBonus);
      if (armorGain > 0) bossState.bossArmor = Math.max(0, Number(bossState.bossArmor || 0) + armorGain);
      bossState.lastBossAction = label;
      pushBossLog(`<strong>${config.bossShortName}反制：</strong>${label}啟動，閃避提升 ${Math.round(dodgeBonus * 100)}%${armorGain > 0 ? `，並獲得 ${armorGain} 點防護` : ''}。`);
      bossState.fxText = `🛰️ ${config.bossShortName}掃描你的節奏，下一次更容易閃避！`;
      return true;
    }

    return false;
  }

  function clampRate(value){
    return Math.max(0, Math.min(0.85, Number(value || 0)));
  }

  function rollChance(rate){
    return Math.random() < clampRate(rate);
  }

  function getPlayerMaxShield(){
    return Math.max(8, Math.round(config.stats.defendShield * COMBAT_RULES.maxShieldFromDefendMultiplier + Number(bossState?.playerDefBonus || 0) * COMBAT_RULES.maxShieldDefRatio + COMBAT_RULES.maxShieldFlatBonus));
  }

  function addPlayerShield(amount, sourceLabel){
    const gain = Math.max(0, Math.round(Number(amount || 0)));
    const before = Number(bossState.playerShield || 0);
    const cap = getPlayerMaxShield();
    bossState.playerShield = Math.min(cap, before + gain);
    const actualGain = bossState.playerShield - before;
    if (sourceLabel) {
      if (actualGain > 0) {
        pushBossLog(`<strong>${sourceLabel}：</strong>護盾 +${actualGain}（上限 ${cap}）。`);
      }
      if (before + gain > cap) {
        pushBossLog(`<strong>護盾上限：</strong>超出的護盾無法繼續累積。`);
      }
    }
    return actualGain;
  }

  function decayPlayerShield(){
    const current = Math.max(0, Number(bossState.playerShield || 0));
    if (current <= 0) return 0;
    const keep = Math.min(current, Math.max(COMBAT_RULES.minShieldCarry, Math.round(current * COMBAT_RULES.shieldCarryRatio)));
    const lost = current - keep;
    bossState.playerShield = keep;
    if (lost > 0) {
      pushBossLog(`<strong>護盾衰減：</strong>回合結束後護盾減少 ${lost}，剩下 ${keep}。`);
    }
    return lost;
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

  function getBossSupportCandidates(){
    if (!bossState) return [];
    bossState.bossSupportUsed ??= { heal:false, seal:false, shield:false };
    const used = bossState.bossSupportUsed;
    const candidates = [];
    if (!used.heal && bossState.bossHp > 0 && bossState.bossHp <= Math.ceil(bossState.bossMaxHp * 0.72)) {
      candidates.push({ type:'heal', label:tx('生命回流', 'Life Return'), icon:'💚', hint:tx('Boss 會恢復生命。', 'The Boss may recover HP.') });
    }
    if (!used.seal && bossState.turn >= 2) {
      candidates.push({ type:'seal', label:tx('封印咒文', 'Seal Spell'), icon:'🔒', hint:tx('Boss 會封住玩家的蓄力。', 'The Boss may seal your stored power.') });
    }
    if (!used.shield && bossState.bossArmor <= 10) {
      candidates.push({ type:'shield', label:tx('護盾魔法', 'Shield Magic'), icon:'🟡', hint:tx('Boss 會展開防護。', 'The Boss may create armor.') });
    }
    return candidates;
  }

  function pickBossSupportAction(){
    const candidates = getBossSupportCandidates();
    if (!candidates.length) return null;
    const bossHpRate = bossState.bossHp / Math.max(1, bossState.bossMaxHp);
    const baseRate = bossHpRate <= 0.45 ? 0.42 : 0.28;
    if (!rollChance(baseRate)) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  function bossUseSupportAction(action){
    if (!action || !bossState || bossState.finished) return false;
    bossState.bossSupportUsed ??= { heal:false, seal:false, shield:false };
    bossState.bossSupportUsed[action.type] = true;
    bossState.lastBossAction = action.label;

    if (action.type === 'heal') {
      const amount = Math.max(6, Math.round(config.stats.basicDamage * 1.35 + bossState.phase * 2));
      const before = Number(bossState.bossHp || 0);
      bossState.bossHp = Math.min(bossState.bossMaxHp, before + amount);
      const healed = bossState.bossHp - before;
      bossState.fxText = tx(`💚 ${config.bossShortName}施放生命回流，恢復 ${healed} 點生命！`, `💚 ${config.bossShortName} used Life Return and recovered ${healed} HP!`);
      pushBossLog(`<strong>${config.bossShortName}${tx('輔助魔法', ' Support Magic')}：</strong>${tx(`生命回流，恢復 ${healed} 點生命（本場限用一次）。`, `Life Return recovered ${healed} HP. This support magic can be used once per battle.`)}`);
      showHealFx('boss', healed);
      setBattleBanner(`${config.bossShortName}: ${tx('生命回流', 'Life Return')}`, tx(`Boss 恢復 ${healed} 點生命`, `Boss recovered ${healed} HP`));
      return true;
    }

    if (action.type === 'seal') {
      const lostPower = Math.max(0, Number(bossState.playerPower || 0));
      bossState.playerPower = 0;
      bossState.nextBasicWeakMultiplier = Math.max(Number(bossState.nextBasicWeakMultiplier || 0), 0.72);
      bossState.fxText = tx(`🔒 ${config.bossShortName}施放封印咒文，你的蓄力被清空，下一次普攻變弱！`, `🔒 ${config.bossShortName} used Seal Spell. Your power was cleared and your next basic attack is weakened!`);
      pushBossLog(`<strong>${config.bossShortName}${tx('輔助魔法', ' Support Magic')}：</strong>${tx(`封印咒文，清除玩家蓄力 ${lostPower}，並削弱下一次普通攻擊（本場限用一次）。`, `Seal Spell cleared ${lostPower} power and weakened your next basic attack. This support magic can be used once per battle.`)}`);
      showFreezeFx('player', 1);
      setBattleBanner(`${config.bossShortName}: ${tx('封印咒文', 'Seal Spell')}`, tx('蓄力清空，下一次普通攻擊變弱', 'Power cleared. Next basic attack weakened.'));
      return true;
    }

    if (action.type === 'shield') {
      const gain = Math.max(6, Math.round(config.stats.defendShield * 0.9 + bossState.phase * 2));
      bossState.bossArmor = Math.max(0, Number(bossState.bossArmor || 0) + gain);
      bossState.fxText = tx(`🟡 ${config.bossShortName}施放護盾魔法，防護 +${gain}！`, `🟡 ${config.bossShortName} used Shield Magic. Armor +${gain}!`);
      pushBossLog(`<strong>${config.bossShortName}${tx('輔助魔法', ' Support Magic')}：</strong>${tx(`護盾魔法，防護 +${gain}（本場限用一次）。`, `Shield Magic gave armor +${gain}. This support magic can be used once per battle.`)}`);
      showGuardFx('boss', gain, false);
      setPortraitStatus('boss', 'shield');
      setBattleBanner(`${config.bossShortName}: ${tx('護盾魔法', 'Shield Magic')}`, tx(`Boss 防護 +${gain}`, `Boss armor +${gain}`));
      return true;
    }
    return false;
  }

  function syncBossPhase(){
    if (!bossState) return;
    const nextPhase = getBossPhase();
    if (bossState.phase !== nextPhase) {
      bossState.phase = nextPhase;
      pushBossLog(`<strong>${config.bossShortName}：</strong>進入「${config.phaseNames[nextPhase - 1]}」！`);
      setBossArmorForPhase(bossState, nextPhase, true);
      bossState.tempBossDodgeBonus = 0;
    } else {
      bossState.phase = nextPhase;
    }
  }

  function getBossIntentPreview(){
    if (!bossState) return { icon:'❔', label:tx('未知', 'Unknown'), hint:tx('準備載入中…', 'Loading...') };
    const candidates = getBossSupportCandidates();
    if (candidates.length) {
      return {
        icon:'✨',
        label:tx('可能使用輔助魔法', 'May Use Support Magic'),
        hint:tx(
          `${config.bossShortName}除了攻擊，也可能隨機使用補血、封印或護盾；每種本場最多一次。`,
          `${config.bossShortName} may attack, or may randomly heal, seal, or shield. Each support magic can be used once per battle.`
        )
      };
    }
    return bossPatternAction(bossState.bossPatternIndex, getBossPhase());
  }

  function pushBossLog(html){
    bossState.log.unshift(html);
    bossState.log = bossState.log.slice(0, 14);
  }

  function applyDamageToBoss(rawDamage, sourceLabel, options = {}){
    const mechanics = getBossMechanics();
    const canDodge = options.canDodge !== false;
    const canCrit = options.canCrit !== false;
    const ignoreArmor = options.ignoreArmor === true;
    const baseDamage = Math.max(0, Math.round(Number(rawDamage || 0)));
    let damage = baseDamage;
    let isCrit = false;
    let isDodged = false;
    let armorBroken = 0;
    const bossDodgeRate = clampRate(COMBAT_RULES.baseBossDodge + (bossState.phase >= 2 ? 0.04 : 0) + Number(bossState.tempBossDodgeBonus || 0));
    const playerCritRate = clampRate(COMBAT_RULES.basePlayerCrit + Number(bossState.playerAtkBonus || 0) * 0.01 + Number(bossState.playerPower || 0) * 0.005);

    if (canDodge && rollChance(bossDodgeRate)) {
      damage = 0;
      isDodged = true;
      bossState.lastBossRoll = `閃避成功 ${Math.round(bossDodgeRate * 100)}%`;
      pushBossLog(`<strong>${config.bossShortName}：</strong>成功閃避了這次攻擊！`);
      bossState.fxText = `💨 ${config.bossShortName} 閃避了你的攻擊！`;
    } else {
      if (canCrit && damage > 0 && rollChance(playerCritRate)) {
        damage = Math.max(1, Math.round(damage * COMBAT_RULES.critMultiplier));
        isCrit = true;
      }

      const armorBefore = Math.max(0, Number(bossState.bossArmor || 0));
      if (!ignoreArmor && armorBefore > 0) {
        const armorBreakBonus = Math.max(0, Math.round(Number(options.armorBreakBonus || 0)));
        const armorBreakPenalty = Math.max(0, Math.round(Number(options.armorBreakPenalty || 0)));
        armorBroken = Math.min(armorBefore, Math.max(0, damage + armorBreakBonus - armorBreakPenalty));
        bossState.bossArmor = Math.max(0, armorBefore - armorBroken);
        damage = Math.max(0, damage - armorBefore);
        pushBossLog(`<strong>${config.bossShortName}防護：</strong>吸收了本次攻擊，防護削減 ${armorBroken}，剩餘 ${bossState.bossArmor}。`);
      }

      bossState.bossHp = Math.max(0, bossState.bossHp - damage);
      bossState.lastBossRoll = isCrit ? `被爆擊！-${damage}` : `受傷 ${damage}`;
      if (sourceLabel) pushBossLog(`<strong>玩家：</strong>${sourceLabel}${isCrit ? ' 觸發爆擊，' : ''}造成 ${damage} 點傷害${armorBroken > 0 ? `，並削弱 ${armorBroken} 點防護` : ''}。`);
      bossState.fxText = armorBroken > 0 && damage <= 0
        ? `🛡️ ${config.bossShortName}的防護擋住了攻擊！你削弱了 ${armorBroken} 點防護。`
        : (isCrit
          ? `💥 爆擊！對${config.bossShortName}造成 ${damage} 點傷害！`
          : `💥 對${config.bossShortName}造成 ${damage} 點傷害！`);
    }

    bossState.lastPlayerRoll = isDodged
      ? `攻擊被閃避（對手 ${Math.round(bossDodgeRate * 100)}%）`
      : (isCrit ? `爆擊成功！${Math.round(playerCritRate * 100)}%` : '普通命中');

    bossState.tempBossDodgeBonus = 0;
    if (isDodged) {
      showDodgeFx('boss');
      setBattleBanner(tx(`${config.bossShortName} 閃開了！`, `${config.bossShortName} dodged!`), tx('這次攻擊沒有打中', 'This attack missed.'));
    } else if (damage > 0) {
      showAttackFx('boss', damage, isCrit);
      setBattleBanner(isCrit ? tx('爆擊命中！', 'Critical Hit!') : tx('攻擊命中！', 'Attack Hit!'), tx(`對${config.bossShortName}造成 ${damage} 點傷害`, `Dealt ${damage} damage to ${config.bossShortName}.`));
    } else if (armorBroken > 0) {
      showGuardFx('boss', armorBroken, false);
      setBattleBanner(tx('削弱防護！', 'Armor Weakened!'), tx(`削掉 ${armorBroken} 點 Boss 防護`, `Boss armor -${armorBroken}`));
    }
    return { damage, armorBroken, isCrit, isDodged };
  }

  function applyDamageToPlayer(rawDamage, sourceLabel, options = {}){
    const mechanics = getBossMechanics();
    const canDodge = options.canDodge !== false;
    const canCrit = options.canCrit !== false;
    const baseDamage = Math.max(0, Math.round(Number(rawDamage || 0)));
    const enrageStacks = options.ignoreEnrage ? 0 : Number(bossState.enrageStacks || 0);
    const extraDamage = Number(mechanics.enrageDamagePerStack || 0) * enrageStacks
      + (options.actionType === 'skill' ? Number(mechanics.enrageSkillBonusPerStack || 0) * enrageStacks : 0)
      + Number(bossState.tempBossDamageBonus || 0);
    const playerDodgeRate = clampRate(COMBAT_RULES.basePlayerDodge + Number(bossState.playerDodgeBonus || 0));
    const bossCritRate = clampRate(COMBAT_RULES.baseBossCrit + (bossState.phase >= 2 ? 0.06 : 0) + Number(mechanics.enrageCritPerStack || 0) * enrageStacks);
    let damage = Math.max(0, baseDamage + extraDamage);
    let isCrit = false;
    let isDodged = false;

    if (canDodge && rollChance(playerDodgeRate)) {
      damage = 0;
      isDodged = true;
      bossState.lastPlayerRoll = `閃避成功 ${Math.round(playerDodgeRate * 100)}%`;
      bossState.lastBossRoll = '攻擊落空';
      if (sourceLabel) pushBossLog(`<strong>玩家：</strong>你閃過了 ${sourceLabel}！`);
      bossState.fxText = '💨 你成功閃避了這次攻擊！';
      bossState.playerDodgeBonus = 0;
      bossState.tempBossDamageBonus = 0;
      showDodgeFx('player');
      setBattleBanner(tx('成功閃避！', 'Dodged!'), tx('你向後退開，躲開了這次攻擊', 'You stepped back and avoided the attack.'));
      return { damage, isCrit, isDodged };
    }

    if (canCrit && damage > 0 && rollChance(bossCritRate)) {
      damage = Math.max(1, Math.round(damage * COMBAT_RULES.critMultiplier));
      isCrit = true;
    }

    const defBonus = Number(bossState.playerDefBonus || 0);
    if (defBonus > 0 && damage > 0) {
      const defenseReduction = Math.min(
        Math.round(damage * COMBAT_RULES.equipmentDefenseMaxDamageRatio),
        Math.round(defBonus * COMBAT_RULES.equipmentDefensePointRatio)
      );
      damage = Math.max(0, damage - defenseReduction);
      if (defenseReduction > 0) {
        pushBossLog(`<strong>裝備防禦：</strong>防禦 +${defBonus} 減少了 ${defenseReduction} 點傷害。`);
      }
    }
    if (bossState.playerShield > 0) {
      const blocked = Math.min(bossState.playerShield, damage);
      bossState.playerShield -= blocked;
      damage -= blocked;
      if (blocked > 0) pushBossLog(`<strong>防禦：</strong>護盾擋下了 ${blocked} 點傷害。`);
    }
    bossState.playerHp = Math.max(0, bossState.playerHp - damage);
    bossState.lastBossRoll = isCrit ? `爆擊成功！${Math.round(bossCritRate * 100)}%` : '普通命中';
    bossState.lastPlayerRoll = damage > 0 ? `受傷 ${damage}` : '完全擋住';
    if (sourceLabel) pushBossLog(`<strong>${config.bossShortName}：</strong>${sourceLabel}${isCrit ? ' 觸發爆擊，' : '，'}你受到 ${damage} 點傷害${enrageStacks > 0 ? `（狂暴 ${enrageStacks}）` : ''}。`);
    bossState.fxText = isCrit
      ? `💢 ${config.bossShortName} 爆擊！你受到 ${damage} 點傷害！`
      : (damage > 0 ? `😵 你受到 ${damage} 點傷害！` : '🛡️ 你完全擋住了這次攻擊！');
    bossState.playerDodgeBonus = 0;
    bossState.tempBossDamageBonus = 0;
    if (isDodged) {
      showDodgeFx('player');
      setBattleBanner(tx('成功閃避！', 'Dodged!'), tx('你躲開了這次攻擊', 'You avoided this attack.'));
    } else if (damage > 0) {
      showAttackFx('player', damage, isCrit);
      setBattleBanner(isCrit ? tx(`${config.bossShortName} 爆擊！`, `${config.bossShortName} critical hit!`) : tx(`${config.bossShortName} 命中！`, `${config.bossShortName} hit!`), tx(`你受到 ${damage} 點傷害`, `You took ${damage} damage.`));
    } else {
      showGuardFx('player', 0, false);
      setBattleBanner(tx('完全防住！', 'Fully Blocked!'), tx('護盾和裝備幫你擋下了攻擊', 'Your shield and equipment blocked the attack.'));
    }
    return { damage, isCrit, isDodged };
  }

  function bossTakeTurn(){
    if (bossState.finished) return;

    syncBossEnrage(true);

    if (bossState.bossFreezeTurns > 0) {
      bossState.bossFreezeTurns -= 1;
      bossState.lastBossAction = '被控制，無法行動';
      bossState.fxText = `❄️ ${config.bossShortName}被控制住，這回合無法行動！`;
      pushBossLog(`<strong>${config.bossShortName}：</strong>被道具效果困住，這回合無法行動！`);
      return;
    }

    const supportAction = pickBossSupportAction();
    if (supportAction && bossUseSupportAction(supportAction)) {
      return;
    }

    const action = bossPatternAction(bossState.bossPatternIndex, getBossPhase());
    bossState.bossPatternIndex += 1;
    bossState.lastBossAction = action.label;
    showWarningFx(`Boss：${action.label}`);
    setBattleBanner(tx(`Boss 準備：${action.label}`, `Boss prepares: ${action.label}`), action.hint || tx('小心下一波攻擊', 'Watch out for the next attack.'));

    if (action.type === 'multi') {
      let total = 0;
      let critCount = 0;
      let dodgeCount = 0;
      for (const hit of action.hits) {
        const result = applyDamageToPlayer(hit, `${action.label}（${hit}）`, { actionType: action.type });
        total += result.damage;
        if (result.isCrit) critCount += 1;
        if (result.isDodged) dodgeCount += 1;
      }
      pushBossLog(`<strong>${config.bossShortName}連擊：</strong>${action.label}總共造成 ${total} 點傷害${critCount ? `，其中 ${critCount} 次爆擊` : ''}${dodgeCount ? `，你閃掉 ${dodgeCount} 下` : ''}。`);
    } else {
      applyDamageToPlayer(action.damage, action.label, { actionType: action.type });
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

  function cameFromTeacherPage(){
    const from = String(qs('from') || qs('source') || '').trim().toLowerCase();
    return from === 'teacher' || from === 'teacherpage' || from === 'teacher_mode';
  }

  function getExitTargetPage(){
    return cameFromTeacherPage() || isTeacherMode() ? 'teacher.html' : 'index.html';
  }

  function goBackToLevelSelect(){
    location.href = `${getExitTargetPage()}?lang=${encodeURIComponent(BOSS_LANG)}`;
  }

  function goHome(){
    goBackToLevelSelect();
  }

  function goToNextWorldFirstLevel(){
    if (!config.nextWorld) {
      goHome();
      return;
    }
    const from = cameFromTeacherPage() || isTeacherMode() ? '&from=teacher' : '';
    location.href = `game.html?world=${encodeURIComponent(config.nextWorld)}&level=level1${from}&lang=${encodeURIComponent(BOSS_LANG)}`;
  }

  function goToRetryBoss(){
    bossState = createBossState();
    const resultEl = document.getElementById('resultCard');
    resultEl.hidden = true;
    render();
    syncTeacherBossToolUi();
  }

  function getSelectedCharacter(){
    try{
      const s = StorageAPI?.getSession?.() || null;
      const character = String(s?.character || bossState?.playerCharacter?.key || 'boy').trim().toLowerCase();
      return character === 'girl' ? 'girl' : 'boy';
    }catch(_err){
      return 'boy';
    }
  }

  function showCharacterOutcomeImage(isWin){
    const src = CHARACTER_OUTCOME_IMAGES?.[getSelectedCharacter()]?.[isWin ? 'win' : 'lose'];
    if(!src) return;
    let wrap = document.getElementById('characterOutcomeFx');
    if(!wrap){
      wrap = document.createElement('div');
      wrap.id = 'characterOutcomeFx';
      wrap.className = 'character-outcome-fx';
      wrap.innerHTML = '<img alt="角色戰鬥結果">';
      document.body.appendChild(wrap);
    }
    const img = wrap.querySelector('img');
    if(img) img.src = src;
    wrap.classList.remove('show','win','lose');
    void wrap.offsetWidth;
    wrap.classList.add('show', isWin ? 'win' : 'lose');
    clearTimeout(wrap._timer);
    wrap._timer = setTimeout(()=> wrap.classList.remove('show','win','lose'), 2000);
  }

  function isFinalWorldVictory(win){
    return !!win && worldId === 'world4' && !config.nextWorld;
  }

  function renderFinalVictoryHtml(turnsUsed, score){
    return `
      <div class="result-inner final-victory-screen" style="max-height:min(88vh,900px);overflow:auto;text-align:center;">
        <img
          src="img/victory.jpeg"
          alt="${tx('恭喜闖關成功', 'Adventure clear')}"
          style="display:block;width:100%;max-width:980px;margin:0 auto 16px;border-radius:22px;box-shadow:0 18px 42px rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.28);"
        >
        <h3 style="margin-top:0;">${tx('恭喜闖關成功！', 'Adventure Clear!')}</h3>
        <p style="font-weight:800;">${tx('你成功擊敗機械主宰，完成四個世界的所有冒險！', 'You defeated the Mechanical Overlord and completed all four worlds!')}</p>
        <div class="result-badges" style="justify-content:center;">
          <span>${tx('回合數', 'Turns')}：${turnsUsed}</span>
          <span>${tx('剩餘生命', 'HP Left')}：${bossState.playerHp}</span>
          <span>${tx('Boss 分數', 'Boss Score')}：${score}</span>
        </div>
        <div class="result-actions" style="margin-top:18px;justify-content:center;">
          <button type="button" class="next" id="resultBackHome">${tx('返回選關頁面', 'Back to Level Select')}</button>
          <button type="button" class="retry" id="resultRetryWin">${tx('重新挑戰最終 Boss', 'Retry Final Boss')}</button>
        </div>
      </div>
    `;
  }

  function finishBossBattle(win){
    bossState.finished = true;
    bossState.busy = false;
    showCharacterOutcomeImage(!!win);
    saveBossResult(win);
    render();

    const resultEl = document.getElementById('resultCard');
    const turnsUsed = bossState.turn;
    const score = Math.max(100, 1500 - (turnsUsed - 1) * 70 - Math.max(0, bossState.playerMaxHp - bossState.playerHp) * 5);

    if (win) {
      resultEl.className = isFinalWorldVictory(win) ? 'result-card good final-victory-card' : 'result-card good';
      resultEl.innerHTML = isFinalWorldVictory(win) ? renderFinalVictoryHtml(turnsUsed, score) : `
        <div class="result-inner" style="max-height:min(88vh,900px);overflow:auto;">
          <h3>${tx('Boss 戰勝利！', 'Boss Battle Victory!')}</h3>
          <p>${config.winText}<br>${config.nextWorld ? tx('你不只通關了，還學會了新的程式能力。先看完下面的新指令說明，再前往下一個世界第 1 關。', 'You cleared the world and learned a new programming skill. Review the new instruction below, then go to the next world.') : tx('你已完成目前所有世界，現在可以返回選關頁面繼續挑戰其他關卡。', 'You have completed all current worlds. Return to level select to keep challenging other levels.')}</p>
          <div class="result-badges">
            <span>${tx('回合數', 'Turns')}：${turnsUsed}</span>
            <span>${tx('剩餘生命', 'HP Left')}：${bossState.playerHp}</span>
            <span>${tx('Boss 分數', 'Boss Score')}：${score}</span>
          </div>
          ${renderUnlockGuideHtml()}
          <div class="result-actions" style="margin-top:18px;">
            <button type="button" class="next" id="resultNextWorld">${config.nextText}</button>
            <button type="button" class="retry" id="resultRetryWin">${tx('重新挑戰', 'Retry')}</button>
          </div>
        </div>
      `;
    } else {
      resultEl.className = 'result-card bad';
      resultEl.innerHTML = `
        <div class="result-inner">
          <h3>${tx('挑戰失敗', 'Challenge Failed')}</h3>
          <p>${tx(`這次被${config.bossShortName}擊退了。<br>請先整理策略、補齊前面關卡的星星與道具，再回來挑戰。`, `${config.bossShortName} defeated you this time.<br>Review your strategy, collect more stars and items, then challenge again.`)}</p>
          <div class="result-badges">
            <span>${tx('回合數', 'Turns')}：${turnsUsed}</span>
            <span>${tx('Boss 剩餘生命', 'Boss HP Left')}：${Math.max(0, bossState.bossHp)}</span>
            <span>${tx('你的剩餘生命', 'Your HP Left')}：${Math.max(0, bossState.playerHp)}</span>
          </div>
          <div class="result-actions" style="margin-top:18px;">
            <button type="button" class="retry" id="resultRetryLose">${tx('再次挑戰', 'Try Again')}</button>
            <button type="button" class="back" id="resultBackLevel">${tx('返回關卡畫面', 'Back to Level Screen')}</button>
          </div>
        </div>
      `;
    }

    resultEl.hidden = false;

    const nextBtn = document.getElementById('resultNextWorld');
    const retryWinBtn = document.getElementById('resultRetryWin');
    const retryLoseBtn = document.getElementById('resultRetryLose');
    const backHomeBtn = document.getElementById('resultBackHome');
    const backLevelBtn = document.getElementById('resultBackLevel');

    if (nextBtn) nextBtn.onclick = goToNextWorldFirstLevel;
    if (retryWinBtn) retryWinBtn.onclick = goToRetryBoss;
    if (retryLoseBtn) retryLoseBtn.onclick = goToRetryBoss;
    if (backHomeBtn) backHomeBtn.onclick = goBackToLevelSelect;
    if (backLevelBtn) backLevelBtn.onclick = goBackToLevelSelect;
  }

  async function playerBossAction(actionKey){
    if (!bossState || bossState.finished || bossState.busy) return;
    clearPortraitStatuses();
    bossState.busy = true;

    const mechanics = getBossMechanics();
    registerPlayerAction(actionKey === 'basic' ? 'basic' : (['defend','focus','skip'].includes(actionKey) ? actionKey : 'card'));

    if (actionKey === 'basic') {
      const extra = bossState.playerPower;
      let total = config.stats.basicDamage + Number(bossState.playerAtkBonus || 0) + extra;
      const weakenMultiplier = Number(bossState.nextBasicWeakMultiplier || 0);
      if (weakenMultiplier > 0 && weakenMultiplier < 1) {
        total = Math.max(1, Math.round(total * weakenMultiplier));
        bossState.nextBasicWeakMultiplier = 0;
        pushBossLog(`<strong>${config.bossShortName}：</strong>你的普通攻擊被反制，只剩 ${Math.round(weakenMultiplier * 100)}% 威力。`);
      }
      const result = applyDamageToBoss(total, tx(`普通攻擊${Number(bossState.playerAtkBonus || 0) > 0 ? `（裝備 +${Number(bossState.playerAtkBonus || 0)}）` : ''}${extra > 0 ? `（含蓄力 +${extra}）` : ''}`, `Basic Attack${Number(bossState.playerAtkBonus || 0) > 0 ? ` (equipment +${Number(bossState.playerAtkBonus || 0)})` : ''}${extra > 0 ? ` (power +${extra})` : ''}`), { armorBreakPenalty: Number(mechanics.basicArmorBreakPenalty || 0) });
      bossState.lastPlayerAction = tx(`普通攻擊 ${result.damage}${result.armorBroken > 0 ? `｜削甲 ${result.armorBroken}` : ''}${result.isCrit ? '（爆擊）' : ''}${result.isDodged ? '（被閃避）' : ''}`, `Basic Attack ${result.damage}${result.armorBroken > 0 ? ` | armor -${result.armorBroken}` : ''}${result.isCrit ? ' (critical)' : ''}${result.isDodged ? ' (dodged)' : ''}`);
      bossState.playerPower = 0;
      applyBasicSpamCounterIfNeeded();
      if (bossState.playerHp <= 0) {
        finishBossBattle(false);
        return;
      }
    } else if (actionKey === 'defend') {
      const shieldGain = config.stats.defendShield + Math.round(Number(bossState.playerDefBonus || 0) * COMBAT_RULES.defendShieldDefRatio);
      let actualGain = addPlayerShield(shieldGain, '玩家防禦');
      let dodgeBonus = COMBAT_RULES.defendDodgeBonus;
      let perfectGuard = false;
      if (rollChance(COMBAT_RULES.perfectGuardChance)) {
        perfectGuard = true;
        const extraShield = Math.max(1, Math.round(shieldGain * COMBAT_RULES.perfectGuardBonus));
        actualGain += addPlayerShield(extraShield, '完美防禦');
        dodgeBonus += 0.08;
      }
      bossState.playerDodgeBonus = Math.max(bossState.playerDodgeBonus || 0, dodgeBonus);
      bossState.lastPlayerAction = perfectGuard ? tx('完美防禦', 'Perfect Guard') : tx('防禦姿態', 'Defensive Stance');
      bossState.lastPlayerRoll = perfectGuard
        ? tx(`完美防禦成功！額外閃避 ${Math.round(dodgeBonus * 100)}%`, `Perfect guard! Extra dodge ${Math.round(dodgeBonus * 100)}%`)
        : tx(`下回合閃避 +${Math.round(dodgeBonus * 100)}%`, `Next-turn dodge +${Math.round(dodgeBonus * 100)}%`);
      bossState.fxText = perfectGuard
        ? tx(`🛡️ 完美防禦！護盾共 +${actualGain}，下次更容易閃避！`, `🛡️ Perfect guard! Shield +${actualGain}, easier to dodge next time!`)
        : tx(`🛡️ 你架起防禦姿態，護盾 +${actualGain}，下次閃避率提升！`, `🛡️ Defensive stance. Shield +${actualGain}, dodge chance increased!`);
      pushBossLog(`<strong>${tx('玩家', 'Player')}：</strong>${perfectGuard ? tx('完美防禦', 'Perfect guard') : tx('進入防禦姿態', 'Defensive stance')}，${tx(`護盾增加 ${actualGain}，下次閃避率提升。`, `shield +${actualGain}, next dodge chance increased.`)}`);
      showGuardFx('player', actualGain, perfectGuard);
      setPortraitStatus('player', 'shield');
      setBattleBanner(perfectGuard ? tx('完美防禦！', 'Perfect Guard!') : tx('防禦姿態！', 'Defensive Stance!'), tx(`護盾 +${actualGain}`, `Shield +${actualGain}`));
    } else if (actionKey === 'focus') {
      bossState.playerPower += config.stats.focusGain;
      bossState.lastPlayerAction = tx('專注蓄力', 'Focused Power');
      bossState.lastPlayerRoll = tx('蓄力中', 'Charging');
      bossState.fxText = tx(`✨ 你正在蓄力，下次普通攻擊 +${config.stats.focusGain}！`, `✨ Charging power. Next basic attack +${config.stats.focusGain}!`);
      pushBossLog(`<strong>${tx('玩家', 'Player')}：</strong>${tx(`專注蓄力，下次普通攻擊 +${config.stats.focusGain} 傷害。`, `Focused power. Next basic attack +${config.stats.focusGain} damage.`)}`);
      showBuffFx(tx(`蓄力 +${config.stats.focusGain}`, `Power +${config.stats.focusGain}`), 'player');
      setBattleBanner(tx('專注蓄力！', 'Focused Power!'), tx(`下次普通攻擊 +${config.stats.focusGain}`, `Next basic attack +${config.stats.focusGain}`));
    } else if (actionKey === 'skip') {
      bossState.lastPlayerAction = tx('略過回合', 'Skipped Turn');
      bossState.fxText = tx(`👀 你選擇觀察${config.bossShortName}。`, `👀 You observe ${config.bossShortName}.`);
      pushBossLog(`<strong>${tx('玩家', 'Player')}：</strong>${tx(`先觀察${config.bossShortName}的動作。`, `Observe ${config.bossShortName}'s move first.`)}`);
      setBattleBanner(tx('先觀察局勢', 'Observe First'), tx(`看看${config.bossShortName}接下來想做什麼`, `See what ${config.bossShortName} does next`));
    } else {
      const card = bossState.cards.find(c => c.key === actionKey);
      if (!card || card.used || card.locked) { bossState.busy = false; return; }
      card.used = true;
      bossState.lastPlayerAction = tx(`使用卡牌：${card.title}`, `Used card: ${card.title}`);
      const prevFreezeTurns = Number(bossState.bossFreezeTurns || 0);
      const hpBefore = Number(bossState.playerHp || 0);
      const shieldBefore = Number(bossState.playerShield || 0);
      const result = typeof card.effect === 'function' ? card.effect(bossState) : null;
      if (EN) bossState.fxText = `${card.title} activated!`;
      const requestedFreezeTurns = Math.max(0, Number(bossState.bossFreezeTurns || 0));
      let preserveControlFx = false;
      if (requestedFreezeTurns > prevFreezeTurns) {
        bossState.bossFreezeTurns = prevFreezeTurns;
        const applied = applyBossControl(requestedFreezeTurns, card.title);
        preserveControlFx = true;
        if (applied !== requestedFreezeTurns && applied > 0) {
          pushBossLog(`<strong>控制抗性：</strong>原本想控制 ${requestedFreezeTurns} 回合，實際只生效 ${applied} 回合。`);
        }
      }
      const healed = Math.max(0, Number(bossState.playerHp || 0) - hpBefore);
      const shieldGained = Math.max(0, Number(bossState.playerShield || 0) - shieldBefore);
      if (typeof result === 'string' && result) {
        pushBossLog(`<strong>${tx('玩家卡牌', 'Player Card')}：</strong>${EN ? `${card.title} activated.` : `${card.title}${result}`}`);
      } else if (result && typeof result === 'object') {
        if (result.damage) {
          const hit = applyDamageToBoss(result.damage, card.title, { armorBreakBonus: Number(mechanics.cardArmorBreakBonus || 0) });
          bossState.lastPlayerAction = tx(`使用卡牌：${card.title}${hit.damage > 0 ? `｜傷害 ${hit.damage}` : ''}${hit.armorBroken > 0 ? `｜削甲 ${hit.armorBroken}` : ''}${hit.isCrit ? '（爆擊）' : ''}${hit.isDodged ? '（被閃避）' : ''}`, `Used card: ${card.title}${hit.damage > 0 ? ` | damage ${hit.damage}` : ''}${hit.armorBroken > 0 ? ` | armor -${hit.armorBroken}` : ''}${hit.isCrit ? ' (critical)' : ''}${hit.isDodged ? ' (dodged)' : ''}`);
        }
        if (result.log) pushBossLog(`<strong>${tx('玩家卡牌', 'Player Card')}：</strong>${EN ? `${card.title} activated.` : result.log}`);
        if (result.fxText && !preserveControlFx) bossState.fxText = EN ? `${card.title} activated!` : result.fxText;
      }
      if (healed > 0) {
        showHealFx('player', healed);
        setBattleBanner(`${card.title}！`, tx(`恢復 ${healed} 點生命`, `Recovered ${healed} HP`));
      }
      if (shieldGained > 0) {
        showGuardFx('player', shieldGained, false);
        setPortraitStatus('player', 'shield');
        setBattleBanner(`${card.title}！`, tx(`護盾 +${shieldGained}`, `Shield +${shieldGained}`));
      }
      if (requestedFreezeTurns > prevFreezeTurns) {
        showFreezeFx('boss', Math.max(1, requestedFreezeTurns - prevFreezeTurns));
        setBattleBanner(`${card.title}！`, tx(`${config.bossShortName} 暫時無法行動`, `${config.bossShortName} cannot act for now`));
      }
      if (healed <= 0 && shieldGained <= 0 && requestedFreezeTurns <= prevFreezeTurns && !(result && typeof result === 'object' && result.damage)) {
        showBuffFx(card.title, 'player');
        setBattleBanner(`${card.title}！`, tx('道具效果已發動', 'Item effect activated'));
      }
    }

    syncBossPhase();
    render();
    if (bossState.bossHp <= 0) {
      finishBossBattle(true);
      return;
    }

    // ✅ 回合節奏：玩家先出招，停在結果畫面；老師或學生點一下戰況框後，Boss 才後行。
    bossState.awaitingBossContinue = true;
    bossState.busy = true;
    setBattleBanner(tx('玩家行動完成', 'Player action complete'), tx('請先看完玩家行動結果，再點擊這個戰況框讓 Boss 後行。', 'Review the result, then tap this battle box so the Boss can act.'));
    render();
  }

  async function continueBossAfterPlayer(){
    if (!bossState || bossState.finished || !bossState.awaitingBossContinue || bossState.continuingBossTurn) return;
    bossState.awaitingBossContinue = false;
    clearPortraitStatuses();
    bossState.continuingBossTurn = true;
    setBattleBanner(tx(`${config.bossShortName}準備行動`, `${config.bossShortName} is ready to act`), tx('Boss 後行，請觀察結果', 'The Boss acts after you. Watch the result.'));
    render();
    await sleep(350);

    bossTakeTurn();
    render();
    await sleep(650);
    if (bossState.playerHp <= 0) {
      bossState.continuingBossTurn = false;
      finishBossBattle(false);
      return;
    }

    decayPlayerShield();
    bossState.turn += 1;
    bossState.busy = false;
    bossState.continuingBossTurn = false;
    render();
  }

  function escapeHtml(value){
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getActionPreview(actionKey){
    if (config.cards && config.cards[actionKey]) {
      const card = bossState.cards.find(c => c.key === actionKey) || config.cards[actionKey];
      return {
        key: actionKey,
        type: 'card',
        iconType: 'image',
        iconValue: card.resolvedImg || card.img || '',
        fallbackIcon: '🧩',
        label: card.title,
        state: card.locked ? tx('尚未取得', 'Locked') : (card.used ? tx('已使用', 'Used') : tx('可使用 1 次', 'Can use once')),
        desc: card.locked ? tx('這張卡還沒在一般關取得，所以這場戰鬥不能使用。', 'You have not collected this card in a normal level yet, so it cannot be used in this battle.') : card.desc,
        note: card.locked ? tx('先在一般關拿到這個道具，Boss 戰才會開放。', 'Collect this item in a normal level to unlock it for Boss Battles.') : tx('點確認後才會真正使用這張卡，避免 iPad 誤觸。', 'The card is only used after confirmation, preventing accidental taps.'),
        confirmText: tx('確認使用', 'Confirm Use'),
        confirmClass: 'boss-action-confirm',
        disabled: !!(card.used || card.locked || bossState.finished || bossState.busy)
      };
    }
    const meta = ACTION_META[actionKey];
    if (!meta) return null;
    return {
      key: actionKey,
      type: 'action',
      iconType: 'emoji',
      iconValue: meta.icon,
      fallbackIcon: meta.icon,
      label: meta.label,
      state: meta.state,
      desc: meta.note(),
      note: tx('點確認後才會真正執行，避免 iPad 誤觸。', 'The action only happens after confirmation, preventing accidental taps.'),
      confirmText: meta.confirm,
      confirmClass: `boss-action-confirm ${meta.buttonClass === 'danger' ? 'danger' : ''}`.trim(),
      disabled: !!(bossState.finished || bossState.busy)
    };
  }

  function closeActionModal(){
    pendingActionPreview = null;
    const modal = document.getElementById('bossActionModal');
    if (modal) {
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  function openActionModal(actionKey){
    const preview = getActionPreview(actionKey);
    if (!preview) return;
    pendingActionPreview = preview;
    const modal = document.getElementById('bossActionModal');
    const previewEl = document.getElementById('bossActionPreview');
    const titleEl = document.getElementById('bossActionTitle');
    const stateEl = document.getElementById('bossActionState');
    const descEl = document.getElementById('bossActionDesc');
    const noteEl = document.getElementById('bossActionNote');
    const confirmBtn = document.getElementById('bossActionConfirm');
    if (!modal || !previewEl || !titleEl || !stateEl || !descEl || !noteEl || !confirmBtn) return;

    if (preview.iconType === 'image' && preview.iconValue) {
      previewEl.innerHTML = `<img src="${escapeHtml(preview.iconValue)}" alt="${escapeHtml(preview.label)}">`;
    } else {
      previewEl.textContent = preview.iconValue || preview.fallbackIcon || '⚔️';
    }
    titleEl.textContent = preview.label;
    stateEl.textContent = preview.state;
    descEl.textContent = preview.desc;
    noteEl.textContent = preview.note;
    confirmBtn.textContent = preview.confirmText;
    confirmBtn.className = preview.confirmClass;
    confirmBtn.disabled = !!preview.disabled;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
  }

  function hasSeenActionHint(actionKey){
    return !!bossState?.actionHintShown?.[String(actionKey || '')];
  }

  function markActionHintShown(actionKey){
    if (!bossState) return;
    bossState.actionHintShown ??= {};
    bossState.actionHintShown[String(actionKey || '')] = true;
  }

  function handleActionSelection(actionKey){
    if (!actionKey || bossState?.finished || bossState?.busy) return;
    if (hasSeenActionHint(actionKey)) {
      playerBossAction(actionKey);
      return;
    }
    markActionHintShown(actionKey);
    openActionModal(actionKey);
  }

  function actionButtonsHtml(){
    return Object.entries(ACTION_META).map(([key, meta]) => `
      <button type="button" class="action-icon-btn ${meta.buttonClass}" data-action="${key}" ${(bossState.finished || bossState.busy) ? 'disabled' : ''}>
        <span class="action-icon-art">${meta.icon}</span>
        <span class="action-icon-label">${meta.label}</span>
        <span class="action-icon-hint">${hasSeenActionHint(key) ? '再次點擊發動' : '首次點擊說明'}</span>
      </button>
    `).join('');
  }

  function bossCardsHtml(){
    return bossState.cards.map(card => {
      const cardImg = card.resolvedImg || card.img || '';
      const stateClass = card.used ? 'is-used' : (card.locked ? 'is-locked' : '');
      const stateText = card.locked
        ? tx('未取得', 'Locked')
        : (card.used ? tx('已使用', 'Used') : (hasSeenActionHint(card.key) ? tx('再次點擊使用', 'Tap again to use') : tx('首次點擊說明', 'Tap for details')));
      const cardImgHtml = cardImg
        ? `<img src="${escapeHtml(cardImg)}" alt="${escapeHtml(card.title)}" onerror="this.style.display='none'; this.parentElement.textContent='🧩';">`
        : '🧩';
      return `
        <div class="boss-card">
          <button type="button" class="boss-icon-btn ${stateClass}" data-card="${card.key}" ${card.used || card.locked || bossState.finished || bossState.busy ? 'disabled' : ''}>
            <span class="boss-icon-art">${cardImgHtml}</span>
            <span class="boss-icon-label">${card.title}</span>
            <span class="boss-icon-state">${stateText}</span>
          </button>
        </div>
      `;
    }).join('');
  }

  function logPillsHtml(){
    const recentLogs = (bossState.log || []).slice(0, 4);
    return recentLogs.length
      ? recentLogs.map(item => `<span class="boss-log-pill">${item.replace(/<[^>]*>/g, '')}</span>`).join('')
      : `<span class="boss-log-pill">${tx('戰鬥開始！', 'Battle started!')}</span>`;
  }

  function bindButtons(){
    document.getElementById('btnRetry').onclick = () => goToRetryBoss();
    document.getElementById('btnExit').onclick = goHome;
    document.getElementById('btnBackGame').onclick = goBackToLevelSelect;

    document.querySelectorAll('#bossCards [data-card]').forEach(btn => {
      btn.onclick = () => handleActionSelection(btn.dataset.card);
    });
    document.querySelectorAll('#bossActions [data-action]').forEach(btn => {
      btn.onclick = () => handleActionSelection(btn.dataset.action);
    });

    const cancelBtn = document.getElementById('bossActionCancel');
    const confirmBtn = document.getElementById('bossActionConfirm');
    const modal = document.getElementById('bossActionModal');
    if (cancelBtn) cancelBtn.onclick = closeActionModal;
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        if (!pendingActionPreview || pendingActionPreview.disabled) return;
        const actionKey = pendingActionPreview.key;
        closeActionModal();
        playerBossAction(actionKey);
      };
    }
    if (modal) {
      modal.onclick = (event) => {
        if (event.target === modal) closeActionModal();
      };
    }

    const battleBanner = document.querySelector('.battle-banner');
    if (battleBanner) {
      battleBanner.onclick = () => continueBossAfterPlayer();
    }
  }

  async function applyTheme(){
    document.documentElement.lang = EN ? 'en' : 'zh-Hant';
    document.title = EN ? `${config.pageTitle} | Magic Maze` : `${config.pageTitle}｜魔法迷宮`;
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
    const backBtn = document.getElementById('btnBackGame');
    const retryBtn = document.getElementById('btnRetry');
    const exitBtn = document.getElementById('btnExit');
    if (backBtn) backBtn.textContent = tx('回首頁', 'Home');
    if (retryBtn) retryBtn.textContent = tx('重新挑戰', 'Retry');
    if (exitBtn) exitBtn.textContent = tx('離開關卡', 'Exit Level');
    const panelTitles = document.querySelectorAll('.panel-title');
    if (panelTitles[0]) panelTitles[0].textContent = tx('玩家狀態', 'Player Status');
    if (panelTitles[1]) panelTitles[1].textContent = tx('Boss 狀態', 'Boss Status');
    const playerSub = document.querySelectorAll('.hp-capsule .panel-sub')[0];
    const bossSub = document.querySelectorAll('.hp-capsule .panel-sub')[2];
    if (playerSub) playerSub.innerHTML = `<span>${tx('護盾', 'Shield')}：<b id="playerShield">0</b></span><span>${tx('蓄力', 'Power')}：<b id="playerPower">0</b></span>`;
    if (bossSub) bossSub.innerHTML = `<span>${tx('階段', 'Phase')}：<b id="bossPhase">${config.phaseNames[0]}</b></span><span>${tx('冰凍', 'Freeze')}：<b id="bossFreeze">0</b></span>`;
    const sectionTitles = document.querySelectorAll('.section-title');
    if (sectionTitles[0]) sectionTitles[0].textContent = tx('卡牌區', 'Cards');
    if (sectionTitles[1]) sectionTitles[1].textContent = tx('玩家行動', 'Player Actions');
    const bannerLabel = document.querySelector('.battle-banner-label');
    if (bannerLabel) bannerLabel.textContent = tx('本回合戰況', 'This Turn');
    const modalTitle = document.getElementById('bossActionTitle');
    const modalState = document.getElementById('bossActionState');
    const modalDesc = document.getElementById('bossActionDesc');
    const modalNote = document.getElementById('bossActionNote');
    const modalCancel = document.getElementById('bossActionCancel');
    const modalConfirm = document.getElementById('bossActionConfirm');
    if (modalTitle) modalTitle.textContent = tx('動作說明', 'Action Details');
    if (modalState) modalState.textContent = tx('準備中', 'Ready');
    if (modalDesc) modalDesc.textContent = tx('請確認後再執行。', 'Confirm before taking action.');
    if (modalNote) modalNote.textContent = tx('點擊確認後才會真正出招，避免 iPad 誤觸。', 'The action only happens after confirmation, preventing accidental taps.');
    if (modalCancel) modalCancel.textContent = tx('返回', 'Back');
    if (modalConfirm) modalConfirm.textContent = tx('確認使用', 'Confirm');
    if (bossName) bossName.textContent = config.bossName;
    if (phase) phase.textContent = config.phaseNames[0];
    if (turnText) turnText.textContent = EN ? `Turn 1 | ${config.bossShortName}'s next move` : `第 1 回合｜${config.bossShortName}下一招`;

    await resolveConfigAssets();

    if (config._resolvedBodyBg) {
      document.body.style.background = config._resolvedBodyBg;
    }

    if (arena) {
      arena.style.background = 'transparent';
    }

    const playerMeta = getPlayerCharacterMeta();
    const playerImg = document.getElementById('playerImg');
    const playerName = document.getElementById('playerName');
    const playerPortraitLabel = document.getElementById('playerPortraitLabel');
    const bossPortraitLabel = document.getElementById('bossPortraitLabel');

    if (playerName) playerName.textContent = playerMeta.hpLabel;
    if (playerPortraitLabel) playerPortraitLabel.textContent = playerMeta.label;
    if (bossPortraitLabel) bossPortraitLabel.textContent = config.bossName;

    if (playerImg) {
      if (config._resolvedPlayerImg) {
        playerImg.src = config._resolvedPlayerImg;
        playerImg.alt = playerMeta.label;
        playerImg.style.display = 'block';
      } else {
        playerImg.removeAttribute('src');
        playerImg.alt = `${playerMeta.label}（圖片未找到）`;
        playerImg.style.display = 'none';
      }
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
    const playerHintEl = document.getElementById('playerHintText');
    const playerCritPct = Math.round(clampRate(COMBAT_RULES.basePlayerCrit + bossState.playerAtkBonus * 0.01 + bossState.playerPower * 0.005) * 100);
    const playerDodgePct = Math.round(clampRate(COMBAT_RULES.basePlayerDodge + bossState.playerDodgeBonus) * 100);
    const basicRisk = getBossCounterRisk();
    if (playerHintEl) playerHintEl.textContent = EN
      ? `Equipment: ${bossState.playerEquipments?.length ? bossState.playerEquipments.join(', ') : 'none'} | Attack +${bossState.playerAtkBonus} | Defense +${bossState.playerDefBonus} | Crit ${playerCritPct}% | Dodge ${playerDodgePct}%${basicRisk.streak > 0 ? ` | Basic streak ${basicRisk.streak}` : ''}${bossState.nextBasicWeakMultiplier > 0 ? ' | Next basic weakened' : ''}`
      : `裝備：${bossState.playerEquipments?.length ? bossState.playerEquipments.join('、') : '尚未取得'}｜攻擊 +${bossState.playerAtkBonus}｜防禦 +${bossState.playerDefBonus}｜爆擊 ${playerCritPct}%｜閃避 ${playerDodgePct}%${basicRisk.streak > 0 ? `｜連續普攻 ${basicRisk.streak}` : ''}${bossState.nextBasicWeakMultiplier > 0 ? '｜下次普攻被削弱' : ''}`;
    document.getElementById('bossHpText').textContent = `${bossState.bossHp} / ${bossState.bossMaxHp}`;
    document.getElementById('playerShield').textContent = bossState.playerShield;
    document.getElementById('playerPower').textContent = bossState.playerPower;
    document.getElementById('bossPhase').textContent = bossState.phase === 1 ? config.phaseNames[0] : config.phaseNames[1];
    document.getElementById('bossFreeze').textContent = bossState.bossFreezeTurns;
    const bossHintEl = document.getElementById('bossHintText');
    const bossCritPct = Math.round(clampRate(COMBAT_RULES.baseBossCrit + (bossState.phase >= 2 ? 0.06 : 0) + Number(getBossMechanics().enrageCritPerStack || 0) * Number(bossState.enrageStacks || 0)) * 100);
    const bossDodgePct = Math.round(clampRate(COMBAT_RULES.baseBossDodge + (bossState.phase >= 2 ? 0.04 : 0) + Number(bossState.tempBossDodgeBonus || 0)) * 100);
    if (bossHintEl) bossHintEl.textContent = EN
      ? `Armor ${bossState.bossArmor} | Rage ${bossState.enrageStacks} | Crit ${bossCritPct}% | Dodge ${bossDodgePct}%`
      : `防護 ${bossState.bossArmor}｜狂暴 ${bossState.enrageStacks}｜爆擊 ${bossCritPct}%｜閃避 ${bossDodgePct}%`;
    const topBossBadge = document.getElementById('topBossBadge');
    if (topBossBadge) topBossBadge.textContent = config.bossName;
    document.getElementById('turnText').textContent = EN ? `Turn ${bossState.turn} | ${config.bossShortName}'s next move` : `第 ${bossState.turn} 回合｜${config.bossShortName}下一招`;
    document.getElementById('intentMain').textContent = `${intent.icon} ${intent.label}`;
    document.getElementById('intentSub').textContent = EN
      ? `${intent.hint}${bossState.bossArmor > 0 ? ` | Armor ${bossState.bossArmor}` : ''}${basicRisk.counterAt > 0 && basicRisk.streak >= basicRisk.warnAt ? ` | Warning: ${basicRisk.counterAt} basic attacks in a row can be countered` : ''}`
      : `${intent.hint}${bossState.bossArmor > 0 ? `｜目前有 ${bossState.bossArmor} 點防護` : ''}${basicRisk.counterAt > 0 && basicRisk.streak >= basicRisk.warnAt ? `｜小心：連續普攻 ${basicRisk.counterAt} 次會被反制` : ''}`;
    document.getElementById('playerHpBar').style.width = `${playerPct}%`;
    document.getElementById('bossHpBar').style.width = `${bossPct}%`;
    document.getElementById('bossCards').innerHTML = bossCardsHtml();
    const actionsEl = document.getElementById('bossActions');
    if (actionsEl) actionsEl.innerHTML = actionButtonsHtml();
    document.getElementById('battleLog').innerHTML = logPillsHtml();
    if (bossState.finished) closeActionModal();
    const fxEl = document.getElementById('fxText');
    if (fxEl) fxEl.textContent = bossState.fxText || `${bossState.lastPlayerAction}｜${bossState.lastBossAction}`;
    const fxSubEl = document.getElementById('fxSubText');
    if (fxSubEl) fxSubEl.textContent = bossState.awaitingBossContinue
      ? (EN ? `Player: ${bossState.lastPlayerAction} | Tap the battle box for the Boss action` : `玩家：${bossState.lastPlayerAction}｜點擊戰況框後 Boss 才會行動`)
      : (EN ? `Player: ${bossState.lastPlayerAction} | Boss: ${bossState.lastBossAction}` : `玩家：${bossState.lastPlayerAction}｜Boss：${bossState.lastBossAction}`);

    const battleBanner = document.querySelector('.battle-banner');
    if (battleBanner) battleBanner.classList.toggle('is-clickable', !!bossState.awaitingBossContinue);
    applyPortraitStatusClasses();

    bindButtons();

  }

  document.addEventListener('DOMContentLoaded', async () => {
    teacherBossSimOverride = readTeacherBossOverride();
    bossState = createBossState();
    await applyTheme();
    injectTeacherBossTool();
    render();
    syncTeacherBossToolUi();

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeActionModal();
    });
  });
})();
