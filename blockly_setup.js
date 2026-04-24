// blockly_setup.js
// 需要在 game.html / teacher.html 載入：blockly.min.js + msg/zh-hant.js
// 並在建立 workspace 前呼叫：Blockly.setLocale(Blockly.Msg)

window.BlocklySetup = (()=>{

  let definitionsReady = false;

  function applyKidFriendlyMsgs(){
    if (window.Blockly && Blockly.Msg) {
      Blockly.Msg.CONTROLS_REPEAT_TITLE = "重複 %1 次";
      Blockly.Msg.CONTROLS_REPEAT_INPUT_DO = "做";
      Blockly.Msg.CONTROLS_IF_MSG_IF = "如果";
      Blockly.Msg.CONTROLS_IF_MSG_THEN = "就";
      Blockly.Msg.CONTROLS_IF_MSG_ELSE = "否則";
    }
  }

  const BLOCK_COLORS = {
    // 依照教師提供的 Blockly 參考圖調整：
    // 起始＝橘黃、移動＝青藍、迴圈＝桃紅、條件＝深藍
    START: "#F2A93B",
    SEQUENCE: "#29C7D8",
    LOOP: "#FF3AA7",
    CONDITION: "#1E95D6",
    FUNCTION: "#5AA51C",
    NUMBER: "#F2A93B"
  };

  function getJavaScriptGenerator(){
    return Blockly.javascriptGenerator || Blockly.JavaScript || null;
  }

  function registerGenerator(js, blockType, fn){
    if(!js || !blockType || typeof fn !== "function") return;
    js.forBlock = js.forBlock || {};
    js.forBlock[blockType] = fn;
    // 相容不同 Blockly 版本：有些版本吃 forBlock，有些會直接讀 generator[blockType]
    js[blockType] = fn;
  }

  function wrapSetColour(blockType, color){
    if(!window.Blockly?.Blocks?.[blockType]) return;
    const def = Blockly.Blocks[blockType];
    if(!def || def.__mwColorWrapped) return;
    const origInit = def.init;
    if(typeof origInit !== 'function') return;
    def.init = function(){
      origInit.call(this);
      try{ this.setColour?.(color); }catch(_err){}
    };
    def.__mwColorWrapped = true;
  }

  function recolorBuiltinBlocks(){
    if(!window.Blockly?.Blocks) return;
    wrapSetColour('controls_repeat_ext', BLOCK_COLORS.LOOP);
    wrapSetColour('controls_whileUntil', BLOCK_COLORS.LOOP);
    wrapSetColour('controls_for', BLOCK_COLORS.LOOP);
    wrapSetColour('controls_forEach', BLOCK_COLORS.LOOP);
    wrapSetColour('controls_if', BLOCK_COLORS.CONDITION);
    wrapSetColour('logic_compare', BLOCK_COLORS.CONDITION);
    wrapSetColour('logic_operation', BLOCK_COLORS.CONDITION);
    wrapSetColour('logic_boolean', BLOCK_COLORS.CONDITION);
    wrapSetColour('logic_negate', BLOCK_COLORS.CONDITION);
    wrapSetColour('math_number', BLOCK_COLORS.NUMBER);
  }

  function xmlTextToDom(xmlText){
    if(Blockly?.utils?.xml?.textToDom) return Blockly.utils.xml.textToDom(xmlText);
    if(Blockly?.Xml?.textToDom) return Blockly.Xml.textToDom(xmlText);
    throw new Error("Blockly XML API 不可用：找不到 textToDom");
  }
  function domToXmlText(dom){
    if(Blockly?.utils?.xml?.domToText) return Blockly.utils.xml.domToText(dom);
    if(Blockly?.Xml?.domToText) return Blockly.Xml.domToText(dom);
    throw new Error("Blockly XML API 不可用：找不到 domToText");
  }
  function domToWorkspace(dom, ws){
    if(Blockly?.Xml?.domToWorkspace) return Blockly.Xml.domToWorkspace(dom, ws);
    throw new Error("Blockly XML API 不可用：找不到 domToWorkspace");
  }
  function workspaceToDom(ws){
    if(Blockly?.Xml?.workspaceToDom) return Blockly.Xml.workspaceToDom(ws);
    throw new Error("Blockly XML API 不可用：找不到 workspaceToDom");
  }

  function defineCustomBlocksOnce(){
    if(!window.Blockly) return;
    if(!Blockly.Blocks["mw_start"]){
      Blockly.defineBlocksWithJsonArray([
        {
          "type":"mw_start",
          "message0":"當開始執行",
          "nextStatement":null,
          "colour":BLOCK_COLORS.START,
          "tooltip":"程式會從這裡開始往下執行。",
          "helpUrl":""
        },
        { "type":"mw_move_forward","message0":"移動-向前","previousStatement":null,"nextStatement":null,"colour":BLOCK_COLORS.SEQUENCE },
        {
          "type":"mw_turn",
          "message0":"轉向－%1",
          "args0":[
            {"type":"field_dropdown","name":"DIR","options":[["左方","left"],["右方","right"]]}
          ],
          "previousStatement":null,
          "nextStatement":null,
          "colour":BLOCK_COLORS.SEQUENCE,
          "tooltip":"選擇要往左方或右方轉向。",
          "helpUrl":""
        },
        { "type":"mw_turn_left","message0":"轉向－左方","previousStatement":null,"nextStatement":null,"colour":BLOCK_COLORS.SEQUENCE },
        { "type":"mw_turn_right","message0":"轉向－右方","previousStatement":null,"nextStatement":null,"colour":BLOCK_COLORS.SEQUENCE },
        {
          "type":"mw_repeat_times",
          "message0":"重複 %1 次 %2 做 %3",
          "args0":[
            {"type":"field_dropdown","name":"TIMES","options":[["2","2"],["3","3"],["4","4"],["5","5"],["6","6"],["7","7"],["8","8"],["9","9"],["10","10"]]},
            {"type":"input_dummy"},
            {"type":"input_statement","name":"DO"}
          ],
          "previousStatement":null,
          "nextStatement":null,
          "colour":BLOCK_COLORS.LOOP,
          "tooltip":"把裡面的動作重複執行指定次數。",
          "helpUrl":""
        },
        {
          "type":"mw_repeat_until_goal",
          "message0":"重複直到抵達大門 %1 做 %2",
          "args0":[
            {"type":"input_dummy"},
            {"type":"input_statement","name":"DO"}
          ],
          "previousStatement":null,
          "nextStatement":null,
          "colour":BLOCK_COLORS.LOOP,
          "tooltip":"一直重複執行，直到角色走到出口。",
          "helpUrl":""
        },
        { "type":"mw_path_ahead","message0":"前方有路？","output":"Boolean","colour":BLOCK_COLORS.CONDITION },
        {
          "type":"mw_if_path",
          "message0":"如果 %1 有路 %2 就 %3 否則 %4",
          "args0":[
            {"type":"field_dropdown","name":"DIR","options":[["前面","ahead"],["右邊","right"],["左邊","left"]]},
            {"type":"input_dummy"},
            {"type":"input_statement","name":"DO"},
            {"type":"input_statement","name":"ELSE"}
          ],
          "previousStatement":null,
          "nextStatement":null,
          "colour":BLOCK_COLORS.CONDITION,
          "tooltip":"先判斷指定方向有沒有路；有路就執行上面，沒有路就執行否則。",
          "helpUrl":""
        },
        { "type":"mw_if_path_ahead","message0":"如果前方有路 %1 就 %2 否則 %3","args0":[{"type":"input_dummy"},{"type":"input_statement","name":"DO"},{"type":"input_statement","name":"ELSE"}],"previousStatement":null,"nextStatement":null,"colour":BLOCK_COLORS.CONDITION,"tooltip":"舊版相容積木。","helpUrl":"" },
        {
          "type":"mw_func_def_fire","message0":"定義火焰咒語 做 %1",
          "args0":[{"type":"input_statement","name":"DO"}],
          "colour":BLOCK_COLORS.FUNCTION,"tooltip":"固定順序：左、右、右、左。可消滅前方冰塊。","helpUrl":""
        },
        { "type":"mw_func_call_fire","message0":"施放火焰咒語","previousStatement":null,"nextStatement":null,"colour":BLOCK_COLORS.FUNCTION },
        {
          "type":"mw_func_def_rain","message0":"定義暴雨咒語 做 %1",
          "args0":[{"type":"input_statement","name":"DO"}],
          "colour":BLOCK_COLORS.FUNCTION,"tooltip":"固定順序：右、左、左、右。可消滅前方火焰。","helpUrl":""
        },
        { "type":"mw_func_call_rain","message0":"施放暴雨咒語","previousStatement":null,"nextStatement":null,"colour":BLOCK_COLORS.FUNCTION },
        {
          "type":"mw_func_def_purify","message0":"定義驅邪咒語 做 %1",
          "args0":[{"type":"input_statement","name":"DO"}],
          "colour":BLOCK_COLORS.FUNCTION,"tooltip":"固定順序：左、左、右、右。可消滅前方妖怪。","helpUrl":""
        },
        { "type":"mw_func_call_purify","message0":"施放驅邪咒語","previousStatement":null,"nextStatement":null,"colour":BLOCK_COLORS.FUNCTION },
        {
          "type":"mw_func_def_fly","message0":"定義飛行咒語 做 %1",
          "args0":[{"type":"input_statement","name":"DO"}],
          "colour":BLOCK_COLORS.FUNCTION,"tooltip":"固定順序：右、右、左、左。可穿過前方河流。","helpUrl":""
        },
        { "type":"mw_func_call_fly","message0":"施放飛行咒語","previousStatement":null,"nextStatement":null,"colour":BLOCK_COLORS.FUNCTION }
      ]);
    }

    recolorBuiltinBlocks();

    const js = getJavaScriptGenerator();
    if(!js) return;

    try{ js.STATEMENT_PREFIX = 'await api.__highlight(%1);\n'; }catch(_err){}

    registerGenerator(js, "mw_start", function(block){
      // ✅ 起始積木本身不產生動作。
      // Blockly 會自動接著產生 nextStatement 的程式碼；
      // 如果這裡再手動 blockToCode(nextBlock)，整串指令會被執行兩次，
      // 看起來就像「最後一個指令跑完後又自動重新開始」。
      return "";
    });

    registerGenerator(js, "mw_move_forward", ()=> "await api.moveForward();\n");
    registerGenerator(js, "mw_turn", function(block){
      const dir = String(block.getFieldValue("DIR") || "left");
      return `await api.turnDirection(${JSON.stringify(dir)});\n`;
    });
    registerGenerator(js, "mw_turn_left", ()=> "await api.turnDirection(\"left\");\n");
    registerGenerator(js, "mw_turn_right", ()=> "await api.turnDirection(\"right\");\n");

    registerGenerator(js, "mw_repeat_times", function(block){
      const times = Number(block.getFieldValue("TIMES") || 3);
      const body = js.statementToCode(block, "DO");
      return `for (let i = 0; i < ${times}; i++) {
${body}}
`;
    });

    registerGenerator(js, "mw_repeat_until_goal", function(block){
      const body = js.statementToCode(block, "DO");
      return `while (!(await api.isAtGoal())) {
${body}}
`;
    });

    registerGenerator(js, "mw_if_path", function(block){
      const dir = String(block.getFieldValue("DIR") || "ahead");
      const doCode = js.statementToCode(block, "DO");
      const elseCode = js.statementToCode(block, "ELSE");
      return `if (await api.canMoveDirection(${JSON.stringify(dir)})) {
${doCode}} else {
${elseCode}}
`;
    });

    const orderNone = js.ORDER_NONE ?? 99;
    registerGenerator(js, "mw_path_ahead", ()=> ["await api.canMoveForward()", orderNone]);

    registerGenerator(js, "mw_if_path_ahead", function(block){
      const doCode = js.statementToCode(block, "DO");
      const elseCode = js.statementToCode(block, "ELSE");
      return `if (await api.canMoveForward()) {\n${doCode}} else {\n${elseCode}}\n`;
    });

    registerGenerator(js, "mw_func_def_a", function(block){
      const body = js.statementToCode(block, "DO");
      return `async function spellA(){\n${body}}\n`;
    });
    registerGenerator(js, "mw_func_call_a", ()=> "await spellA();\n");

    registerGenerator(js, "mw_func_def_b", function(block){
      const body = js.statementToCode(block, "DO");
      return `async function spellB(){\n${body}}\n`;
    });
    registerGenerator(js, "mw_func_call_b", ()=> "await spellB();\n");

    registerGenerator(js, "mw_func_def_fire", function(block){
      const body = js.statementToCode(block, "DO");
      return `async function mwSpell_fire(){\n  await api.__beginSpell("fire");\n  try {\n${body}  } finally {\n    await api.__endSpell("fire");\n  }\n}\n`;
    });
    registerGenerator(js, "mw_func_call_fire", ()=> "await mwSpell_fire();\n");

    registerGenerator(js, "mw_func_def_rain", function(block){
      const body = js.statementToCode(block, "DO");
      return `async function mwSpell_rain(){\n  await api.__beginSpell("rain");\n  try {\n${body}  } finally {\n    await api.__endSpell("rain");\n  }\n}\n`;
    });
    registerGenerator(js, "mw_func_call_rain", ()=> "await mwSpell_rain();\n");

    registerGenerator(js, "mw_func_def_purify", function(block){
      const body = js.statementToCode(block, "DO");
      return `async function mwSpell_purify(){\n  await api.__beginSpell("purify");\n  try {\n${body}  } finally {\n    await api.__endSpell("purify");\n  }\n}\n`;
    });
    registerGenerator(js, "mw_func_call_purify", ()=> "await mwSpell_purify();\n");

    registerGenerator(js, "mw_func_def_fly", function(block){
      const body = js.statementToCode(block, "DO");
      return `async function mwSpell_fly(){\n  await api.__beginSpell("fly");\n  try {\n${body}  } finally {\n    await api.__endSpell("fly");\n  }\n}\n`;
    });
    registerGenerator(js, "mw_func_call_fly", ()=> "await mwSpell_fly();\n");
  }

  function ensureDefinitions(){
    if(definitionsReady) return true;
    if(!window.Blockly) return false;
    applyKidFriendlyMsgs();
    defineCustomBlocksOnce();
    definitionsReady = true;
    return true;
  }

  function loopRepeatBlockToolboxItem(defaultTimes = 3){
    return {
      kind:"block",
      type:"mw_repeat_times",
      fields:{
        TIMES: String(Number(defaultTimes) || 3)
      }
    };
  }

  function normalizeLevelId(levelId){
    const raw = String(levelId || '').trim();
    if(!raw) return '';
    if(/^boss$/i.test(raw)) return 'boss';
    const m = raw.match(/^(?:level|l)\s*(\d+)$/i);
    if(m) return `L${m[1]}`;
    return raw.toUpperCase();
  }

  function getWorld4SpellConfig(levelId){
    const map = {
      L1: { name:'飛行咒語', defType:'mw_func_def_fly', callType:'mw_func_call_fly', target:'L' },
      L2: { name:'火焰咒語', defType:'mw_func_def_fire', callType:'mw_func_call_fire', target:'X' },
      L3: { name:'暴雨咒語', defType:'mw_func_def_rain', callType:'mw_func_call_rain', target:'F' },
      L4: { name:'驅邪咒語', defType:'mw_func_def_purify', callType:'mw_func_call_purify', target:'O' }
    };
    return map[normalizeLevelId(levelId)] || null;
  }

  function getSpellConfigByObstacle(symbol){
    const key = String(symbol || '').trim().toUpperCase();
    const map = {
      X: { name:'火焰咒語', defType:'mw_func_def_fire', callType:'mw_func_call_fire', target:'X' },
      F: { name:'暴雨咒語', defType:'mw_func_def_rain', callType:'mw_func_call_rain', target:'F' },
      O: { name:'驅邪咒語', defType:'mw_func_def_purify', callType:'mw_func_call_purify', target:'O' },
      L: { name:'飛行咒語', defType:'mw_func_def_fly', callType:'mw_func_call_fly', target:'L' }
    };
    return map[key] || null;
  }

  function getWorld4AvailableSpellConfigs(levelId, opts = {}){
    const hintCfg = getWorld4HintSpellConfig(levelId);
    if(hintCfg) return [hintCfg];

    const symbolList = Array.isArray(opts.availableSpellSymbols) ? opts.availableSpellSymbols : [];
    const seen = new Set();
    const configs = [];

    symbolList.forEach(symbol => {
      const cfg = getSpellConfigByObstacle(symbol);
      if(!cfg || seen.has(cfg.defType)) return;
      seen.add(cfg.defType);
      configs.push(cfg);
    });

    if(configs.length > 0) return configs;

    const fallback = getWorld4SpellConfig(levelId);
    return fallback ? [fallback] : [];
  }

  function getWorld4HintSpellConfig(levelId = ''){
    const map = {
      L1: 'L',
      L2: 'F',
      L3: 'X',
      L4: 'O'
    };
    const symbol = map[normalizeLevelId(levelId)] || 'L';
    return getSpellConfigByObstacle(symbol);
  }

  function buildToolbox(worldId, levelId = '', opts = {}){
    ensureDefinitions();

    // ✅ 改成「單一飛出工具箱」：所有目前關卡可用積木一次顯示，
    // 不需要學生先點分類標籤，適合 iPad 與國小課堂操作。
    const contents = [
      {kind:"block", type:"mw_move_forward"},
      {kind:"block", type:"mw_turn", fields:{ DIR:"left" }}
    ];

    if(worldId === "W2" || worldId === "W3" || worldId === "W4"){
      contents.push(loopRepeatBlockToolboxItem(3));
      if(worldId === "W3" || worldId === "W4"){
        contents.push({kind:"block", type:"mw_repeat_until_goal"});
      }
    }

    if(worldId === "W3" || worldId === "W4"){
      contents.push({kind:"block", type:"mw_if_path", fields:{ DIR:"ahead" }});
    }

    if(worldId === "W4"){
      const spellConfigs = getWorld4AvailableSpellConfigs(levelId, opts);
      spellConfigs.forEach(cfg => {
        contents.push({kind:"block", type:cfg.defType});
        contents.push({kind:"block", type:cfg.callType});
      });
    }

    return { kind:"flyoutToolbox", contents };
  }

  function buildWorld4PresetXml(levelId){
    const cfg = getWorld4HintSpellConfig(levelId) || getWorld4SpellConfig(levelId);
    if(!cfg) return '';
    return `
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="mw_start" x="20" y="20" deletable="false" movable="false"></block>
        <block type="${cfg.defType}" x="380" y="36"></block>
      </xml>
    `;
  }

  function enforceWorld4SingleSpell(workspace, levelId, opts = {}){
    if(!workspace) return false;
    const cfg = getWorld4HintSpellConfig(levelId) || getWorld4SpellConfig(levelId);
    if(!cfg) return false;

    let defs = (typeof workspace.getAllBlocks === 'function' ? workspace.getAllBlocks(false) : []).filter(block => block?.type === cfg.defType);
    let defBlock = defs[0] || null;
    defs.slice(1).forEach(block => { try{ block.dispose(false); }catch(_err){} });

    if(!defBlock){
      try{
        const block = workspace.newBlock?.(cfg.defType);
        if(block){
          block.initSvg?.();
          block.render?.();
          block.moveBy?.(380, 36);
          defBlock = block;
        }
      }catch(_err){}
    }

    if(defBlock){
      defBlock.setMovable?.(true);
      defBlock.setDeletable?.(false);
      defBlock.setEditable?.(true);
      if(opts.reposition !== false){
        try{
          const xy = typeof defBlock.getRelativeToSurfaceXY === 'function' ? defBlock.getRelativeToSurfaceXY() : {x:0,y:0};
          defBlock.moveBy?.(380 - Number(xy.x || 0), 36 - Number(xy.y || 0));
        }catch(_err){}
      }
    }

    ensureStartBlock(workspace);
    lockStartBlocks(workspace);
    return true;
  }

  function loadWorld4PresetSpell(workspace, levelId){
    const xmlText = buildWorld4PresetXml(levelId);
    if(!xmlText) return false;
    const ok = loadXmlText(workspace, xmlText);
    if(ok) enforceWorld4SingleSpell(workspace, levelId);
    return ok;
  }

  function createWorkspace(containerId, worldId, opts = {}){
    ensureDefinitions();

    const readOnly = !!opts.readOnly;
    const loadDefaultBlocks = opts.loadDefaultBlocks !== false;
    const trashcan = readOnly ? false : (opts.trashcan !== false);

    const toolbox = buildToolbox(worldId, opts.levelId || "", opts);

    const workspace = Blockly.inject(containerId, {
      toolbox,
      readOnly,
      grid: {spacing: 20, length: 3, colour: "rgba(255,255,255,.12)", snap: true},
      trashcan,
      zoom: {controls: true, wheel: true, startScale: 1.0, maxScale: 2, minScale: 0.6, scaleSpeed: 1.2}
    });

    if(loadDefaultBlocks){
      const xmlText = `
        <xml xmlns="https://developers.google.com/blockly/xml">
          <block type="mw_start" x="20" y="20" deletable="false" movable="false"></block>
        </xml>
      `;
      const xml = xmlTextToDom(xmlText);
      domToWorkspace(xml, workspace);
      lockStartBlocks(workspace);
      if(worldId === "W4"){
        enforceWorld4SingleSpell(workspace, opts.levelId || "", { reposition:true });
      }
    }

    return workspace;
  }

  function migrateLegacyStartInSerializedNode(node){
    if(!node || typeof node !== "object") return;

    const thisBlock = node.block && typeof node.block === "object" ? node.block : node;
    if(thisBlock && thisBlock.type === "mw_start" && thisBlock.inputs && thisBlock.inputs.DO && !thisBlock.next){
      const doInput = thisBlock.inputs.DO;
      const firstBlock = doInput.block || null;
      if(firstBlock){
        thisBlock.next = { block: firstBlock };
      }
      delete thisBlock.inputs.DO;
      if(thisBlock.inputs && Object.keys(thisBlock.inputs).length === 0){
        delete thisBlock.inputs;
      }
    }

    Object.keys(thisBlock || {}).forEach((key)=>{
      const value = thisBlock[key];
      if(Array.isArray(value)){
        value.forEach(item => migrateLegacyStartInSerializedNode(item));
      }else if(value && typeof value === "object"){
        migrateLegacyStartInSerializedNode(value);
      }
    });
  }

  function normalizeSerializedWorkspaceData(data){
    if(!data || typeof data !== "object") return data;
    try{
      const cloned = JSON.parse(JSON.stringify(data));
      migrateLegacyStartInSerializedNode(cloned);
      return cloned;
    }catch(_err){
      return data;
    }
  }

  function loadWorkspaceData(workspace, data){
    if(!workspace || !window.Blockly || !data) return false;
    try{
      ensureDefinitions();
      workspace.clear();
      const normalized = normalizeSerializedWorkspaceData(data);
      if(Blockly.serialization?.workspaces?.load){
        Blockly.serialization.workspaces.load(normalized, workspace);
      }else{
        return false;
      }
      ensureStartBlock(workspace);
      lockStartBlocks(workspace);
      return true;
    }catch(e){
      console.warn("loadWorkspaceData failed", e);
      return false;
    }
  }

  function loadSerializedText(workspace, textValue){
    if(!workspace || typeof textValue !== "string" || !textValue.trim()) return false;
    try{
      const parsed = JSON.parse(textValue);
      return loadWorkspaceData(workspace, parsed);
    }catch(_err){
      return false;
    }
  }

  function workspaceToAsyncCode(workspace){
    const js = getJavaScriptGenerator();
    if(!js) return "return (async () => {})();";
    const code = js.workspaceToCode(workspace);
    const safe = code.trim() ? code : "/* 沒有積木 */\n";
    return `
      return (async () => {
        ${safe}
      })();
    `;
  }

  function exportXmlText(workspace){
    if(!workspace) return "";
    const dom = workspaceToDom(workspace);
    return domToXmlText(dom);
  }

  function loadXmlText(workspace, xmlText){
    if(!workspace) return false;
    if(!xmlText || typeof xmlText !== "string") return false;
    try{
      ensureDefinitions();
      workspace.clear();
      const dom = xmlTextToDom(xmlText);
      domToWorkspace(dom, workspace);
      ensureStartBlock(workspace);
      lockStartBlocks(workspace);
      return true;
    }catch(e){
      console.warn("loadXmlText failed", e);
      return false;
    }
  }

  function getWorkspaceVisibleTargetXY(workspace, margin = 18){
    // Blockly 的 x/y 是「工作區座標」，不是畫面像素。
    // 若工作區載入草稿後自動捲動，單純把積木移到 x=20,y=20 仍可能不在目前可視區左上角。
    // 因此要先讀取目前可視區的 viewLeft/viewTop，再把起始積木放到可視區左上角。
    let viewLeft = 0;
    let viewTop = 0;
    try{
      const metrics = workspace?.getMetrics?.();
      viewLeft = Number(metrics?.viewLeft || 0);
      viewTop = Number(metrics?.viewTop || 0);
    }catch(_err){}
    return { x: viewLeft + margin, y: viewTop + margin };
  }

  function moveBlockStackTo(block, targetX, targetY){
    if(!block) return;
    try{
      const wasMovable = typeof block.isMovable === 'function' ? block.isMovable() : true;
      block.setMovable?.(true);
      const xy = typeof block.getRelativeToSurfaceXY === 'function'
        ? block.getRelativeToSurfaceXY()
        : { x: 0, y: 0 };
      block.moveBy?.(Number(targetX || 0) - Number(xy.x || 0), Number(targetY || 0) - Number(xy.y || 0));
      block.setMovable?.(wasMovable);
    }catch(_err){}
  }

  function placeStartBlockAtEditableTopLeft(workspace, startBlock){
    if(!workspace || !startBlock) return;
    try{ workspace.render?.(); }catch(_err){}
    const target = getWorkspaceVisibleTargetXY(workspace, 18);
    moveBlockStackTo(startBlock, target.x, target.y);
    try{ workspace.render?.(); }catch(_err){}
  }

  function ensureStartBlock(workspace){
    if(!workspace || !window.Blockly) return null;
    const allBlocks = typeof workspace.getAllBlocks === "function" ? workspace.getAllBlocks(false) : [];
    let startBlock = allBlocks.find(block => block?.type === "mw_start") || null;

    if(!startBlock){
      startBlock = workspace.newBlock("mw_start");
      startBlock.initSvg?.();
      startBlock.render?.();
    }

    const topBlocks = (typeof workspace.getTopBlocks === "function" ? workspace.getTopBlocks(true) : [])
      .filter(block => block && block.id !== startBlock.id);

    if(startBlock.nextConnection && !startBlock.nextConnection.targetConnection && topBlocks.length){
      const mainTopBlock = topBlocks[0];
      const previousConnection = mainTopBlock.previousConnection || null;
      if(previousConnection){
        try{ startBlock.nextConnection.connect(previousConnection); }catch(_err){}
      }
    }

    // ✅ 固定起始積木在「目前可視的可編輯區域」左上角。
    // 關鍵修正：不要只用 x=20,y=20；草稿或序列化資料載入後，Blockly 可能已經改變視窗 viewLeft/viewTop。
    placeStartBlockAtEditableTopLeft(workspace, startBlock);

    topBlocks.slice(1).forEach((block, index)=>{
      try{
        const target = getWorkspaceVisibleTargetXY(workspace, 18);
        moveBlockStackTo(block, target.x + 220 + index * 28, target.y + index * 28);
      }catch(_err){}
    });

    try{
      workspace.render?.();
      requestAnimationFrame?.(()=>{
        try{
          placeStartBlockAtEditableTopLeft(workspace, startBlock);
          lockStartBlocks(workspace);
          workspace.render?.();
        }catch(_err){}
      });
      setTimeout(()=>{
        try{
          placeStartBlockAtEditableTopLeft(workspace, startBlock);
          lockStartBlocks(workspace);
          workspace.render?.();
        }catch(_err){}
      }, 260);
    }catch(_err){}

    return startBlock;
  }

  function lockStartBlocks(workspace){
    if(!workspace?.getAllBlocks) return;
    workspace.getAllBlocks(false).forEach(block=>{
      if(block?.type === "mw_start"){
        block.setMovable(false);
        block.setDeletable(false);
        block.setEditable?.(false);
      }
    });
  }

  function countScoringBlocks(workspace){
    if(!workspace?.getAllBlocks) return 0;

    const allBlocks = workspace.getAllBlocks(false);
    const startBlock = allBlocks.find(block => block?.type === "mw_start");
    if(!startBlock) return 0;

    const visited = new Set();

    function shouldCount(block){
      if(!block) return false;
      if(typeof block.isShadow === "function" && block.isShadow()) return false;

      const type = String(block.type || "");
      if(type === "mw_start") return false;
      if(type === "math_number") return false;

      return true;
    }

    function walk(block){
      if(!block || visited.has(block.id)) return 0;
      visited.add(block.id);

      let total = shouldCount(block) ? 1 : 0;

      if(Array.isArray(block.inputList)){
        block.inputList.forEach(input => {
          const child = input?.connection?.targetBlock?.();
          if(child) total += walk(child);
        });
      }

      const nextBlock = block.getNextBlock?.();
      if(nextBlock) total += walk(nextBlock);

      return total;
    }

    const firstExecutable = startBlock.getNextBlock?.();
    if(!firstExecutable) return 0;

    return walk(firstExecutable);
  }

  return {
    createWorkspace,
    workspaceToAsyncCode,
    exportXmlText,
    loadXmlText,
    loadSerializedText,
    loadWorkspaceData,
    buildToolbox,
    countScoringBlocks,
    lockStartBlocks,
    ensureStartBlock,
    ensureDefinitions,
    normalizeSerializedWorkspaceData,
    getWorld4SpellConfig,
    getWorld4AvailableSpellConfigs,
    getWorld4HintSpellConfig,
    loadWorld4PresetSpell,
    enforceWorld4SingleSpell
  };
})();
