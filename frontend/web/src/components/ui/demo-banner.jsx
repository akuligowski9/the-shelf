import { useState, useEffect } from 'react'
import { AlertTriangle, X, RefreshCw } from 'lucide-react'
import { Button } from './button'
import api from '@/lib/api'

export default function DemoBanner() {
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check demo status on mount
    api.get('/demo/status')
      .then(res => {
        if (res.ok && res.data?.demo_mode) {
          setIsDemoMode(true)
        }
      })
      .catch(() => {
        // Ignore errors - just means demo mode is not enabled
      })
  }, [])

  const handleReset = async () => {
    setIsResetting(true)
    try {
      const res = await api.post('/demo/reset')
      if (res.ok) {
        // Reload the page to show fresh demo data
        window.location.reload()
      }
    } catch (err) {
      console.error('Failed to reset demo:', err)
    } finally {
      setIsResetting(false)
    }
  }

  if (!isDemoMode || dismissed) {
    return null
  }

  return (
    <div className="bg-amber-500/90 dark:bg-amber-600/90 text-amber-950 px-4 py-2 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm font-medium">
          Demo Mode — Feel free to explore! Data may be reset periodically.
        </span>
      </div>
      <div className="flex items-center gap-2">
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
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-amber-950 hover:bg-amber-600/50 dark:hover:bg-amber-700/50"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
