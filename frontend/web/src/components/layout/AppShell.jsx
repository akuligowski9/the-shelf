import { useEffect } from 'react'
import { Outlet } from 'react-router'
import Navigation from './Navigation'
import { HabitsProvider } from '@/context/HabitsContext'
import { getESTHour } from '@/data/mockData'

export default function AppShell() {
  // Time-based dark mode (6 PM - 6 AM EST)
  // TEMP: Forcing light mode for testing
  useEffect(() => {
    document.documentElement.classList.remove('dark')
    // const applyTheme = () => {
    //   const hour = getESTHour()
    //   const isDarkTime = hour >= 18 || hour < 6 // 6 PM to 6 AM
    //   if (isDarkTime) {
    //     document.documentElement.classList.add('dark')
    //   } else {
    //     document.documentElement.classList.remove('dark')
    //   }
    // }
    // applyTheme()
    // const interval = setInterval(applyTheme, 60000)
    // return () => clearInterval(interval)
  }, [])

  return (
    <HabitsProvider>
      <div className="min-h-screen bg-background text-foreground">
        <main className="container mx-auto px-4 py-6 pb-24 max-w-3xl">
          <Outlet />
        </main>
        <Navigation />
      </div>
    </HabitsProvider>
  )
}
