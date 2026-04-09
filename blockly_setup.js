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
    START: "#f4b400",
    SEQUENCE: "#34a853",
    LOOP: "#ea4335",
    CONDITION: "#4285f4",
    FUNCTION: "#ab47bc",
    NUMBER: "#f29900"
  };

  function getJavaScriptGenerator(){
    return Blockly.JavaScript || Blockly.javascriptGenerator || null;
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
        { "type":"mw_move_forward","message0":"向前走 1 格","previousStatement":null,"nextStatement":null,"colour":BLOCK_COLORS.SEQUENCE },
        { "type":"mw_turn_left","message0":"左轉","previousStatement":null,"nextStatement":null,"colour":BLOCK_COLORS.SEQUENCE },
        { "type":"mw_turn_right","message0":"右轉","previousStatement":null,"nextStatement":null,"colour":BLOCK_COLORS.SEQUENCE },
        { "type":"mw_path_ahead","message0":"前方有路？","output":"Boolean","colour":BLOCK_COLORS.CONDITION },
        { "type":"mw_if_path_ahead","message0":"如果前方有路 %1 就 %2 否則 %3","args0":[{"type":"input_dummy"},{"type":"input_statement","name":"DO"},{"type":"input_statement","name":"ELSE"}],"previousStatement":null,"nextStatement":null,"colour":BLOCK_COLORS.CONDITION,"tooltip":"先判斷前方能不能走，再決定要做什麼。","helpUrl":"" },
        {
          "type":"mw_func_def_a","message0":"定義咒語A 做 %1",
          "args0":[{"type":"input_statement","name":"DO"}],
          "colour":BLOCK_COLORS.FUNCTION,"tooltip":"把一段常用走法放進咒語A，之後可以重複施放。","helpUrl":""
        },
        { "type":"mw_func_call_a","message0":"施放咒語A","previousStatement":null,"nextStatement":null,"colour":BLOCK_COLORS.FUNCTION },
        {
          "type":"mw_func_def_b","message0":"定義咒語B 做 %1",
          "args0":[{"type":"input_statement","name":"DO"}],
          "colour":BLOCK_COLORS.FUNCTION,"tooltip":"把另一段常用走法放進咒語B。","helpUrl":""
        },
        { "type":"mw_func_call_b","message0":"施放咒語B","previousStatement":null,"nextStatement":null,"colour":BLOCK_COLORS.FUNCTION }
      ]);
    }

    recolorBuiltinBlocks();

    const js = getJavaScriptGenerator();
    if(!js) return;

    try{ js.STATEMENT_PREFIX = 'await api.__highlight(%1);\n'; }catch(_err){}

    js.forBlock = js.forBlock || {};

    js.forBlock["mw_start"] = function(block){
      const nextBlock = block.getNextBlock?.();
      return nextBlock ? js.blockToCode(nextBlock) : "";
    };

    js.forBlock["mw_move_forward"] = ()=> "await api.moveForward();\n";
    js.forBlock["mw_turn_left"]   = ()=> "await api.turnLeft();\n";
    js.forBlock["mw_turn_right"]  = ()=> "await api.turnRight();\n";

    const orderNone = js.ORDER_NONE ?? 99;
    js.forBlock["mw_path_ahead"] = ()=> ["await api.canMoveForward()", orderNone];

    js.forBlock["mw_if_path_ahead"] = function(block){
      const doCode = js.statementToCode(block, "DO");
      const elseCode = js.statementToCode(block, "ELSE");
      return `if (await api.canMoveForward()) {\n${doCode}} else {\n${elseCode}}\n`;
    };

    js.forBlock["mw_func_def_a"] = function(block){
      const body = js.statementToCode(block, "DO");
      return `async function spellA(){\n${body}}\n`;
    };
    js.forBlock["mw_func_call_a"] = ()=> "await spellA();\n";

    js.forBlock["mw_func_def_b"] = function(block){
      const body = js.statementToCode(block, "DO");
      return `async function spellB(){\n${body}}\n`;
    };
    js.forBlock["mw_func_call_b"] = ()=> "await spellB();\n";
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
      type:"controls_repeat_ext",
      inputs:{
        TIMES:{
          shadow:{
            type:"math_number",
            fields:{ NUM: Number(defaultTimes) || 3 }
          }
        }
      }
    };
  }

  function buildToolbox(worldId){
    ensureDefinitions();
    const contents = [];

    contents.push({
      kind:"category",
      name:"移動",
      colour:BLOCK_COLORS.SEQUENCE,
      contents:[
        {kind:"block", type:"mw_move_forward"},
        {kind:"block", type:"mw_turn_left"},
        {kind:"block", type:"mw_turn_right"}
      ]
    });

    if(worldId === "W2" || worldId === "W3" || worldId === "W4"){
      contents.push({
        kind:"category",
        name:"迴圈",
        colour:BLOCK_COLORS.LOOP,
        contents:[
          loopRepeatBlockToolboxItem(2),
          loopRepeatBlockToolboxItem(3),
          loopRepeatBlockToolboxItem(4)
        ]
      });
    }

    if(worldId === "W3" || worldId === "W4"){
      contents.push({
        kind:"category",
        name:"條件",
        colour:BLOCK_COLORS.CONDITION,
        contents:[
          {kind:"block", type:"mw_if_path_ahead"}
        ]
      });
    }

    if(worldId === "W4"){
      contents.push({
        kind:"category",
        name:"函式（咒語）",
        colour:BLOCK_COLORS.FUNCTION,
        contents:[
          {kind:"block", type:"mw_func_def_a"},
          {kind:"block", type:"mw_func_call_a"},
          {kind:"block", type:"mw_func_def_b"},
          {kind:"block", type:"mw_func_call_b"}
        ]
      });
    }

    return { kind:"categoryToolbox", contents };
  }

  function createWorkspace(containerId, worldId, opts = {}){
    ensureDefinitions();

    const readOnly = !!opts.readOnly;
    const loadDefaultBlocks = opts.loadDefaultBlocks !== false;
    const trashcan = readOnly ? false : (opts.trashcan !== false);

    const toolbox = buildToolbox(worldId);

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

  function ensureStartBlock(workspace){
    if(!workspace || !window.Blockly) return null;
    const allBlocks = typeof workspace.getAllBlocks === "function" ? workspace.getAllBlocks(false) : [];
    let startBlock = allBlocks.find(block => block?.type === "mw_start") || null;

    if(!startBlock){
      startBlock = workspace.newBlock("mw_start");
      startBlock.initSvg?.();
      startBlock.render?.();
      startBlock.moveBy?.(20, 20);
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

    topBlocks.slice(1).forEach((block, index)=>{
      try{
        block.moveBy?.(220 + index * 28, 20 + index * 28);
      }catch(_err){}
    });

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
    return workspace.getAllBlocks(false).filter(block=>{
      if(!block || (typeof block.isShadow === "function" && block.isShadow())) return false;
      const type = String(block.type || "");
      if(type === "mw_start") return false;
      if(type === "math_number") return false;
      return true;
    }).length;
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
    normalizeSerializedWorkspaceData
  };
})();
