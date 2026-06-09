const { Context } = require('koishi')
const MockBot = require('@koishijs/plugin-mock').default
const MemoryDriver = require('@koishijs/plugin-database-memory').default
const assert = require('node:assert')
const test = require('node:test')

let app, client

test.before(async () => {
  app = new Context()
  app.plugin(MemoryDriver, {})
  app.plugin(MockBot, { selfId: '514' })
  app.plugin(require('../src/index'), { apiUrl: 'http://localhost:9999', apiPrefix: 'test', apiKey: 'test_key' })
  await app.start()
})

test.after(async () => {
  try { await app.stop() } catch (_) { /* mock plugin known dispose issue */ }
})

test.beforeEach(() => {
  client = app.mock.client('user123', 'channel456')
  globalThis.fetch = null
})

function mockOK(data) {
  globalThis.fetch = async () => ({
    ok: true, status: 200, statusText: 'OK', json: async () => data,
  })
}

function mockError(msg) {
  globalThis.fetch = async () => { throw new Error(msg) }
}

// ========== apwatch ==========
test('apwatch converts room number to watch code', async () => {
  const [r] = await client.receive('apwatch 123456', 1)
  assert.ok(r.includes('房间号 123456'))
  assert.ok(r.includes('观战码:'))
})

test('apwatch room 1 = F4241', async () => {
  const [r] = await client.receive('apwatch 1', 1)
  assert.ok(r.includes('F4241'))
})

test('apwatch rejects non-numeric input', async () => {
  const [r] = await client.receive('apwatch abc', 1)
  assert.ok(r.includes('房间号格式错误'))
})

test('apwatch rejects > 999999', async () => {
  const [r] = await client.receive('apwatch 1000000', 1)
  assert.ok(r.includes('房间号格式错误'))
})

// ========== 随机地图 ==========
test('随机地图 returns valid PVE map', async () => {
  const known = ['星趴·梦想号', '御魂庆典', '水乡古镇', '魔法学院', '龙宫游乐园', '幽魂暗巷', '园林中庭']
  const [r] = await client.receive('随机地图', 1)
  assert.match(r, /^随机PVE地图: .+ \(ID:\d+\)$/)
  assert.ok(known.some(m => r.includes(m)), `Unknown map: ${r}`)
})

// ========== apchar ==========
test('apchar shows PVE character info', async () => {
  mockOK({
    id: 102,
    name: { name: '古怪神探:芬妮', id: 102 },
    skills: {
      pvp: { act: { id: 10201, name: 'P', desc: 'p', cd: 3 }, pas: [] },
      pve: {
        act: { id: 10201, name: '麻烦制造者', desc: '触发事件。', cd: 3 },
        pas: [{ id: 10211, name: '华点发现！', desc: '获得星币。', cd: null }],
      },
    },
    desc: { id: 102, name: '芬妮', title: '古怪神探', story: '...', feature: '特殊机制', meta: { hp: 10, atk: 1, def: 2 } },
  })
  const [r] = await client.receive('apchar 102', 1)
  assert.ok(r.includes('古怪神探:芬妮'))
  assert.ok(r.includes('HP:10 ATK:1 DEF:2'))
  assert.ok(r.includes('[PVE主动技能]'))
  assert.ok(r.includes('麻烦制造者'))
  assert.ok(r.includes('[PVE被动技能]'))
  assert.ok(r.includes('华点发现！'))
  assert.ok(r.includes('[角色特性]'))
  assert.ok(r.includes('特殊机制'))
})

test('apchar no feature section when empty', async () => {
  mockOK({
    id: 101,
    name: { name: '商业之主:帕露南', id: 101 },
    skills: { pve: { act: { id: 10101, name: '利益最大化', desc: '获得星币。', cd: 2 }, pas: [] } },
    desc: { id: 101, name: '帕露南', title: '商业之主', story: '...', feature: '', meta: { hp: 10, atk: 1, def: 2 } },
  })
  const [r] = await client.receive('apchar 帕露南', 1)
  assert.ok(r.includes('商业之主:帕露南'))
  assert.ok(!r.includes('[角色特性]'))
})

test('apchar handles API not found', async () => {
  mockError('Not Found')
  const [r] = await client.receive('apchar 999', 1)
  assert.ok(r.includes('查询角色失败'))
})

