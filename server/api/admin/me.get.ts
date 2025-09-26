import { H3Event, getCookie } from 'h3'

const COOKIE_NAME = 'mc_admin_v2'

export default defineEventHandler(async (event: H3Event) => {
	const username = getCookie(event, COOKIE_NAME) || ''
	return { ok: !!username, username }
})


