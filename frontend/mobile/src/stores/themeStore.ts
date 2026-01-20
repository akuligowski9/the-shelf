import { create } from 'zustand'
import { Appearance, ColorSchemeName } from 'react-native'
import { getThemeColors } from '@shared/colors'

export type ThemeMode = 'light' | 'dark' | 'auto'

interface ThemeState {
  // State
  colorScheme: ColorSchemeName
  isDark: boolean
  colors: ReturnType<typeof getThemeColors>
  themeMode: ThemeMode

  // Actions
  setColorScheme: (scheme: ColorSchemeName) => void
  toggleTheme: () => void
  setThemeMode: (mode: ThemeMode) => void
  initializeTheme: () => () => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  // Initial state
  colorScheme: Appearance.getColorScheme(),
  isDark: Appearance.getColorScheme() === 'dark',
  colors: getThemeColors(Appearance.getColorScheme() === 'dark'),
  themeMode: 'auto',

  // Actions
  setColorScheme: (scheme) => {
    const isDark = scheme === 'dark'
    set({
      colorScheme: scheme,
      isDark,
      colors: getThemeColors(isDark),
    })
  },

  toggleTheme: () => {
    const newIsDark = !get().isDark
    set({
      colorScheme: newIsDark ? 'dark' : 'light',
      isDark: newIsDark,
      colors: getThemeColors(newIsDark),
      themeMode: newIsDark ? 'dark' : 'light',
    })
  },

  setThemeMode: (mode) => {
    let isDark: boolean

    if (mode === 'auto') {
      // Use system setting
      isDark = Appearance.getColorScheme() === 'dark'
    } else {
      isDark = mode === 'dark'
    }

    set({
      themeMode: mode,
      colorScheme: isDark ? 'dark' : 'light',
      isDark,
      colors: getThemeColors(isDark),
    })
  },

  initializeTheme: () => {
    // Listen for system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // Only update if in auto mode
      if (get().themeMode === 'auto') {
        get().setColorScheme(colorScheme)
      }
    })

    // Return cleanup function
    return () => subscription.remove()
  },
}))
