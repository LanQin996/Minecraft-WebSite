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
          <el-menu-item index="modules">
            <div class="menu-item-inner">
              <span class="left"><el-icon><Setting /></el-icon><span>功能模块</span></span>
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
            <el-form-item label="底部版权"><el-input v-model="site.footer" placeholder="例如：© 2025 Minecraft Server · 保留所有权利" /></el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving.site" @click="saveSite">保存</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div v-show="active === 'modules'" class="panel">
          <el-form :model="modules" :label-width="120" ref="modulesRef" class="form">
            <el-form-item label="启用 LiteBans">
              <el-switch v-model="modules.enable_litebans" />
            </el-form-item>
            <el-form-item label="LiteBans 主机"><el-input v-model="modules.lb_host" placeholder="localhost" /></el-form-item>
            <el-form-item label="LiteBans 端口"><el-input v-model.number="modules.lb_port" type="number" placeholder="3306" /></el-form-item>
            <el-form-item label="LiteBans 用户名"><el-input v-model="modules.lb_user" /></el-form-item>
            <el-form-item label="LiteBans 密码"><el-input v-model="modules.lb_password" type="password" show-password /></el-form-item>
            <el-form-item label="LiteBans 数据库"><el-input v-model="modules.lb_database" /></el-form-item>
            <el-form-item label="表前缀"><el-input v-model="modules.lb_prefix" placeholder="litebans" /></el-form-item>
            <el-form-item>
              <el-button style="margin-left:8px" :loading="testingConn" @click="testConnection">测试连接</el-button>
              <el-button type="primary" :disabled="!connOk" :loading="saving.modules" @click="saveModules">保存</el-button>
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
        <el-menu-item index="modules">
          <div class="menu-item-inner">
            <span class="left"><el-icon><Setting /></el-icon><span>功能模块</span></span>
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

const active = ref<'site' | 'hero' | 'profile' | 'modules'>('site')
const drawerOpen = ref(false)
function onSelect(key: string) {
  active.value = key as any
  if (drawerOpen.value) drawerOpen.value = false
}
const saving = reactive({ site: false, hero: false, profile: false, modules: false })

