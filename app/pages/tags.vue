<template>
    <div class="h-full overflow-y-auto p-6">
        <div class="max-w-[1400px] mx-auto">
            <div class="flex items-center gap-4 mb-8">
                <UButton icon="i-heroicons-arrow-left" color="neutral" variant="ghost" to="/dashboard" />
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">标签管理</h1>
            </div>

            <!-- Add Tag Section -->
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-8">
                <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">添加新标签</h2>
                <div class="flex gap-4">
                    <UInput v-model="newTagName" placeholder="输入标签名称..." class="flex-1" :disabled="isSubmitting"
                        @keyup.enter="createTag" />
                    <UButton :loading="isSubmitting" @click="createTag">添加标签</UButton>
                </div>
            </div>

            <!-- Tags List -->
            <div
                class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div class="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">标签列表</h2>
                    <span class="text-sm text-gray-500">共 {{ tags.length }} 个</span>
                </div>

                <div v-if="pending" class="p-8 text-center text-gray-500">
                    加载中...
                </div>

                <div v-else-if="tags.length === 0" class="p-8 text-center text-gray-500">
                    暂无标签
                </div>

                <div v-else class="p-6 flex flex-wrap gap-4">
                    <div v-for="tag in tags" :key="tag.id"
                        class="group relative flex items-center justify-between gap-3 px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                        <span class="text-xs font-medium text-gray-900 dark:text-white">{{ tag.name }}</span>

                        <div class="flex items-center gap-2">
                            <span class="text-[10px] text-gray-400">{{ new
                                Date(tag.createdAt).toLocaleDateString('zh-CN')
                            }}</span>
                            <UButton color="error" variant="ghost" icon="i-heroicons-trash" size="xs"
                                class="!p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                @click="deleteTag(tag.id)" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const { success, error } = useAppToast()
const newTagName = ref('')
const isSubmitting = ref(false)

// Fetch tags
const { data: tagsData, pending, refresh } = await useFetch<{ success: boolean; tags: any[] }>('/api/tags')
const tags = computed(() => tagsData.value?.tags || [])

async function createTag() {
    const name = newTagName.value.trim()
    if (!name) return

    // Duplicate Check
    if (tags.value.some((t: any) => t.name === name)) {
        error('添加失败', '标签名称已存在')
        return
    }

    isSubmitting.value = true
    try {
        const res = await $fetch<any>('/api/tags', {
            method: 'POST',
            body: { name }
        })

        if (res.success) {
            success('添加成功')
            newTagName.value = ''
            refresh()
        } else {
            error(res.message || '添加失败')
        }
    } catch (e: any) {
        error('添加失败', e.data?.message || e.message)
    } finally {
        isSubmitting.value = false
    }
}

async function deleteTag(id: number | string) {
    if (!confirm('确定要删除这个标签吗？')) return

    try {
        await $fetch(`/api/tags/${id}`, { method: 'DELETE' })
        success('删除成功')
        refresh()
    } catch (e) {
        error('删除失败')
    }
}
</script>
