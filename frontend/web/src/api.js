import { getApiBase, getApiUrl } from './utils/api-url'

// Re-export for backwards compatibility
export { getApiBase, getApiUrl }
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
