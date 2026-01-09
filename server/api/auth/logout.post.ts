export default defineEventHandler((event) => {
  setCookie(event, 'auth_token', '', {
    httpOnly: true,
    maxAge: -1,
  })
  setCookie(event, 'auth_status', '', {
    httpOnly: false,
    maxAge: -1,
  })
  return { success: true }
})
