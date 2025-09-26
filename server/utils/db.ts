import { createPool, type Pool, type RowDataPacket } from 'mysql2/promise'
import crypto from 'node:crypto'

let pool: Pool | null = null
let schemaInitialized = false

function env(name: string, fallback = ''): string {
	const v = process.env[name]
	return (v === undefined || v === '') ? fallback : v
}

function getPool(): Pool {
	if (pool) return pool
	pool = createPool({
		host: env('MYSQL_HOST', 'localhost'),
		port: Number(env('MYSQL_PORT', '3306')),
		user: env('MYSQL_USER', 'root'),
		password: env('MYSQL_PASSWORD', ''),
		database: env('MYSQL_DATABASE', 'minecraft'),
		connectionLimit: 10,
		namedPlaceholders: true
	})
	return pool
}

export async function ensureSchema(): Promise<void> {
	if (schemaInitialized) return
	const p = getPool()
	await p.query(`
		CREATE TABLE IF NOT EXISTS users (
			id INT AUTO_INCREMENT PRIMARY KEY,
			username VARCHAR(64) NOT NULL UNIQUE,
			password_md5 CHAR(32) NOT NULL,
			created_at DATETIME NOT NULL
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`)
	await p.query(`
		CREATE TABLE IF NOT EXISTS hero_settings (
			id INT PRIMARY KEY CHECK (id = 1),
			title VARCHAR(255) NOT NULL,
			subtitle VARCHAR(255) NOT NULL,
			bg_url VARCHAR(512) NOT NULL
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`)
	await p.query(`
		CREATE TABLE IF NOT EXISTS site_settings (
			id INT PRIMARY KEY CHECK (id = 1),
			site_title VARCHAR(255) NOT NULL,
			site_subtitle VARCHAR(255) NOT NULL,
			site_description TEXT NOT NULL,
			logo_url VARCHAR(512) NOT NULL,
			favicon_url VARCHAR(512) NOT NULL,
			footer VARCHAR(512) NOT NULL DEFAULT ''
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`)
	// ensure footer column exists for existing installations
	try {
		await p.query(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer VARCHAR(512) NOT NULL DEFAULT ''`)
	} catch (e) {
		// ignore if not supported; try a fallback check
		try {
			const [cols] = await p.query<RowDataPacket[]>(`SHOW COLUMNS FROM site_settings LIKE 'footer'`)
			if ((cols as any[]).length === 0) {
				await p.query(`ALTER TABLE site_settings ADD COLUMN footer VARCHAR(512) NOT NULL DEFAULT ''`)
			}
		} catch {}
	}
	await p.query(`
		CREATE TABLE IF NOT EXISTS modules_settings (
			id INT PRIMARY KEY CHECK (id = 1),
			enable_litebans TINYINT(1) NOT NULL DEFAULT 0,
			lb_host VARCHAR(255) NOT NULL DEFAULT 'localhost',
			lb_port INT NOT NULL DEFAULT 3306,
			lb_user VARCHAR(255) NOT NULL DEFAULT '',
			lb_password VARCHAR(255) NOT NULL DEFAULT '',
			lb_database VARCHAR(255) NOT NULL DEFAULT '',
			lb_prefix VARCHAR(64) NOT NULL DEFAULT 'litebans'
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`)
	// seed hero row if missing
	await p.query(`INSERT IGNORE INTO hero_settings (id, title, subtitle, bg_url) VALUES (1, '我的世界服务器官网', '欢迎来到我们的服务器，一起开启新的冒险！', 'https://cdn.jsdu.cn/opdav/20250918/80fec3ca1133b1ef52d4d33604dd99bd.png')`)
	// seed site settings row if missing
	await p.query(`INSERT IGNORE INTO site_settings (id, site_title, site_subtitle, site_description, logo_url, favicon_url, footer) VALUES (1, 'Minecraft 服务器', '一起探索方块世界', '这是一个基于 Nuxt 的 Minecraft 服务器官网后台演示。', '/logo.png', '/favicon.ico', '')`)
	// seed modules row if missing
	await p.query(`INSERT IGNORE INTO modules_settings (id, enable_litebans, lb_host, lb_port, lb_user, lb_password, lb_database, lb_prefix) VALUES (1, 0, 'localhost', 3306, '', '', '', 'litebans')`)
	// always ensure default admin
	await p.execute(
		'INSERT IGNORE INTO users (username, password_md5, created_at) VALUES (?, ?, ?)',
		['admin', md5('123456'), new Date()]
	)
	schemaInitialized = true
}

export function md5(text: string): string {
	return crypto.createHash('md5').update(text).digest('hex')
}

export async function createAdminUserIfMissing(username: string, password: string): Promise<void> {
	await ensureSchema()
	const p = getPool()
	await p.execute('INSERT IGNORE INTO users (username, password_md5, created_at) VALUES (?, ?, ?)', [username, md5(password), new Date()])
}

export async function verifyUser(username: string, password: string): Promise<boolean> {
	await ensureSchema()
	const p = getPool()
	const [rows] = await p.execute<RowDataPacket[]>('SELECT id FROM users WHERE username = ? AND password_md5 = ?', [username, md5(password)])
	return rows.length > 0
}

export async function updateUserCredentials(currentUsername: string, newUsername: string, newPassword?: string): Promise<void> {
	await ensureSchema()
	const p = getPool()
	if (newPassword && newPassword !== '') {
		await p.execute('UPDATE users SET username = ?, password_md5 = ? WHERE username = ?', [newUsername, md5(newPassword), currentUsername])
	} else {
		await p.execute('UPDATE users SET username = ? WHERE username = ?', [newUsername, currentUsername])
	}
}

export interface HeroSettings { title: string; subtitle: string; bg_url: string }

export async function getHero(): Promise<HeroSettings> {
	await ensureSchema()
	const p = getPool()
	const [rows] = await p.execute<RowDataPacket[]>('SELECT title, subtitle, bg_url FROM hero_settings WHERE id = 1')
	if (rows.length === 0) return { title: '', subtitle: '', bg_url: '' }
	const r = rows[0]
	return { title: String(r.title), subtitle: String(r.subtitle), bg_url: String(r.bg_url) }
}

export async function updateHero(data: HeroSettings): Promise<void> {
	await ensureSchema()
	const p = getPool()
	await p.execute('UPDATE hero_settings SET title = ?, subtitle = ?, bg_url = ? WHERE id = 1', [data.title, data.subtitle, data.bg_url])
}

export interface SiteSettings { site_title: string; site_subtitle: string; site_description: string; logo_url: string; favicon_url: string; footer: string }

export async function getSiteSettings(): Promise<SiteSettings> {
	await ensureSchema()
	const p = getPool()
	const [rows] = await p.execute<RowDataPacket[]>(`SELECT site_title, site_subtitle, site_description, logo_url, favicon_url, footer FROM site_settings WHERE id = 1`)
	if (rows.length === 0) return { site_title: '', site_subtitle: '', site_description: '', logo_url: '', favicon_url: '', footer: '' }
	const r = rows[0]
	return {
		site_title: String(r.site_title),
		site_subtitle: String(r.site_subtitle),
		site_description: String(r.site_description),
		logo_url: String(r.logo_url),
		favicon_url: String(r.favicon_url),
		footer: String(r.footer || '')
	}
}

export async function updateSiteSettings(data: SiteSettings): Promise<void> {
	await ensureSchema()
	const p = getPool()
	await p.execute(
		`UPDATE site_settings SET site_title = ?, site_subtitle = ?, site_description = ?, logo_url = ?, favicon_url = ?, footer = ? WHERE id = 1`,
		[data.site_title, data.site_subtitle, data.site_description, data.logo_url, data.favicon_url, data.footer || '']
	)
}

export interface ModulesSettings {
	enable_litebans: 0 | 1
	lb_host: string
	lb_port: number
	lb_user: string
	lb_password: string
	lb_database: string
	lb_prefix: string
}

export type PublicModulesFlags = { enable_litebans: boolean }

export async function getModulesSettings(): Promise<ModulesSettings> {
	await ensureSchema()
	const p = getPool()
	const [rows] = await p.execute<RowDataPacket[]>(`SELECT enable_litebans, lb_host, lb_port, lb_user, lb_password, lb_database, lb_prefix FROM modules_settings WHERE id = 1`)
	if (rows.length === 0) {
		return { enable_litebans: 0, lb_host: 'localhost', lb_port: 3306, lb_user: '', lb_password: '', lb_database: '', lb_prefix: 'litebans' }
	}
	const r = rows[0]
	return {
		enable_litebans: Number(r.enable_litebans) as 0 | 1,
		lb_host: String(r.lb_host),
		lb_port: Number(r.lb_port),
		lb_user: String(r.lb_user),
		lb_password: String(r.lb_password),
		lb_database: String(r.lb_database),
		lb_prefix: String(r.lb_prefix)
	}
}

export async function updateModulesSettings(data: ModulesSettings): Promise<void> {
	await ensureSchema()
	const p = getPool()
	await p.execute(
		`UPDATE modules_settings SET enable_litebans = ?, lb_host = ?, lb_port = ?, lb_user = ?, lb_password = ?, lb_database = ?, lb_prefix = ? WHERE id = 1`,
		[data.enable_litebans, data.lb_host, data.lb_port, data.lb_user, data.lb_password, data.lb_database, data.lb_prefix]
	)
}

export async function getPublicModulesFlags(): Promise<PublicModulesFlags> {
	const s = await getModulesSettings()
	return { enable_litebans: s.enable_litebans === 1 }
}


