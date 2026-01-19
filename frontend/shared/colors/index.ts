// Centralized color utilities for The Shelf
// Works with both web and React Native

// HSL values for all habit colors
export const colorHslValues: Record<string, string> = {
  sage: '110 25% 45%',
  forest: '140 25% 35%',
  teal: '170 40% 40%',
  ocean: '200 50% 45%',
  sky: '210 60% 50%',
  dusk: '230 35% 55%',
  lavender: '260 40% 60%',
  plum: '280 35% 45%',
  orchid: '290 45% 55%',
  berry: '330 50% 45%',
  rose: '350 55% 55%',
  coral: '15 65% 55%',
  sienna: '25 50% 45%',
  copper: '30 55% 50%',
  marigold: '40 70% 50%',
}

// Convert HSL string to RGB values
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
  }
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)]
}

// Parse HSL string and convert to hex
function hslStringToHex(hslString: string): string {
  const parts = hslString.split(' ').map(p => parseFloat(p))
  const [r, g, b] = hslToRgb(parts[0], parts[1], parts[2])
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// Generate lighter version of HSL color
function getLightHex(hslString: string): string {
  const parts = hslString.split(' ').map(p => parseFloat(p))
  const [r, g, b] = hslToRgb(parts[0], parts[1] * 0.3, 90) // 30% saturation, 90% lightness
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// Generate lighter version for dark mode
function getDarkLightHex(hslString: string): string {
  const parts = hslString.split(' ').map(p => parseFloat(p))
  const [r, g, b] = hslToRgb(parts[0], parts[1] * 0.4, 20) // 40% saturation, 20% lightness
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// Color palette with hex values for React Native
export interface HabitColorSet {
  name: string
  main: string
  light: string
  darkLight: string
}

export const habitColors: Record<string, HabitColorSet> = Object.entries(colorHslValues).reduce(
  (acc, [key, hsl]) => {
    acc[key] = {
      name: key.charAt(0).toUpperCase() + key.slice(1),
      main: hslStringToHex(hsl),
      light: getLightHex(hsl),
      darkLight: getDarkLightHex(hsl),
    }
    return acc
  },
  {} as Record<string, HabitColorSet>
)

// Get color set by key
export function getHabitColor(colorKey: string): HabitColorSet {
  return habitColors[colorKey] || habitColors.sage
}

// Get raw HSL string
export function getHabitColorHsl(colorKey: string): string {
  return colorHslValues[colorKey] || colorHslValues.sage
}

// Entry type colors
export const entryTypeColors = {
  life: {
    main: '#3b82f6', // sky blue
    light: '#dbeafe',
    darkLight: '#1e3a5f',
  },
  caution: {
    main: '#ef4444', // terracotta/red
    light: '#fee2e2',
    darkLight: '#5f1e1e',
  },
}

// Target status colors
export const statusColors = {
  active: {
    main: '#22c55e', // green
    light: '#dcfce7',
    darkLight: '#166534',
  },
  planned: {
    main: '#3b82f6', // blue
    light: '#dbeafe',
    darkLight: '#1e40af',
  },
  parked: {
    main: '#f59e0b', // amber
    light: '#fef3c7',
    darkLight: '#92400e',
  },
  completed: {
    main: '#10b981', // emerald
    light: '#d1fae5',
    darkLight: '#065f46',
  },
  archived: {
    main: '#6b7280', // gray
    light: '#f3f4f6',
    darkLight: '#374151',
  },
}

// Theme colors
export const themeColors = {
  light: {
    background: '#ffffff',
    card: '#f5f5f5',
    text: '#171717',
    textMuted: '#a3a3a3',
    border: '#e5e5e5',
    primary: '#22c55e',
  },
  dark: {
    background: '#1a1a1a',
    card: '#262626',
    text: '#e5e5e5',
    textMuted: '#737373',
    border: '#404040',
    primary: '#86efac',
  },
}

// Get theme colors based on dark mode
export function getThemeColors(isDark: boolean) {
  return isDark ? themeColors.dark : themeColors.light
}

// Color options for habit picker
export const colorOptions = Object.entries(habitColors).map(([key, value]) => ({
  key,
  ...value,
}))
