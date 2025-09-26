import { H3Event } from 'h3'
import { getSiteSettings } from '../utils/db'

export default defineEventHandler(async (_event: H3Event) => {
  const data = await getSiteSettings()
  return data
})


