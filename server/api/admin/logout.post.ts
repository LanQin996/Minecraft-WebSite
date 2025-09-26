import { H3Event } from 'h3'
import { setCookie } from 'h3'

const COOKIE_NAME = 'mc_admin_v2'

export default defineEventHandler(async (event: H3Event) => {
	setCookie(event, COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
	return { ok: true }
})


