<template>
    <div class="h-full flex flex-col items-center justify-start pt-12 p-6 overflow-hidden">
        <div class="max-w-[1400px] w-full h-[83vh] flex flex-col gap-4">
            <!-- Header -->
            <div class="flex items-center justify-between flex-shrink-0 px-1">
                <div class="flex items-center gap-4">
                    <button @click="router.push('/dashboard')"
                        class="p-2 rounded-full hover:bg-white dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all">
                        <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
                    </button>
                    <h1 class="text-xl font-bold text-gray-900 dark:text-white">编辑提示词</h1>
                </div>
                <!-- Action Buttons -->
                <div class="flex items-center gap-3">
                    <UButton color="neutral" variant="soft" icon="i-heroicons-play"
                        class="rounded-full px-4 font-medium" @click="openTester">
                        测试
                    </UButton>
                    <UButton color="primary" :loading="isSaving" class="px-6 rounded-full font-medium"
                        @click="submitForm">
                        保存
                    </UButton>
                    <UButton color="neutral" variant="soft" icon="i-heroicons-x-mark"
                        class="rounded-full w-9 h-9 flex items-center justify-center p-0"
                        @click="router.push('/dashboard')" />
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="pending"
                class="flex justify-center items-center flex-1 min-h-0 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>

            <!-- Error State -->
            <div v-else-if="error"
                class="flex flex-col justify-center items-center flex-1 min-h-0 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl">
                <p class="text-red-500 mb-4">{{ error.message || '加载失败' }}</p>
                <UButton @click="() => refresh()">重试</UButton>
            </div>

            <!-- Edit Form Container -->
            <div v-else
                class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 flex-1 min-h-0 flex flex-col overflow-hidden shadow-xl ring-1 ring-gray-200 dark:ring-gray-800">
                <PromptForm ref="formRef" :initial-state="initialState" :loading="isSaving" :prompt-id="promptId"
                    submit-label="保存修改" @submit="savePrompt" @cancel="router.push('/dashboard')" />
            </div>

            <PromptTester v-model="isTesterOpen" :prompt-content="testContent" />
        </div>
    </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { success, error: showError } = useAppToast()

const formRef = ref<{ $el: HTMLFormElement } | null>(null)
const promptId = computed(() => route.params.id as string)
const { data, pending, error, refresh } = await useFetch(() => `/api/prompts/${promptId.value}`)

const isSaving = ref(false)
const isTesterOpen = ref(false)
const testContent = ref('')

function openTester() {
    if (formRef.value && 'getData' in formRef.value) {
        const data = (formRef.value as any).getData()
        testContent.value = data.content || ''
        isTesterOpen.value = true
    }
}

const initialState = computed(() => {
    const d = data.value as any
    const item = d?.prompt || d?.data || d
    if (!item) return undefined

    return {
        title: item.title || '',
        content: item.content || '',
        description: item.description || '',
        tags: (item.tags as string[]) || [],
        version: item.version || '1.0.0',
        changelog: item.changelog || ''
    }
})

function submitForm() {
    // Trigger the form's submit event
    if (formRef.value?.$el?.requestSubmit) {
        formRef.value.$el.requestSubmit()
    } else {
        formRef.value?.$el?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
    }
}

async function savePrompt(formData: any) {
    if (!formData.title || !formData.content) {
        showError('请填写完整信息')
        return
    }

    isSaving.value = true
    try {
        await $fetch(`/api/prompts/${promptId.value}`, {
            method: 'PUT',
            body: formData
        })

        success('保存成功')
        // Optimisation: Do not redirect to dashboard, stay here to continue editing or see history
        // router.push('/dashboard') 

        // Refresh history versions
        if (formRef.value && 'refreshVersions' in formRef.value) {
            (formRef.value as any).refreshVersions()
        }
    } catch (e: any) {
        showError('保存失败', e.message)
    } finally {
        isSaving.value = false
    }
}
</script>
