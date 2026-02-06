<template>
    <USlideover v-model="isOpen" :ui="{ width: 'w-screen max-w-2xl' }">
        <div class="flex flex-col h-full bg-white dark:bg-gray-900 shadow-xl overflow-hidden">
            <!-- Header -->
            <div
                class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                    测试提示词
                </h3>
                <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
                    @click="isOpen = false" />
            </div>

            <div class="flex-1 overflow-y-auto p-4 space-y-6">
                <!-- API Settings -->
                <div class="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                    <button @click="isSettingsOpen = !isSettingsOpen"
                        class="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            <UIcon name="i-heroicons-cog-6-tooth" /> API 配置
                        </span>
                        <UIcon :name="isSettingsOpen ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                            class="text-gray-500" />
                    </button>

                    <div v-show="isSettingsOpen"
                        class="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 grid grid-cols-1 gap-4">
                        <!-- Node Selection -->
                        <UFormGroup label="API 节点 (API Node)">
                            <USelectMenu v-model="selectedNode" :options="apiNodes" option-attribute="label"
                                placeholder="选择 API 节点" />
                        </UFormGroup>

                        <UFormGroup label="API Base URL">
                            <UInput v-model="config.baseUrl" placeholder="https://anyrouter.top"
                                :disabled="selectedNode.value !== 'custom'" />
                        </UFormGroup>
                        <UFormGroup label="API Key">
                            <UInput v-model="config.apiKey" type="password" placeholder="sk-..." />
                        </UFormGroup>
                        <UFormGroup label="Model">
                            <UInput v-model="config.model" placeholder="gpt-3.5-turbo" />
                        </UFormGroup>
                        <div class="text-xs text-gray-500">
                            配置将自动保存在本地浏览器中
                        </div>
                    </div>
                </div>

                <!-- Variables Section -->
                <div v-if="variables.length > 0">
                    <div class="flex items-center gap-2 mb-3">
                        <h4 class="text-sm font-medium text-gray-900 dark:text-white">变量赋值</h4>
                        <span class="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">检测到 {{
                            variables.length }} 个变量</span>
                    </div>

                    <div class="space-y-3">
                        <div v-for="variable in variables" :key="variable" class="flex flex-col gap-1">
                            <label class="text-xs font-mono text-gray-500">{{ variable }}</label>
                            <UTextarea v-model="variableValues[variable]" :rows="1" autoresize
                                :placeholder="`输入 ${variable} 的值`" class="font-mono text-sm" />
                        </div>
                    </div>
                </div>

                <!-- User Message Input -->
                <div>
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">用户输入 (User Message)</h4>
                    <UTextarea v-model="userMessage" :rows="3" placeholder="输入要测试的内容..." />
                </div>

                <!-- Preview System Prompt -->
                <div>
                    <UButton size="xs" color="neutral" variant="ghost"
                        :icon="showPreview ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
                        @click="showPreview = !showPreview" class="mb-2">
                        系统提示词预览 (System Prompt)
                    </UButton>
                    <div v-if="showPreview"
                        class="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-xs font-mono whitespace-pre-wrap text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                        {{ interpolatedPrompt }}
                    </div>
                </div>

                <UDivider />

                <!-- Response Section -->
                <div v-if="response || isLoading" class="space-y-2">
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white">API 响应</h4>
                    <div
                        class="relative min-h-[100px] bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 font-mono text-sm">
                        <div v-if="isLoading"
                            class="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 rounded-lg z-10">
                            <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin text-primary-500" />
                        </div>
                        <div v-if="response" class="whitespace-pre-wrap break-words text-gray-800 dark:text-gray-200">
                            {{ response }}
                        </div>
                    </div>
                </div>
                <div v-if="error"
                    class="bg-red-50 dark:bg-red-900/10 text-red-500 text-sm p-3 rounded-lg border border-red-200 dark:border-red-900/20">
                    {{ error }}
                </div>
            </div>

            <!-- Footer -->
            <div
                class="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-900/50 flex-shrink-0">
                <UButton color="neutral" variant="ghost" @click="isOpen = false">关闭</UButton>
                <UButton color="primary" :loading="isLoading" @click="runTest" icon="i-heroicons-play">
                    运行测试
                </UButton>
            </div>
        </div>
    </USlideover>
</template>

<script setup lang="ts">
import { useStorage } from '@vueuse/core'

const props = defineProps<{
    modelValue: boolean
    promptContent: string
}>()

const emit = defineEmits(['update:modelValue', 'close'])

const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => {
        emit('update:modelValue', value)
        if (!value) emit('close')
    }
})