// Site tab
const siteRef = ref<FormInstance>()
const { data: siteData, refresh: refreshSite } = await useAsyncData('admin-site', () => $fetch('/api/admin/site', { headers: process.server ? useRequestHeaders(['cookie']) : undefined }))
const site = reactive({
  site_title: siteData.value?.site_title || '',
  site_subtitle: siteData.value?.site_subtitle || '',
  site_description: siteData.value?.site_description || '',
  logo_url: siteData.value?.logo_url || '',
  favicon_url: siteData.value?.favicon_url || '',
  footer: siteData.value?.footer || ''
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

// Modules tab
const modulesRef = ref<FormInstance>()
const { data: modulesData, refresh: refreshModules } = await useAsyncData('admin-modules', () => $fetch('/api/admin/modules', { headers: process.server ? useRequestHeaders(['cookie']) : undefined }))
const modules = reactive<{ enable_litebans: boolean; lb_host: string; lb_port: number; lb_user: string; lb_password: string; lb_database: string; lb_prefix: string }>({
  enable_litebans: !!(modulesData.value as any)?.enable_litebans,
  lb_host: (modulesData.value as any)?.lb_host || 'localhost',
  lb_port: Number((modulesData.value as any)?.lb_port || 3306),
  lb_user: (modulesData.value as any)?.lb_user || '',
  lb_password: (modulesData.value as any)?.lb_password || '',
  lb_database: (modulesData.value as any)?.lb_database || '',
  lb_prefix: (modulesData.value as any)?.lb_prefix || 'litebans'
})
watch(modulesData, (v: any) => { if (!v) return; modules.enable_litebans = !!v.enable_litebans; modules.lb_host = v.lb_host; modules.lb_port = Number(v.lb_port); modules.lb_user = v.lb_user; modules.lb_password = v.lb_password; modules.lb_database = v.lb_database; modules.lb_prefix = v.lb_prefix })
// connection test state
const connOk = ref(false)
watch(modules, () => { connOk.value = false }, { deep: true })
async function saveModules() {
  saving.modules = true
  try {
    await $fetch('/api/admin/modules', { method: 'PUT', body: modules })
    await refreshModules()
    ElMessage.success('已保存')
  } catch (e: any) {
    ElMessage.error(e?.data?.statusMessage || '保存失败')
  } finally {
    saving.modules = false
  }
}

const testingConn = ref(false)
async function testConnection() {
  testingConn.value = true
  try {
    const resp = await $fetch<{ ok: boolean; tableExists?: boolean; error?: string }>(
      '/api/admin/modules.test', { method: 'POST', body: modules }
    )
    if (resp.ok) {
      connOk.value = !!resp.tableExists
      if (resp.tableExists) {
        if ((resp as any).matched) {
          ElMessage.success(`连接成功，检测到表：${(resp as any).matched}`)
        } else {
          ElMessage.success('连接成功，已检测到表存在')
        }
      } else {
        ElMessage.warning('连接成功，但未检测到封禁表（请检查前缀）')
      }
    } else {
      connOk.value = false
      ElMessage.error(resp.error || '连接失败')
    }
  } catch (e: any) {
    connOk.value = false
    ElMessage.error(e?.data?.statusMessage || '连接失败')
  } finally {
    testingConn.value = false
  }
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
.admin-page { 
  padding: 16px; 
  /* Element Plus vars to adapt dark mode */
  --el-bg-color: var(--panel);
  --el-fill-color-blank: var(--panel);
  --el-color-white: var(--panel);
  --el-text-color-primary: var(--fg);
  --el-text-color-regular: var(--fg);
  --el-border-color: var(--border);
  --el-border-color-light: var(--border);
  --el-border-color-lighter: var(--border);
}
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
.admin-menu .el-menu-item.is-active { color: #265df5; background: color-mix(in oklab, var(--fg) 14%, transparent); }
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

/* Dark/Light adapt for Element Plus controls */
.admin-page :deep(.el-form-item__label) { color: var(--fg); pointer-events: none; }
.admin-page :deep(.el-input__wrapper),
.admin-page :deep(.el-textarea__inner) {
  background: var(--panel) !important;
  border: 1px solid var(--border);
  box-shadow: none;
  color: var(--fg);
}
.admin-page :deep(.el-input__wrapper:hover) { border-color: var(--border); box-shadow: none; }
/* correct focus states */
.admin-page :deep(.el-input__wrapper.is-focus),
.admin-page :deep(.el-textarea__inner:focus) {
  border-color: color-mix(in oklab, var(--fg) 40%, var(--border));
  box-shadow: none;
}
.admin-page :deep(.el-input__inner) { color: var(--fg); }
.admin-page :deep(.el-switch__core) { border-color: var(--border); background: var(--panel); }
.admin-page :deep(.el-switch.is-checked .el-switch__core) { background: color-mix(in oklab, var(--fg) 25%, #3b82f6 10%); }
.admin-page :deep(.el-select .el-select__wrapper) { background: var(--panel); border: 1px solid var(--border); box-shadow: none; color: var(--fg); }
.admin-page :deep(.el-upload),
.admin-page :deep(.el-upload-dragger) { background: var(--panel); border-color: var(--border); color: var(--fg); }
.admin-page :deep(.el-button) { color: var(--fg); border-color: var(--border); background: var(--panel); }
.admin-page :deep(.el-button:focus) { outline: none; }
.admin-page :deep(.el-button:focus-visible) { outline: 2px solid color-mix(in oklab, var(--fg) 40%, #3b82f6 10%); outline-offset: 1px; }
.admin-page :deep(.el-button:active) { transform: translateY(1px); }
.admin-page :deep(.el-button:hover) { background: color-mix(in oklab, var(--fg) 8%, var(--panel)); border-color: color-mix(in oklab, var(--fg) 20%, var(--border)); }
.admin-page :deep(.el-button.is-disabled),
.admin-page :deep(.is-disabled.el-button) { color: var(--muted); background: color-mix(in oklab, var(--panel) 96%, var(--fg) 4%); border-color: var(--border); }
.admin-page :deep(.el-button.is-plain) { background: var(--panel); }
.admin-page :deep(.el-button--primary) { border-color: transparent; }
.admin-page :deep(.el-message) { background: var(--panel); border: 1px solid var(--border); color: var(--fg); }

.admin-page :deep(.el-input.is-disabled .el-input__wrapper),
.admin-page :deep(.is-disabled .el-input__wrapper) { background: color-mix(in oklab, var(--panel) 96%, var(--fg) 4%); }
</style>

<style>
/* Sidebar dark-mode variables and overrides (scoped) */
.admin-sider .admin-menu {
  /* Bind Element Plus menu variables to site theme vars */
  --el-menu-text-color: var(--fg);
  --el-menu-active-color: var(--fg);
  --el-menu-bg-color: var(--panel);
  --el-menu-hover-bg-color: color-mix(in oklab, var(--fg) 10%, transparent);
  --el-menu-border-color: var(--border);
}
.admin-sider :deep(.el-menu) { background: var(--panel); border-color: var(--border); }
.admin-sider :deep(.el-menu-item),
.admin-sider :deep(.el-sub-menu__title) { color: var(--fg); }
.admin-sider :deep(.el-menu-item .el-icon),
.admin-sider :deep(.el-sub-menu__title .el-icon) { color: var(--fg); }
.admin-sider :deep(.el-menu-item.is-active) {
  background: color-mix(in oklab, var(--fg) 12%, transparent);
  color: var(--fg);
}
.admin-sider :deep(.el-menu-item.is-active .el-icon) { color: var(--fg); }
.admin-sider :deep(.el-menu-item:not(.is-active):hover) {
  background: color-mix(in oklab, var(--fg) 10%, transparent);
  color: var(--fg);
}
</style>