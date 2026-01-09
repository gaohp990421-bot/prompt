<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div class="max-w-4xl mx-auto p-8">
            <!-- Loading State -->
            <div v-if="pending" class="flex justify-center items-center h-64">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="text-center py-16">
                <p class="text-red-500 mb-4">{{ error.message || '加载失败' }}</p>
                <UButton to="/dashboard">返回首页</UButton>
            </div>

            <!-- Detail View -->
            <div v-else class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8">
                <!-- Header -->
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ prompt.title }}</h1>
                        <div class="flex flex-wrap gap-2">
                            <UBadge v-for="tag in promptTags" :key="tag" color="primary" variant="subtle" size="sm"
                                class="rounded-full">
                                {{ tag }}
                            </UBadge>
                            <UBadge color="neutral" variant="soft" size="sm">v{{ prompt.version || '1.0.0' }}</UBadge>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <UButton icon="i-heroicons-document-duplicate" color="neutral" variant="outline"
                            @click="copyContent">
                            复制内容
                        </UButton>
                    </div>
                </div>

                <USeparator class="mb-6" />

                <!-- Description -->
                <div v-if="prompt.description" class="mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">描述</h3>
                    <p class="text-gray-700 dark:text-gray-300">{{ prompt.description }}</p>
                </div>

                <!-- Content -->
                <div>
                    <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">提示词内容</h3>
                    <div class="relative group">
                        <pre
                            class="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg font-mono text-sm whitespace-pre-wrap text-gray-800 dark:text-gray-200">{{ prompt.content }}</pre>
                        <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <UButton icon="i-heroicons-document-duplicate" size="xs" color="neutral" variant="ghost"
                                @click="copyContent" />
                        </div>
                    </div>
                </div>


            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { success, error: showError } = useAppToast()

const promptId = computed(() => route.params.id as string)
const { data, pending, error } = await useFetch(() => `/api/prompts/${promptId.value}`)

const prompt = computed(() => {
    const d = data.value as any
    return d?.prompt || d?.data || {}
})

const promptTags = computed(() => {
    const p = prompt.value
    const tags = p.tags
    if (Array.isArray(tags)) return tags
    if (typeof tags === 'string') {
        try {
            return JSON.parse(tags)
        } catch {
            return []
        }
    }
    return []
})

async function copyContent() {
    if (!prompt.value.content) return
    try {
        await navigator.clipboard.writeText(prompt.value.content)
        success('已复制提示词内容')
    } catch {
        showError('复制失败')
    }
}
</script>
