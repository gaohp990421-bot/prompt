import { type H3Event, createError } from 'h3'

export const config = {
  clientId: process.env.LINUX_DO_CLIENT_ID || '',
  clientSecret: process.env.LINUX_DO_CLIENT_SECRET || '',
  redirectUri: process.env.LINUX_DO_CALLBACK_URL || 'https://prompt.huiyim.cn/api/auth/callback/linuxdo',
  // 猜测的 Linux DO Connect 端点 (Discourse 标准)
  authorizationEndpoint: process.env.LINUX_DO_AUTH_URL || 'https://connect.linux.do/oauth2/authorize',
  tokenEndpoint: process.env.LINUX_DO_TOKEN_URL || 'https://connect.linux.do/oauth2/token',
  userinfoEndpoint: process.env.LINUX_DO_USER_INFO_URL || 'https://connect.linux.do/api/user',
}

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope?: string
}

interface LinuxDoUser {
  id: number
  username: string
  name: string
  avatar_url: string
  email?: string
  [key: string]: any
}

export const useLinuxDoAuth = () => {
  const getAuthorizationUrl = () => {
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: 'read', // 根据需要调整 scope
    })
    return `${config.authorizationEndpoint}?${params.toString()}`
  }

  const exchangeCodeForToken = async (code: string): Promise<TokenResponse> => {
    try {
      // 一些 OAuth 提供商需要 Basic Auth Header
      const basicAuth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')
      
      const response = await $fetch<TokenResponse>(config.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${basicAuth}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: config.redirectUri,
          client_id: config.clientId, // 为了兼容性再次带上
          client_secret: config.clientSecret // 为了兼容性再次带上
        }).toString()
      })
      return response
    } catch (error: any) {
      console.error('Token Exchange Error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to exchange token with Linux DO Connect',
      })
    }
  }

  const getUserInfo = async (accessToken: string): Promise<LinuxDoUser> => {
    try {
      return await $fetch<LinuxDoUser>(config.userinfoEndpoint, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
    } catch (error: any) {
      console.error('User Info Error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch user info from Linux DO Connect',
      })
    }
  }

  return {
    getAuthorizationUrl,
    exchangeCodeForToken,
    getUserInfo
  }
}
