import { desc, eq, like, and } from 'drizzle-orm'
import { tags } from '../database/schema'
import { useDb } from '../utils/db'
import { serializeData } from '../utils/serializer'

export default defineEventHandler(async (event) => {
  const userIdStr = getCookie(event, 'auth_token')
  if (!userIdStr) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const query = getQuery(event)
  const search = query.q as string | undefined

  const db = useDb()
  
  try {
    const filters = [eq(tags.userId, BigInt(userIdStr))]
    if (search) {
      filters.push(like(tags.name, `%${search}%`))
    }

    const allTags = await db.select().from(tags)
      .where(and(...filters))
      .orderBy(desc(tags.createdAt))
    
    console.log(`[API Debug] Fetching tags for User: ${userIdStr}, Search: '${search || ''}', Found: ${allTags.length}`)

    return {
      success: true,
      tags: serializeData(allTags),
      total: allTags.length
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch tags'
    })
  }
})
