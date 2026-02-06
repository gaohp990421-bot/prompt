import { prompts } from '../../database/schema'
import { useDb } from '../../utils/db'
import { serializeData } from '../../utils/serializer'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const idStr = getRouterParam(event, 'id')
  if (!idStr) {
    throw createError({ statusCode: 400, statusMessage: 'Missing ID' })
  }

  const db = useDb()
  if (!db) {
    throw createError({ statusCode: 500, statusMessage: 'Database Error' })
  }

  try {
    const prompt = await db.select({
      id: prompts.id,
      title: prompts.title,
      content: prompts.content,
      description: prompts.description,
      tags: prompts.tags,
      version: prompts.version,
      createdAt: prompts.createdAt,
    }).from(prompts)
      .where(and(
        eq(prompts.id, BigInt(idStr)),
        eq(prompts.isPublic, true)
      ))
      .then((res) => res[0])

    if (!prompt) {
      throw createError({
        statusCode: 404,
        statusMessage: '提示词不存在或未公开分享',
      })
    }

    return {
      success: true,
      data: serializeData(prompt)
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  }
})
