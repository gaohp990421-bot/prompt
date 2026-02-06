<template>
  <div class="h-full overflow-y-auto p-6">
    <div class="max-w-[1400px] mx-auto">
      <!-- Header Section -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">提示词库</h1>
        <div class="text-sm text-gray-500">共 {{ totalCount }} 个提示词</div>
      </div>

      <!-- Filter/Search Placeholder -->
      <div class="flex flex-col gap-4 mb-8">
        <UInput v-model="searchQuery" icon="i-heroicons-magnifying-glass" placeholder="搜索提示词..." class="w-full max-w-sm"
          size="md" />
        <div class="flex items-center gap-2 flex-wrap">
          <UButton v-for="tag in popularTags" :key="tag" :color="selectedTag === tag ? 'primary' : 'neutral'"
            :variant="selectedTag === tag ? 'solid' : 'ghost'" size="xs" class="rounded-full px-4"
            @click="toggleTag(tag)">
            {{ tag }}
          </UButton>

          <div v-if="popularTags.length > 0" class="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1"></div>

          <UButton color="neutral" variant="ghost" icon="i-heroicons-cog-6-tooth" size="xs" class="rounded-full"
            to="/tags">
            标签管理</UButton>
        </div>
      </div>

      <!-- Grid Layout -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

        <!-- Create New Card -->
        <div v-if="currentPage === 1"
          class="h-52 bg-white dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 cursor-pointer flex flex-col items-center justify-center transition-all group"
          @click="navigateTo('/prompts/create')">
          <div
            class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-primary-100 dark:group-hover:bg-primary-900 flex items-center justify-center mb-3 transition-colors">
            <UIcon name="i-heroicons-plus" class="w-6 h-6 text-gray-400 group-hover:text-primary-500" />
          </div>
          <span class="text-sm font-medium text-gray-500 group-hover:text-primary-600">新增提示词</span>
        </div>

        <!-- Prompt Cards -->
        <div v-for="prompt in filteredPrompts" :key="prompt.id"
          class="h-52 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col hover:shadow-lg transition-all cursor-pointer relative group overflow-hidden"
          @click="navigateTo(`/prompts/${prompt.id}`)">
          <h3 class="font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{{ prompt.title }}</h3>
          <div v-if="prompt.tags && prompt.tags.length" class="flex flex-wrap gap-1.5 mb-2 h-6 overflow-hidden">
            <UBadge v-for="tag in prompt.tags" :key="tag" color="primary" variant="subtle" size="xs"
              class="rounded-full">
              {{ tag }}</UBadge>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-auto">{{ prompt.description ||
            prompt.content
          }}</p>

          <div
            class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs text-gray-400">
            <span>{{ new Date(prompt.createdAt).toLocaleDateString('zh-CN') }}</span>
            <UIcon name="i-heroicons-arrow-right"
              class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 transform duration-300" />
          </div>

          <!-- Action Buttons -->
          <div
            class="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-sm border border-gray-100 dark:border-gray-700 rounded-full px-2 py-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            @click.stop>
            <UTooltip text="复制内容">
              <UButton color="neutral" variant="ghost" icon="i-heroicons-document-duplicate" size="xs"
                @click="copyContent(prompt.content)" />
            </UTooltip>
            <UTooltip text="分享链接">
              <UButton color="neutral" variant="ghost" icon="i-heroicons-share" size="xs"
                @click="sharePrompt(prompt.id)" />
            </UTooltip>
            <UTooltip text="删除">
              <UButton color="error" variant="ghost" icon="i-heroicons-trash" size="xs"
                @click="deletePrompt(prompt.id)" />
            </UTooltip>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center mt-8">
        <UPagination v-model="currentPage" :total="totalCount" :items-per-page="pageSize" />
      </div>

      <!-- Delete Confirmation Modal -->
      <UModal v-model:open="isDeleteConfirmOpen" title="确认删除" description="确定要删除这个提示词吗？此操作无法撤销。"
        :ui="{ overlay: 'z-[60]', content: 'z-[60] sm:max-w-sm' }">
        <template #footer>
          <div class="flex justify-end gap-3 w-full">
            <UButton color="neutral" variant="ghost" @click="isDeleteConfirmOpen = false">取消</UButton>
            <UButton color="error" :loading="isDeleting" @click="confirmDelete">删除</UButton>
          </div>
        </template>
      </UModal>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const { success, error } = useAppToast() // custom toast composable

// --- State ---
const searchQuery = ref('')
const selectedTag = ref<string | null>(null)
const currentPage = ref(1)
const pageSize = 20

// --- Data Fetching ---
const { data: promptsData, refresh } = await useFetch('/api/prompts', {
  query: computed(() => ({ page: currentPage.value, pageSize })),
  watch: [currentPage],
})
const { data: tagsData } = await useFetch('/api/tags')

const totalCount = computed(() => {
  const d = promptsData.value as any
  return d?.total ?? 0
})

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize))

const prompts = computed(() => {
  const d = promptsData.value as any
  return (d?.prompts || d || []).map((p: any) => ({
    ...p,
    tags: Array.isArray(p.tags) ? p.tags : (p.tags ? JSON.parse(p.tags as string) : [])
  }))
})

// --- Filtering ---
const availableTags = computed(() => {
  const d = tagsData.value as any
  return (d?.tags || []).map((t: any) => t.name)
})

const popularTags = computed(() => {
  if (availableTags.value.length > 0) return availableTags.value.slice(0, 5)
  // Fallback if no API tags
  const tags = new Set<string>()
  prompts.value.forEach((p: any) => p.tags.forEach((t: string) => tags.add(t)))
  return Array.from(tags).slice(0, 10)
})

const filteredPrompts = computed(() => {
  let result = prompts.value

  if (selectedTag.value) {
    result = result.filter((p: any) => p.tags.includes(selectedTag.value!))
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter((p: any) =>
      p.title?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.content?.toLowerCase().includes(q)
    )
  }

  return result
})

const toggleTag = (tag: string) => {
  selectedTag.value = selectedTag.value === tag ? null : tag
}

// Delete Confirmation State
const isDeleteConfirmOpen = ref(false)
const promptToDeleteId = ref<string | number | null>(null)
const isDeleting = ref(false)

function deletePrompt(id: number | string) {
  promptToDeleteId.value = id
  isDeleteConfirmOpen.value = true
}

async function confirmDelete() {
  if (!promptToDeleteId.value) return

  isDeleting.value = true
  try {
    await $fetch(`/api/prompts/${promptToDeleteId.value}`, { method: 'DELETE' })
    success('删除成功')
    await refresh()
    isDeleteConfirmOpen.value = false
  } catch {
    error('删除失败')
  } finally {
    isDeleting.value = false
    promptToDeleteId.value = null
  }
}

const copyContent = (text: string) => {
  navigator.clipboard.writeText(text)
  success('内容已复制')
}

const sharePrompt = (id: number) => {
  const url = `${window.location.origin}/share/${id}`
  navigator.clipboard.writeText(url)
  success('链接已复制', '快去分享给小伙伴吧！')
}

const navigateTo = (path: string) => {
  router.push(path)
}
</script>
