export default defineNuxtRouteMiddleware((to, from) => {
  // 1. Allow list (Public Routes)
  const publicRoutes = ['/', '/register']
  
  // 2. Check Auth
  // We use 'auth_status' (non-httpOnly) for client-side checks because 'auth_token' is HttpOnly.
  const token = useCookie('auth_status')

  const isAuthenticated = !!token.value

  // Case A: User is logged in
  if (isAuthenticated) {
    if (publicRoutes.includes(to.path)) {
      // If going to login/register while logged in, redirect to dashboard
      return navigateTo('/dashboard')
    }
  } 
  // Case B: User is NOT logged in
  else {
    if (!publicRoutes.includes(to.path)) {
      // If going to protected route while NOT logged in, redirect to login
      return navigateTo('/')
    }
  }
})
