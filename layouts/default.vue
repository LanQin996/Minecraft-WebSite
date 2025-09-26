<template>
  <div class="layout">
    <header class="site-header">
      <div class="container">
        <NuxtLink class="brand" to="/">
          <img v-if="siteSettings?.logo_url" :src="siteSettings.logo_url" class="brand-logo" :alt="siteSettings?.site_title || 'Logo'" />
          <span v-else>Minecraft 服务器</span>
        </NuxtLink>
        <div class="spacer"></div>
        <nav class="nav">
          <NuxtLink to="/">首页</NuxtLink>
          <NuxtLink v-if="modules?.enable_litebans" to="/bans">封禁</NuxtLink>
          <NuxtLink to="/admin/login">后台</NuxtLink>
        </nav>
        <button class="theme-toggle" @click="toggleTheme" :aria-label="`切换到${theme === 'light' ? '深色' : '浅色'}模式`">
          <span v-if="theme === 'light'">🌞</span>
          <span v-else>🌙</span>
        </button>
      </div>
    </header>

    <main>
      <HeroSection v-if="isHome && hero" :hero="hero" />
      <slot />
    </main>

    <footer class="site-footer">
      <div class="container">
        <p>
          {{ siteSettings?.footer && siteSettings.footer.trim() !== ''
            ? siteSettings.footer
            : `© ${new Date().getFullYear()} Minecraft Server · 保留所有权利` }}
        </p>
      </div>
    </footer>
  </div>
  
  
</template>

<script setup lang="ts">
import HeroSection from '~/components/HeroSection.vue'

const route = useRoute()
const isHome = computed(() => route.path === '/')
const { data } = await useAsyncData('hero-layout', () => $fetch<{ title: string; subtitle: string; bg_url: string }>('/api/hero'))
const { data: site } = await useAsyncData('site-settings', () => $fetch<{ site_title: string; site_subtitle: string; site_description: string; logo_url: string; favicon_url: string; footer?: string }>('/api/site'))
const { data: modules } = await useAsyncData('modules-flags', () => $fetch<{ enable_litebans: boolean }>('/api/modules'))
const hero = computed(() => data?.value)
const siteSettings = computed(() => site?.value)

// Theme toggle (persisted) - 防止闪烁的解决方案
const theme = useState<'dark' | 'light'>('theme', () => {
  // 服务端渲染时，尝试从cookie读取主题设置
  if (process.server) {
    const cookie = useCookie('theme', { 
      default: () => 'dark',
      sameSite: 'lax',
      secure: true,
      httpOnly: false // 允许客户端访问
    })
    return cookie.value as 'dark' | 'light'
  }
  return 'dark'
})

function applyTheme(next: 'dark' | 'light') {
  if (process.client) {
    const root = document.documentElement
    if (next === 'light') root.classList.add('theme-light')
    else root.classList.remove('theme-light')
  }
}

// 初始化主题 - 服务端和客户端同步
onMounted(() => {
  if (!process.client) return
  
  // 从localStorage读取用户设置
  const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
  if (saved === 'light' || saved === 'dark') {
    theme.value = saved
    // 同步到cookie，确保服务端下次渲染时使用正确主题
    const cookie = useCookie('theme', { 
      default: () => 'dark',
      sameSite: 'lax',
      secure: true,
      httpOnly: false
    })
    cookie.value = saved
  }
  applyTheme(theme.value)
})

// 监听主题变化，同时更新localStorage和cookie
watch(theme, (val) => {
  if (!process.client) return
  
  localStorage.setItem('theme', val)
  // 更新cookie，确保服务端下次渲染时使用正确主题
  const cookie = useCookie('theme', { 
    default: () => 'dark',
    sameSite: 'lax',
    secure: true,
    httpOnly: false
  })
  cookie.value = val
  applyTheme(val)
})

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

// Preload hero background image to avoid late paint (SSR-safe)
const preloadLinks = computed(() => {
  if (!isHome.value || !hero.value?.bg_url) return [] as any[]
  return [
    { rel: 'preload', as: 'image', href: hero.value.bg_url, fetchpriority: 'high' }
  ]
})
useHead(() => ({
  title: siteSettings.value?.site_title || 'Minecraft 服务器',
  meta: [
    { name: 'description', content: siteSettings.value?.site_description || '' }
  ],
  htmlAttrs: { class: theme.value === 'light' ? 'theme-light' : undefined },
  link: [
    ...preloadLinks.value as any,
    siteSettings.value?.favicon_url ? { rel: 'icon', href: siteSettings.value.favicon_url } as any : null
  ].filter(Boolean),
  script: [
    {
      innerHTML: `
        // 防止主题闪烁的内联脚本
        (function() {
          try {
            var theme = localStorage.getItem('theme') || 'dark';
            if (theme === 'light') {
              document.documentElement.classList.add('theme-light');
            } else {
              document.documentElement.classList.remove('theme-light');
            }
          } catch (e) {
            // localStorage不可用时使用默认主题
            document.documentElement.classList.remove('theme-light');
          }
        })();
      `,
      type: 'text/javascript'
    }
  ]
}))
</script>

<style>
.layout { min-height: 100vh; display: flex; flex-direction: column; }
main { flex: 1; }
.container { width: 100%; max-width: none; margin: 0; padding: 0 12px; }
.site-header { position: sticky; top: 0; z-index: 10; background: color-mix(in oklab, var(--panel) 85%, transparent); backdrop-filter: blur(6px); border-bottom: 1px solid var(--border); }
.site-header .container { display: flex; align-items: center; height: 56px; }
.brand { text-decoration: none; margin-right: 16px; display: inline-flex; align-items: center; gap: 8px; }
.brand-logo { height: 28px; width: auto; display: block; }
.nav { display: flex; gap: 12px; }
.nav a { color: var(--fg); text-decoration: none; padding: 6px 8px; border-radius: 6px; }
.nav a:hover { background: color-mix(in oklab, var(--fg) 10%, transparent); }
.spacer { flex: 1; }
.theme-toggle { height: 32px; width: 42px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--border); background: var(--panel); color: var(--fg); border-radius: 8px; cursor: pointer; margin-left: 12px; }
.theme-toggle:hover { background: color-mix(in oklab, var(--panel) 90%, var(--fg) 10%); }
.site-footer { border-top: 1px solid var(--border); background: var(--panel); color: var(--muted); }
.site-footer .container { padding: 18px 16px; text-align: center; }
</style>

