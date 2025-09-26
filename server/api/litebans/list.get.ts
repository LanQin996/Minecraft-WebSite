import { H3Event } from 'h3'
import { createPool } from 'mysql2/promise'
import { getModulesSettings, getPublicModulesFlags } from '../../utils/db'

export default defineEventHandler(async (event: H3Event) => {
  const flags = await getPublicModulesFlags()
  if (!flags.enable_litebans) {
    return { enabled: false, bans: [], page: 1, pageSize: 20, total: 0 }
  }
  const s = await getModulesSettings()
  if (!s.lb_host || !s.lb_user || !s.lb_database) {
    return { enabled: true, bans: [], page: 1, pageSize: 20, total: 0 }
  }
  try {
    const lb = createPool({
      host: s.lb_host,
      port: s.lb_port,
      user: s.lb_user,
      password: s.lb_password,
      database: s.lb_database,
      connectionLimit: 3,
      namedPlaceholders: true
    })
    const bansTable = `${s.lb_prefix}bans`
    const historyTable = `${s.lb_prefix}history`
    const q = getQuery(event)
    const page = Math.max(1, Number((q.page as any) || 1))
    const pageSize = Math.max(1, Math.min(100, Number((q.pageSize as any) || 20)))
    const offset = (page - 1) * pageSize
    const [[countRow]] = await lb.query<any[]>(`SELECT COUNT(*) AS cnt FROM \`${bansTable}\``)
    const total = Number((countRow as any).cnt || 0)
    const [rows] = await lb.query<any[]>(
      `SELECT 
        b.uuid,
        b.ip,
        b.reason,
        b.banned_by_uuid,
        b.banned_by_name,
        b.time,
        b.until,
        b.active,
        (SELECT h.name FROM \`${historyTable}\` h WHERE h.uuid = b.uuid ORDER BY h.id DESC LIMIT 1) AS player_name
       FROM \`${bansTable}\` b
       ORDER BY b.time DESC
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    )
    await lb.end()
    return {
      enabled: true,
      bans: rows.map((r: any) => {
        const toBool = (v: any) => Buffer.isBuffer(v) ? v[0] === 1 : !!v
        const untilRaw = Number(r.until ?? 0)
        return {
          type: 'ban',
          uuid: String(r.uuid || ''),
          name: String(r.player_name || ''),
          reason: String(r.reason || ''),
          byUuid: r.banned_by_uuid ? String(r.banned_by_uuid) : '',
          by: String(r.banned_by_name || ''),
          time: Number(r.time || 0),
          until: untilRaw > 0 ? untilRaw : null,
          active: toBool(r.active)
        }
      }),
      page,
      pageSize,
      total
    }
  } catch (e: any) {
    const msg: string = e?.message || '连接 LiteBans 数据库失败'
    const code: string | undefined = e?.code
    // 明确提示不支持的认证插件（如 auth_gssapi_client）
    const hint = code === 'AUTH_SWITCH_PLUGIN_ERROR' || /unknown plugin/i.test(msg)
      ? '数据库用户使用了不受支持的认证插件。请为 LiteBans 连接创建一个使用 mysql_native_password 或 caching_sha2_password 的用户，并更新后台连接配置。'
      : undefined
    return { enabled: true, bans: [], error: hint ? `${msg} - ${hint}` : msg }
  }
})


