import { useDb } from '../../../utils/db'
import { promptVersions } from '../../../database/schema'
import { eq, desc } from 'drizzle-orm'
import { serializeData } from '../../../utils/serializer'

export default defineEventHandler(async (event) => {
  // Authentication check
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
    const versions = await db
      .select({
        id: promptVersions.id,
        version: promptVersions.version,
        createdAt: promptVersions.createdAt,
        // We might not need full content for the list, but for restore we might need it?
        // Actually, let's fetch everything so frontend has it ready for restore preview/action
        title: promptVersions.title,
        content: promptVersions.content,
        description: promptVersions.description,
        tags: promptVersions.tags,
        changelog: promptVersions.changelog, // Added
      })
      .from(promptVersions)
      .where(eq(promptVersions.promptId, BigInt(idStr)))
      .orderBy(desc(promptVersions.createdAt))

    // Sort by version (SemVer logic basic implementation)
    // We want Descending order (latest version first)
    versions.sort((a, b) => {
        const vA = a.version || '0.0.0'
        const vB = b.version || '0.0.0'
        
        const partsA = vA.split('.').map(Number)
        const partsB = vB.split('.').map(Number)
        
        for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
            const valA = partsA[i] || 0
            const valB = partsB[i] || 0
            if (valA > valB) return -1
            if (valA < valB) return 1
        }
        return 0
    })

    return {
      success: true,
      data: serializeData(versions)
    }
  } catch (error) {
    console.error('Database error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    })
  }
})
