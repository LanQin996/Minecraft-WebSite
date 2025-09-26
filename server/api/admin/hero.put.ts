import { H3Event, readBody, createError } from 'h3'
import { updateHero } from '../../utils/db'

interface Body { title?: string; subtitle?: string; bg_url?: string }

export default defineEventHandler(async (event: H3Event) => {
	const { title = '', subtitle = '', bg_url = '' } = (await readBody(event)) as Body
	if (!title || !subtitle || !bg_url) {
		throw createError({ statusCode: 400, statusMessage: 'Missing fields' })
	}
	await updateHero({ title, subtitle, bg_url })
	return { ok: true }
})


