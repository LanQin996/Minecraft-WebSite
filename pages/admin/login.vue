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
          <el-button type="primary" :loading="loading" @click="startCaptcha">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'

// 声明全局极验函数
declare global {
  interface Window {
    initGeetest4?: (
      options: { captchaId: string; product: 'bind'; nativeButton?: boolean },
      cb: (obj: any) => void
    ) => void
  }
}

const router = useRouter()
const runtime = useRuntimeConfig()
definePageMeta({ middleware: 'auth-guest' })

const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({ username: '', password: '' })
const rules = reactive<FormRules>({
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})

// 初始化极验
let captchaObj: any = null
const geetestEnabled = computed(() => Boolean(runtime.public?.geetestId))

onMounted(async () => {
  // 如果已登录直接跳后台
  try {
    const me = await $fetch<{ ok: boolean }>('/api/admin/me')
    if (me.ok) router.replace('/admin')
  } catch {}

  if (process.client && geetestEnabled.value) {
    // 加载极验脚本
    const script = document.createElement('script')
    script.src = 'https://static.geetest.com/v4/gt4.js'
    script.async = true
    script.onload = initCaptcha
    document.body.appendChild(script)
  }
})

function initCaptcha() {
  if (window.initGeetest4 && geetestEnabled.value) {
    window.initGeetest4(
      {
        captchaId: runtime.public?.geetestId as string, // 你的ID
        product: 'bind', // 绑定模式
        nativeButton: false
      },
      (obj: any) => {
        captchaObj = obj
        // 验证通过回调
        obj.onSuccess(async () => {
          const result = obj.getValidate()
          if (!result) return
          // result: lot_number、captcha_output、pass_token、gen_time
          await onSubmit(result)
        })
      }
    )
  }
}

async function startCaptcha() {
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return
  if (captchaObj && geetestEnabled.value) {
    captchaObj.showBox() // 显示极验弹窗
  } else {
    // 未配置极验则直接登录
    await onSubmit()
  }
}

async function onSubmit(validate?: { lot_number: string; captcha_output: string; pass_token: string; gen_time: string }) {
  loading.value = true
  try {
    await $fetch('/api/admin/login', {
      method: 'POST',
      body: {
        username: form.username,
        password: form.password,
        lot_number: validate?.lot_number,
        captcha_output: validate?.captcha_output,
        pass_token: validate?.pass_token,
        gen_time: validate?.gen_time
      }
    })
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

.admin-auth :deep(.el-form-item__label) { color: var(--fg); }
.admin-auth :deep(.el-input__wrapper),
.admin-auth :deep(.el-textarea__inner) {
  background: var(--panel) !important;
  border: 1px solid var(--border);
  box-shadow: none;
  color: var(--fg);
}
.admin-auth :deep(.el-input__inner) { color: var(--fg); }
</style>


