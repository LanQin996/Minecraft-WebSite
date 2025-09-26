import { defineEventHandler, sendError, createError, getCookie } from 'h3'

const COOKIE_NAME = 'mc_admin_v2'

export default defineEventHandler((event) => {
	const url = event.node.req.url || ''
	if (!url.startsWith('/api/admin/')) return
	if (url.startsWith('/api/admin/login') || url.startsWith('/api/admin/logout')) return
	const username = getCookie(event, COOKIE_NAME)
	if (!username) {
		return sendError(event, createError({ statusCode: 401, statusMessage: 'Unauthorized' }))
	}
})


