import { createContext, useContext, useState, useEffect } from 'react'
import { getESTHour } from '@/data/mockData'

const ThemeContext = createContext(null)

const STORAGE_KEY = 'shelf-theme'

// Check if current time is in dark hours (6 PM - 6 AM EST)
function isDarkTime() {
  const hour = getESTHour()
  return hour >= 18 || hour < 6
}

// Apply theme class to document
function applyTheme(theme) {
  const shouldBeDark = theme === 'dark' || (theme === 'auto' && isDarkTime())

  if (shouldBeDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export function ThemeProvider({ children }) {
  // Initialize from localStorage or default to 'auto'
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) || 'auto'
    }
    return 'auto'
  })

  // Set theme and persist to localStorage
  const setTheme = (newTheme) => {
    setThemeState(newTheme)
    localStorage.setItem(STORAGE_KEY, newTheme)
    applyTheme(newTheme)
  }

  // Apply theme on mount and set up interval for 'auto' mode
  useEffect(() => {
    applyTheme(theme)

    // Only need interval for auto mode
    if (theme === 'auto') {
      const interval = setInterval(() => applyTheme(theme), 60000)
      return () => clearInterval(interval)
    }
  }, [theme])

  const value = {
    theme,
    setTheme,
    isDark: theme === 'dark' || (theme === 'auto' && isDarkTime()),
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
