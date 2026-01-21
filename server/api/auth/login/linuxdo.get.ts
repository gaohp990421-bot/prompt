export default defineEventHandler((event) => {
  const { getAuthorizationUrl } = useLinuxDoAuth()
  
  const authUrl = getAuthorizationUrl()
  
  // 重定向到 Linux DO 授权页面
  return sendRedirect(event, authUrl)
})
