// Shared language helpers for the student-facing pages.
window.MagicMazeI18n = (() => {
  const KEY = "magic_maze_lang_v1";
  const supported = new Set(["zh", "en"]);

  function normalize(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (raw.startsWith("en")) return "en";
    if (raw.startsWith("zh")) return "zh";
    return "";
  }

  function getLang() {
    const urlLang = normalize(new URL(location.href).searchParams.get("lang"));
    if (urlLang) {
      try { localStorage.setItem(KEY, urlLang); } catch (_err) {}
      return urlLang;
    }
    try {
      const stored = normalize(localStorage.getItem(KEY));
      if (stored) return stored;
    } catch (_err) {}
    return "zh";
  }

  function setLang(lang) {
    const next = supported.has(lang) ? lang : "zh";
    try { localStorage.setItem(KEY, next); } catch (_err) {}
    return next;
  }

  function pick(value, lang = getLang()) {
    if (!value || typeof value !== "object") return value;
    return value[lang] ?? value.zh ?? value.en ?? "";
  }

  function withLang(url, lang = getLang()) {
    const target = new URL(url, location.href);
    target.searchParams.set("lang", lang);
    return target.pathname.split("/").pop() + target.search;
  }

  function levelNumber(levelId) {
    const raw = String(levelId || "").trim();
    const match = raw.match(/(\d+)/);
    return match ? Number(match[1]) : 1;
  }

  const worldNames = {
    W1: { zh: "世界1｜魔法學院（序列）", en: "World 1 | Magic Academy (Sequence)" },
    W2: { zh: "世界2｜符文森林（迴圈）", en: "World 2 | Rune Forest (Loops)" },
    W3: { zh: "世界3｜時光圖書館（條件式）", en: "World 3 | Time Library (Conditionals)" },
    W4: { zh: "世界4｜機械城堡（函式）", en: "World 4 | Mechanical Castle (Functions)" }
  };

  const shortWorldNames = {
    W1: { zh: "魔法學院", en: "Magic Academy" },
    W2: { zh: "符文森林", en: "Rune Forest" },
    W3: { zh: "時光圖書館", en: "Time Library" },
    W4: { zh: "機械城堡", en: "Mechanical Castle" }
  };

  const levelNames = {
    W1: ["Academy Hallway", "Forked Classroom", "Library Stairs", "Secret Lab"],
    W2: ["Forest Entrance", "Runic Path", "Vine Crossing", "Moonlit Grove"],
    W3: ["Reading Room", "Clock Corridor", "Prophecy Shelves", "Time Lock"],
    W4: ["Gear Gate", "Steam Hall", "Circuit Bridge", "Clockwork Core"]
  };

  function normalizeWorldId(worldId) {
    const raw = String(worldId || "").trim();
    const match = raw.match(/(?:world|w)\s*(\d+)/i);
    return match ? `W${match[1]}` : raw.toUpperCase();
  }

  function getWorldName(worldId, fallback = "") {
    const key = normalizeWorldId(worldId);
    return pick(worldNames[key]) || fallback || key;
  }

  function getShortWorldName(worldId, fallback = "") {
    const key = normalizeWorldId(worldId);
    return pick(shortWorldNames[key]) || fallback || key;
  }

  function getLevelName(worldId, levelId, fallback = "") {
    if (getLang() !== "en") return fallback;
    if (/boss/i.test(String(levelId || ""))) return "Boss Battle";
    const key = normalizeWorldId(worldId);
    const n = levelNumber(levelId);
    const name = levelNames[key]?.[n - 1] || `Level ${n}`;
    return `Level ${n}: ${name}`;
  }

  return { getLang, setLang, pick, withLang, normalizeWorldId, getWorldName, getShortWorldName, getLevelName };
})();
