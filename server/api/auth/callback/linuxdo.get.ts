import { eq } from 'drizzle-orm'
import { generateId } from '../../../utils/snowflake' // 导入 Snowflake ID 生成器

// 确保使用 MySQL 的 useDb
import { useDb } from '../../../utils/db'
import { users } from '../../../database/schema'
import { useLinuxDoAuth } from '../../../utils/oauth'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const code = query.code as string

  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing authorization code',
    })
  }

  const { exchangeCodeForToken, getUserInfo } = useLinuxDoAuth()

  try {
    // 1. 换取 Token
    const tokenData = await exchangeCodeForToken(code)

    // 2. 获取用户信息
    const linuxDoUser = await getUserInfo(tokenData.access_token)
    
    // 3. 数据库操作: 检查用户是否存在，不存在则创建
    const db = useDb()
    
    // 查询是否存在
    const [existingUsers] = await db.select().from(users).where(eq(users.linuxDoId, String(linuxDoUser.id)))
    const existingUser = existingUsers // select 返回的是数组

    let userId: string | number | bigint

    if (existingUser) {
      // 更新用户信息
      await db.update(users).set({
        name: linuxDoUser.name || linuxDoUser.username,
        avatar: linuxDoUser.avatar_url,
        // email: linuxDoUser.email 
      }).where(eq(users.id, existingUser.id))
      
      userId = existingUser.id
    } else {
      // 创建新用户 - 生成 Snowflake ID
      const newId = generateId()
      
      await db.insert(users).values({
        id: BigInt(newId), // 确保转为 BigInt
        email: linuxDoUser.email || `linuxdo_${linuxDoUser.id}@placeholder.com`,
        linuxDoId: String(linuxDoUser.id),
        name: linuxDoUser.name || linuxDoUser.username,
        avatar: linuxDoUser.avatar_url,
      })
      
      userId = newId
    }

    // 4. 设置 Session Cookie
    setCookie(event, 'auth_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    
    setCookie(event, 'user_info', JSON.stringify({
      id: userId.toString(), // ID 转字符串防止前端精度丢失
      name: linuxDoUser.name || linuxDoUser.username,
      avatar: linuxDoUser.avatar_url
    }), {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
    })

    // 5. 重定向回首页
    return sendRedirect(event, '/')
    
  } catch (error: any) {
    console.error('OAuth Callback Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Authentication Failed: ${error.message}`,
    })
  }
})
