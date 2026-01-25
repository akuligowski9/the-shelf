/**
 * Dynamically determine the API base URL based on the current hostname.
 * This allows a single Vercel deployment to serve both demo and production environments.
 */
export function getApiUrl() {
  // Guard against SSR/build-time execution
  if (typeof window === 'undefined') {
    return 'http://localhost:3001'
  }

  const hostname = window.location.hostname.toLowerCase()
  const isDemo = hostname.includes('demo')

  let apiUrl

  // Demo domain → demo backend
  if (isDemo) {
    apiUrl = import.meta.env.VITE_DEMO_API_URL || 'https://shelf-api-demo-785607788916.us-east1.run.app'
  }
  // Localhost → localhost backend
  else if (hostname === 'localhost' || hostname === '127.0.0.1') {
    apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
  }
  // Production domain → production backend
  else {
    apiUrl = import.meta.env.VITE_API_URL || 'https://shelf-api-785607788916.us-east1.run.app'
  }

  // Debug logging in browser console (always enabled for debugging)
  console.log('[API] Hostname:', hostname)
  console.log('[API] Is Demo:', isDemo)
  console.log('[API] API URL:', apiUrl)

  return apiUrl
}

// Cached version for performance
let cachedApiBase = null
export function getApiBase() {
  if (!cachedApiBase) {
    cachedApiBase = getApiUrl()
  }
  return cachedApiBase
}