// ========== apchip ==========
test('apchip shows player tokens', async () => {
  mockOK({
    players: [
      { name: '玩家A', uid: 1, skillCd: 3, cards: [], char: { name: '商业之主:帕露南', id: 101 }, tokens: [{ name: '拳击手套-初级', level: 1, id: 50001 }] },
      { name: '玩家B', uid: 2, skillCd: 2, cards: [], char: { name: '暗影忍者:小町', id: 104 }, tokens: [{ name: '速度轮滑-中级', level: 2, id: 50005 }] },
    ],
  })
  const [r] = await client.receive('apchip ABC', 1)
  assert.ok(r.includes('局内筹码'))
  assert.ok(r.includes('玩家A'))
  assert.ok(r.includes('[拳击手套-初级]'))
  assert.ok(r.includes('玩家B'))
  assert.ok(r.includes('[速度轮滑-中级]'))
})

test('apchip shows no tokens correctly', async () => {
  mockOK({ players: [{ name: '玩家C', uid: 3, skillCd: 0, cards: [], char: { name: '机械超人:梅加斯', id: 122 }, tokens: [] }] })
  const [r] = await client.receive('apchip XYZ', 1)
  assert.ok(r.includes('(无)'))
})

test('apchip empty game', async () => {
  mockOK({ players: [] })
  const [r] = await client.receive('apchip EMPTY', 1)
  assert.strictEqual(r, '未找到游戏')
})

test('apchip API error', async () => {
  mockError('Network Error')
  const [r] = await client.receive('apchip BAD', 1)
  assert.ok(r.includes('查询筹码失败'))
})

// ========== apgame ==========
test('apgame shows game hand info', async () => {
  mockOK({
    players: [
      { name: '玩家A', uid: 1, skillCd: 3, cards: [{ name: '攻击(中)', id: 10001 }, { name: '防御(大)', id: 10004 }], char: { name: '商业之主:帕露南', id: 101 }, tokens: [] },
      { name: '玩家B', uid: 2, skillCd: 0, cards: [], char: { name: '暗影忍者:小町', id: 104 }, tokens: [] },
    ],
  })
  const [r] = await client.receive('apgame ABC', 1)
  assert.ok(r.includes('游戏对局'))
  assert.ok(r.includes('玩家A'))
  assert.ok(r.includes('CD[3]'))
  assert.ok(r.includes('[攻击(中)]'))
  assert.ok(r.includes('[防御(大)]'))
  assert.ok(r.includes('(无手牌)'))
})

test('apgame empty', async () => {
  mockOK({ players: [] })
  const [r] = await client.receive('apgame EMPTY', 1)
  assert.strictEqual(r, '未找到游戏')
})

// ========== apuid ==========
test('apuid queries player info', async () => {
  mockOK({
    name: '测试玩家', playerId: '100001', lv: 30,
    isShowData: true, isShowFight: true,
    statistics: { fightCount: 100, winFightCount: 60, roleCardCount: 20, useHero: 102, adornCount: 5 },
    praiseNum: 10,
    record: [{ time: '1718000000', rank: 1, heroId: 102, mapType: 4 }],
    relatedChars: { '102': { id: 102, name: '古怪神探:芬妮' } },
  })
  const [r] = await client.receive('apuid 100001', 1)
  assert.ok(r.includes('测试玩家'))
  assert.ok(r.includes('UID: 100001'))
  assert.ok(r.includes('lv.30'))
  assert.ok(r.includes('总场数: 100'))
  assert.ok(r.includes('胜场: 60'))
  assert.ok(r.includes('战绩'))
})

test('apuid hidden info', async () => {
  mockOK({ name: '隐藏', playerId: '200001', lv: 10, isShowData: false, isShowFight: false, statistics: {}, praiseNum: 0, record: [], relatedChars: {} })
  const [r] = await client.receive('apuid 200001', 1)
  assert.ok(r.includes('[信息未公开]'))
  assert.ok(r.includes('[战绩未公开]'))
})

test('apuid prompts binding when no UID', async () => {
  const [r] = await client.receive('apuid', 1)
  assert.ok(r.includes('未提供UID，且未绑定'))
})

test('apuid handles API error', async () => {
  mockError('Not Found')
  const [r] = await client.receive('apuid 999999', 1)
  assert.ok(r.includes('查询玩家失败'))
})

// ========== apuid.bind ==========
test('apuid.bind binds UID', async () => {
  const [r] = await client.receive('apuid.bind 123456', 1)
  assert.strictEqual(r, '已绑定 UID: 123456')
})

test('apuid.bind rejects non-numeric', async () => {
  const [r] = await client.receive('apuid.bind abc', 1)
  assert.ok(r.includes('UID格式错误'))
})

test('apuid uses bound UID after binding', async () => {
  mockOK({
    name: '绑定用户', playerId: '123456', lv: 50,
    isShowData: true, isShowFight: true,
    statistics: { fightCount: 200, winFightCount: 150 },
    praiseNum: 20, record: [], relatedChars: {},
  })
  const [r] = await client.receive('apuid', 1)
  assert.ok(r.includes('绑定用户'))
  assert.ok(r.includes('UID: 123456'))
})
