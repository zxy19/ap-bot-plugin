import { Context } from 'koishi'
import { get } from '../utils/api'

export function registerGame(ctx: Context) {
  ctx.command('apgame <code:text>')
    .action(async ({ session }, code) => {
      try {
        const data = await get(ctx, `/game/${encodeURIComponent(code)}`)
        return formatGame(data)
      } catch (e: any) {
        return `查询对局失败：${e.message}`
      }
    })
}

function formatGame(data: any): string {
  if (!data.players || data.players.length === 0) return '未找到游戏'

  let result = '游戏对局:\n\n'
  result += data.players.map((p: any) => {
    const cards = (p.cards || []).map((c: any) => `[${c.name}]`).join('')
    return `${p.name}(${p.char?.name || '?'}) CD[${p.skillCd || 0}]\n${cards || '(无手牌)'}`
  }).join('\n-----------------\n')

  return result
}
