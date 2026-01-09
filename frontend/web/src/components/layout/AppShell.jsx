import { Outlet } from 'react-router'
import Navigation from './Navigation'

export default function AppShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-6 pb-24 max-w-3xl">
        <Outlet />
      </main>
      <Navigation />
    </div>
  )
}
