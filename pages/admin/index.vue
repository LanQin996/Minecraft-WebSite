<template>
  <div class="admin-page">
    <div class="admin-header">
      <button class="sider-toggle" @click="drawerOpen = true" aria-label="展开侧边栏">
        <el-icon><MenuIcon /></el-icon>
      </button>
      <h1>网站后台</h1>
      <div class="spacer"></div>
      <el-button size="small" class="logout-btn" @click="logout" :loading="logoutLoading">
        <span class="icon" aria-hidden="true">⎋</span>
        <span class="text">退出登录</span>
      </el-button>
    </div>

    <div class="admin-wrap">
      <aside class="admin-sider">
        <el-menu :default-active="active" class="admin-menu" @select="onSelect">
          <el-menu-item index="site">
            <div class="menu-item-inner">
              <span class="left"><el-icon><Setting /></el-icon><span>站点信息</span></span>
            </div>
          </el-menu-item>
          <el-menu-item index="hero">
            <div class="menu-item-inner">
              <span class="left"><el-icon><PictureFilled /></el-icon><span>首页横幅</span></span>
            </div>
          </el-menu-item>
          <el-menu-item index="profile">
            <div class="menu-item-inner">
              <span class="left"><el-icon><UserFilled /></el-icon><span>账号设置</span></span>
            </div>
          </el-menu-item>
        </el-menu>
      </aside>
      <section class="admin-main">
        <div v-show="active === 'site'" class="panel">
          <el-form :model="site" :label-width="96" :rules="siteRules" ref="siteRef" class="form">
            <el-form-item label="网站标题" prop="site_title"><el-input v-model="site.site_title" /></el-form-item>
            <el-form-item label="副标题" prop="site_subtitle"><el-input v-model="site.site_subtitle" /></el-form-item>
            <el-form-item label="简介"><el-input v-model="site.site_description" type="textarea" :rows="4" /></el-form-item>
            <el-form-item label="Logo URL"><el-input v-model="site.logo_url" /></el-form-item>
            <el-form-item label="Favicon URL"><el-input v-model="site.favicon_url" /></el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving.site" @click="saveSite">保存</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div v-show="active === 'hero'" class="panel">
          <el-form :model="hero" :label-width="96" :rules="heroRules" ref="heroRef" class="form">
            <el-form-item label="标题" prop="title"><el-input v-model="hero.title" /></el-form-item>
            <el-form-item label="副标题" prop="subtitle"><el-input v-model="hero.subtitle" /></el-form-item>
            <el-form-item label="背景图URL" prop="bg_url"><el-input v-model="hero.bg_url" /></el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving.hero" @click="saveHero">保存</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div v-show="active === 'profile'" class="panel">
          <el-form :model="profile" :label-width="96" :rules="profileRules" ref="profileRef" class="form">
            <el-form-item label="当前账号"><el-input v-model="profile.username" /></el-form-item>
            <el-form-item label="新密码"><el-input v-model="profile.password" type="password" show-password /></el-form-item>
            <el-form-item label="确认密码"><el-input v-model="profile.confirm" type="password" show-password /></el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving.profile" @click="saveProfile">保存</el-button>
            </el-form-item>
          </el-form>
        </div>
      </section>
    </div>
    <!-- Mobile Drawer -->
    <el-drawer v-model="drawerOpen" :with-header="false" direction="ltr" size="260px" class="admin-drawer">
      <el-menu :default-active="active" class="admin-menu" @select="onSelect">
        <el-menu-item index="site">
          <div class="menu-item-inner">
            <span class="left"><el-icon><Setting /></el-icon><span>站点信息</span></span>
          </div>
        </el-menu-item>
        <el-menu-item index="hero">
          <div class="menu-item-inner">
            <span class="left"><el-icon><PictureFilled /></el-icon><span>首页横幅</span></span>
          </div>
        </el-menu-item>
        <el-menu-item index="profile">
          <div class="menu-item-inner">
            <span class="left"><el-icon><UserFilled /></el-icon><span>账号设置</span></span>
          </div>
        </el-menu-item>
      </el-menu>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { Setting, PictureFilled, UserFilled, Menu as MenuIcon } from '@element-plus/icons-vue'

const router = useRouter()
definePageMeta({ middleware: 'auth-admin' })

type MeResp = { ok: true; username: string } | { ok: false }
const me = await $fetch<MeResp>('/api/admin/me', { headers: process.server ? useRequestHeaders(['cookie']) : undefined }).catch(() => ({ ok: false as const }))

const active = ref<'site' | 'hero' | 'profile'>('site')
const drawerOpen = ref(false)
function onSelect(key: string) {
  active.value = key as any
  if (drawerOpen.value) drawerOpen.value = false
}
const saving = reactive({ site: false, hero: false, profile: false })

// Site tab
const siteRef = ref<FormInstance>()
const { data: siteData, refresh: refreshSite } = await useAsyncData('admin-site', () => $fetch('/api/admin/site', { headers: process.server ? useRequestHeaders(['cookie']) : undefined }))
const site = reactive({
  site_title: siteData.value?.site_title || '',
  site_subtitle: siteData.value?.site_subtitle || '',
  site_description: siteData.value?.site_description || '',
  logo_url: siteData.value?.logo_url || '',
  favicon_url: siteData.value?.favicon_url || ''
})
watch(siteData, (v: any) => { if (!v) return; Object.assign(site, v) })
const siteRules = reactive<FormRules>({
  site_title: [{ required: true, message: '请输入网站标题', trigger: 'blur' }],
  site_subtitle: [{ required: true, message: '请输入副标题', trigger: 'blur' }]
})
async function saveSite() {
  if (!siteRef.value) return
  await siteRef.value.validate(async (valid) => {
    if (!valid) return
    saving.site = true
    try {
      await $fetch('/api/admin/site', { method: 'PUT', body: site })
      await refreshSite()
      ElMessage.success('已保存')
    } catch (e: any) {
      ElMessage.error(e?.data?.statusMessage || '保存失败')
    } finally {
      saving.site = false
    }
  })
}

