import { Context } from 'koishi'
import { get } from '../utils/api'
import { getBoundUid, bindUid } from '../data/uidBind'

export function registerUid(ctx: Context) {
  ctx.command('apuid [uid:text]')
    .action(async ({ session }, uid) => {
      const resolvedUid = uid || await getBoundUid(ctx, session.userId)
      if (!resolvedUid) {
        return '未提供UID，且未绑定。请使用 /apuid.bind <UID> 绑定，或直接 /apuid <UID> 查询'
      }
      try {
        const data = await get(ctx, `/player/${encodeURIComponent(resolvedUid)}`)
        return formatPlayer(data)
      } catch (e: any) {
        return `查询玩家失败：${e.message}`
      }
    })

  ctx.command('apuid.bind <uid:text>')
    .action(async ({ session }, uid) => {
      if (!uid || !/^\d+$/.test(uid)) {
        return 'UID格式错误，请输入纯数字UID'
      }
      try {
        await bindUid(ctx, session.userId, uid)
        return `已绑定 UID: ${uid}`
      } catch (e: any) {
        return `绑定失败：${e.message}`
      }
    })
}

function formatPlayer(data: any): string {
  const formatTime = (ts: string | number) => {
    const d = new Date(Number(ts) * 1000 + 28800000)
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  const charMap: Record<string, string> = {}
  if (data.relatedChars) {
    for (const v of Object.values(data.relatedChars) as any[]) {
      charMap[(v as any).id] = (v as any).name
    }
  }

  let result = `用户${data.name} (UID: ${data.playerId}) lv.${data.lv}\n`

  if (!data.isShowData) {
    result += '[信息未公开]\n'
  }

  const stats = data.statistics || {}
  result += `总场数: ${stats.fightCount || 0}\n`
  result += `胜场: ${stats.winFightCount || 0}\n`
  result += `角色总数: ${stats.roleCardCount || 0}\n`
  result += `最常使用角色: ${charMap[stats.useHero] || stats.useHero || ''}\n`
  result += `装扮数: ${stats.adornCount || 0}\n`
  result += `点赞数: ${data.praiseNum || 0}\n\n`

  result += '战绩:\n'
  if (!data.isShowFight) {
    result += '[战绩未公开]\n'
  }
  if (data.record && data.record.length > 0) {
    const latest = [...data.record]
      .sort((a: any, b: any) => parseInt(b.time) - parseInt(a.time))
      .slice(0, 5)

    latest.forEach((game: any) => {
      let label = ''
      if (game.mapType !== 4) {
        label = `第${game.rank || 0}`
      } else {
        if (game.rank === 1) label = '胜'
        else if (game.rank !== undefined) label = '负'
        else label = '掉线'
      }
      const charName = charMap[game.heroId] || game.heroId || ''
      result += `${formatTime(game.time)} ${label} ${charName}\n`
    })
  } else {
    result += '暂无战绩'
  }

  return result
}
