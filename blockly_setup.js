// blockly_setup.js
// 需要在 game.html / teacher.html 載入：blockly.min.js + msg/zh-hant.js
// 並在建立 workspace 前呼叫：Blockly.setLocale(Blockly.Msg)

window.BlocklySetup = (()=>{

  // ✅（選配）用國小友善字詞
  function applyKidFriendlyMsgs(){
    if (window.Blockly && Blockly.Msg) {
      Blockly.Msg.CONTROLS_REPEAT_TITLE = "重複 %1 次";
      Blockly.Msg.CONTROLS_REPEAT_INPUT_DO = "做";
      Blockly.Msg.CONTROLS_IF_MSG_IF = "如果";
      Blockly.Msg.CONTROLS_IF_MSG_THEN = "就";
      Blockly.Msg.CONTROLS_IF_MSG_ELSE = "否則";
    }
  }

  // -------------------------------
  // ✅ Blockly XML 相容層（修正你截圖的 textToDom 問題）
  // -------------------------------
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

  // -------------------------------
  // ✅ 自訂積木（移動 + 感測器 + 函式）
  // -------------------------------
  function defineCustomBlocksOnce(){
    if(!window.Blockly) return;

    if(Blockly.Blocks["mw_move_forward"]) return;

    Blockly.defineBlocksWithJsonArray([
      { "type":"mw_move_forward","message0":"向前走 1 格","previousStatement":null,"nextStatement":null,"colour":"#7c5cff" },
      { "type":"mw_turn_left","message0":"左轉","previousStatement":null,"nextStatement":null,"colour":"#7c5cff" },
      { "type":"mw_turn_right","message0":"右轉","previousStatement":null,"nextStatement":null,"colour":"#7c5cff" },

      { "type":"mw_path_ahead","message0":"前方有路？","output":"Boolean","colour":"#ffd26e" },

      {
        "type":"mw_func_def_a","message0":"定義咒語A 做 %1",
        "args0":[{"type":"input_statement","name":"DO"}],
        "colour":"#ff5c7c","tooltip":"把一段常用走法放進咒語A，之後可以重複施放。","helpUrl":""
      },
      { "type":"mw_func_call_a","message0":"施放咒語A","previousStatement":null,"nextStatement":null,"colour":"#ff5c7c" },

      {
        "type":"mw_func_def_b","message0":"定義咒語B 做 %1",
        "args0":[{"type":"input_statement","name":"DO"}],
        "colour":"#ff5c7c","tooltip":"把另一段常用走法放進咒語B。","helpUrl":""
      },
      { "type":"mw_func_call_b","message0":"施放咒語B","previousStatement":null,"nextStatement":null,"colour":"#ff5c7c" }
    ]);

    const js = Blockly.JavaScript;

    // ✅ 步進除錯：每個「指令積木」執行前先反白目前積木
    js.STATEMENT_PREFIX = 'await api.__highlight(%1);\n';

    js.forBlock["mw_move_forward"] = ()=> "await api.moveForward();\n";
    js.forBlock["mw_turn_left"]   = ()=> "await api.turnLeft();\n";
    js.forBlock["mw_turn_right"]  = ()=> "await api.turnRight();\n";

    js.forBlock["mw_path_ahead"] = ()=> ["await api.canMoveForward()", js.ORDER_NONE];

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

  // -------------------------------
  // ✅ 依世界解鎖工具箱
  // -------------------------------
  function buildToolbox(worldId){
    const contents = [];

    contents.push({
      kind:"category",
      name:"移動",
      colour:"#7c5cff",
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
        colour:"#31d0ff",
        contents:[
          {kind:"block", type:"controls_repeat_ext"},
          {kind:"block", type:"controls_whileUntil"}
        ]
      });
      contents.push({
        kind:"category",
        name:"數字",
        colour:"#ffd26e",
        contents:[ {kind:"block", type:"math_number"} ]
      });
    }

    if(worldId === "W3" || worldId === "W4"){
      contents.push({
        kind:"category",
        name:"條件",
        colour:"#ffd26e",
        contents:[
          {kind:"block", type:"controls_if"},
          {kind:"block", type:"mw_path_ahead"}
        ]
      });
    }

    if(worldId === "W4"){
      contents.push({
        kind:"category",
        name:"函式（咒語）",
        colour:"#ff5c7c",
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
    applyKidFriendlyMsgs();
    defineCustomBlocksOnce();

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
          <block type="mw_move_forward" x="20" y="20"></block>
        </xml>
      `;
      const xml = xmlTextToDom(xmlText);
      domToWorkspace(xml, workspace);
    }

    return workspace;
  }

  function workspaceToAsyncCode(workspace){
    const code = Blockly.JavaScript.workspaceToCode(workspace);
    const safe = code.trim() ? code : "/* 沒有積木 */\n";
    return `
      return (async () => {
        ${safe}
      })();
    `;
  }

  // ✅ 匯出/匯入 XML（教師後台也會用到）
  function exportXmlText(workspace){
    if(!workspace) return "";
    const dom = workspaceToDom(workspace);
    return domToXmlText(dom);
  }

  function loadXmlText(workspace, xmlText){
    if(!workspace) return false;
    if(!xmlText || typeof xmlText !== "string") return false;
    try{
      workspace.clear();
      const dom = xmlTextToDom(xmlText);
      domToWorkspace(dom, workspace);
      return true;
    }catch(e){
      console.warn("loadXmlText failed", e);
      return false;
    }
  }

  return {
    createWorkspace,
    workspaceToAsyncCode,
    exportXmlText,
    loadXmlText,
    buildToolbox
  };
})();
