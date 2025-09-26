import { H3Event } from 'h3'
import { getModulesSettings } from '../../utils/db'

export default defineEventHandler(async (_event: H3Event) => {
  const data = await getModulesSettings()
  return data
})


