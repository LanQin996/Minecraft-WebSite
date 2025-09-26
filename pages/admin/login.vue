<template>
  <div class="admin-auth">
    <div class="card">
      <h1 class="title">后台登录</h1>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="72px">
        <el-form-item label="账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入账号" autocomplete="username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" autocomplete="current-password" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="onSubmit">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
definePageMeta({ middleware: 'auth-guest' })

const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({ username: '', password: '' })
const rules = reactive<FormRules>({
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})

onMounted(async () => {
  // 若已登录则跳转后台首页
  try {
    const me = await $fetch<{ ok: boolean }>('/api/admin/me')
    if (me.ok) {
      router.replace('/admin')
    }
  } catch {}
})

async function onSubmit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return
  loading.value = true
  try {
    await $fetch('/api/admin/login', { method: 'POST', body: { username: form.username, password: form.password } })
    if (process.client) {
      await navigateTo('/admin')
    }
  } catch (e: any) {
    ElMessage.error(e?.data?.statusMessage || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style>
.admin-auth { display: flex; align-items: center; justify-content: center; min-height: 60vh; padding: 24px; }
.card { width: 100%; max-width: 420px; border: 1px solid var(--border); background: var(--panel); border-radius: 12px; padding: 20px 16px; }
.title { margin: 0 0 12px; font-size: 20px; text-align: center; }
</style>