// Custom Local Storage Logic
function useLocalStorage<T>(key: string, initialValue: T) {
    const data = ref<T>(initialValue)
    onMounted(() => {
        try {
            const item = localStorage.getItem(key)
            if (item) {
                const parsed = JSON.parse(item)
                if (typeof initialValue === 'object' && initialValue !== null) {
                    data.value = { ...initialValue, ...parsed }
                } else {
                    data.value = parsed
                }
            }
        } catch (e) { }
    })
    watch(data, (val) => {
        try {
            localStorage.setItem(key, JSON.stringify(val))
        } catch (e) { }
    }, { deep: true })
    return data
}

const apiNodes = [
    { label: '主站直连 (anyrouter.top)', value: 'https://anyrouter.top' },
    { label: '大陆优化 1 (rainapp.top)', value: 'https://pmpjfbhq.cn-nb1.rainapp.top' },
    { label: '大陆优化 2 (fcapp.run)', value: 'https://a-ocnfniawgw.cn-shanghai.fcapp.run' },
    { label: '自定义', value: 'custom' }
]

const config = useLocalStorage('prompt-tester-config', {
    baseUrl: 'https://pmpjfbhq.cn-nb1.rainapp.top',
    apiKey: '',
    model: 'gpt-3.5-turbo'
})

const selectedNode = ref(apiNodes[1]) // Default to object

// Sync selectedNode with config.baseUrl
watch(selectedNode, (val) => {
    if (val.value !== 'custom') {
        config.value.baseUrl = val.value
    }
})

// If baseUrl changes from outside or storage, sync node
watch(() => config.value.baseUrl, (val) => {
    const node = apiNodes.find(n => n.value === val)
    if (node) {
        selectedNode.value = node
    } else {
        selectedNode.value = apiNodes[3] // custom
    }
}, { immediate: true })

onMounted(() => {
    const runtimeConfig = useRuntimeConfig()
    const envApiKey = runtimeConfig.public.anyrouterApiKey as string
    if (envApiKey && !config.value.apiKey) {
        config.value.apiKey = envApiKey
    }
})

const isSettingsOpen = ref(!config.value.apiKey)

const variableValues = ref<Record<string, string>>({})
const userMessage = ref('')
const response = ref('')
const error = ref('')
const isLoading = ref(false)
const showPreview = ref(false)

// Extract variables
const variables = computed(() => {
    const regex = /\{\{(.*?)\}\}/g
    const matches = props.promptContent.match(regex)
    if (!matches) return []
    return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '').trim()))]
})

watch(variables, (newVars) => {
    newVars.forEach(v => {
        if (!(v in variableValues.value)) {
            variableValues.value[v] = ''
        }
    })
}, { immediate: true })

const interpolatedPrompt = computed(() => {
    let content = props.promptContent
    for (const [key, value] of Object.entries(variableValues.value)) {
        const safeKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(`\\{\\{\\s*${safeKey}\\s*\\}\\}`, 'g')
        content = content.replace(regex, value || `{{${key}}}`)
    }
    return content
})

const runTest = async () => {
    if (!config.value.apiKey) {
        error.value = '请先配置 API Key'
        isSettingsOpen.value = true
        return
    }

    isLoading.value = true
    error.value = ''
    response.value = ''

    try {
        let baseUrl = config.value.baseUrl.trim().replace(/\/+$/, '')

        let endpoint = baseUrl
        // Smart URL normalization
        if (!endpoint.includes('/v1') && !endpoint.includes('/chat/completions')) {
            // It's likely a root domain like https://anyrouter.top
            endpoint = `${endpoint}/v1/chat/completions`
        } else if (endpoint.endsWith('/v1')) {
            endpoint = `${endpoint}/chat/completions`
        } else if (!endpoint.endsWith('/chat/completions')) {
            // User likely provided path but missing final endpoint
            endpoint = `${endpoint}/chat/completions`
        }

        const messages = [
            { role: 'system', content: interpolatedPrompt.value },
            { role: 'user', content: userMessage.value || ' ' }
        ]

        const res: any = await $fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.value.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: {
                model: config.value.model,
                messages: messages,
                stream: false
            }
        })

        if (res.choices && res.choices.length > 0) {
            response.value = res.choices[0].message.content
        } else {
            response.value = JSON.stringify(res, null, 2)
        }

    } catch (e: any) {
        console.error(e)
        const errorData = e.data || e.response?._data
        error.value = errorData?.error?.message || e.message || '请求失败'
    } finally {
        isLoading.value = false
    }
}
</script>
