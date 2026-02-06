import { z } from 'zod'
import { useDb } from '../../utils/db'
import { serializeData } from '../../utils/serializer'
import { prompts, promptVersions } from '../../database/schema'
import { eq, and } from 'drizzle-orm'
import { generateId } from '../../utils/snowflake'

const UpdatePromptSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  content: z.string().min(1).optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  version: z.string().optional(),
  isPublic: z.boolean().optional(),
  changelog: z.string().optional(), // Added
})

export default defineEventHandler(async (event) => {
  const userIdStr = getCookie(event, 'auth_token')
  if (!userIdStr) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const idStr = getRouterParam(event, 'id')
  if (!idStr) {
    throw createError({ statusCode: 400, statusMessage: 'Missing ID' })
  }

  const body = await readBody(event)
  const validationResult = UpdatePromptSchema.safeParse(body)
  if (!validationResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: (validationResult.error as any).errors,
    })
  }

  const db = useDb()

  try {
    const result = await db.update(prompts)
      .set(validationResult.data)
      .where(and(
        eq(prompts.id, BigInt(idStr)), 
        eq(prompts.userId, BigInt(userIdStr))
      )) as any
    
    console.log('Update Result:', result)

    if (result.affectedRows === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Prompt not found or access denied',
      })
    }


    // Return simple success or fetch updated
    // 2. Insert into Versions table
    // We need to fetch the full current data first? 
    // Wait, the validationResult only has *updated* fields. 
    // For a complete history snapshot, we usually want the *full state* at this point in time.
    // However, if we only patch partial data, we need to know the merged state.
    // Recommendation: Fetch the *latest* full object after update, and save THAT to history.
    
    // BUT since we just successfully updated, we can assume the DB has it.
    // Let's first fetch the Full Updated Prompt to save accurate snapshot.
    // Actually, `body` might not have all fields.
    // Let's do a fetch after update.

    const [updatedPrompt] = await db.select().from(prompts).where(eq(prompts.id, BigInt(idStr))) as any[]
    console.log('Updated Prompt from DB:', updatedPrompt)
    
    if (updatedPrompt) {
        // Check if this version already exists in history
        const [existingVersion] = await db.select()
            .from(promptVersions)
            .where(and(
                eq(promptVersions.promptId, BigInt(idStr)),
                eq(promptVersions.version, updatedPrompt.version || '1.0.0')
            )) as any[]

        console.log('Existing Version in History:', existingVersion)

        if (existingVersion) {
            console.log('Updating existing version...')
            // Update existing version entry
            await db.update(promptVersions)
                .set({
                    title: updatedPrompt.title,
                    content: updatedPrompt.content,
                    description: updatedPrompt.description,
                    tags: updatedPrompt.tags,
                    changelog: body.changelog !== undefined ? body.changelog : existingVersion.changelog, // Allow empty string update
                    createdAt: new Date()
                })
                .where(eq(promptVersions.id, existingVersion.id))
        } else {
            console.log('Inserting new version...')
            // Insert new version entry
            await db.insert(promptVersions).values({
                id: BigInt(generateId()),
                promptId: BigInt(idStr),
                version: updatedPrompt.version || '1.0.0',
                title: updatedPrompt.title,
                content: updatedPrompt.content,
                description: updatedPrompt.description,
                tags: updatedPrompt.tags,
                changelog: body.changelog || 'Auto saved version', // Save changelog
            })
        }
    }

    return {
      success: true,
      data: serializeData(updatedPrompt)
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Database error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  }
})
