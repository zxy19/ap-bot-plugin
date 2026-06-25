import { Context } from 'koishi'
import { mapList } from '../data/defmap'
export function registerRandomMap(ctx: Context) {
  ctx.command('随机地图')
    .action(async ({ session }) => {
      const map = mapList[Math.floor(Math.random() * mapList.length)]
      return `下一局就玩【${map.name}】吧`
    })
}
