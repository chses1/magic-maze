// levels.js
// ✅ 此檔由教師後台匯出，已內嵌目前瀏覽器儲存的最佳解法與最佳程式碼數
window.LEVELS = [
  {
    "worldId": "W1",
    "worldName": "世界1｜魔法學院（序列）",
    "theme": {
      "accent": "#7c5cff",
      "accent2": "#31d0ff",
      "wallBg": "rgba(35,28,85,.80)",
      "wallBd": "rgba(180,140,255,.22)",
      "itemBg": "rgba(124,92,255,.16)",
      "itemBd": "rgba(124,92,255,.28)",
      "blockBg": "rgba(255,146,64,.16)",
      "blockBd": "rgba(255,146,64,.28)"
    },
    "unlockRule": {
      "type": "always"
    },
    "levels": [
      {
        "levelId": "L1",
        "name": "第1關：學院走廊",
        "targetSteps": 14,
        "mapSize": 6,
        "itemReward": "魔力水晶",
        "equipmentReward": "頭盔",
        "startDir": 1,
        "map": [
          "######",
          "#S..C#",
          "####.#",
          "#.G#.#",
          "#D..K#",
          "######"
        ],
        "bestXml": "{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"mw_start\",\"id\":\"?d/^PZlbrF5B$Aez0Bv-\",\"x\":20,\"y\":20,\"deletable\":false,\"movable\":false,\"editable\":false,\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"TNDc/{aZ49-BUh-#aDe/\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"Drz5PJXuQ}{$chN?oo?[\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"*)F/}|%hjix]7p=1=UgF\",\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"bw[O,ASExVm_eKL+#*KE\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"I=;a*9xhg9WK.Vya2kE!\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"MNJf`PfIk]4}:2x|mo+Q\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"LVyIz:qFB3nh7#{,W+-t\",\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"G1)vQnVCRb3y*rIT4xr_\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"#9fqp%aq1`.Jq_i[)Vkq\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"7:mIw0HU(LWPx_E`rqQf\",\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"s!YH}rEAxinz(@|Eue_u\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"$t)sLSZ1/QCWmQDtWY=F\",\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"PO-a3Z.I1Ok`sQ{!Z;Id\",\"fields\":{\"DIR\":\"left\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"Cr1ay#33AWP*QLQ^$`nH\",\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"#uG}9W=%XoFZQXM{H7zN\",\"fields\":{\"DIR\":\"left\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"c1:vOZV2mIu2VBVYaN}v\"}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}]}}",
        "targetBlocks": 16
      },
      {
        "levelId": "L2",
        "name": "第2關：分岔教室",
        "targetSteps": 15,
        "mapSize": 7,
        "itemReward": "新生魔杖",
        "equipmentReward": "劍",
        "startDir": 1,
        "map": [
          "#######",
          "###C###",
          "###.###",
          "#S.K.D#",
          "###.###",
          "###G###",
          "#######"
        ],
        "bestXml": "{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"mw_start\",\"id\":\".hZFwS,hJbulDivH/*C5\",\"x\":20,\"y\":20,\"deletable\":false,\"movable\":false,\"editable\":false,\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"1+$w-VXW?EU6@+)G!8%u\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"+X,gt}wLLc$y`q[8KLGx\",\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\";d$10bF~2$PsE84Lqr1g\",\"fields\":{\"DIR\":\"left\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"Y[+cwoMSBq?+dR6^omaQ\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"*_ofxIfm(KoGE%68]8=!\",\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"Q!{k_U)`L4[2aawi_dqN\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"1Auv9L,mm2;QA`f[5Aa;\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"!bb^4UT+*K87Y$X~#MMf\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"h4s99yi_(|Up[+E~vj0B\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"yf_e4%_L[sEA.irm`BU}\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"~}-@bXO/-ZtOfq)+SD{E\",\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"SNbBnHmpepm0+!fa$ErM\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"W/1Kzbq.=7G1w9v16wsV\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"(;6g}~BTMi3VXE6=qB!_\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"Z)5iR~Xdzivl_:v}kf|%\",\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"rfd6BB0`}_L}5:ok7,/^\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"oyg7/z5Q605J:~QjuigC\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"(Xmw;7_OJ@^CN)XR:ao)\"}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}]}}",
        "targetBlocks": 18
      },
      {
        "levelId": "L3",
        "name": "第3關：圖書樓梯",
        "targetSteps": 16,
        "mapSize": 7,
        "itemReward": "學院法袍",
        "equipmentReward": "盔甲",
        "startDir": 1,
        "map": [
          "#######",
          "#S....#",
          "##K...#",
          "#.#C..#",
          "#..#G.#",
          "#...#D#",
          "#######"
        ],
        "bestXml": "{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"mw_start\",\"id\":\"l,)]V)t@9YCiFM;R!|BN\",\"x\":-309,\"y\":-448,\"deletable\":false,\"editable\":false,\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"1cytef@!eGHe,R$YNH|G\",\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\".CavGr%8^L1I_97D|CO=\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"v6H2(72dO;[G]^14iL,9\",\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"Hp0E/iL3KxhsbVlaLHF5\",\"fields\":{\"DIR\":\"left\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"DBkOzAS/dA0DD}XHh~Xh\",\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\")7M$;QM4eoq3FynS,-#+\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"!:~Ki(0Ou%$;Cf2k1)Tw\",\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"y(iclsI,n)M`Hmb$UW-^\",\"fields\":{\"DIR\":\"left\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"FZ8VqaqFq3Ae9Nb;Lxq(\",\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"@`kAZ`^:P?Cd)LQS!OX@\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"7=,]*xd?e^8d;/^qEc]0\",\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"0aihURar/oA6(b.XP~.?\",\"fields\":{\"DIR\":\"left\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\")0f_P;Z}l=-m9hu0:jL%\",\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"f3Y07{rK-Bm,`Aht(xl-\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"LYZ9ek(kohN!QL;ji,N+\"}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}]}}",
        "targetBlocks": 15
      },
      {
        "levelId": "L4",
        "name": "第4關：秘密試驗室",
        "targetSteps": 19,
        "mapSize": 7,
        "itemReward": "封印卷軸",
        "equipmentReward": "盾牌",
        "startDir": 2,
        "map": [
          "#######",
          "#S#P#D#",
          "#.#.#P#",
          "#.#.###",
          "#.....#",
          "#C.K.G#",
          "#######"
        ],
        "bestXml": "{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"mw_start\",\"id\":\"nmmULWH$no7W)y_B@+wm\",\"x\":20,\"y\":20,\"deletable\":false,\"movable\":false,\"editable\":false,\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"P@SvnhuIB?5h9if_78mP\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"oGS1#,RXNS$ev`)cgIwI\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"WQ)~*feVn}om@?QAz_9o\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"?0_1}O3_~T,xK_?j?LMV\",\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"5;b-s)y^E^+8*z/[r`W{\",\"fields\":{\"DIR\":\"left\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"kjse{/Ax58YUyq@*BOwu\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"+p/2.J.}jQ2rOZcZ7W#F\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"r0iK*)s-kR|uyWnON|T4\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"t4h8G8zH=17kBjhifWFv\",\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"sa%yz,kN^%f.w9jzXP7p\",\"fields\":{\"DIR\":\"left\"},\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"d!GycrQ6?M*g8X4oC#x:\",\"fields\":{\"DIR\":\"left\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"N9Mis_8eZp=J=s7)5)gf\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"5th]ojJ$%BB-jTAW~`y,\",\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"|CC}Ug#Vp~.Uet0MDo|#\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"!arb334PnByBFmLS-R[C\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"+[5.v5!#9`5%%):^2b-f\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"9{N5m3!UeGaX-kZ/qw$A\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"e8%-kDZOL)0^~niw{DRN\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"kMCJ[%[5Gp~2o6OEP-62\"}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}]}}",
        "targetBlocks": 19
      }
    ]
  },
  {
    "worldId": "W2",
    "worldName": "世界2｜符文森林（迴圈）",
    "theme": {
      "accent": "#3ddc84",
      "accent2": "#31d0ff",
      "wallBg": "rgba(14,50,40,.82)",
      "wallBd": "rgba(61,220,132,.22)",
      "portalBg": "rgba(78,227,165,.16)",
      "portalBd": "rgba(78,227,165,.28)",
      "monsterBg": "rgba(255,92,124,.16)",
      "monsterBd": "rgba(255,92,124,.28)",
      "itemBg": "rgba(61,220,132,.12)",
      "itemBd": "rgba(61,220,132,.22)"
    },
    "unlockRule": {
      "type": "passCountInWorld",
      "worldId": "W1",
      "need": 4
    },
    "levels": [
      {
        "levelId": "L1",
        "name": "第1關：森林入口",
        "targetSteps": 22,
        "mapSize": 11,
        "itemReward": "補血小藥水",
        "equipmentReward": "頭盔",
        "startDir": 1,
        "map": [
          "NNNNNNNNNNN",
          "NS..N..O..N",
          "N.N.NNNNN.N",
          "N.N.N.....N",
          "N.N.NONNNON",
          "N..CNK...DN",
          "NNN.N.NNN.N",
          "NP..N.....N",
          "NNNNN.NNN.N",
          "N.O.NG...PN",
          "NNNNNNNNNNN"
        ],
        "bestXml": "{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"mw_start\",\"id\":\",|MiFfI_agR$NWN9UQ%Z\",\"x\":20,\"y\":20,\"deletable\":false,\"movable\":false,\"editable\":false,\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"]m}/_nQgx_~F0$:|9Zd;\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"H/8e%,:Wg6D0.md/0[a_\",\"next\":{\"block\":{\"type\":\"mw_repeat_times\",\"id\":\"ZyEOFA{Sa,@f3jh!kn=B\",\"fields\":{\"TIMES\":\"2\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"G+[Dh/T=zM/?[DMi}WD5\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_repeat_times\",\"id\":\",yqFQ!PD,Tnal?7cE]M;\",\"fields\":{\"TIMES\":\"6\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"7h^uB$M-:5ZAId?~dAgS\"}}}}}}}},\"next\":{\"block\":{\"type\":\"mw_repeat_times\",\"id\":\"`RO698=Eevz;%,)Q^Hv$\",\"fields\":{\"TIMES\":\"2\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"A.iU83)l11z-N-JN{+0f\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_repeat_times\",\"id\":\"I?+YKEHrLn_S0Bao.2}P\",\"fields\":{\"TIMES\":\"4\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"[Ff_0,kM7#Q*z|Pa#YY+\"}}}}}}}}}}}}}}}}}]}}",
        "targetBlocks": 10
      },
      {
        "levelId": "L2",
        "name": "第2關：狼跡岔道",
        "targetSteps": 25,
        "mapSize": 11,
        "itemReward": "小刀攻擊",
        "equipmentReward": "盾牌",
        "startDir": 2,
        "map": [
          "NNNNNNNNNNN",
          "NS.TNN..Q.N",
          "N.NNNN.NN.N",
          "N..KNN.NN.N",
          "NNN.NN.NN.N",
          "N...NN.NN.N",
          "N.NNNN.NN.N",
          "NG..NNC..DN",
          "NNN.NNN.O.N",
          "N..QNNN...N",
          "NNNNNNNNNNN"
        ],
        "bestXml": "{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"mw_start\",\"id\":\"x=j/.=+[^@d7_ht9zD.L\",\"x\":20,\"y\":20,\"deletable\":false,\"movable\":false,\"editable\":false,\"next\":{\"block\":{\"type\":\"mw_repeat_times\",\"id\":\"1^k0mRv:im6YA`(tbuVS\",\"fields\":{\"TIMES\":\"2\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"h.d6uC,6i_5[%rR+k~Ys\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"$`z.vz++xWmUrxK!_$r*\",\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"PvLc$6Rp5K7lL1l[f)Qy\",\"fields\":{\"DIR\":\"left\"},\"next\":{\"block\":{\"type\":\"mw_repeat_times\",\"id\":\"2K7]Q=N]IV0~8,D0jpAx\",\"fields\":{\"TIMES\":\"2\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"1:|ZP.J[;IFm^Bs]^(?y\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"]56c/E?)E$RCu*qmfe@,\",\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"Du;1M6j%iRHEId6lu[cX\",\"fields\":{\"DIR\":\"right\"}}}}}}}},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"Ie22O$Mtw}eO%3#S+tbB\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"p(GA1^KPs,i2h~~NYyZy\",\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"R^2GOqksH^G_Zwy.!!%W\",\"fields\":{\"DIR\":\"left\"}}}}}}}}}}}}}}}},\"next\":{\"block\":{\"type\":\"mw_repeat_times\",\"id\":\"rLHcAe`/$`ACCE:=;(|v\",\"fields\":{\"TIMES\":\"6\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"-4n85w}J!Y#c1U{%eZ(o\"}}},\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\".}l;uOnZmBPj-elwgnJ=\",\"fields\":{\"DIR\":\"left\"},\"next\":{\"block\":{\"type\":\"mw_repeat_times\",\"id\":\")gc}7@aP2kB^ns,9tmtZ\",\"fields\":{\"TIMES\":\"3\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"Bgnjf@Yn-d$R)@n~EFR-\"}}}}}}}}}}}}]}}",
        "targetBlocks": 16
      },
      {
        "levelId": "L3",
        "name": "第3關：藤蔓迷徑",
        "targetSteps": 21,
        "mapSize": 11,
        "itemReward": "木盾防禦",
        "equipmentReward": "盔甲",
        "startDir": 1,
        "map": [
          "NNNNNNNNNNN",
          "NS...NR..DN",
          "N..N.NNNNNN",
          "N..N..N.O.N",
          "NK..PNN.N.N",
          "N...N.N.N.N",
          "NNNNNNN.N.N",
          "NP.CQNN.N.N",
          "NNNNNNN.N.N",
          "N..T.NQ.GRN",
          "NNNNNNNNNNN"
        ],
        "bestXml": "{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"mw_start\",\"id\":\"Nr1pM/y*;5*Y}s0_w3gQ\",\"x\":-370,\"y\":-470,\"deletable\":false,\"editable\":false,\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"e|CP2JUJY%;-D)y5bJFs\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_repeat_times\",\"id\":\"OZ/KYCLIE3f)A/L(,Oi#\",\"fields\":{\"TIMES\":\"3\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"}rWZX.I?HF`rgU2p`2g{\"}}},\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"g=Wcr!O!P43?4DU-*$SF\",\"fields\":{\"DIR\":\"left\"},\"next\":{\"block\":{\"type\":\"mw_repeat_times\",\"id\":\"+:k]vEmy])AAJ6Af1feW\",\"fields\":{\"TIMES\":\"4\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_repeat_times\",\"id\":\"O{s;[3.eKC:$g*JI~^`T\",\"fields\":{\"TIMES\":\"3\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"RSTG=Dmu--pE]jU_h.5s\"}}}}}}}}}}}}}}}]}}",
        "targetBlocks": 7
      },
      {
        "levelId": "L4",
        "name": "第4關：月影祭壇",
        "targetSteps": 11,
        "mapSize": 11,
        "itemReward": "冰凍藤蔓",
        "equipmentReward": "劍",
        "startDir": 2,
        "map": [
          "NNNNNNNNNNN",
          "NS........N",
          "N.NNNN..N.N",
          "N...GNQ.N.N",
          "N...PND.N.N",
          "N.NNNNNNN.N",
          "N.NRCNP...N",
          "N.N.QNKR..N",
          "N.N..NNNN.N",
          "N.........N",
          "NNNNNNNNNNN"
        ],
        "bestXml": "{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"mw_start\",\"id\":\"oAvbQOFhTE|4R7k6ve2i\",\"x\":-309,\"y\":-448,\"deletable\":false,\"editable\":false,\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"V~UY4UEvE-)gbkqEaQFn\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"(W|L*A:(;;@akVL{c;%,\",\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"a=_GsRgl3i.`wld{U{er\",\"fields\":{\"DIR\":\"left\"},\"next\":{\"block\":{\"type\":\"mw_repeat_times\",\"id\":\";7P`zV!dfz!c1qOkIEl_\",\"fields\":{\"TIMES\":\"3\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"Q[7ZPuJyLC-[[`Om^pB:\"}}},\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"0R^aP[N29}GK|Q[2F(k^\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"s}o8XrFF+#qM]ehB.dd.\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"9|YoH;b$Y4?S7NCt_-lL\",\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"W_ZC{jJXA.g$Cp[KMy${\",\"fields\":{\"DIR\":\"left\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"2XTO#XG8K6//St,:KW(8\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"_d^mf8*OX#/+vYM?qG}}\",\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"-@e+pU/`at,gIT8s?YmL\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\".0|ywjqv#znL|mn9BL.d\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"a`lR=K[c^uf9KQ*av-RY\"}}}}}}}}}}}}}}}}}}}}}}}}}}}]}}",
        "targetBlocks": 14
      }
    ]
  },
  {
    "worldId": "W3",
    "worldName": "世界3｜時光圖書館（條件式）",
    "theme": {
      "accent": "#ffd26e",
      "accent2": "#31d0ff",
      "wallBg": "rgba(70,55,20,.82)",
      "wallBd": "rgba(255,210,110,.22)",
      "itemBg": "rgba(255,210,110,.12)",
      "itemBd": "rgba(255,210,110,.22)",
      "monsterBg": "rgba(255,92,124,.14)",
      "monsterBd": "rgba(255,92,124,.25)",
      "portalBg": "rgba(49,208,255,.14)",
      "portalBd": "rgba(49,208,255,.22)",
      "blockBg": "rgba(255,146,64,.14)",
      "blockBd": "rgba(255,146,64,.25)"
    },
    "unlockRule": {
      "type": "passCountInWorld",
      "worldId": "W2",
      "need": 4
    },
    "levels": [
      {
        "levelId": "L1",
        "name": "第1關：書架走廊",
        "targetSteps": 32,
        "mapSize": 13,
        "itemReward": "時光沙漏",
        "equipmentReward": "頭盔",
        "startDir": 2,
        "map": [
          "BBBBBBBBBBBBB",
          "BS....B.....B",
          "B.BBB.B.BBBDB",
          "B...B.B..GB.B",
          "BBB.B.BBB.B.B",
          "B...B.T.B.B.B",
          "B.BBBBB.B.B.B",
          "B.BK.PB.B.B.B",
          "B.B.B.B.B.B.B",
          "BC..B.B..PB.B",
          "BBBBB.BBBBB.B",
          "B...T.......B",
          "BBBBBBBBBBBBB"
        ],
        "bestXml": "{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"mw_start\",\"id\":\"5]z6.{yZ-|[BZW(kjx$u\",\"x\":-250,\"y\":-410,\"deletable\":false,\"editable\":false,\"next\":{\"block\":{\"type\":\"mw_repeat_until_goal\",\"id\":\"*h?ot(^,i7kAkS?b7OK{\",\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_if_path\",\"id\":\"oD!.5Hrtbri`bcXaMTAV\",\"fields\":{\"DIR\":\"ahead\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"CNpg}HLlPZ5%Rnxbx/CK\"}},\"ELSE\":{\"block\":{\"type\":\"mw_if_path\",\"id\":\"B[~5,*Ltl]Xq0*NG(Ht#\",\"fields\":{\"DIR\":\"right\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"(l$I5q!Q]m/vXU}e?2_1\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"#F5_=TEg$-!dDs4#cv=A\"}}}},\"ELSE\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"N71W7rJ`2T8v-LqCAK.5\",\"fields\":{\"DIR\":\"left\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"=aGsvvo0l/4#LLbeTzPd\"}}}}}}}}}}}}}}]}}",
        "targetBlocks": 8
      },
      {
        "levelId": "L2",
        "name": "第2關：迷路書庫",
        "targetSteps": 36,
        "mapSize": 13,
        "itemReward": "館藏羽毛筆",
        "equipmentReward": "盾牌",
        "startDir": 1,
        "map": [
          "BBBBBBBBBBBBB",
          "BS....B.....B",
          "B.BBB.B.BBB.B",
          "B...B.BPBCB.B",
          "B.B.B.BBB.B.B",
          "B.BT..BPB.B.B",
          "B.BBBBBKB.B.B",
          "B.B.....B.B.B",
          "B.B.BBBBB.B.B",
          "B.T.B...B.B.B",
          "B.B.B.B.B.B.B",
          "B.G.BDB.....B",
          "BBBBBBBBBBBBB"
        ],
        "bestXml": "{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"mw_start\",\"id\":\"1Nm3)[@t:irD[4QFE`#A\",\"x\":20,\"y\":20,\"deletable\":false,\"movable\":false,\"editable\":false,\"next\":{\"block\":{\"type\":\"mw_repeat_until_goal\",\"id\":\"0wPI0ZL=Qd3CY_nvUwPn\",\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_if_path\",\"id\":\"SddzRnPPR$,|Rj~7}n.6\",\"fields\":{\"DIR\":\"right\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"qu|US6f,g`bF[p=wPF:V\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"f5Aq=lBcM0%w$Freq3v:\"}}}},\"ELSE\":{\"block\":{\"type\":\"mw_if_path\",\"id\":\"3d^C,*)bsQ+^4mB27X]d\",\"fields\":{\"DIR\":\"ahead\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"xb7yNHJbYA;D(ziw$4AW\"}},\"ELSE\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"X)d90KT|Iw3|*:~0XQ7*\",\"fields\":{\"DIR\":\"left\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"v;1QJ==YC.{c[i{8zddD\"}}}}}}}}}}}}}}]}}",
        "targetBlocks": 8
      },
      {
        "levelId": "L3",
        "name": "第3關：斷頁回廊",
        "targetSteps": 38,
        "mapSize": 13,
        "itemReward": "預言書頁",
        "equipmentReward": "盔甲",
        "startDir": 1,
        "map": [
          "BBBBBBBBBBBBB",
          "BSB...B...BDB",
          "B.B.B.B.B.B.B",
          "B.B.B.B.B.B.B",
          "B.BPB.B.B.B.B",
          "B.B.BTBPB.B.B",
          "B.B.B.B.B.B.B",
          "B.BGB.BTBCB.B",
          "B.B.B.B.B.B.B",
          "B.B.B.B.B.B.B",
          "B.B.B.B.B.B.B",
          "BK..T.B.B...B",
          "BBBBBBBBBBBBB"
        ],
        "bestXml": "{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"mw_start\",\"id\":\"Xem!*sPZa(Vsd]H=a5Xx\",\"x\":20,\"y\":20,\"deletable\":false,\"movable\":false,\"editable\":false,\"next\":{\"block\":{\"type\":\"mw_repeat_until_goal\",\"id\":\"iG@R[f(7[|.)+uxQx{(3\",\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_if_path\",\"id\":\"V;-a.%_.4rrG(:VEx3%z\",\"fields\":{\"DIR\":\"right\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"n-*p!SUf%QWW_Q,t|UB#\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\",$JbJ-@*5^J!2-1V.O2S\"}}}},\"ELSE\":{\"block\":{\"type\":\"mw_if_path\",\"id\":\"an;Jipc,0N;{(YkPiJxx\",\"fields\":{\"DIR\":\"left\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"~)9uIZ{2Pl$Cd!,pm,6*\",\"fields\":{\"DIR\":\"left\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"2G(@$!jL!P#L9+-uhW^P\"}}}},\"ELSE\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"mVLT|f60C9_i[RxGoJjU\"}}}}}}}}}}}}]}}",
        "targetBlocks": 8
      },
      {
        "levelId": "L4",
        "name": "第4關：時鐘大廳",
        "targetSteps": 41,
        "mapSize": 13,
        "itemReward": "時空鑰匙",
        "equipmentReward": "劍",
        "startDir": 1,
        "map": [
          "BBBBBBBBBBBBB",
          "B......B....B",
          "B......B.B..B",
          "B......B.B..B",
          "B.BBBB.BDB..B",
          "B.S..B.BBBB.B",
          "B....B..PB..B",
          "B.BBBB...B..B",
          "B.BK.P.....GB",
          "B.B.........B",
          "B.BBBB......B",
          "BC.......B..B",
          "BBBBBBBBBBBBB"
        ],
        "bestXml": "{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"mw_start\",\"id\":\"75`KtNpccTxaV1B?0eI]\",\"x\":20,\"y\":20,\"deletable\":false,\"movable\":false,\"editable\":false,\"next\":{\"block\":{\"type\":\"mw_repeat_until_goal\",\"id\":\"$e)tt~g,5R.mt=bX5:5k\",\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_if_path\",\"id\":\"upJ916qwo|yMNa4[[=e=\",\"fields\":{\"DIR\":\"ahead\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"UV{8%(W|QA~`j8s{{ges\"}},\"ELSE\":{\"block\":{\"type\":\"mw_if_path\",\"id\":\"J1q%lgOBF!G=rOJ3~b_j\",\"fields\":{\"DIR\":\"left\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_turn\",\"id\":\":Y]/|@{-N7AG5v[3*R3t\",\"fields\":{\"DIR\":\"left\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"mbf2hVRw82A_V_up$m2|\"}}}},\"ELSE\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"*ipCxVBS6QwR2LmKBB*[\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"PDu%i:dLt=/-!N/q1NCK\"}}}}}}}}}}}}}}]}}",
        "targetBlocks": 8
      }
    ]
  },
  {
    "worldId": "W4",
    "worldName": "世界4｜機械城堡（函式）",
    "theme": {
      "accent": "#ff5c7c",
      "accent2": "#31d0ff",
      "wallBg": "rgba(60,15,25,.82)",
      "wallBd": "rgba(255,92,124,.22)",
      "itemBg": "rgba(255,92,124,.12)",
      "itemBd": "rgba(255,92,124,.22)",
      "portalBg": "rgba(49,208,255,.14)",
      "portalBd": "rgba(49,208,255,.22)",
      "monsterBg": "rgba(255,210,110,.14)",
      "monsterBd": "rgba(255,210,110,.22)",
      "blockBg": "rgba(255,146,64,.14)",
      "blockBd": "rgba(255,146,64,.25)"
    },
    "unlockRule": {
      "type": "passCountInWorld",
      "worldId": "W3",
      "need": 4
    },
    "levels": [
      {
        "levelId": "L1",
        "name": "第1關：齒輪入口",
        "targetSteps": 40,
        "mapSize": 15,
        "itemReward": "齒輪核心",
        "equipmentReward": "頭盔",
        "startDir": 1,
        "map": [
          "MMMMMMMMMMMMMMM",
          "MS....LK..L...M",
          "M.MMM.L.MMMMMDM",
          "M...M.L.....M.M",
          "MMM.M.MMMMM.M.M",
          "M...M...M...M.M",
          "M.MMMMM.M.MMMLM",
          "M.M...M.M..PM.M",
          "M.M.M.MPMMM.M.M",
          "M.C.M.M...M.MLM",
          "MLMMM.MMM.M.MLM",
          "M...MG..M.M.MLM",
          "M...MMM.M.M.MLM",
          "M.....L...M...M",
          "MMMMMMMMMMMMMMM"
        ],
        "bestXml": "{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"mw_start\",\"id\":\"ctayl60m!C*{Xs8}2^6(\",\"x\":20,\"y\":20,\"deletable\":false,\"movable\":false,\"editable\":false,\"next\":{\"block\":{\"type\":\"mw_repeat_until_goal\",\"id\":\"*Qfs4UGo!%sPrzZU41n~\",\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_if_path\",\"id\":\")m81ind)jhW[%wD{`T{*\",\"fields\":{\"DIR\":\"right\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"R9g+Y33{S;5sU1go.pLR\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"i|#8DF[`Z,oPYAc8u;8)\"}}}},\"ELSE\":{\"block\":{\"type\":\"mw_if_path\",\"id\":\"J66tc:l!9+VQZNJ@QkP9\",\"fields\":{\"DIR\":\"left\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"8|(bA{EcF!!}j5P$Qe!3\",\"fields\":{\"DIR\":\"left\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"dTyPjFrsXV*,6yi`a,*Z\"}}}},\"ELSE\":{\"block\":{\"type\":\"mw_func_call_fly\",\"id\":\"w![-ppb;|JC;+cjd;)?5\",\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"M1hrTn.t=|s#|P0w4~Ey\"}}}}}}}}}}}}}},{\"type\":\"mw_func_def_fly\",\"id\":\"XVTUXXz@^/i`-c_A0~ns\",\"x\":270,\"y\":30,\"deletable\":false,\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"!d8V_#j!+kE~csH`A3{F\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\")luaUU7X{xV!o^IMKoKq\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"/fVU}_F.,[O/!fCM:fVX\",\"fields\":{\"DIR\":\"left\"},\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"X]KyQpWKoV5?R)~9Eqi?\",\"fields\":{\"DIR\":\"left\"}}}}}}}}}}}]}}",
        "targetBlocks": 9
      },
      {
        "levelId": "L2",
        "name": "第2關：蒸汽鍋爐室",
        "targetSteps": 44,
        "mapSize": 15,
        "itemReward": "蒸汽手套",
        "equipmentReward": "盾牌",
        "startDir": 1,
        "map": [
          "MMMMMMMMMMMMMMM",
          "MS.....RM...P.M",
          "M.MMMMM.M.MMMGM",
          "M....FM.MF..M.M",
          "MMMMM.M.MMM.M.M",
          "M...M.M...M.M.M",
          "M.M.M.MMM.M.M.M",
          "M.M.MC..M.MDM.M",
          "M.MMMMM.M.M.M.M",
          "M.....M.M.M.M.M",
          "MMM.M.M.M.M.M.M",
          "M...M.M.P.M.M.M",
          "M.MMM.MMMMM.M.M",
          "MR...F.....K..M",
          "MMMMMMMMMMMMMMM"
        ],
        "bestXml": "{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"mw_start\",\"id\":\"=q5G2`+QaQW%E@|#j%Gg\",\"x\":20,\"y\":20,\"deletable\":false,\"movable\":false,\"editable\":false,\"next\":{\"block\":{\"type\":\"mw_repeat_until_goal\",\"id\":\"4q?9!_e=Jpl8688V.9m[\",\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_if_path\",\"id\":\"A[)y)s)j*VhH!/o1rCd!\",\"fields\":{\"DIR\":\"left\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"=@}}L(M.xORpdtz@e-MN\",\"fields\":{\"DIR\":\"left\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"(NWW(A?8xsVjQQ(16c7R\"}}}},\"ELSE\":{\"block\":{\"type\":\"mw_if_path\",\"id\":\"Q~wWhCW-%#p)|]S!!LXt\",\"fields\":{\"DIR\":\"right\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"(m$NU/(ihRPb]W%`ivv1\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"TYA8@s@{lQFSZX~m3$qS\"}}}},\"ELSE\":{\"block\":{\"type\":\"mw_if_path\",\"id\":\"nnlOZ3_,L;KbedUOARoL\",\"fields\":{\"DIR\":\"ahead\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\":30$?o%J44PJL{BWxsB*\"}},\"ELSE\":{\"block\":{\"type\":\"mw_func_call_rain\",\"id\":\"lZvo4AK);{{H{)5vDD=h\"}}}}}}}}}}}}}}},{\"type\":\"mw_func_def_rain\",\"id\":\"D1Q-ctEBh2tM!UKysEK@\",\"x\":350,\"y\":50,\"deletable\":false,\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"hWRjlw[}{czT.wW]d2h7\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"[s_vn1ESyDiUJ+^L.L%Y\",\"fields\":{\"DIR\":\"left\"},\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"Vy.!m_5WVc}vr^9toqYv\",\"fields\":{\"DIR\":\"left\"},\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"(|3rK-3*q|:^_!GQ}BdJ\",\"fields\":{\"DIR\":\"right\"}}}}}}}}}}}]}}",
        "targetBlocks": 10
      },
      {
        "levelId": "L3",
        "name": "第3關：傳動核心",
        "targetSteps": 47,
        "mapSize": 15,
        "itemReward": "機械咒語晶片",
        "equipmentReward": "盔甲",
        "startDir": 1,
        "map": [
          "MMMMMMMMMMMMMMM",
          "MS....M...X...M",
          "M.MMM.M.MMMMMDM",
          "M...M.M.....M.M",
          "M.M.M.MMMMM.M.M",
          "M.MK..M...M.M.M",
          "MXMMMMM.M.MCM.M",
          "M...X...M.MXMXM",
          "MMM.MMMMMXM.M.M",
          "M...M..PM.M.M.M",
          "M.MMM.M.M.M.M.M",
          "MG..M.M...M.M.M",
          "MMM.M.MMMMM.M.M",
          "MP..M.......M.M",
          "MMMMMMMMMMMMMMM"
        ],
        "bestXml": "{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"mw_start\",\"id\":\"qZZtLAEEqX/#xLnzO`$r\",\"x\":20,\"y\":20,\"deletable\":false,\"movable\":false,\"editable\":false,\"next\":{\"block\":{\"type\":\"mw_repeat_until_goal\",\"id\":\"g}D`#,[HykLA#GxM-vfv\",\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_if_path\",\"id\":\"$V(P*+]mnY1TD./ebd:#\",\"fields\":{\"DIR\":\"ahead\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"E2W2WH#Pz-PObpB[RdCG\"}},\"ELSE\":{\"block\":{\"type\":\"mw_if_path\",\"id\":\"27:cHaUllU$3SnYc)n-]\",\"fields\":{\"DIR\":\"left\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"6Q!nYv~|cGlXV]iw3(ql\",\"fields\":{\"DIR\":\"left\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"i006RuUZ2!|ci38a]1O5\"}}}},\"ELSE\":{\"block\":{\"type\":\"mw_if_path\",\"id\":\"J}M^74JyB%gkvhH:TRWB\",\"fields\":{\"DIR\":\"right\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"dlGKI9=a^y49!d61qjCi\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"9XU=]$+Ouhft^:FYrW9i\"}}}},\"ELSE\":{\"block\":{\"type\":\"mw_func_call_fire\",\"id\":\"05,$DBqUqbigQwR=Ot_3\"}}}}}}}}}}}}}}},{\"type\":\"mw_func_def_fire\",\"id\":\"]]dx.BJ6_eGH4ZdiL`Xd\",\"x\":310,\"y\":30,\"deletable\":false,\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"g06IM;qddU~*fxB%54-e\",\"fields\":{\"DIR\":\"left\"},\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"bu=QprU*(uE:@:KuG$[i\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"|Fv%zjgglQ6GB]ee!op:\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"xWYHQeFjoD0nb@W[FHTD\",\"fields\":{\"DIR\":\"left\"}}}}}}}}}}}]}}",
        "targetBlocks": 10
      },
      {
        "levelId": "L4",
        "name": "第4關：王座控制室",
        "targetSteps": 50,
        "mapSize": 15,
        "itemReward": "傳動發條鑰匙",
        "equipmentReward": "劍",
        "startDir": 1,
        "map": [
          "MMMMMMMMMMMMMMM",
          "MS......MP....M",
          "M.MMMMM.M.MMMMM",
          "M.....MOM.M.M.M",
          "MMMMM.M.M.M.M.M",
          "M...MOM..KM.M.M",
          "M.M.M.MMM.M.MOM",
          "M.MOMG..M.M.MDM",
          "M.M.MMM.M.M.MOM",
          "MC....M.MOM.M.M",
          "MMM.M.M.M.M.M.M",
          "M...M.M.M.M.M.M",
          "M.MMMOM.M.M.M.M",
          "M..RMPM.M.MR..M",
          "MMMMMMMMMMMMMMM"
        ],
        "bestXml": "{\"blocks\":{\"languageVersion\":0,\"blocks\":[{\"type\":\"mw_start\",\"id\":\"1tPC^RUNipQ6$ye}WH3]\",\"x\":20,\"y\":20,\"deletable\":false,\"movable\":false,\"editable\":false,\"next\":{\"block\":{\"type\":\"mw_repeat_until_goal\",\"id\":\"DQ,=Ra;Xc)[:KmZ1fc4i\",\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_if_path\",\"id\":\"nF-_e]]/n[#S}{FAGN(c\",\"fields\":{\"DIR\":\"right\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"/e8{.4lj-D,oX)2YIxfx\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"NT7)bOvek97^]5;AcZaJ\"}}}},\"ELSE\":{\"block\":{\"type\":\"mw_if_path\",\"id\":\"V$@HsMiiM[HcaIZ8vm1L\",\"fields\":{\"DIR\":\"ahead\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\"ftZ^j#uE]wFk$WGYP9wp\"}},\"ELSE\":{\"block\":{\"type\":\"mw_if_path\",\"id\":\"NA}C7p%n*ra_A7!aJiMC\",\"fields\":{\"DIR\":\"left\"},\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"sriKx$aNx)x1rwb_dYyO\",\"fields\":{\"DIR\":\"left\"},\"next\":{\"block\":{\"type\":\"mw_move_forward\",\"id\":\".!i5wLu_4lsle(5+=Gph\"}}}},\"ELSE\":{\"block\":{\"type\":\"mw_turn\",\"id\":\")?IkcB,0d,m:@nu.T8^@\",\"fields\":{\"DIR\":\"left\"},\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"*Ex?6PP^:c@EN.#_P3}3\",\"fields\":{\"DIR\":\"left\"}}}}}}}}}}}},\"next\":{\"block\":{\"type\":\"mw_func_call_purify\",\"id\":\"|h@8ay7h#eb}T[iI-mqh\"}}}}}}}},{\"type\":\"mw_func_def_purify\",\"id\":\"*+oHNKz5Gi4FX;qfBV5z\",\"x\":370,\"y\":30,\"deletable\":false,\"inputs\":{\"DO\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"3Ipu?+,Xbbe!lH)SgB82\",\"fields\":{\"DIR\":\"left\"},\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"Lpx3zu9oECc?tRK_-Cv]\",\"fields\":{\"DIR\":\"left\"},\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\"gn=rmM,S$1/be=;}vHT_\",\"fields\":{\"DIR\":\"right\"},\"next\":{\"block\":{\"type\":\"mw_turn\",\"id\":\".(h=[:9!2;,!ssOmU4g^\",\"fields\":{\"DIR\":\"right\"}}}}}}}}}}}]}}",
        "targetBlocks": 12
      }
    ]
  }
];
