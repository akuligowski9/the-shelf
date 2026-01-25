import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getApiUrl } from '@/utils/api-url'

const AuthContext = createContext(null)

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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(() => detectDemoModeFromHostname())
  const [isReadOnly, setIsReadOnly] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch(`${getApiUrl()}/auth/status`, {
        credentials: 'include',
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
      await fetch(`${getApiUrl()}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
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
