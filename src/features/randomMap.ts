import { Context } from 'koishi'
import { mapList } from '../data/defmap'

const PVE_MAP_IDS = [82007, 82008, 82010, 82012, 82013, 82014, 82015]

export function registerRandomMap(ctx: Context) {
  ctx.command('随机地图')
    .action(async ({ session }) => {
      const pveMaps = mapList.filter(m => PVE_MAP_IDS.includes(m.id))
      if (pveMaps.length === 0) return '未找到PVE地图'
      const map = pveMaps[Math.floor(Math.random() * pveMaps.length)]
      return `随机PVE地图: ${map.name} (ID:${map.id})`
    })
}
