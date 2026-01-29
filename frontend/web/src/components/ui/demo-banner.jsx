import { useState } from 'react'
import { useNavigate } from 'react-router'
import { AlertTriangle, X, RefreshCw, LogIn, LogOut } from 'lucide-react'
import { Button } from './button'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'

export default function DemoBanner() {
  const { isDemoMode, isAuthenticated, isReadOnly, user, logout } = useAuth()
  const [isResetting, setIsResetting] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const navigate = useNavigate()

  const handleReset = async () => {
    setIsResetting(true)
    try {
      const res = await api.post('/demo/reset')
      if (res.ok) {
        window.location.reload()
      }
    } catch (err) {
      console.error('Failed to reset demo:', err)
    } finally {
      setIsResetting(false)
    }
  }

  // Only show banner in demo mode
  if (!isDemoMode || dismissed) {
    return null
  }

  return (
    <div className="bg-amber-500/90 dark:bg-amber-600/90 text-amber-950 px-4 py-2 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm font-medium">
          {isDemoMode
            ? isAuthenticated
              ? `Demo Mode — Signed in as ${user?.name || user?.email}`
              : 'Demo Mode — Try it out, use Reset button to restore'
            : isAuthenticated
            ? `Signed in as ${user?.name || user?.email}`
            : 'Please sign in to continue'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-amber-950 hover:bg-amber-600/50 dark:hover:bg-amber-700/50"
            onClick={logout}
          >
            <LogOut className="h-3.5 w-3.5 mr-1" />
            Sign Out
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-amber-950 hover:bg-amber-600/50 dark:hover:bg-amber-700/50"
            onClick={() => navigate('/login')}
          >
            <LogIn className="h-3.5 w-3.5 mr-1" />
            Sign In
          </Button>
        )}
        {isDemoMode && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-amber-950 hover:bg-amber-600/50 dark:hover:bg-amber-700/50"
            onClick={handleReset}
            disabled={isResetting}
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isResetting ? 'animate-spin' : ''}`} />
            Reset
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-amber-950 hover:bg-amber-600/50 dark:hover:bg-amber-700/50"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
