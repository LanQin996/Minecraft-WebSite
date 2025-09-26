import { H3Event, readBody, createError } from 'h3'
import { verifyUser, createAdminUserIfMissing } from '../../utils/db'
import { setCookie } from 'h3'

const COOKIE_NAME = 'mc_admin_v2'
const COOKIE_MAX_AGE = 60 * 60 * 4

interface LoginBody { username?: string; password?: string }

export default defineEventHandler(async (event: H3Event) => {
	const { username = '', password = '' } = (await readBody(event)) as LoginBody
	if (!username || !password) {
		throw createError({ statusCode: 400, statusMessage: 'Missing credentials' })
	}
	// Optionally bootstrap a default admin if env provided (one-time)
	if (process.env.ADMIN_BOOTSTRAP_USER && process.env.ADMIN_BOOTSTRAP_PASS) {
		await createAdminUserIfMissing(process.env.ADMIN_BOOTSTRAP_USER, process.env.ADMIN_BOOTSTRAP_PASS)
	}
	const ok = await verifyUser(username, password)
	if (!ok) throw createError({ statusCode: 401, statusMessage: '账号或密码错误' })
	setCookie(event, COOKIE_NAME, username, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: COOKIE_MAX_AGE
	})
	return { ok: true }
})


