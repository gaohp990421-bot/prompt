import { z } from 'zod'
import { useDb } from '../utils/db'
import { serializeData } from '../utils/serializer'
import { tags } from '../database/schema'
import { eq, and } from 'drizzle-orm'
import { generateId } from '../utils/snowflake'

const CreateTagSchema = z.object({
  name: z.string().min(1, '标签名称不能为空').max(50, '标签名称过长'),
})

export default defineEventHandler(async (event) => {
  const userIdStr = getCookie(event, 'auth_token')
  if (!userIdStr) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const validationResult = CreateTagSchema.safeParse(body)
  
  if (!validationResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: (validationResult.error as any).errors,
    })
  }

  const { name } = validationResult.data
  const db = useDb()
  const userId = BigInt(userIdStr)

  try {
    // Check duplication for THIS user
    const existing = await db.select().from(tags)
      .where(and(
        eq(tags.name, name), 
        eq(tags.userId, userId)
      ))
      .then(res => res[0])

    if (existing) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Tag already exists',
      })
    }

    const id = generateId()
    await db.insert(tags).values({
      id: BigInt(id),
      userId,
      name,
    })

    return {
      success: true,
      tag: serializeData({
        id,
        userId: userIdStr,
        name,
        createdAt: new Date(),
      })
    }
  } catch (error: any) {
    if (error.statusCode === 409) throw error
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  }
})
