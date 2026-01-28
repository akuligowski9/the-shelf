import { getApiBase, getApiUrl } from './utils/api-url'
import { getAuthToken } from '@/context/AuthContext'

// Re-export for backwards compatibility
export { getApiBase, getApiUrl }
export const API_BASE = getApiBase();

export async function apiFetch(path, options = {}) {
  // Build headers with auth token if available
  const token = getAuthToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${getApiBase()}${path}`, {
    headers,
    credentials: 'include', // Also include cookies for desktop
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
