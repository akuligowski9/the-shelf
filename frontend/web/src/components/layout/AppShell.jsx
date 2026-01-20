import { Outlet } from 'react-router'
import Navigation from './Navigation'
import { HabitsProvider } from '@/context/HabitsContext'
import { EntriesProvider } from '@/context/EntriesContext'
import { ThemeProvider } from '@/context/ThemeContext'
import DemoBanner from '@/components/ui/demo-banner'

export default function AppShell() {
  return (
    <ThemeProvider>
      <HabitsProvider>
        <EntriesProvider>
          <div className="min-h-screen bg-background text-foreground">
            <DemoBanner />
            <main className="container mx-auto px-4 py-6 pb-24 max-w-6xl">
              <Outlet />
            </main>
            <Navigation />
          </div>
        </EntriesProvider>
      </HabitsProvider>
    </ThemeProvider>
  )
}
