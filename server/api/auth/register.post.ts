import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'
import { useDb } from '../../utils/db'
import { generateId } from '../../utils/snowflake'
import { createHash } from 'crypto'

const RegisterSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string()
    .min(8, '密码至少需要8位')
    .regex(/[a-zA-Z]/, '密码必须包含至少一个字母')
    .regex(/[0-9]/, '密码必须包含至少一个数字'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const validation = RegisterSchema.safeParse(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Error',
      data: (validation as any).error.errors,
    })
  }

  const { email, password } = validation.data
  const db = useDb()
  
  if (!db) {
     throw createError({
        statusCode: 500,
        statusMessage: 'Database Error',
    })
  }

  // Check if user exists
  const existingUsers = await db.select().from(users).where(eq(users.email, email))
  if (existingUsers.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: '该邮箱已被注册',
      message: '该邮箱已被注册'
    })
  }

  // Hash Password
  const hashPassword = (pwd: string) => {
    return createHash('sha256').update(pwd).digest('hex')
  }
  const hashedPassword = hashPassword(password)

  // Create User
  const id = generateId()
  await db.insert(users).values({
    id: BigInt(id),
    email,
    password: hashedPassword,
  })

  // Auto Login (Set Cookie)
  setCookie(event, 'auth_token', id.toString(), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
  // Client-side visible cookie for middleware
  setCookie(event, 'auth_status', '1', {
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 7,
  })

  return {
    success: true,
    user: {
      id: id.toString(),
      email,
      createdAt: new Date()
    }
  }
})
