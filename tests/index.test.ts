import { Context } from 'koishi'
import MockBot from '@koishijs/plugin-mock'
import MemoryDriver from '@koishijs/plugin-database-memory'
import * as apApi from '../src'
import { describe, it, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest'

let app: Context
let client: ReturnType<MockBot['client']>
let fetchSpy: ReturnType<typeof vi.fn>

beforeAll(async () => {
  app = new Context()

  app.plugin(MemoryDriver, {})
  app.plugin(MockBot, { selfId: '514' })

  app.plugin(apApi, { apiUrl: 'https://ap.xypp.cc', apiPrefix: 'ci' })

  await app.start()
})

afterAll(async () => {
  await app.stop()
})

beforeEach(() => {
  client = app.mock.client('user123', 'channel456')
  fetchSpy = vi.fn()
  vi.stubGlobal('fetch', fetchSpy)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function mockFetch(status: number, data: any) {
  fetchSpy.mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: async () => data,
  })
}

describe('/apwatch', () => {
  it('converts room number to watch code', async () => {
    await client.shouldReply('/apwatch 123456', '房间号 123456 → 观战码: 111E40')
  })

  it('converts room 1', async () => {
    await client.shouldReply('/apwatch 1', '房间号 1 → 观战码: F4241')
  })

  it('rejects invalid room number', async () => {
    await client.shouldReply('/apwatch abc', /房间号格式错误/)
  })

  it('rejects room number over 999999', async () => {
    await client.shouldReply('/apwatch 1000000', /房间号格式错误/)
  })
})

describe('/随机地图', () => {
  it('returns a random PVE map', async () => {
    const replies = await client.receive('/随机地图', 1)
    const reply = replies[0] || ''
    expect(reply).toMatch(/^随机PVE地图: .+ \(ID:\d+\)$/)
  })

  it('always returns one of the known PVE maps', async () => {
    const knownMaps = ['星趴·梦想号', '御魂庆典', '水乡古镇', '魔法学院', '龙宫游乐园', '幽魂暗巷', '园林中庭']
    const replies = await client.receive('/随机地图', 1)
    const reply = replies[0] || ''
    const found = knownMaps.some(m => reply.includes(m))
    expect(found).toBe(true)
  })
})

describe('/apchar', () => {
  it('queries character by name and formats PVE info', async () => {
    mockFetch(200, {
      id: 102,
      name: { name: '古怪神探:芬妮', id: 102 },
      skills: {
        pvp: {
          act: { id: 10201, name: '麻烦制造者', desc: '本回合停留后，额外触发1次事件。', cd: 3 },
          pas: [{ id: 10211, name: '华点发现！', desc: '芬妮触发事件后，获得3星币。', cd: null }],
        },
        pve: {
          act: { id: 10201, name: '麻烦制造者', desc: '本回合停留后，额外触发1次事件。', cd: 3 },
          pas: [{ id: 10211, name: '华点发现！', desc: '芬妮触发事件后，获得3星币。', cd: null }],
        },
      },
      desc: {
        id: 102, name: '芬妮', title: '古怪神探',
        story: '...', feature: '特殊机制说明', quote: '"..."',
        meta: { hp: 10, atk: 1, def: 2 },
      },
    })

    const replies = await client.receive('/apchar 102')
    const reply = replies[0] || ''
    expect(reply).toContain('古怪神探:芬妮')
    expect(reply).toContain('HP:10 ATK:1 DEF:2')
    expect(reply).toContain('[PVE主动技能]')
    expect(reply).toContain('麻烦制造者')
    expect(reply).toContain('[PVE被动技能]')
    expect(reply).toContain('华点发现！')
    expect(reply).toContain('[角色特性]')
    expect(reply).toContain('特殊机制说明')
  })

  it('handles character not found via API error', async () => {
    fetchSpy.mockRejectedValue(new Error('Not Found'))
    await client.shouldReply('/apchar 999', /查询角色失败/)
  })

  it('shows character without feature correctly', async () => {
    mockFetch(200, {
      id: 101,
      name: { name: '商业之主:帕露南', id: 101 },
      skills: {
        pve: {
          act: { id: 10101, name: '利益最大化', desc: '获得星币。', cd: 2 },
          pas: [],
        },
      },
      desc: {
        id: 101, name: '帕露南', title: '商业之主',
        story: '...', feature: '', quote: '"..."',
        meta: { hp: 10, atk: 1, def: 2 },
      },
    })

    const replies = await client.receive('/apchar 帕露南')
    const reply = replies[0] || ''
    expect(reply).toContain('商业之主:帕露南')
    expect(reply).toContain('利益最大化')
    expect(reply).not.toContain('[角色特性]')
  })
})

describe('/apchip', () => {
  it('shows player tokens from a game', async () => {
    mockFetch(200, {
      players: [
        {
          name: '玩家A', uid: 100001, skillCd: 3,
          cards: [],
          char: { name: '商业之主:帕露南', id: 101 },
          tokens: [
            { name: '拳击手套-初级', level: 1, id: 50001 },
            { name: '医疗箱-紧急治疗', level: 1, id: 50021 },
          ],
        },
        {
          name: '玩家B', uid: 100002, skillCd: 2,
          cards: [],
          char: { name: '暗影忍者:小町', id: 104 },
          tokens: [
            { name: '速度轮滑-中级', level: 2, id: 50005 },
          ],
        },
      ],
    })

    const replies = await client.receive('/apchip ABC123')
    const reply = replies[0] || ''
    expect(reply).toContain('局内筹码')
    expect(reply).toContain('玩家A')
    expect(reply).toContain('商业之主:帕露南')
    expect(reply).toContain('[拳击手套-初级]')
    expect(reply).toContain('[医疗箱-紧急治疗]')
    expect(reply).toContain('玩家B')
    expect(reply).toContain('[速度轮滑-中级]')
  })

  it('returns 未找到游戏 for empty game', async () => {
    mockFetch(200, { players: [] })
    await client.shouldReply('/apchip EMPTY', '未找到游戏')
  })

  it('handles API error gracefully', async () => {
    fetchSpy.mockRejectedValue(new Error('Network Error'))
    await client.shouldReply('/apchip BAD', /查询筹码失败/)
  })
})

describe('/apgame', () => {
  it('shows game hand info with cards', async () => {
    mockFetch(200, {
      players: [
        {
          name: '玩家A', uid: 100001, skillCd: 3,
          cards: [
            { name: '攻击(中)', id: 10001 },
            { name: '防御(大)', id: 10004 },
          ],
          char: { name: '商业之主:帕露南', id: 101 },
          tokens: [],
        },
        {
          name: '玩家B', uid: 100002, skillCd: 0,
          cards: [],
          char: { name: '暗影忍者:小町', id: 104 },
          tokens: [],
        },
      ],
    })

    const replies = await client.receive('/apgame ABC123')
    const reply = replies[0] || ''
    expect(reply).toContain('游戏对局')
    expect(reply).toContain('玩家A')
    expect(reply).toContain('CD[3]')
    expect(reply).toContain('[攻击(中)]')
    expect(reply).toContain('[防御(大)]')
    expect(reply).toContain('玩家B')
    expect(reply).toContain('(无手牌)')
  })

  it('returns 未找到游戏 for empty game', async () => {
    mockFetch(200, { players: [] })
    await client.shouldReply('/apgame EMPTY', '未找到游戏')
  })
})

describe('/apuid', () => {
  it('queries player info with UID', async () => {
    mockFetch(200, {
      name: '测试玩家', playerId: '100001', lv: 30,
      isShowData: true, isShowFight: true,
      statistics: {
        fightCount: 100, winFightCount: 60,
        roleCardCount: 20, useHero: 102,
        adornCount: 5,
      },
      praiseNum: 10,
      record: [
        { time: '1718000000', rank: 1, heroId: 102, mapType: 4 },
        { time: '1717900000', rank: 2, heroId: 101, mapType: 4 },
      ],
      relatedChars: {
        '102': { id: 102, name: '古怪神探:芬妮' },
        '101': { id: 101, name: '商业之主:帕露南' },
      },
    })

    const replies = await client.receive('/apuid 100001')
    const reply = replies[0] || ''
    expect(reply).toContain('测试玩家')
    expect(reply).toContain('UID: 100001')
    expect(reply).toContain('lv.30')
    expect(reply).toContain('总场数: 100')
    expect(reply).toContain('胜场: 60')
    expect(reply).toContain('角色总数: 20')
    expect(reply).toContain('点赞数: 10')
    expect(reply).toContain('战绩')
  })

  it('shows info not public when hidden', async () => {
    mockFetch(200, {
      name: '隐藏玩家', playerId: '200001', lv: 10,
      isShowData: false, isShowFight: false,
      statistics: {},
      praiseNum: 0,
      record: [],
      relatedChars: {},
    })

    const replies = await client.receive('/apuid 200001')
    const reply = replies[0] || ''
    expect(reply).toContain('[信息未公开]')
    expect(reply).toContain('[战绩未公开]')
    expect(reply).toContain('暂无战绩')
  })

  it('prompts for binding when no UID and not bound', async () => {
    const replies = await client.receive('/apuid')
    const reply = replies[0] || ''
    expect(reply).toContain('未提供UID，且未绑定')
  })

  it('handles API error', async () => {
    fetchSpy.mockRejectedValue(new Error('Not Found'))
    await client.shouldReply('/apuid 999999', /查询玩家失败/)
  })
})

describe('/apuid.bind', () => {
  it('binds UID successfully', async () => {
    await client.shouldReply('/apuid.bind 123456', '已绑定 UID: 123456')
  })

  it('rejects invalid UID format', async () => {
    await client.shouldReply('/apuid.bind abc', /UID格式错误/)
  })

  it('queries with bound UID after binding', async () => {
    mockFetch(200, {
      name: '绑定用户', playerId: '123456', lv: 50,
      isShowData: true, isShowFight: true,
      statistics: { fightCount: 200, winFightCount: 150 },
      praiseNum: 20,
      record: [],
      relatedChars: {},
    })

    const replies = await client.receive('/apuid')
    const reply = replies[0] || ''
    expect(reply).toContain('绑定用户')
    expect(reply).toContain('UID: 123456')
  })
})
