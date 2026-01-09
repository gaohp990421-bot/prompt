import { eq, and } from 'drizzle-orm'
import { prompts } from '../../database/schema'
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
    const result = await db.delete(prompts)
      .where(and(
        eq(prompts.id, BigInt(idStr)), 
        eq(prompts.userId, BigInt(userIdStr))
      )) as any

    if (result.affectedRows === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Prompt not found or access denied',
      })
    }

    return {
      success: true,
      message: 'Prompt deleted successfully',
    }
  } catch (error: any) {
    if (error.statusCode === 404) throw error
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  }
})
