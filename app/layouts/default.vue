<template>
  <div class="h-screen bg-gray-50 dark:bg-gray-950 flex flex-col overflow-hidden">
    <!-- Top Navigation -->
    <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 z-50">
      <div class="px-6">
        <div class="max-w-[1400px] mx-auto h-16 flex items-center justify-between">
          <!-- Logo Area -->
          <div class="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            @click="navigateTo('/dashboard')">
            <div class="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <UIcon name="i-heroicons-sparkles" class="w-5 h-5 text-green-500" />
            </div>
            <span class="font-bold text-gray-900 dark:text-white text-lg tracking-tight">提示词管理</span>
          </div>

          <!-- Right Actions -->
          <div class="flex items-center gap-6">
            <ClientOnly>
              <div class="flex items-center gap-4">
                <!-- Contact Us -->
                <!-- Contact Us -->
                <UPopover mode="hover" :ui="{ content: 'w-auto' }">
                  <UButton color="neutral" variant="ghost" label="联系我们" icon="i-heroicons-chat-bubble-left-right" />
                  <template #content>
                    <div class="p-4 flex flex-col items-center gap-2">
                      <div class="text-sm font-medium text-gray-700 dark:text-gray-200">扫码联系我们</div>
                      <img src="/contact-qr.png" alt="Contact QR" class="w-40 h-40 rounded-lg" />
                    </div>
                  </template>
                </UPopover>

                <UButton :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'" color="neutral"
                  variant="ghost" aria-label="Theme" @click="isDark = !isDark" />
                <UButton variant="ghost" color="neutral" icon="i-heroicons-language" />

                <UDropdownMenu :items="userMenuItems" :ui="{ content: 'w-48' }">
                  <UButton color="neutral" variant="ghost" class="p-0 rounded-full">
                    <UAvatar alt="H" size="sm"
                      class="bg-orange-100 text-orange-600 ring-2 ring-white hover:ring-orange-200 transition-all" />
                  </UButton>
                </UDropdownMenu>
              </div>
              <template #fallback>
                <div class="flex items-center gap-4">
                  <button class="w-8 h-8 flex items-center justify-center">
                    <div class="w-5 h-5 bg-gray-200 rounded-full" />
                  </button>
                  <button class="w-8 h-8 flex items-center justify-center">
                    <div class="w-5 h-5 bg-gray-200 rounded-full" />
                  </button>
                  <div class="w-8 h-8 rounded-full bg-gray-100" />
                </div>
              </template>
            </ClientOnly>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 min-h-0 overflow-hidden">
      <slot />
    </main>

    <!-- Change Password Modal -->
    <UModal v-model:open="isPasswordModalOpen" :ui="{ overlay: 'z-[60]', content: 'z-[60] sm:max-w-md' }">
      <template #content>
        <div class="p-6">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                <UIcon name="i-heroicons-key" class="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">修改密码</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">设置一个安全的新密码</p>
              </div>
            </div>
            <UButton icon="i-heroicons-x-mark" color="neutral" variant="ghost" size="sm"
              @click="isPasswordModalOpen = false" />
          </div>

          <!-- Form -->
          <form @submit.prevent="handleChangePassword" class="space-y-5">
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">当前密码</label>
              <UInput v-model="pwdState.oldPassword" type="password" placeholder="输入当前密码（首次设置可留空）" size="lg" />
            </div>

            <div class="space-y-1.5">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">新密码 <span
                  class="text-red-500">*</span></label>
              <UInput v-model="pwdState.newPassword" type="password" placeholder="至少8位，包含字母和数字" size="lg" />
            </div>

            <div class="space-y-1.5">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">确认新密码 <span
                  class="text-red-500">*</span></label>
              <UInput v-model="pwdState.confirmPassword" type="password" placeholder="再次输入新密码" size="lg" />
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <UButton color="neutral" variant="outline" @click="isPasswordModalOpen = false">取消</UButton>
              <UButton type="submit" color="primary" :loading="isChangingPwd">
                <template #leading>
                  <UIcon name="i-heroicons-check" class="w-4 h-4" />
                </template>
                确认修改
              </UButton>
            </div>
          </form>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const { success, error: showError } = useAppToast()
const router = useRouter()

const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
})

// --- Logout Logic ---
async function handleLogout() {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
  } catch (e) {
    console.error('Logout failed', e)
    // Ignore error, force logout
  } finally {
    const authStatus = useCookie('auth_status')
    authStatus.value = null // Clear immediately
    success('已退出登录')
    router.push('/') // Redirect to Login
  }
}

// --- Change Password Logic ---
const pwdState = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const isChangingPwd = ref(false)

async function handleChangePassword() {
  if (pwdState.newPassword !== pwdState.confirmPassword) {
    showError('两次输入的密码不一致')
    return
  }
  if (pwdState.newPassword.length < 8) {
    showError('新密码至少需要8位')
    return
  }
  if (!/[a-zA-Z]/.test(pwdState.newPassword)) {
    showError('新密码必须包含至少一个字母')
    return
  }
  if (!/[0-9]/.test(pwdState.newPassword)) {
    showError('新密码必须包含至少一个数字')
    return
  }

  isChangingPwd.value = true
  try {
    await $fetch('/api/auth/change-password', {
      method: 'POST',
      body: {
        oldPassword: pwdState.oldPassword || undefined, // Send undefined if empty
        newPassword: pwdState.newPassword
      }
    })
    success('密码修改成功')
    isPasswordModalOpen.value = false
  } catch (e: any) {
    showError('修改失败', e.data?.message || e.message)
  } finally {
    isChangingPwd.value = false
  }
}

// --- Menu Items ---
const isPasswordModalOpen = ref(false)

const userMenuItems = [
  [{
    label: '用户账户',
    avatar: { alt: 'H', class: 'bg-orange-100 text-orange-600' },
    type: 'label' as const
  }],
  [{
    label: '修改密码',
    icon: 'i-heroicons-key',
    onSelect: () => {
      pwdState.oldPassword = ''
      pwdState.newPassword = ''
      pwdState.confirmPassword = ''
      isPasswordModalOpen.value = true
    }
  }],
  [{
    label: '退出登录',
    icon: 'i-heroicons-arrow-right-on-rectangle',
    color: 'error' as const,
    onSelect: handleLogout
  }]
]
</script>
