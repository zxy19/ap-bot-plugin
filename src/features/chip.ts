import { Context } from 'koishi'
import { get } from '../utils/api'

export function registerChip(ctx: Context) {
  ctx.command('apchip <code:text>')
    .action(async ({ session }, code) => {
      try {
        const data = await get(ctx, `/game/${encodeURIComponent(code)}`)
        return formatChip(data)
      } catch (e: any) {
        return `查询筹码失败：${e.message}`
      }
    })
}

function formatChip(data: any): string {
  if (!data.players || data.players.length === 0) return '未找到游戏'

  let result = '局内筹码:\n\n'
  result += data.players.map((p: any) => {
    const tokens = (p.tokens || []).map((t: any) => `[${t.name}]`).join('')
    return `${p.name}(${p.char?.name || '?'})\n${tokens || '(无)'}`
  }).join('\n-----------------\n')

  return result
}
