var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// external/ap-api/src/index.ts
var src_exports = {};
__export(src_exports, {
  Config: () => Config,
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(src_exports);
var import_koishi = require("koishi");

// external/ap-api/src/data/database.ts
async function init(ctx) {
  ctx.model.extend("ap_uid_bind", {
    id: "unsigned",
    user: "string",
    uid: "string"
  }, {
    autoInc: true
  });
}

// external/ap-api/src/utils/api.ts
var apiBase;
var apiKey;
function initApi(config) {
  const url = config.apiUrl.replace(/\/+$/, "");
  const prefix = (config.apiPrefix || "").replace(/^\/+/, "").replace(/\/+$/, "");
  apiBase = prefix ? `${url}/${prefix}` : url;
  apiKey = config.apiKey || "";
}
async function get(ctx, path) {
  const suffix = apiKey ? `@${apiKey}` : "";
  const url = `${apiBase}${path}${suffix}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1e4);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "Accept": "application/json" }
    });
    clearTimeout(timeout);
    if (!res.ok) {
      throw new Error(`API ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (e) {
    clearTimeout(timeout);
    if (e.name === "AbortError") {
      throw new Error("API\u8BF7\u6C42\u8D85\u65F6");
    }
    throw e;
  }
}

// external/ap-api/src/features/char.ts
function registerChar(ctx) {
  ctx.command("apchar <nameOrId:text>").action(async ({ session }, nameOrId) => {
    try {
      const data = await get(ctx, `/char/${encodeURIComponent(nameOrId)}`);
      return formatChar(data);
    } catch (e) {
      return `\u67E5\u8BE2\u89D2\u8272\u5931\u8D25\uFF1A${e.message}`;
    }
  });
}
function formatChar(data) {
  const d = data.desc;
  const skills = data.skills?.pve;
  let result = `${d.title}:${d.name} (ID:${data.id})
`;
  result += `HP:${d.meta.hp} ATK:${d.meta.atk} DEF:${d.meta.def}
`;
  if (skills?.act) {
    result += `
[PVE\u4E3B\u52A8\u6280\u80FD] CD${skills.act.cd}
`;
    result += `${skills.act.name}: ${skills.act.desc}
`;
  }
  if (skills?.pas && skills.pas.length > 0) {
    result += `
[PVE\u88AB\u52A8\u6280\u80FD]
`;
    skills.pas.forEach((p) => {
      result += `${p.name}: ${p.desc}
`;
    });
  }
  if (d.feature) {
    result += `
[\u89D2\u8272\u7279\u6027]
${d.feature}
`;
  }
  return result;
}

// external/ap-api/src/features/chip.ts
function registerChip(ctx) {
  ctx.command("apchip <code:text>").action(async ({ session }, code) => {
    try {
      const data = await get(ctx, `/game/${encodeURIComponent(code)}`);
      return formatChip(data);
    } catch (e) {
      return `\u67E5\u8BE2\u7B79\u7801\u5931\u8D25\uFF1A${e.message}`;
    }
  });
}
function formatChip(data) {
  if (!data.players || data.players.length === 0) return "\u672A\u627E\u5230\u6E38\u620F";
  let result = "\u5C40\u5185\u7B79\u7801:\n\n";
  result += data.players.map((p) => {
    const tokens = (p.tokens || []).map((t) => `[${t.name}]`).join("");
    return `${p.name}(${p.char?.name || "?"})
${tokens || "(\u65E0)"}`;
  }).join("\n-----------------\n");
  return result;
}

// external/ap-api/src/features/game.ts
function registerGame(ctx) {
  ctx.command("apgame <code:text>").action(async ({ session }, code) => {
    try {
      const data = await get(ctx, `/game/${encodeURIComponent(code)}`);
      return formatGame(data);
    } catch (e) {
      return `\u67E5\u8BE2\u5BF9\u5C40\u5931\u8D25\uFF1A${e.message}`;
    }
  });
}
function formatGame(data) {
  if (!data.players || data.players.length === 0) return "\u672A\u627E\u5230\u6E38\u620F";
  let result = "\u6E38\u620F\u5BF9\u5C40:\n\n";
  result += data.players.map((p) => {
    const cards = (p.cards || []).map((c) => `[${c.name}]`).join("");
    return `${p.name}(${p.char?.name || "?"}) CD[${p.skillCd || 0}]
${cards || "(\u65E0\u624B\u724C)"}`;
  }).join("\n-----------------\n");
  return result;
}

// external/ap-api/src/data/uidBind.ts
async function getBoundUid(ctx, userId) {
  const rows = await ctx.database.get("ap_uid_bind", { user: userId });
  if (rows.length === 0) return null;
  return rows[0].uid;
}
async function bindUid(ctx, userId, uid) {
  const existing = await ctx.database.get("ap_uid_bind", { user: userId });
  if (existing.length > 0) {
    await ctx.database.set("ap_uid_bind", { user: userId }, { uid });
  } else {
    await ctx.database.create("ap_uid_bind", { user: userId, uid });
  }
}

// external/ap-api/src/features/uid.ts
function registerUid(ctx) {
  ctx.command("apuid [uid:text]").action(async ({ session }, uid) => {
    const resolvedUid = uid || await getBoundUid(ctx, session.userId);
    if (!resolvedUid) {
      return "\u672A\u63D0\u4F9BUID\uFF0C\u4E14\u672A\u7ED1\u5B9A\u3002\u8BF7\u4F7F\u7528 /apuid.bind <UID> \u7ED1\u5B9A\uFF0C\u6216\u76F4\u63A5 /apuid <UID> \u67E5\u8BE2";
    }
    try {
      const data = await get(ctx, `/player/${encodeURIComponent(resolvedUid)}`);
      return formatPlayer(data);
    } catch (e) {
      return `\u67E5\u8BE2\u73A9\u5BB6\u5931\u8D25\uFF1A${e.message}`;
    }
  });
  ctx.command("apuid.bind <uid:text>").action(async ({ session }, uid) => {
    if (!uid || !/^\d+$/.test(uid)) {
      return "UID\u683C\u5F0F\u9519\u8BEF\uFF0C\u8BF7\u8F93\u5165\u7EAF\u6570\u5B57UID";
    }
    try {
      await bindUid(ctx, session.userId, uid);
      return `\u5DF2\u7ED1\u5B9A UID: ${uid}`;
    } catch (e) {
      return `\u7ED1\u5B9A\u5931\u8D25\uFF1A${e.message}`;
    }
  });
}
function formatPlayer(data) {
  const formatTime = (ts) => {
    const d = new Date(Number(ts) * 1e3 + 288e5);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  const charMap = {};
  if (data.relatedChars) {
    for (const v of Object.values(data.relatedChars)) {
      charMap[v.id] = v.name;
    }
  }
  let result = `\u7528\u6237${data.name} (UID: ${data.playerId}) lv.${data.lv}
`;
  if (!data.isShowData) {
    result += "[\u4FE1\u606F\u672A\u516C\u5F00]\n";
  }
  const stats = data.statistics || {};
  result += `\u603B\u573A\u6570: ${stats.fightCount || 0}
`;
  result += `\u80DC\u573A: ${stats.winFightCount || 0}
`;
  result += `\u89D2\u8272\u603B\u6570: ${stats.roleCardCount || 0}
`;
  result += `\u6700\u5E38\u4F7F\u7528\u89D2\u8272: ${charMap[stats.useHero] || stats.useHero || ""}
`;
  result += `\u88C5\u626E\u6570: ${stats.adornCount || 0}
`;
  result += `\u70B9\u8D5E\u6570: ${data.praiseNum || 0}

`;
  result += "\u6218\u7EE9:\n";
  if (!data.isShowFight) {
    result += "[\u6218\u7EE9\u672A\u516C\u5F00]\n";
  }
  if (data.record && data.record.length > 0) {
    const latest = [...data.record].sort((a, b) => parseInt(b.time) - parseInt(a.time)).slice(0, 5);
    latest.forEach((game) => {
      let label = "";
      if (game.mapType !== 4) {
        label = `\u7B2C${game.rank || 0}`;
      } else {
        if (game.rank === 1) label = "\u80DC";
        else if (game.rank !== void 0) label = "\u8D1F";
        else label = "\u6389\u7EBF";
      }
      const charName = charMap[game.heroId] || game.heroId || "";
      result += `${formatTime(game.time)} ${label} ${charName}
`;
    });
  } else {
    result += "\u6682\u65E0\u6218\u7EE9";
  }
  return result;
}

// external/ap-api/src/features/watch.ts
function registerWatch(ctx) {
  ctx.command("apwatch <roomNumber:text>").action(async ({ session }, roomNumber) => {
    const num = parseInt(roomNumber);
    if (isNaN(num) || num <= 0 || num > 999999) {
      return "\u623F\u95F4\u53F7\u683C\u5F0F\u9519\u8BEF\uFF0C\u5E94\u4E3A1-6\u4F4D\u7EAF\u6570\u5B57";
    }
    const watchCode = (1e6 + num).toString(16).toUpperCase();
    return `\u623F\u95F4\u53F7 ${num} \u2192 \u89C2\u6218\u7801: ${watchCode}`;
  });
}

// external/ap-api/src/data/defmap.ts
var mapList = [
  { "id": 82007, "name": "\u661F\u8DB4\xB7\u68A6\u60F3\u53F7" },
  { "id": 82008, "name": "\u5FA1\u9B42\u5E86\u5178" },
  { "id": 82010, "name": "\u6C34\u4E61\u53E4\u9547" },
  { "id": 82012, "name": "\u9B54\u6CD5\u5B66\u9662" },
  { "id": 82013, "name": "\u9F99\u5BAB\u6E38\u4E50\u56ED" },
  { "id": 82014, "name": "\u5E7D\u9B42\u6697\u5DF7" },
  { "id": 82015, "name": "\u56ED\u6797\u4E2D\u5EAD" }
];

// external/ap-api/src/features/randomMap.ts
var PVE_MAP_IDS = [82007, 82008, 82010, 82012, 82013, 82014, 82015];
function registerRandomMap(ctx) {
  ctx.command("\u968F\u673A\u5730\u56FE").action(async ({ session }) => {
    const pveMaps = mapList.filter((m) => PVE_MAP_IDS.includes(m.id));
    if (pveMaps.length === 0) return "\u672A\u627E\u5230PVE\u5730\u56FE";
    const map = pveMaps[Math.floor(Math.random() * pveMaps.length)];
    return `\u968F\u673APVE\u5730\u56FE: ${map.name} (ID:${map.id})`;
  });
}

// external/ap-api/src/reg.ts
var features = [
  registerChar,
  registerChip,
  registerGame,
  registerUid,
  registerWatch,
  registerRandomMap
];
function registerAll(ctx) {
  features.forEach((f) => f(ctx));
}

// external/ap-api/src/index.ts
var name = "ap-api";
var inject = {
  required: ["database"]
};
var Config = import_koishi.Schema.object({
  apiUrl: import_koishi.Schema.string().required().description("API\u670D\u52A1\u5730\u5740"),
  apiPrefix: import_koishi.Schema.string().required().description("API\u8DEF\u5F84\u524D\u7F00"),
  apiKey: import_koishi.Schema.string().required().description("API\u8BBF\u95EE\u5BC6\u94A5")
});
function apply(ctx, config) {
  ctx.on("ready", async () => {
    await init(ctx);
  });
  initApi(config);
  registerAll(ctx);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Config,
  apply,
  inject,
  name
});
