import { H3Event, readBody, getCookie, createError, setCookie } from 'h3'
import { updateUserCredentials } from '../../utils/db'

const COOKIE_NAME = 'mc_admin_v2'

interface Body { username?: string; password?: string; confirm?: string }

export default defineEventHandler(async (event: H3Event) => {
	const current = getCookie(event, COOKIE_NAME)
	if (!current) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
	const { username = '', password = '', confirm = '' } = (await readBody(event)) as Body
	if (!username) throw createError({ statusCode: 400, statusMessage: 'Missing username' })
	if (password && password !== confirm) throw createError({ statusCode: 400, statusMessage: 'Password mismatch' })
	await updateUserCredentials(current, username, password || undefined)
	// refresh cookie if username changed
	if (username !== current) {
		setCookie(event, COOKIE_NAME, username, { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 4 })
	}
	return { ok: true }
})


