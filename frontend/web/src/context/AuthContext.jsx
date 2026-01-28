import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getApiUrl } from '@/utils/api-url'

const AuthContext = createContext(null)
const TOKEN_KEY = 'shelf_auth_token'

function detectDemoModeFromHostname() {
  const hostname = window.location.hostname.toLowerCase()

  // Explicit demo detection
  if (hostname.includes('demo')) return true

  // Explicit production detection
  if (hostname.includes('amk')) return false

  // Localhost fallback to env var
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return import.meta.env.VITE_DEMO_MODE === 'true'
  }

  // Default to production (safe)
  return false
}

// Token management for mobile-friendly auth
export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAuthToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(() => detectDemoModeFromHostname())
  const [isReadOnly, setIsReadOnly] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check for token in URL (from OAuth callback) and store it
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      setAuthToken(token)
      // Clean up URL without reload
      const url = new URL(window.location.href)
      url.searchParams.delete('token')
      window.history.replaceState({}, '', url.pathname + url.search)
    }
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      const token = getAuthToken()
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch(`${getApiUrl()}/auth/status`, {
        credentials: 'include',
        headers,
      })
      const data = await res.json()

      if (data.ok) {
        setUser(data.user)
        setIsAuthenticated(data.authenticated)
        setIsDemoMode(data.demo_mode)
        setIsReadOnly(data.read_only)
      }
    } catch (err) {
      console.error('Auth check failed:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = (provider) => {
    window.location.href = `${getApiUrl()}/auth/${provider}`
  }

  const logout = async () => {
    try {
      const token = getAuthToken()
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      await fetch(`${getApiUrl()}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers,
      })
      clearAuthToken()
      setUser(null)
      setIsAuthenticated(false)
      setIsReadOnly(isDemoMode)
      window.location.href = '/'
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isDemoMode,
        isReadOnly,
        loading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
