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
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 rounded-full blur-[120px]" />
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
    </div>

    <div class="relative z-10 w-full h-full min-h-screen flex">
      <!-- 左侧 60%：动态视觉区域 (Changed from 70%) -->
      <div class="hidden lg:flex lg:w-[60%] bg-[#0B1120] relative overflow-hidden flex-col justify-start p-16 pt-24">
        <!-- 动态背景光 (增强版) -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            class="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px] animate-pulse"
            style="animation-duration: 4s;"></div>
          <div
            class="absolute bottom-[10%] right-[10%] w-[700px] h-[700px] bg-indigo-500/10 rounded-full blur-[130px] animate-pulse"
            style="animation-duration: 7s;"></div>
          <div
            class="absolute top-[40%] left-[60%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse"
            style="animation-duration: 5s;"></div>
        </div>

        <!-- 科技网格背景 -->
        <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div class="absolute inset-0 z-0 opacity-20"
          style="background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px); background-size: 50px 50px;">
        </div>

        <!-- 悬浮装饰元素 (模拟真实功能：变量、版本、标签) -->
        <div class="absolute inset-0 z-0 opacity-90">

          <!-- 连接线 (SVG) -->
          <svg class="absolute inset-0 w-full h-full pointer-events-none z-0"
            style="filter: drop-shadow(0 0 5px rgba(99, 102, 241, 0.5));">
            <!-- Line 1: Variable -> Version -->
            <path d="M 80% 25% Q 60% 35% 20% 45%" stroke="url(#grad1)" stroke-width="2" fill="none"
              class="animate-draw-line" stroke-dasharray="10 10" />
            <!-- Line 2: Version -> Tag -->
            <path d="M 20% 55% Q 40% 70% 60% 80%" stroke="url(#grad2)" stroke-width="2" fill="none"
              class="animate-draw-line-delayed" stroke-dasharray="10 10" />
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:rgba(99, 102, 241, 0.1)" />
                <stop offset="50%" style="stop-color:rgba(99, 102, 241, 0.6)" />
                <stop offset="100%" style="stop-color:rgba(34, 197, 94, 0.1)" />
              </linearGradient>
              <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:rgba(34, 197, 94, 0.1)" />
                <stop offset="50%" style="stop-color:rgba(168, 85, 247, 0.6)" />
                <stop offset="100%" style="stop-color:rgba(168, 85, 247, 0.1)" />
              </linearGradient>
            </defs>
          </svg>

          <!-- Card 1: Variable Template System (Top Right) -->
          <div
            class="absolute top-[15%] right-[10%] w-80 bg-[#1E293B]/90 border border-white/10 rounded-2xl backdrop-blur-xl p-5 transform rotate-[-4deg] animate-float-slow shadow-2xl shadow-indigo-500/20 z-10 hover:scale-105 transition-transform duration-500">
            <div class="flex items-center gap-2 mb-3 border-b border-white/5 pb-3">
              <div class="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <UIcon name="i-heroicons-variable" class="w-5 h-5 text-indigo-400" />
              </div>
              <span class="text-sm font-bold text-white tracking-wide">智能模版变量</span>
            </div>
            <!-- Added v-pre to fix Vue warnings about missing properties -->
            <div class="space-y-2 font-mono text-xs text-gray-300 relative" v-pre>
              <!-- Syntax Highlighting Decoration -->
              <div class="absolute -left-2 top-0 bottom-0 w-0.5 bg-indigo-500/30 rounded-full"></div>
              <div class="pl-2">为 <span
                  class="text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-500/30">{{产品名称}}</span>
                写一篇</div>
              <div class="pl-2"><span
                  class="text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-500/30">{{风格}}</span>
                的营销文案，</div>
              <div class="pl-2">突出其 <span
                  class="text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-500/30">{{核心优势}}</span>...
              </div>
            </div>
          </div>

          <!-- Card 2: Version Control (Center Left - Adjusted Position) -->
          <div
            class="absolute top-[55%] left-[8%] w-72 bg-[#1E293B]/90 border border-white/10 rounded-2xl backdrop-blur-xl p-5 transform rotate-[6deg] animate-float-medium shadow-2xl shadow-green-500/20 z-10 hover:scale-105 transition-transform duration-500">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <UIcon name="i-heroicons-clock" class="w-5 h-5 text-green-400" />
                </div>
                <span class="text-sm font-bold text-white tracking-wide">版本回溯</span>
              </div>
              <span
                class="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-xs text-green-400 font-mono">v3.2.0</span>
            </div>
            <div class="space-y-4 relative pl-2">
              <!-- Timeline Line -->
              <div class="absolute left-[13px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-green-500/50 to-transparent">
              </div>

              <!-- History Item 1 -->
              <div class="flex gap-3 relative z-10 items-start">
                <div class="w-3 h-3 mt-1 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] shrink-0">
                </div>
                <div class="space-y-1 bg-white/5 p-2 rounded-lg w-full border border-white/5">
                  <div class="text-xs font-bold text-white flex justify-between">
                    <span>v3.2.0 (Current)</span>
                    <span class="text-[10px] text-gray-500">Just now</span>
                  </div>
                  <div class="text-[10px] text-gray-400 leading-tight">优化了 Midjourney 参数...</div>
                </div>
              </div>
              <!-- History Item 2 -->
              <div class="flex gap-3 relative z-10 items-start opacity-60">
                <div class="w-3 h-3 mt-1 rounded-full bg-gray-600 border border-white/10 shrink-0"></div>
                <div class="space-y-1">
                  <div class="text-xs font-medium text-gray-300">v3.1.5</div>
                  <div class="text-[10px] text-gray-500">添加了负面提示词</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 3: Tag Management (Bottom Right) -->
          <div
            class="absolute bottom-[20%] left-[45%] w-72 bg-[#1E293B]/90 border border-white/10 rounded-2xl backdrop-blur-xl p-5 transform rotate-[-3deg] animate-float-fast shadow-2xl shadow-purple-500/20 z-10 hover:scale-105 transition-transform duration-500">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <UIcon name="i-heroicons-tag" class="w-5 h-5 text-purple-400" />
              </div>
              <span class="text-sm font-bold text-white tracking-wide">标签管理系统</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <span
                class="px-2.5 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-medium border border-purple-500/20 hover:bg-purple-500/30 transition-colors cursor-default">#创意写作</span>
              <span
                class="px-2.5 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-500/20 hover:bg-blue-500/30 transition-colors cursor-default">#代码助手</span>
              <span
                class="px-2.5 py-1.5 rounded-lg bg-pink-500/20 text-pink-300 text-xs font-medium border border-pink-500/20 hover:bg-pink-500/30 transition-colors cursor-default">#StableDiffusion</span>
              <span
                class="px-2.5 py-1.5 rounded-lg bg-white/5 text-gray-400 text-xs border border-white/5 border-dashed flex items-center gap-1 opacity-70">
                <UIcon name="i-heroicons-plus-small" class="w-3 h-3" /> 新建
              </span>
            </div>
          </div>
        </div>

        <!-- 装饰性标签云 (Relocated to Right side to make room for Feature Bar) -->
        <div class="absolute top-[30%] right-20 z-0 flex flex-col gap-3 opacity-20 pointer-events-none items-end" v-pre>
          <span
            class="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-white/30 text-xs backdrop-blur-sm">Prompt
            Engineering</span>
          <span
            class="px-3 py-1.5 rounded-lg bg-primary-500/10 border border-primary-500/10 text-primary-400/50 text-xs backdrop-blur-sm font-mono">{{Variables}}</span>
          <span
            class="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-white/30 text-xs backdrop-blur-sm">Version
            Control</span>
        </div>

        <!-- 文字内容 -->
        <div class="relative z-10 mb-10">
          <div
            class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-primary-500/30">
            <UIcon name="i-heroicons-cube-transparent" class="w-8 h-8 text-white" />
          </div>
          <h2 class="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
            激发创意<br />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400">管理您的 AI
              资产</span>
          </h2>
          <p class="text-lg text-gray-400 max-w-lg leading-relaxed mb-8">
            为个人和团队打造的现代化提示词管理平台。
            让每一个灵感都被妥善珍藏。
          </p>
        </div>

        <!-- Feature Highlights Bar (Moved to Bottom Left) -->
        <div class="absolute bottom-16 left-16 z-20 flex items-center gap-6 border-t border-white/10 pt-8 max-w-2xl">
          <div class="flex items-center gap-3 group cursor-default">
            <div
              class="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary-500/20 group-hover:border-primary-500/30 transition-all duration-300">
              <UIcon name="i-heroicons-variable"
                class="w-5 h-5 text-gray-400 group-hover:text-primary-400 transition-colors" />
            </div>
            <div>
              <div class="text-sm font-semibold text-gray-200">智能模版</div>
              <div class="text-xs text-gray-500">支持动态变量</div>
            </div>
          </div>
          <div class="w-px h-8 bg-white/10"></div>
          <div class="flex items-center gap-3 group cursor-default">
            <div
              class="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-green-500/20 group-hover:border-green-500/30 transition-all duration-300">
              <UIcon name="i-heroicons-clock"
                class="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors" />
            </div>
            <div>
              <div class="text-sm font-semibold text-gray-200">版本回溯</div>
              <div class="text-xs text-gray-500">全历史记录</div>
            </div>
          </div>
          <div class="w-px h-8 bg-white/10"></div>
          <div class="flex items-center gap-3 group cursor-default">
            <div
              class="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:border-purple-500/30 transition-all duration-300">
              <UIcon name="i-heroicons-shield-check"
                class="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
            </div>
            <div>
              <div class="text-sm font-semibold text-gray-200">安全存储</div>
              <div class="text-xs text-gray-500">隐私保护</div>
            </div>
          </div>
        </div>

        <!-- Decorative Patterns (Tech Vibes) -->
        <div class="absolute bottom-10 right-10 z-0 opacity-20 pointer-events-none grid grid-cols-4 gap-4">
          <div class="w-1 h-1 bg-white rounded-full"></div>
          <div class="w-1 h-1 bg-white rounded-full"></div>
          <div class="w-1 h-1 bg-white rounded-full"></div>
          <div class="w-1 h-1 bg-white rounded-full"></div>
          <div class="w-1 h-1 bg-white rounded-full"></div>
          <div class="w-1 h-1 bg-white rounded-full"></div>
          <div class="w-1 h-1 bg-white rounded-full"></div>
          <div class="w-1 h-1 bg-white rounded-full"></div>
          <div class="w-1 h-1 bg-white rounded-full"></div>
          <div class="w-1 h-1 bg-white rounded-full"></div>
          <div class="w-1 h-1 bg-white rounded-full"></div>
          <div class="w-1 h-1 bg-white rounded-full"></div>
        </div>
        <div
          class="absolute top-20 right-20 z-0 opacity-10 pointer-events-none text-white text-xs font-mono tracking-[0.5em] rotate-90 origin-top-right">
          SYSTEM_READY
        </div>
      </div>

      <!-- 右侧 40%：登录/注册 (Changed from 30%) -->
      <div
        class="w-full lg:w-[40%] flex flex-col justify-center items-center bg-white dark:bg-gray-950 p-8 shadow-2xl z-20 transition-all duration-300">
        <div class="w-full max-w-[400px]">
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
    </div>

  </div>
</template>
