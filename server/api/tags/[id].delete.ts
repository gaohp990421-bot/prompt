import { eq, and } from 'drizzle-orm'
import { tags } from '../../database/schema'
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const userIdStr = getCookie(event, 'auth_token')
  if (!userIdStr) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const idStr = getRouterParam(event, 'id')
  if (!idStr) {
    throw createError({ statusCode: 400, statusMessage: 'Missing ID' })
  }

  const db = useDb()

  try {
    const result = await db.delete(tags)
      .where(and(
        eq(tags.id, BigInt(idStr)),
        eq(tags.userId, BigInt(userIdStr))
      )) as any
    
    if (result.affectedRows === 0) {
       throw createError({ statusCode: 404, statusMessage: 'Tag not found' })
    }

    return { success: true }
  } catch (error: any) {
    if (error.statusCode === 404) throw error
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete tag'
    })
  }
})
