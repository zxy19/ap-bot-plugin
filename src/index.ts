import { Context, Schema } from 'koishi'
import { init as initDB } from './data/database'
import { initApi } from './utils/api'
import { registerAll } from './reg'

export const name = 'ap-api'
export const inject = {
  required: ['database'],
}

export interface Config {
  apiUrl: string
  apiPrefix: string
  apiKey: string
}

export const Config: Schema<Config> = Schema.object({
  apiUrl: Schema.string().required().description('API服务地址'),
  apiPrefix: Schema.string().required().description('API路径前缀'),
  apiKey: Schema.string().required().description('API访问密钥'),
})

export function apply(ctx: Context, config: Config) {
  ctx.on('ready', async () => {
    await initDB(ctx)
  })
  initApi(config)
  registerAll(ctx)
}
