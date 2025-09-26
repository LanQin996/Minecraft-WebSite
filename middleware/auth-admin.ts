export default defineNuxtRouteMiddleware(async (_to, _from) => {
  try {
    const headers = process.server ? useRequestHeaders(['cookie']) : undefined
    const me = await $fetch<{ ok: boolean }>('/api/admin/me', { headers })
    if (!me.ok) {
      return navigateTo('/admin/login', { replace: true })
    }
  } catch {
    return navigateTo('/admin/login', { replace: true })
  }
})


