<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

definePageMeta({
  layout: 'auth'
})

// Schemas
const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码')
})

const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string()
    .min(8, '密码至少需要8位')
    .regex(/[a-zA-Z]/, '密码必须包含至少一个字母')
    .regex(/[0-9]/, '密码必须包含至少一个数字'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
})

const isRegister = ref(false)
const schema = computed(() => isRegister.value ? registerSchema : loginSchema)

type Schema = z.output<typeof registerSchema>

const state = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

const toast = useAppToast()
const router = useRouter()
const isLoading = ref(false)

function toggleMode() {
  isRegister.value = !isRegister.value
  state.password = ''
  state.confirmPassword = ''
  // Keep email for convenience
}

function navigateToLinuxDo() {
  window.location.href = '/api/auth/login/linuxdo'
}

async function onSubmit(event: FormSubmitEvent<any>) {
  isLoading.value = true
  try {
    // 模拟网络延迟，增加交互质感
    await new Promise(resolve => setTimeout(resolve, 800))

    if (isRegister.value) {
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: {
          email: event.data.email,
          password: event.data.password,
          confirmPassword: event.data.confirmPassword
        }
      })
      toast.success('注册成功', '正在为您自动登录...')
    } else {
      await $fetch('/api/auth/login', {
        method: 'POST',
        body: {
          email: event.data.email,
          password: event.data.password,
        },
      })
    }

    router.push('/dashboard')
  } catch (error: any) {
    const action = isRegister.value ? '注册' : '登录'
    toast.error(`${action}失败`, error.data?.message || error.data?.statusMessage || '操作失败')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
    <!-- 背景装饰 -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/20 rounded-full blur-[120px]" />
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px]" />
    </div>

    <!-- Centered Login/Register Card -->
    <UContainer class="relative z-10 w-full max-w-md px-4 flex items-center justify-center min-h-screen">
      <div
        class="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 transition-all duration-300">
        <div class="w-full">
          <!-- 头部 -->
          <div class="text-center mb-8">
            <div
              class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-500 mb-4 transition-transform duration-300"
              :class="{ 'rotate-12': isRegister }">
              <UIcon :name="isRegister ? 'i-heroicons-user-plus' : 'i-heroicons-rocket-launch'" class="w-6 h-6" />
            </div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-all duration-300">
              {{ isRegister ? '欢迎加入' : '欢迎回来' }}
            </h1>
            <p class="text-gray-500 dark:text-gray-400 text-sm transition-all duration-300">
              {{ isRegister ? '创建一个新账号以开始使用' : '登录以继续使用 Prompt 管理平台' }}
            </p>
          </div>

          <!-- 表单 -->
          <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
            <UFormField label="邮箱地址" name="email" class="grid grid-cols-[1fr] items-start gap-2"
              :ui="{ label: 'font-medium text-gray-700 dark:text-gray-200' }">
              <UInput v-model="state.email" placeholder="name@example.com" icon="i-heroicons-envelope" size="lg"
                class="w-full" />
            </UFormField>

            <UFormField label="密码" name="password" class="grid grid-cols-[1fr] items-start gap-2"
              :ui="{ label: 'font-medium text-gray-700 dark:text-gray-200' }">
              <UInput v-model="state.password" :placeholder="isRegister ? '至少8位，含字母和数字' : '请输入密码'"
                icon="i-heroicons-lock-closed" size="lg" type="password" class="w-full" />
            </UFormField>

            <!-- 确认密码 (仅注册模式显示) -->
            <UFormField v-if="isRegister" label="确认密码" name="confirmPassword"
              class="grid grid-cols-[1fr] items-start gap-2 animate-fade-in-down"
              :ui="{ label: 'font-medium text-gray-700 dark:text-gray-200' }">
              <UInput v-model="state.confirmPassword" placeholder="请再次输入密码" icon="i-heroicons-lock-closed" size="lg"
                type="password" class="w-full" />
            </UFormField>

            <UButton type="submit" block size="lg" :loading="isLoading" color="primary" variant="solid"
              class="mt-6 font-semibold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all duration-300">
              {{ isRegister ? '注册并登录' : '登录' }}
            </UButton>
          </UForm>

          <!-- 第三方登录 Divider -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white dark:bg-gray-900 text-gray-500">Or continue with</span>
            </div>
          </div>

          <!-- Linux DO Login Button -->
          <UButton block size="lg" color="neutral" variant="solid" @click="navigateToLinuxDo"
            class="font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
            <template #leading>
              <!-- 简单的 Linux 图标，如果有 linux do 专属图标可替换 -->
              <UIcon name="i-simple-icons-linux" class="w-5 h-5 text-gray-900 dark:text-white" />
            </template>
            <span class="text-gray-700 dark:text-gray-200">Linux DO Login</span>
          </UButton>

          <!-- 底部 -->
          <div class="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
            <p class="text-sm text-gray-500 mb-6">
              {{ isRegister ? '已有账号？' : '还没有账号？' }}
              <button type="button" @click="toggleMode"
                class="text-primary-500 hover:text-primary-600 font-medium transition-colors focus:outline-none ml-1">
                {{ isRegister ? '直接登录' : '立即注册' }}
              </button>
            </p>

            <!-- Contact Us (In-column) -->
            <UPopover mode="hover" :ui="{ content: 'w-auto' }" :popper="{ placement: 'top' }">
              <UButton color="neutral" variant="ghost" label="遇到问题？联系客服"
                icon="i-heroicons-chat-bubble-bottom-center-text"
                class="rounded-full bg-gray-50 dark:bg-gray-900 shadow-sm text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all text-xs" />
              <template #content>
                <div class="p-4 flex flex-col items-center gap-2">
                  <div class="text-sm font-medium text-gray-700 dark:text-gray-200">扫码联系我们</div>
                  <img src="/contact-qr.png" alt="Contact QR" class="w-32 h-32 rounded-lg" />
                </div>
              </template>
            </UPopover>
          </div>
        </div>
      </div>
    </UContainer>
  </div>
</template>
