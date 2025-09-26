import { H3Event } from 'h3'
import { createPool } from 'mysql2/promise'
import { updateModulesSettings, type ModulesSettings } from '../../utils/db'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event as any)
  const data: ModulesSettings = {
    enable_litebans: body.enable_litebans ? 1 : 0,
    lb_host: String(body.lb_host || ''),
    lb_port: Number(body.lb_port || 3306),
    lb_user: String(body.lb_user || ''),
    lb_password: String(body.lb_password || ''),
    lb_database: String(body.lb_database || ''),
    lb_prefix: String(body.lb_prefix || 'litebans')
  }
  // Enforce: must pass connection test before save
  try {
    const pool = createPool({
      host: data.lb_host,
      port: data.lb_port,
      user: data.lb_user,
      password: data.lb_password,
      database: data.lb_database,
      connectionLimit: 1
    })
    await pool.query('SELECT 1')
    await pool.end()
  } catch (e: any) {
    const msg: string = e?.message || 'LiteBans 数据库连接失败，已阻止保存'
    const code: string | undefined = e?.code
    const hint = code === 'AUTH_SWITCH_PLUGIN_ERROR' || /unknown plugin/i.test(msg)
      ? '数据库用户认证插件不受支持，请使用 mysql_native_password 或 caching_sha2_password。'
      : undefined
    throw createError({ statusCode: 400, statusMessage: hint ? `${msg} - ${hint}` : msg })
  }
  await updateModulesSettings(data)
  return { ok: true }
})


