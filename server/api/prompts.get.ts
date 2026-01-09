import { desc, eq } from 'drizzle-orm'
import { prompts } from '../database/schema'
import { useDb } from '../utils/db'
import { serializeData } from '../utils/serializer'

export default defineEventHandler(async (event) => {
  const userIdStr = getCookie(event, 'auth_token')
  if (!userIdStr) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const db = useDb()
  
  try {
    const allPrompts = await db.select().from(prompts)
      .where(eq(prompts.userId, BigInt(userIdStr)))
      .orderBy(desc(prompts.createdAt))
    
    console.log(`[API Debug] Fetched ${allPrompts.length} prompts for User ${userIdStr}`)

    return {
      success: true,
      prompts: serializeData(allPrompts)
    }
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch prompts'
    })
  }
})
