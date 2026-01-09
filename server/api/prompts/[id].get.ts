import { prompts, promptVersions } from '../../database/schema'
import { useDb } from '../../utils/db'
import { serializeData } from '../../utils/serializer'
import { desc, eq, and } from 'drizzle-orm'

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
  if (!db) {
    throw createError({ statusCode: 500, statusMessage: 'Database Error' })
  }

  try {
    const prompt = await db.select().from(prompts)
      .where(and(
        eq(prompts.id, BigInt(idStr)), 
        eq(prompts.userId, BigInt(userIdStr))
      ))
      .then((res) => res[0])

    if (!prompt) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Prompt not found',
      })
    }

    // specific fetch for changelog from versions table
    // verify if we have a version, otherwise default to latest
    const latestVersion = await db.select({ changelog: promptVersions.changelog })
        .from(promptVersions)
        .where(and(
            eq(promptVersions.promptId, prompt.id),
            eq(promptVersions.version, prompt.version || '1.0.0')
        ))
        .orderBy(desc(promptVersions.createdAt))
        .limit(1)
        .then(res => res[0])
    
    // Merge changelog into the response
    const responseData = {
        ...prompt,
        changelog: latestVersion?.changelog || ''
    }

    return {
      success: true,
      data: serializeData(responseData)
    }
  } catch (error: any) {
    if (error.statusCode === 404) throw error
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  }
})
