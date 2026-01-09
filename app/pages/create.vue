<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

definePageMeta({
    layout: 'default',
    middleware: ['auth'] // 假设有 auth 中间件保护路由
})

// 1. 定义表单验证 Schema
const schema = z.object({
    title: z.string().min(1, '请输入标题').max(100, '标题不能超过100个字符'),
    content: z.string().min(1, '请输入提示词内容'),
    description: z.string().optional(),
    tags: z.string().optional(), // 前端用逗号分隔字符串输入，提交时处理
})

type Schema = z.output<typeof schema>

// 2. 状态管理
const state = reactive({
    title: '',
    content: '',
    description: '',
    tags: '',
})

const isLoading = ref(false)
const toast = useAppToast()
const router = useRouter()

// 3. 提交处理
async function onSubmit(event: FormSubmitEvent<Schema>) {
    isLoading.value = true
    try {
        // 处理标签：逗号分隔转数组
        const tagsArray = event.data.tags
            ? event.data.tags.split(/[,，]/).map(t => t.trim()).filter(Boolean)
            : []

        const response = await $fetch<{ success: boolean; id: string }>('/api/prompts', {
            method: 'POST',
            body: {
                ...event.data,
                tags: tagsArray
            }
        })

        if (response.success) {
            toast.success('创建成功', '您的提示词已发布')
            // 延迟跳转，提升体验
            setTimeout(() => {
                router.push('/dashboard')
            }, 500)
        }
    } catch (error: any) {
        const errorMsg = error.data?.message || '发布失败，请检查网络'
        // 如果是验证错误，展示第一条详细信息
        const detailMsg = error.data?.data?.[0]?.message
        toast.error('创建失败', detailMsg ? `${errorMsg}: ${detailMsg}` : errorMsg)
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <UContainer class="py-8 max-w-2xl">
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">创建一个新提示词</h1>
            <p class="text-gray-500 dark:text-gray-400">分享您的智慧，帮助他人获得灵感</p>
        </div>

        <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
            <!-- 标题 -->
            <UFormField label="标题" name="title" required :ui="{ label: 'font-semibold' }">
                <UInput v-model="state.title" placeholder="给提示词起个响亮的名字" size="lg" icon="i-heroicons-tag" />
            </UFormField>

            <!-- 描述 -->
            <UFormField label="简介 (可选)" name="description" :ui="{ label: 'font-semibold' }">
                <UInput v-model="state.description" placeholder="简单描述这个提示词的用途" size="lg" />
            </UFormField>

            <!-- 标签 -->
            <UFormField label="标签 (可选)" name="tags" help="多个标签请用逗号分隔" :ui="{ label: 'font-semibold' }">
                <UInput v-model="state.tags" placeholder="例如：写作, 编程, 效率" size="lg" icon="i-heroicons-hashtag" />
            </UFormField>

            <!-- 内容 -->
            <UFormField label="提示词内容" name="content" required :ui="{ label: 'font-semibold' }">
                <UTextarea v-model="state.content" placeholder="在这里输入详细的提示词内容..." :rows="8" size="lg"
                    class="font-mono text-sm" autoresize />
            </UFormField>

            <!-- 提交按钮 -->
            <div class="flex justify-end pt-4">
                <UButton type="submit" size="xl" color="primary" :loading="isLoading" icon="i-heroicons-paper-airplane"
                    class="px-8">
                    发布提示词
                </UButton>
            </div>
        </UForm>
    </UContainer>
</template>
