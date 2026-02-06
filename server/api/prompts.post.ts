import { z } from 'zod'
import { prompts } from '../database/schema'
import { useDb } from '../utils/db'
import { generateId } from '../utils/snowflake'

// 验证 Schema
const CreatePromptSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100, '标题不能超过100个字符'),
  content: z.string().min(1, '内容不能为空'),
  description: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  isPublic: z.boolean().optional().default(false),
})

export default defineEventHandler(async (event) => {
  // 1. 验证用户登录状态
  const userId = getCookie(event, 'auth_token')
  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: '请先登录',
    })
  }

  // 2. 读取并验证请求体
  const body = await readBody(event)
  const validation = CreatePromptSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Error',
      data: (validation as any).error.errors,
    })
  }

  const { title, content, description, tags, isPublic } = validation.data
  const db = useDb()
  if (!db) {
    throw createError({
        statusCode: 500,
        statusMessage: 'Database Error',
    })
  }
  const id = generateId()
  
  // 3. 插入数据库
  try {
    await db.insert(prompts).values({
      id: BigInt(id),
      userId: BigInt(userId),
      title,
      content,
      description: description || null,
      tags: tags,
      isPublic,
      version: '1.0.0',
      createdAt: new Date(),
    })
    
    return {
      success: true,
      id: id,
    }
  } catch (error) {
    console.error('Create prompt error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: '创建失败，请稍后重试',
    })
  }
})
