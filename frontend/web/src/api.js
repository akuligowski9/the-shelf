function getApiUrl() {
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

  // Debug logging in development
  if (import.meta.env.DEV) {
    console.log('[API] Hostname:', hostname)
    console.log('[API] Is Demo:', isDemo)
    console.log('[API] API URL:', apiUrl)
  }

  return apiUrl
}

export const API_BASE = getApiUrl();

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
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
