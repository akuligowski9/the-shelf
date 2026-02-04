import { describe, it, expect } from 'vitest'
import {
  colorHslValues,
  colorPalette,
  getHabitColorHsl,
  getColorClasses,
  getHabitBadgeClasses,
  getHabitBadgeClassesByColor,
  getEntryBadgeStyle,
  getDayPromptClasses,
  getDayPromptIconClass,
  statusColors,
  entryTypeColors,
} from './colors'

describe('colorHslValues', () => {
  it('contains all 24 color keys', () => {
    const keys = Object.keys(colorHslValues)
    expect(keys).toHaveLength(24)
    expect(keys).toContain('sage')
    expect(keys).toContain('forest')
    expect(keys).toContain('marigold')
  })

  it('values are valid HSL strings', () => {
    Object.values(colorHslValues).forEach(hsl => {
      expect(hsl).toMatch(/^\d+\s+\d+%\s+\d+%$/)
    })
  })
})

describe('getHabitColorHsl', () => {
  it('returns correct HSL for valid color key', () => {
    expect(getHabitColorHsl('forest')).toBe('140 25% 35%')
    expect(getHabitColorHsl('ocean')).toBe('200 50% 45%')
  })

  it('returns sage as fallback for invalid key', () => {
    expect(getHabitColorHsl('nonexistent')).toBe(colorHslValues.sage)
    expect(getHabitColorHsl(undefined)).toBe(colorHslValues.sage)
    expect(getHabitColorHsl(null)).toBe(colorHslValues.sage)
  })
})

describe('getColorClasses', () => {
  it('returns color object for valid key', () => {
    const result = getColorClasses('teal')
    expect(result).toBe(colorPalette.teal)
    expect(result.name).toBe('Teal')
    expect(result.bg).toContain('bg-')
    expect(result.text).toContain('text-')
  })

  it('returns sage as fallback for invalid key', () => {
    expect(getColorClasses('invalid')).toBe(colorPalette.sage)
    expect(getColorClasses(undefined)).toBe(colorPalette.sage)
  })
})

describe('getHabitBadgeClasses', () => {
  it('returns empty string for string input (legacy)', () => {
    expect(getHabitBadgeClasses('Exercise')).toBe('')
  })

  it('returns classes for habit object with color', () => {
    const habit = { name: 'Exercise', color: 'ocean' }
    const result = getHabitBadgeClasses(habit)
    expect(result).toContain('bg-')
    expect(result).toContain('text-')
    expect(result).toContain('border-')
  })

  it('uses forest as default when habit has no color', () => {
    const habit = { name: 'Exercise' }
    const result = getHabitBadgeClasses(habit)
    expect(result).toContain(colorPalette.forest.bg)
  })

  it('returns empty string for invalid color', () => {
    const habit = { name: 'Exercise', color: 'invalidcolor123' }
    const result = getHabitBadgeClasses(habit)
    expect(result).toBe('')
  })
})

describe('getHabitBadgeClassesByColor', () => {
  it('returns classes for valid color key', () => {
    const result = getHabitBadgeClassesByColor('berry')
    expect(result).toContain(colorPalette.berry.bg)
    expect(result).toContain(colorPalette.berry.text)
    expect(result).toContain(colorPalette.berry.border)
  })

  it('returns sage classes as fallback', () => {
    const result = getHabitBadgeClassesByColor('invalid')
    expect(result).toContain(colorPalette.sage.bg)
  })
})

describe('getEntryBadgeStyle', () => {
  it('returns habit style for habit entry', () => {
    const entry = {
      type: 'habit',
      habit: { name: 'Reading', color: 'plum' }
    }
    const result = getEntryBadgeStyle(entry)
    expect(result.variant).toBe('outline')
    expect(result.className).toContain(colorPalette.plum.bg)
  })

  it('returns life style for life entry', () => {
    const entry = { type: 'life' }
    const result = getEntryBadgeStyle(entry)
    expect(result.variant).toBe('outline')
    expect(result.className).toContain(entryTypeColors.life.bg)
  })

  it('returns caution style for caution entry', () => {
    const entry = { type: 'caution' }
    const result = getEntryBadgeStyle(entry)
    expect(result.variant).toBe('outline')
    expect(result.className).toContain(entryTypeColors.caution.bg)
  })

  it('returns secondary variant for unknown type', () => {
    const entry = { type: 'unknown' }
    const result = getEntryBadgeStyle(entry)
    expect(result.variant).toBe('secondary')
    expect(result.className).toBe('')
  })
})

describe('getDayPromptClasses', () => {
  it('returns start classes', () => {
    const result = getDayPromptClasses('start')
    expect(result).toContain('bg-')
    expect(result).toContain('border-')
    expect(result).toContain('hover:')
  })

  it('returns end classes', () => {
    const result = getDayPromptClasses('end')
    expect(result).toContain('bg-')
  })

  it('returns empty string for invalid type', () => {
    expect(getDayPromptClasses('invalid')).toBe('')
    expect(getDayPromptClasses(undefined)).toBe('')
  })
})

describe('getDayPromptIconClass', () => {
  it('returns text class for valid type', () => {
    expect(getDayPromptIconClass('start')).toContain('text-')
    expect(getDayPromptIconClass('end')).toContain('text-')
  })

  it('returns empty string for invalid type', () => {
    expect(getDayPromptIconClass('invalid')).toBe('')
  })
})

describe('statusColors', () => {
  it('contains all expected statuses', () => {
    expect(statusColors).toHaveProperty('active')
    expect(statusColors).toHaveProperty('planned')
    expect(statusColors).toHaveProperty('parked')
    expect(statusColors).toHaveProperty('completed')
    expect(statusColors).toHaveProperty('archived')
  })

  it('each status has dot and text properties', () => {
    Object.values(statusColors).forEach(status => {
      expect(status).toHaveProperty('dot')
      expect(status).toHaveProperty('text')
    })
  })
})
