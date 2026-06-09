import { Context } from 'koishi'
import { get } from '../utils/api'

export function registerChar(ctx: Context) {
  ctx.command('apchar <nameOrId:text>')
    .action(async ({ session }, nameOrId) => {
      try {
        const data = await get(ctx, `/char/${encodeURIComponent(nameOrId)}`)
        return formatChar(data)
      } catch (e: any) {
        return `查询角色失败：${e.message}`
      }
    })
}

function formatChar(data: any): string {
  const d = data.desc
  const skills = data.skills?.pve

  let result = `${d.title}:${d.name} (ID:${data.id})\n`
  result += `HP:${d.meta.hp} ATK:${d.meta.atk} DEF:${d.meta.def}\n`

  if (skills?.act) {
    result += `\n[PVE主动技能] CD${skills.act.cd}\n`
    result += `${skills.act.name}: ${skills.act.desc}\n`
  }

  if (skills?.pas && skills.pas.length > 0) {
    result += `\n[PVE被动技能]\n`
    skills.pas.forEach((p: any) => {
      result += `${p.name}: ${p.desc}\n`
    })
  }

  if (d.feature) {
    result += `\n[角色特性]\n${d.feature}\n`
  }

  return result
}
