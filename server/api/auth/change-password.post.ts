import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'
import { useDb } from '../../utils/db'
import { createHash } from 'crypto' // Simple hash for now, ideally bcrypt

// Helper to hash password (use bcrypt/argon2 in prod, here simple sha256 for demo speed/deps)
function hashPassword(pwd: string) {
    return createHash('sha256').update(pwd).digest('hex')
}

const ChangePasswordSchema = z.object({
  oldPassword: z.string().optional(), // Optional if user never set password? No, UI asks for it.
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
})

export default defineEventHandler(async (event) => {
  const userIdStr = getCookie(event, 'auth_token')
  if (!userIdStr) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const validation = ChangePasswordSchema.safeParse(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Error',
      data: validation.error.errors,
    })
  }

  const db = useDb()
  const [user] = await db.select().from(users).where(eq(users.id, BigInt(userIdStr))) as any[]

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  // If user HAS a password, verify old password
  if (user.password) {
    if (!validation.data.oldPassword) {
         throw createError({ statusCode: 400, statusMessage: 'Current password is required' })
    }
    const oldHash = hashPassword(validation.data.oldPassword)
    if (oldHash !== user.password) {
        throw createError({ statusCode: 400, statusMessage: 'Incorrect current password' })
    }
  }

  // Update to new password
  const newHash = hashPassword(validation.data.newPassword)
  await db.update(users)
    .set({ password: newHash })
    .where(eq(users.id, BigInt(userIdStr)))

  return { success: true }
})
