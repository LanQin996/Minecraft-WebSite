export default defineNuxtRouteMiddleware(async () => {
  try {
    const headers = process.server ? useRequestHeaders(['cookie']) : undefined
    const me = await $fetch<{ ok: boolean }>('/api/admin/me', { headers })
    if (me.ok) {
      return navigateTo('/admin', { replace: true })
    }
  } catch {
    // ignore
  }
})


