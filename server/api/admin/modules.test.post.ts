import { H3Event } from 'h3'
import { createPool } from 'mysql2/promise'
import { getModulesSettings } from '../../utils/db'

export default defineEventHandler(async (event: H3Event) => {
  // Accept overrides from body; if absent, use saved settings
  const body = await readBody(event as any).catch(() => ({})) as any
  const saved = await getModulesSettings()
  const cfg = {
    host: String(body.lb_host ?? saved.lb_host),
    port: Number(body.lb_port ?? saved.lb_port),
    user: String(body.lb_user ?? saved.lb_user),
    password: String(body.lb_password ?? saved.lb_password),
    database: String(body.lb_database ?? saved.lb_database),
    prefix: String(body.lb_prefix ?? saved.lb_prefix)
  }

  try {
    const pool = createPool({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      connectionLimit: 1
    })
    // Basic connectivity
    const [ping] = await pool.query('SELECT 1 AS ok')
    // Check table existence using user-provided prefix exactly
    const tableName = `${cfg.prefix}bans`
    const [existsRows] = await pool.query(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_name = ? LIMIT 1',
      [cfg.database, tableName]
    )
    await pool.end()
    const arr = Array.isArray(existsRows) ? (existsRows as any[]) : []
    const tableExists = arr.length > 0
    const matched = tableExists ? String((arr[0] as any).table_name) : undefined
    return { ok: true, tableExists, matched }
  } catch (e: any) {
    const msg: string = e?.message || '连接失败'
    const code: string | undefined = e?.code
    const hint = code === 'AUTH_SWITCH_PLUGIN_ERROR' || /unknown plugin/i.test(msg)
      ? '数据库用户认证插件不受支持。请使用 mysql_native_password 或 caching_sha2_password。'
      : undefined
    return { ok: false, error: hint ? `${msg} - ${hint}` : msg, code }
  }
})