// Hero tab
const heroRef = ref<FormInstance>()
const { data: heroData, refresh: refreshHero } = await useAsyncData('admin-hero', () => $fetch('/api/hero', { headers: process.server ? useRequestHeaders(['cookie']) : undefined }))
const hero = reactive({ title: heroData.value?.title || '', subtitle: heroData.value?.subtitle || '', bg_url: heroData.value?.bg_url || '' })
watch(heroData, (v: any) => { if (!v) return; Object.assign(hero, v) })
const heroRules = reactive<FormRules>({
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  subtitle: [{ required: true, message: '请输入副标题', trigger: 'blur' }],
  bg_url: [{ required: true, message: '请输入背景图URL', trigger: 'blur' }]
})
async function saveHero() {
  if (!heroRef.value) return
  await heroRef.value.validate(async (valid) => {
    if (!valid) return
    saving.hero = true
    try {
      await $fetch('/api/admin/hero', { method: 'PUT', body: hero })
      await refreshHero()
      ElMessage.success('已保存')
    } catch (e: any) {
      ElMessage.error(e?.data?.statusMessage || '保存失败')
    } finally {
      saving.hero = false
    }
  })
}

// Profile tab
const profileRef = ref<FormInstance>()
const profile = reactive({ username: (me as any).username || 'admin', password: '', confirm: '' })
const profileRules = reactive<FormRules>({
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  confirm: [{ validator: (_: any, __: any, cb: any) => { if (profile.password && profile.password !== profile.confirm) cb(new Error('两次输入的密码不一致')); else cb() }, trigger: 'blur' }]
})
async function saveProfile() {
  if (!profileRef.value) return
  await profileRef.value.validate(async (valid) => {
    if (!valid) return
    saving.profile = true
    try {
      await $fetch('/api/admin/profile', { method: 'PUT', body: profile })
      ElMessage.success('已保存')
    } catch (e: any) {
      ElMessage.error(e?.data?.statusMessage || '保存失败')
    } finally {
      saving.profile = false
    }
  })
}

// logout
const logoutLoading = ref(false)
async function logout() {
  logoutLoading.value = true
  try {
    await $fetch('/api/admin/logout', { method: 'POST' })
    router.replace('/admin/login')
  } catch {
  } finally {
    logoutLoading.value = false
  }
}
</script>

<style>
.admin-page { padding: 16px; }
.admin-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.sider-toggle { display: none; border: 1px solid var(--border); background: var(--panel); color: var(--fg); height: 32px; width: 36px; border-radius: 8px; align-items: center; justify-content: center; cursor: pointer; }
.sider-toggle:hover { background: color-mix(in oklab, var(--panel) 90%, var(--fg) 10%); }
.admin-header h1 { font-size: 18px; margin: 0; }
.spacer { flex: 1; }
.form { max-width: 720px; }
/* Admin sidebar layout */
.admin-wrap { display: grid; grid-template-columns: 220px 1fr; gap: 16px; }
.admin-sider { background: var(--panel); border: 1px solid var(--border); border-radius: 12px; padding: 8px; }
.admin-main { background: var(--panel); border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
.admin-menu { border-right: none; background: transparent; }
.admin-menu .el-menu-item { border-radius: 8px; height: 40px; line-height: 40px; margin: 2px 0; }
.menu-item-inner { display: flex; align-items: center; justify-content: flex-start; width: 100%; }
.menu-item-inner .left { display: inline-flex; align-items: center; gap: 8px; }
.menu-item-inner .el-icon { font-size: 16px; }
.admin-menu .el-menu-item.is-active { color: #0b1219; background: color-mix(in oklab, var(--fg) 14%, transparent); }
.admin-menu .el-menu-item:hover { background: color-mix(in oklab, var(--fg) 10%, transparent); }
.panel { max-width: 820px; }
@media (max-width: 920px) {
  .admin-wrap { grid-template-columns: 1fr; }
  .admin-sider { display: none; }
  .sider-toggle { display: inline-flex; }
}


/* Logout button beautify */
.logout-btn { 
  --bg1: #ef4444; /* red-500 */
  --bg2: #dc2626; /* red-600 */
  --bg3: #b91c1c; /* red-700 */
  background: linear-gradient(90deg, var(--bg1), var(--bg2), var(--bg3));
  color: #ffffff;
  border: none;
  border-radius: 999px;
  padding: 0 12px;
  height: 30px;
  box-shadow: 0 2px 10px rgba(220,38,38,0.25);
}
.logout-btn:hover { filter: brightness(1.05); box-shadow: 0 4px 14px rgba(220,38,38,0.35); }
.logout-btn:active { transform: translateY(1px); }
.logout-btn .icon { font-size: 14px; line-height: 1; margin-right: 6px; }
.logout-btn .text { font-weight: 600; }
</style>


