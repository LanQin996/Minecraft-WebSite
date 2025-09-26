import { H3Event } from 'h3'
import { getHero } from '../utils/db'

export default defineEventHandler(async (_event: H3Event) => {
	const data = await getHero()
	return data
})


