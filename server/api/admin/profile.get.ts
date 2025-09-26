import { H3Event, getCookie, createError } from 'h3'

const COOKIE_NAME = 'mc_admin_v2'

export default defineEventHandler(async (event: H3Event) => {
	const username = getCookie(event, COOKIE_NAME)
	if (!username) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
	return { username }
})


