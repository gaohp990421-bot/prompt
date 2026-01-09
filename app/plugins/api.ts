export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()
  
  nuxtApp.hook('app:error', (err) => {
    // Check if error is 401
    // This hook catches vue errors, maybe not fetch errors unless they bubble up?
    // Better way: intercept $fetch
  })

  // Intercept global $fetch
  const originalFetch = globalThis.$fetch
  globalThis.$fetch = $fetch.create({
    onResponseError({ response }) {
      if (response.status === 401) {
        // Clear status cookie so middleware knows we are out
        const authStatus = useCookie('auth_status')
        authStatus.value = null
        
        // Redirect
        router.push('/')
      }
    }
  })
})
