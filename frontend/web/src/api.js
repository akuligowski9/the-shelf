function getApiUrl() {
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
  // Production domain → production backend
  // Localhost → localhost (or env var override)
  else if (hostname === 'localhost' || hostname === '127.0.0.1') {
    apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
  }
  else {
    apiUrl = import.meta.env.VITE_API_URL || 'https://shelf-api-785607788916.us-east1.run.app'
  }

  // Debug logging - always log in browser (not just DEV mode)
  console.log('[API] Hostname:', hostname)
  console.log('[API] Is Demo:', isDemo)
  console.log('[API] API URL:', apiUrl)

  return apiUrl
}

// Lazy getter - evaluates at runtime, not module load time
let cachedApiBase = null
export const getApiBase = () => {
  if (!cachedApiBase) {
    cachedApiBase = getApiUrl()
  }
  return cachedApiBase
}

// For backwards compatibility
export const API_BASE = getApiBase();

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${getApiBase()}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for auth
    ...options,
  });

  if (!res.ok) {
    // Handle authentication errors
    if (res.status === 401) {
      // Redirect to login page
      window.location.href = '/login';
      throw new Error('Authentication required');
    }

    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }

  return res.json();
}
