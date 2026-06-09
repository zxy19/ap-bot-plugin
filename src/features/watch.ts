import { Context } from 'koishi'

export function registerWatch(ctx: Context) {
  ctx.command('apwatch <roomNumber:text>')
    .action(async ({ session }, roomNumber) => {
      const num = parseInt(roomNumber)
      if (isNaN(num) || num <= 0 || num > 999999) {
        return '房间号格式错误，应为1-6位纯数字'
      }
      const watchCode = (1000000 + num).toString(16).toUpperCase()
      return `房间号 ${num} → 观战码: ${watchCode}`
    })
}
