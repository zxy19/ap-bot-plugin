import { Context } from 'koishi'
import { Config } from '../index'

let apiBase: string
let apiKey: string

export function initApi(config: Config) {
  const url = config.apiUrl.replace(/\/+$/, '')
  const prefix = (config.apiPrefix || '').replace(/^\/+/, '').replace(/\/+$/, '')
  apiBase = prefix ? `${url}/${prefix}` : url
  apiKey = config.apiKey || ''
}

export async function get(ctx: Context, path: string): Promise<any> {
  const suffix = apiKey ? `@${apiKey}` : ''
  const url = `${apiBase}${path}${suffix}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    })
    clearTimeout(timeout)
    if (!res.ok) {
      throw new Error(`API ${res.status}: ${res.statusText}`)
    }
    return await res.json()
  } catch (e: any) {
    clearTimeout(timeout)
    if (e.name === 'AbortError') {
      throw new Error('API请求超时')
    }
    throw e
  }
}
