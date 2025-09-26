import { H3Event } from 'h3'
import { getPublicModulesFlags } from '../utils/db'

export default defineEventHandler(async (_event: H3Event) => {
  const flags = await getPublicModulesFlags()
  return flags
})


