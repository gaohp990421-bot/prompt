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
                    <h1 class="text-xl font-bold text-gray-900 dark:text-white">新增提示词</h1>
                </div>
                <!-- Action Buttons -->
                <div class="flex items-center gap-3">
                    <UButton color="primary" :loading="isSaving" class="px-6 rounded-full font-medium"
                        @click="submitForm">
                        保存
                    </UButton>
                    <UButton color="neutral" variant="soft" icon="i-heroicons-x-mark"
                        class="rounded-full w-9 h-9 flex items-center justify-center p-0"
                        @click="router.push('/dashboard')" />
                </div>
            </div>

            <!-- Create Form Container -->
            <div
                class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 flex-1 min-h-0 flex flex-col overflow-hidden shadow-xl ring-1 ring-gray-200 dark:ring-gray-800">
                <PromptForm ref="formRef" :initial-state="initialState" :loading="isSaving" submit-label="立即创建"
                    @submit="createPrompt" @cancel="router.push('/dashboard')" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const router = useRouter()
const { success, error: showError } = useAppToast()

const formRef = ref<{ $el: HTMLFormElement } | null>(null)
const isSaving = ref(false)

const initialState = {
    title: '',
    content: '',
    description: '',
    tags: [],
    version: '1.0.0'
}

function submitForm() {
    // Trigger the form's submit event
    if (formRef.value?.$el?.requestSubmit) {
        formRef.value.$el.requestSubmit()
    } else {
        formRef.value?.$el?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
    }
}

async function createPrompt(formData: any) {
    if (!formData.title || !formData.content) {
        showError('请填写完整信息')
        return
    }

    if (!formData.version) formData.version = '1.0.0'

    isSaving.value = true
    try {
        await $fetch('/api/prompts', {
            method: 'POST',
            body: formData
        })

        success('创建成功')
        router.push('/dashboard')
    } catch (e: any) {
        showError('创建失败', e.message)
    } finally {
        isSaving.value = false
    }
}
</script>
