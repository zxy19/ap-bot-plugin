var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Config: () => Config,
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(src_exports);
var import_koishi = require("koishi");

// src/data/database.ts
async function init(ctx) {
  ctx.model.extend("ap_uid_bind", {
    id: "unsigned",
    user: "string",
    uid: "string"
  }, {
    autoInc: true
  });
}
__name(init, "init");

// src/utils/api.ts
var apiBase;
var apiKey;
function initApi(config) {
  const url = config.apiUrl.replace(/\/+$/, "");
  const prefix = (config.apiPrefix || "").replace(/^\/+/, "").replace(/\/+$/, "");
  apiBase = prefix ? `${url}/${prefix}` : url;
  apiKey = config.apiKey || "";
}
__name(initApi, "initApi");
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
      throw new Error("API请求超时");
    }
    throw e;
  }
}
__name(get, "get");

// src/features/char.ts
function registerChar(ctx) {
  ctx.command("apchar <nameOrId:text>").action(async ({ session }, nameOrId) => {
    try {
      const data = await get(ctx, `/char/${encodeURIComponent(nameOrId)}`);
      return formatChar(data);
    } catch (e) {
      return `查询角色失败：${e.message}`;
    }
  });
}
__name(registerChar, "registerChar");
function formatChar(data) {
  const d = data.desc;
  const skills = data.skills?.pve;
  let result = `${d.title}:${d.name} (ID:${data.id})
`;
  result += `HP:${d.meta.hp} ATK:${d.meta.atk} DEF:${d.meta.def}
`;
  if (skills?.act) {
    result += `
[PVE主动技能] CD${skills.act.cd}
`;
    result += `${skills.act.name}: ${skills.act.desc}
`;
  }
  if (skills?.pas && skills.pas.length > 0) {
    result += `
[PVE被动技能]
`;
    skills.pas.forEach((p) => {
      result += `${p.name}: ${p.desc}
`;
    });
  }
  if (d.feature) {
    result += `
[角色特性]
${d.feature}
`;
  }
  return result;
}
__name(formatChar, "formatChar");

// src/features/chip.ts
function registerChip(ctx) {
  ctx.command("apchip <code:text>").action(async ({ session }, code) => {
    try {
      const data = await get(ctx, `/game/${encodeURIComponent(code)}`);
      return formatChip(data);
    } catch (e) {
      return `查询筹码失败：${e.message}`;
    }
  });
}
__name(registerChip, "registerChip");
function formatChip(data) {
  if (!data.players || data.players.length === 0) return "未找到游戏";
  let result = "局内筹码:\n\n";
  result += data.players.map((p) => {
    const tokens = (p.tokens || []).map((t) => `[${t.name}]`).join("");
    return `${p.name}(${p.char?.name || "?"})
${tokens || "(无)"}`;
  }).join("\n-----------------\n");
  return result;
}
__name(formatChip, "formatChip");

// src/features/game.ts
function registerGame(ctx) {
  ctx.command("apgame <code:text>").action(async ({ session }, code) => {
    try {
      const data = await get(ctx, `/game/${encodeURIComponent(code)}`);
      return formatGame(data);
    } catch (e) {
      return `查询对局失败：${e.message}`;
    }
  });
}
__name(registerGame, "registerGame");
function formatGame(data) {
  if (!data.players || data.players.length === 0) return "未找到游戏";
  let result = "游戏对局:\n\n";
  result += data.players.map((p) => {
    const cards = (p.cards || []).map((c) => `[${c.name}]`).join("");
    return `${p.name}(${p.char?.name || "?"}) CD[${p.skillCd || 0}]
${cards || "(无手牌)"}`;
  }).join("\n-----------------\n");
  return result;
}
__name(formatGame, "formatGame");

// src/data/uidBind.ts
async function getBoundUid(ctx, userId) {
  const rows = await ctx.database.get("ap_uid_bind", { user: userId });
  if (rows.length === 0) return null;
  return rows[0].uid;
}
__name(getBoundUid, "getBoundUid");
async function bindUid(ctx, userId, uid) {
  const existing = await ctx.database.get("ap_uid_bind", { user: userId });
  if (existing.length > 0) {
    await ctx.database.set("ap_uid_bind", { user: userId }, { uid });
  } else {
    await ctx.database.create("ap_uid_bind", { user: userId, uid });
  }
}
__name(bindUid, "bindUid");

