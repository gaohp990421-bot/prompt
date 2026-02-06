import { desc, eq, count } from 'drizzle-orm'
import { prompts } from '../database/schema'
import { useDb } from '../utils/db'
import { serializeData } from '../utils/serializer'

export default defineEventHandler(async (event) => {
  const userIdStr = getCookie(event, 'auth_token')
  if (!userIdStr) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20))

  const db = useDb()

  try {
    const [totalResult, pagePrompts] = await Promise.all([
      db.select({ count: count() }).from(prompts)
        .where(eq(prompts.userId, BigInt(userIdStr))),
      db.select().from(prompts)
        .where(eq(prompts.userId, BigInt(userIdStr)))
        .orderBy(desc(prompts.createdAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
    ])

    const total = totalResult[0]?.count ?? 0

    return {
      success: true,
      prompts: serializeData(pagePrompts),
      total,
      page,
      pageSize,
    }
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch prompts'
    })
  }
})
