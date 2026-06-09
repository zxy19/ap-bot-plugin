import { Context } from 'koishi'

export async function getBoundUid(ctx: Context, userId: string): Promise<string | null> {
  const rows = await ctx.database.get('ap_uid_bind', { user: userId })
  if (rows.length === 0) return null
  return rows[0].uid
}

export async function bindUid(ctx: Context, userId: string, uid: string): Promise<void> {
  const existing = await ctx.database.get('ap_uid_bind', { user: userId })
  if (existing.length > 0) {
    await ctx.database.set('ap_uid_bind', { user: userId }, { uid })
  } else {
    await ctx.database.create('ap_uid_bind', { user: userId, uid })
  }
}
