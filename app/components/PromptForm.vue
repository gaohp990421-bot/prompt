<template>
    <form @submit.prevent="handleSubmit" class="h-full flex flex-col">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
            <!-- Left Column: Meta Info -->
            <div class="lg:col-span-1 h-full flex flex-col min-h-0 pr-2 pb-1">
                <!-- Card Container -->
                <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 flex flex-col h-full overflow-hidden">
                    <!-- Top Section: Inputs -->
                    <div class="space-y-4 flex-shrink-0">
                        <!-- Title -->
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                标题 <span class="text-red-500">*</span>
                            </label>
                            <UInput v-model="formState.title" placeholder="为你的提示词起个醒目的标题" size="lg" class="w-full" />
                        </div>

                        <!-- Description -->
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                描述
                            </label>
                            <UTextarea v-model="formState.description" placeholder="简要描述这个提示词的用途和使用场景" :rows="3"
                                size="lg" class="w-full" />
                        </div>

                        <!-- Divider -->
                        <div class="border-t border-gray-200 dark:border-gray-700"></div>

                        <!-- Tags -->
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                <span class="flex items-center gap-2">
                                    <UIcon name="i-heroicons-tag" class="w-4 h-4" />
                                    标签
                                </span>
                            </label>
                            <ClientOnly>
                                <UInputMenu v-model="formState.tags" v-model:query="tagQuery" :items="availableTags"
                                    multiple create-item open-on-focus placeholder="选择或输入标签..." class="w-full"
                                    :ui="{ content: 'z-[100]' }" :tag-props="{ color: 'primary', variant: 'soft' }"
                                    @create="createTag" />
                            </ClientOnly>
                        </div>

                        <!-- Version Input & Changelog -->
                        <div>
                            <div class="flex items-center gap-4 mb-2">
                                <div class="w-32">
                                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        <span class="flex items-center gap-2">
                                            <UIcon name="i-heroicons-code-bracket" class="w-4 h-4" />
                                            版本
                                        </span>
                                    </label>
                                    <UInput v-model="formState.version" placeholder="1.0.0">
                                        <template #leading>
                                            <span class="text-gray-500 text-sm font-mono">v</span>
                                        </template>
                                    </UInput>
                                </div>
                                <div class="flex-1">
                                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        <span class="flex items-center gap-2">
                                            <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
                                            版本更新日志
                                        </span>
                                    </label>
                                    <UInput v-model="formState.changelog" placeholder="简述本次更新内容..." />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Versions List (Flex Grow to fill space) -->
                    <div v-if="versions.length > 0"
                        class="flex flex-col flex-1 min-h-0 mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex-shrink-0">
                            <span class="flex items-center gap-2">
                                <UIcon name="i-heroicons-clock" class="w-4 h-4" />
                                历史版本
                            </span>
                        </label>
                        <div class="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
                            <div v-for="v in versions" :key="v.id"
                                class="flex flex-col p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary-500 dark:hover:border-primary-500 cursor-pointer transition-colors group"
                                @click="confirmRestore(v)">
                                <div class="flex items-center justify-between mb-1">
                                    <div class="flex items-center gap-2">
                                        <span class="text-sm font-medium text-gray-900 dark:text-white">v{{ v.version
                                            }}</span>
                                        <UBadge v-if="v.version === formState.version" size="xs" color="neutral"
                                            variant="soft">当前</UBadge>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <span class="text-xs text-gray-400">{{ new Date(v.createdAt).toLocaleString()
                                            }}</span>
                                        <UIcon name="i-heroicons-arrow-path"
                                            class="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                                <!-- Changelog Display -->
                                <div v-if="v.changelog"
                                    class="text-xs text-gray-500 dark:text-gray-400 truncate pl-1 border-l-2 border-gray-200 dark:border-gray-700">
                                    {{ v.changelog }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Right Column: Content -->
            <div class="lg:col-span-2 flex flex-col min-h-0">
                <div class="flex items-center justify-between mb-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        提示词内容 <span class="text-red-500">*</span>
                    </label>
                    <div
                        class="flex items-center gap-1 text-amber-500 text-xs bg-amber-50 dark:bg-amber-900/10 px-2 py-0.5 rounded-md border border-amber-100 dark:border-amber-900/20">
                        <UIcon name="i-heroicons-light-bulb" class="w-3.5 h-3.5" />
                        <span v-pre>提示：使用 {{变量名}} 语法可以创建动态变量</span>
                    </div>
                </div>
                <div class="relative flex-1 min-h-0 flex flex-col">
                    <PromptEditor v-model="formState.content" placeholder="在这里输入你的提示词内容，可以包含具体的指令、上下文要求等"
                        class="w-full h-full" />
                </div>
            </div>
        </div>

        <!-- Tag Creation Confirmation Modal -->
        <UModal v-model:open="isTagConfirmOpen" title="创建新标签" :description="`确实要创建标签 '${pendingTag}' 吗？`"
            :ui="{ overlay: 'z-[60]', content: 'z-[60] sm:max-w-sm' }">
            <template #footer>
                <div class="flex justify-end gap-2 w-full">
                    <UButton color="neutral" variant="outline" @click="isTagConfirmOpen = false">取消</UButton>
                    <UButton color="primary" @click="confirmTagCreation">确认创建</UButton>
                </div>
            </template>
        </UModal>

        <!-- Restore Confirmation Modal -->
        <UModal v-model:open="isRestoreConfirmOpen" title="恢复历史版本"
            :description="`确定要将当前内容替换为版本 v${pendingVersion?.version} 吗？当前未保存的修改将丢失。`"
            :ui="{ overlay: 'z-[60]', content: 'z-[60] sm:max-w-sm' }">
            <template #footer>
                <div class="flex justify-end gap-2 w-full">
                    <UButton color="neutral" variant="outline" @click="isRestoreConfirmOpen = false">取消</UButton>
                    <UButton color="warning" @click="restoreVersion">确认恢复</UButton>
                </div>
            </template>
        </UModal>
    </form>
</template>

<script setup lang="ts">
const props = defineProps<{
    promptId?: string | number // Added promptId prop
    initialState?: {
        title: string
        content: string
        description: string
        tags: string[]
        version: string
        changelog?: string
    }
    loading?: boolean
    submitLabel?: string
}>()

const emit = defineEmits(['submit', 'cancel'])
const { success, error: showError } = useAppToast()

const formState = reactive({
    title: '',
    content: '',
    description: '',
    tags: [] as string[],
    version: '1.0.0',
    changelog: '' // Added changelog field
})

// Initialize state
watch(() => props.initialState, (val) => {
    if (val) {
        formState.title = val.title
        formState.content = val.content
        formState.description = val.description
        formState.tags = [...val.tags]
        formState.version = val.version
        formState.changelog = val.changelog || ''
    }
}, { immediate: true, deep: true })

const handleSubmit = () => {
    emit('submit', { ...formState })
}

// --- Tag Management Logic ---
const availableTags = ref<string[]>([])
const tagQuery = ref('')
const isTagConfirmOpen = ref(false)
const pendingTag = ref('')

// Fetch Tags
const { data: tagsData } = await useFetch<{ tags: any[] }>('/api/tags')
watch(tagsData, (val) => {
    if (val?.tags) {
        availableTags.value = val.tags.map(t => t.name)
    }
}, { immediate: true })

async function fetchTags() {
    try {
        const res = await $fetch<{ tags: any[] }>('/api/tags')
        if (res?.tags) {
            availableTags.value = res.tags.map(t => t.name)
        }
    } catch (e) {
        console.error('Failed to fetch tags', e)
    }
}

// Watch tags change to auto-clear query (covers both selection and creation)
watch(() => formState.tags, () => {
    nextTick(() => {
        tagQuery.value = ''
    })
}, { deep: true })

const createTag = (item: any) => {
    const newTag = typeof item === 'string' ? item : item.label
    if (!newTag) return

    // 1. Check if already selected
    if (formState.tags.includes(newTag)) {
        nextTick(() => { tagQuery.value = '' })
        return
    }

    // 2. Check if exists in availableTags (Global list)
    const existingGlobal = availableTags.value.find(t => t === newTag)
    if (existingGlobal) {
        formState.tags.push(existingGlobal)
        nextTick(() => {
            tagQuery.value = ''
            setTimeout(() => { tagQuery.value = '' }, 100)
        })
        return
    }

    // 3. Truly new tag -> Confirm creation
    pendingTag.value = newTag
    isTagConfirmOpen.value = true
    nextTick(() => {
        tagQuery.value = ''
    })
}

const confirmTagCreation = async () => {
    if (pendingTag.value && !formState.tags.includes(pendingTag.value)) {
        try {
            // 1. Optimistically add to local state
            formState.tags.push(pendingTag.value)

            // 2. Persist to backend (Tag Library)
            await $fetch('/api/tags', {
                method: 'POST',
                body: { name: pendingTag.value }
            })

            // 3. Refresh available tags
            if (!availableTags.value.includes(pendingTag.value)) {
                availableTags.value.push(pendingTag.value)
            }

            // Update global list just in case needed elsewhere via fetchTags() if we shared state, 
            // but here we just update local cache.

            success('标签创建成功')
        } catch (e) {
            formState.tags = formState.tags.filter(t => t !== pendingTag.value)
            showError('标签保存失败', '虽然已添加到当前展示，但未保存到标签库')
        }
    }
    isTagConfirmOpen.value = false
    pendingTag.value = ''
    nextTick(() => {
        tagQuery.value = ''
        setTimeout(() => {
            tagQuery.value = ''
        }, 100)
    })
}
// --- History Versions Logic ---
const versions = ref<any[]>([])
const isRestoreConfirmOpen = ref(false)
const pendingVersion = ref<any>(null)

// If promptId is provided (from props, though current props don't have it, we might need to add it or derive it?)
// Actually, fetchVersions needs an ID. The parent page has the ID.
// Let's add `promptId` to props.
const fetchVersions = async () => {
    if (!props.promptId) return
    try {
        const res = await $fetch<{ success: boolean, data: any[] }>(`/api/prompts/${props.promptId}/versions`)
        if (res.success) {
            versions.value = res.data
        }
    } catch (e) {
        console.error('Failed to fetch versions', e)
    }
}

watch(() => props.promptId, (newId) => {
    if (newId) fetchVersions()
}, { immediate: true })

const confirmRestore = (version: any) => {
    pendingVersion.value = version
    isRestoreConfirmOpen.value = true
}

const restoreVersion = () => {
    if (!pendingVersion.value) return

    // Restore state
    const v = pendingVersion.value
    formState.title = v.title
    formState.content = v.content
    formState.description = v.description || ''
    formState.version = v.version
    formState.changelog = v.changelog || ''
    // tags is JSON or array? Serializer handles it? 
    // Drizzle JSON is usually typed as unknown or any, need to cast.
    // If it comes from API via serializeData, it should be array if it was array in DB.
    formState.tags = Array.isArray(v.tags) ? [...v.tags] : []

    success(`已恢复至版本 v${v.version}`)
    isRestoreConfirmOpen.value = false
    pendingVersion.value = null
}

defineExpose({
    refreshVersions: fetchVersions
})
</script>
