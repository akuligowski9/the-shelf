import { NavLink } from 'react-router'
import { Home, Calendar, BarChart3, BookOpen, Focus, Settings } from 'lucide-react'

const navItems = [
  { to: '/shelf', icon: Home, label: 'Shelf' },
  { to: '/today', icon: Calendar, label: 'Today' },
  { to: '/progress', icon: BarChart3, label: 'Progress' },
  { to: '/review', icon: BookOpen, label: 'Review' },
  { to: '/attention', icon: Focus, label: 'Attention' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Navigation() {
  return (
    <nav aria-label="Main navigation" className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-around py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center px-3 py-2 text-xs transition-colors ${
                  isActive
                    ? 'text-[hsl(var(--color-ui-accent))]'
                    : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              <Icon className="h-5 w-5 mb-1" />
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
