import { Context } from 'koishi'

export async function init(ctx: Context) {
  ctx.model.extend('ap_uid_bind', {
    id: 'unsigned',
    user: 'string',
    uid: 'string',
  }, {
    autoInc: true,
  })
}
