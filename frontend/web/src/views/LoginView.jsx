import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, BookOpen, Laptop } from 'lucide-react'

// Simple mobile detection via user agent
function isMobileDevice() {
  if (typeof navigator === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export default function LoginView() {
  const { isAuthenticated, isDemoMode, login, loading } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const error = searchParams.get('error')
  const [localCheckState, setLocalCheckState] = useState(null) // null | 'checking' | 'unavailable'
  const isMobile = isMobileDevice()

  useEffect(() => {
    // If already authenticated, redirect to home
    if (!loading && isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, loading, navigate])

  // Handle Local button click - check if localhost is reachable first
  const handleLocalClick = async () => {
    setLocalCheckState('checking')
    try {
      // Try to reach the local health endpoint with a short timeout
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 2000)
      await fetch('http://localhost:3001/health', {
        signal: controller.signal,
        mode: 'no-cors' // Avoid CORS issues for the check
      })
      clearTimeout(timeout)
      // If we get here, localhost is likely running
      window.location.href = 'http://localhost:5173'
    } catch (err) {
      // Localhost not reachable
      setLocalCheckState('unavailable')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] gap-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CardTitle className="text-2xl m-0">Welcome to The Shelf</CardTitle>
            <BookOpen className="h-7 w-7" />
          </div>
          <CardDescription>
            {isDemoMode
              ? 'Sign in to make changes, or browse the demo below.'
              : 'Sign in to continue'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex flex-col gap-3 p-4 text-sm bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 rounded-md border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  {error === 'unauthorized' && (
                    <>
                      <p className="font-medium">Thanks for your interest!</p>
                      <p className="mt-1">This is a personal app, so sign-in is restricted. But I'd love to hear from you if you're interested in collaborating or have questions about the project.</p>
                    </>
                  )}
                  {error === 'auth_unavailable' && (
                    <>
                      <p className="font-medium">Sign-in isn't available here</p>
                      <p className="mt-1">This demo instance is for browsing only. Feel free to explore without signing in, or reach out if you'd like to discuss the project.</p>
                    </>
                  )}
                  {error === 'failed' && (
                    <>
                      <p className="font-medium">Something went wrong</p>
                      <p className="mt-1">Sign-in failed unexpectedly. Please try again, or reach out if the problem persists.</p>
                    </>
                  )}
                  {!['unauthorized', 'auth_unavailable', 'failed'].includes(error) && (
                    <>
                      <p className="font-medium">Oops!</p>
                      <p className="mt-1">Something unexpected happened. Please try again or reach out for help.</p>
                    </>
                  )}
                </div>
              </div>
              <a
                href="https://akuligowski-portfolio.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-amber-700 dark:text-amber-300 hover:underline ml-6"
              >
                Visit my portfolio →
              </a>
            </div>
          )}

          <Button
            variant="outline"
            className="w-full h-12 text-base"
            onClick={() => login('google')}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 text-base"
            onClick={() => login('github')}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Continue with GitHub
          </Button>

          {/* Deployment navigation links */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or navigate to</span>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Show Demo button on production and local */}
            {window.location.hostname !== 'demo-the-shelf.vercel.app' && (
              <Button
                variant="secondary"
                className="flex-1 h-12 text-base"
                onClick={() => window.location.href = 'https://demo-the-shelf.vercel.app'}
              >
                Demo
              </Button>
            )}

            {/* Show Local button on deployed environments, but not on mobile */}
            {!isMobile && (window.location.hostname === 'the-shelf-amk.vercel.app' || window.location.hostname === 'demo-the-shelf.vercel.app') && (
              <Button
                variant="secondary"
                className="flex-1 h-12 text-base"
                onClick={handleLocalClick}
                disabled={localCheckState === 'checking'}
              >
                <Laptop className="w-4 h-4 mr-2" />
                {localCheckState === 'checking' ? 'Checking...' : 'Local'}
              </Button>
            )}

            {/* Show Production button only on local/demo */}
            {window.location.hostname !== 'the-shelf-amk.vercel.app' && (
              <Button
                variant="secondary"
                className="flex-1 h-12 text-base"
                onClick={() => window.location.href = 'https://the-shelf-amk.vercel.app'}
              >
                Production
              </Button>
            )}
          </div>

          {/* Local development unavailable message */}
          {localCheckState === 'unavailable' && (
            <div className="flex flex-col gap-3 p-4 text-sm bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-200 rounded-md border border-sky-200 dark:border-sky-800">
              <div className="flex items-start gap-2">
                <Laptop className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Local server not running</p>
                  <p className="mt-1">It looks like you're trying to run The Shelf locally. You'll need Docker to set up the development environment.</p>
                </div>
              </div>
              <a
                href="https://github.com/akuligowski9/the-shelf#local-development"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-sky-700 dark:text-sky-300 hover:underline ml-6"
              >
                View local setup instructions →
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {isDemoMode && (
        <>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            This is a demo instance. You can browse without signing in, but changes require authentication.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="mt-2"
          >
            Browse Demo Without Signing In
          </Button>
        </>
      )}
    </div>
  )
}
