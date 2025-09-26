// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  pages: true,
  css: ['@/assets/global.css'],
  modules: ['@element-plus/nuxt'],
  runtimeConfig: {
    geetestKey: process.env.GEETEST_KEY || '',
    public: {
      geetestId: process.env.GEETEST_ID || ''
    }
  }
})
