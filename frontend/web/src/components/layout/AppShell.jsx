import { useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router'
import Navigation from './Navigation'
import { HabitsProvider } from '@/context/HabitsContext'
import { EntriesProvider } from '@/context/EntriesContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import DemoBanner from '@/components/ui/demo-banner'

export default function AppShell() {
  const { loading, isAuthenticated, isDemoMode } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Don't redirect if still loading or already on login page
    if (loading || location.pathname === '/login') {
      return
    }

    // In non-demo mode, require authentication
    if (!isDemoMode && !isAuthenticated) {
      navigate('/login')
    }
  }, [loading, isAuthenticated, isDemoMode, navigate, location])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const isLoginPage = location.pathname === '/login'

  return (
    <ThemeProvider>
      <HabitsProvider>
        <EntriesProvider>
          <div className="min-h-screen bg-background text-foreground">
            {!isLoginPage && <DemoBanner />}
            <main className="container mx-auto px-4 py-6 pb-24 max-w-6xl">
              <Outlet />
            </main>
            {!isLoginPage && <Navigation />}
          </div>
        </EntriesProvider>
      </HabitsProvider>
    </ThemeProvider>
  )
}