// src/features/uid.ts
function registerUid(ctx) {
  ctx.command("apuid [uid:text]").action(async ({ session }, uid) => {
    const resolvedUid = uid || await getBoundUid(ctx, session.userId);
    if (!resolvedUid) {
      return "未提供UID，且未绑定。请使用 /apuid.bind <UID> 绑定，或直接 /apuid <UID> 查询";
    }
    try {
      const data = await get(ctx, `/player/${encodeURIComponent(resolvedUid)}`);
      return formatPlayer(data);
    } catch (e) {
      return `查询玩家失败：${e.message}`;
    }
  });
  ctx.command("apuid.bind <uid:text>").action(async ({ session }, uid) => {
    if (!uid || !/^\d+$/.test(uid)) {
      return "UID格式错误，请输入纯数字UID";
    }
    try {
      await bindUid(ctx, session.userId, uid);
      return `已绑定 UID: ${uid}`;
    } catch (e) {
      return `绑定失败：${e.message}`;
    }
  });
}
__name(registerUid, "registerUid");
function formatPlayer(data) {
  const formatTime = /* @__PURE__ */ __name((ts) => {
    const d = new Date(Number(ts) * 1e3 + 288e5);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }, "formatTime");
  const charMap = {};
  if (data.relatedChars) {
    for (const v of Object.values(data.relatedChars)) {
      charMap[v.id] = v.name;
    }
  }
  let result = `用户${data.name} (UID: ${data.playerId}) lv.${data.lv}
`;
  if (!data.isShowData) {
    result += "[信息未公开]\n";
  }
  const stats = data.statistics || {};
  result += `总场数: ${stats.fightCount || 0}
`;
  result += `胜场: ${stats.winFightCount || 0}
`;
  result += `角色总数: ${stats.roleCardCount || 0}
`;
  result += `最常使用角色: ${charMap[stats.useHero] || stats.useHero || ""}
`;
  result += `装扮数: ${stats.adornCount || 0}
`;
  result += `点赞数: ${data.praiseNum || 0}

`;
  result += "战绩:\n";
  if (!data.isShowFight) {
    result += "[战绩未公开]\n";
  }
  if (data.record && data.record.length > 0) {
    const latest = [...data.record].sort((a, b) => parseInt(b.time) - parseInt(a.time)).slice(0, 5);
    latest.forEach((game) => {
      let label = "";
      if (game.mapType !== 4) {
        label = `第${game.rank || 0}`;
      } else {
        if (game.rank === 1) label = "胜";
        else if (game.rank !== void 0) label = "负";
        else label = "掉线";
      }
      const charName = charMap[game.heroId] || game.heroId || "";
      result += `${formatTime(game.time)} ${label} ${charName}
`;
    });
  } else {
    result += "暂无战绩";
  }
  return result;
}
__name(formatPlayer, "formatPlayer");

// src/features/watch.ts
function registerWatch(ctx) {
  ctx.command("apwatch <roomNumber:text>").action(async ({ session }, roomNumber) => {
    const num = parseInt(roomNumber);
    if (isNaN(num) || num <= 0 || num > 999999) {
      return "房间号格式错误，应为1-6位纯数字";
    }
    const watchCode = (1e6 + num).toString(16).toUpperCase();
    return `房间号 ${num} → 观战码: ${watchCode}`;
  });
}
__name(registerWatch, "registerWatch");

// src/data/defmap.ts
var mapList = [
  { "id": 82007, "name": "星趴·梦想号" },
  { "id": 82008, "name": "御魂庆典" },
  { "id": 82010, "name": "水乡古镇" },
  { "id": 82012, "name": "魔法学院" },
  { "id": 82013, "name": "龙宫游乐园" },
  { "id": 82014, "name": "幽魂暗巷" },
  { "id": 82015, "name": "园林中庭" },
  { "id": 83001, "name": "海选赛运动场" },
  { "id": 83002, "name": "淘汰赛运动场" },
  { "id": 83003, "name": "决赛大赛场" }
];

// src/features/randomMap.ts
function registerRandomMap(ctx) {
  ctx.command("随机地图").action(async ({ session }) => {
    const map = mapList[Math.floor(Math.random() * mapList.length)];
    return `下一局就玩【${map.name}】吧`;
  });
}
__name(registerRandomMap, "registerRandomMap");

// src/reg.ts
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
__name(registerAll, "registerAll");

// src/index.ts
var name = "ap-api";
var inject = {
  required: ["database"]
};
var Config = import_koishi.Schema.object({
  apiUrl: import_koishi.Schema.string().required().description("API服务地址"),
  apiPrefix: import_koishi.Schema.string().required().description("API路径前缀"),
  apiKey: import_koishi.Schema.string().required().description("API访问密钥")
});
function apply(ctx, config) {
  ctx.on("ready", async () => {
    await init(ctx);
  });
  initApi(config);
  registerAll(ctx);
}
__name(apply, "apply");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Config,
  apply,
  inject,
  name
});
