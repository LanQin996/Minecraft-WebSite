import { H3Event, readBody, createError } from 'h3'
import { updateSiteSettings } from '../../utils/db'

interface Body { site_title?: string; site_subtitle?: string; site_description?: string; logo_url?: string; favicon_url?: string; footer?: string }

export default defineEventHandler(async (event: H3Event) => {
  const { site_title = '', site_subtitle = '', site_description = '', logo_url = '', favicon_url = '', footer = '' } = (await readBody(event)) as Body
  if (!site_title || !site_subtitle) throw createError({ statusCode: 400, statusMessage: 'Missing title or subtitle' })
  await updateSiteSettings({ site_title, site_subtitle, site_description, logo_url, favicon_url, footer })
  return { ok: true }
})


