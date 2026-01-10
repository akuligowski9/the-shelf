// Centralized color utilities for The Shelf
// Change colors here to update across all screens

// Available color palette for habits - 15 distinct nature tones
export const colorPalette = {
  // Greens
  sage: {
    name: 'Sage',
    bg: 'bg-[hsl(var(--color-sage-light))]',
    text: 'text-[hsl(var(--color-sage))]',
    border: 'border-[hsl(var(--color-sage))]',
    dot: 'bg-[hsl(var(--color-sage))]',
  },
  forest: {
    name: 'Forest',
    bg: 'bg-[hsl(var(--color-forest-light))]',
    text: 'text-[hsl(var(--color-forest))]',
    border: 'border-[hsl(var(--color-forest))]',
    dot: 'bg-[hsl(var(--color-forest))]',
  },
  // Blues
  teal: {
    name: 'Teal',
    bg: 'bg-[hsl(var(--color-teal-light))]',
    text: 'text-[hsl(var(--color-teal))]',
    border: 'border-[hsl(var(--color-teal))]',
    dot: 'bg-[hsl(var(--color-teal))]',
  },
  ocean: {
    name: 'Ocean',
    bg: 'bg-[hsl(var(--color-ocean-light))]',
    text: 'text-[hsl(var(--color-ocean))]',
    border: 'border-[hsl(var(--color-ocean))]',
    dot: 'bg-[hsl(var(--color-ocean))]',
  },
  cobalt: {
    name: 'Cobalt',
    bg: 'bg-[hsl(var(--color-cobalt-light))]',
    text: 'text-[hsl(var(--color-cobalt))]',
    border: 'border-[hsl(var(--color-cobalt))]',
    dot: 'bg-[hsl(var(--color-cobalt))]',
  },
  indigo: {
    name: 'Indigo',
    bg: 'bg-[hsl(var(--color-indigo-light))]',
    text: 'text-[hsl(var(--color-indigo))]',
    border: 'border-[hsl(var(--color-indigo))]',
    dot: 'bg-[hsl(var(--color-indigo))]',
  },
  // Purples
  violet: {
    name: 'Violet',
    bg: 'bg-[hsl(var(--color-violet-light))]',
    text: 'text-[hsl(var(--color-violet))]',
    border: 'border-[hsl(var(--color-violet))]',
    dot: 'bg-[hsl(var(--color-violet))]',
  },
  plum: {
    name: 'Plum',
    bg: 'bg-[hsl(var(--color-plum-light))]',
    text: 'text-[hsl(var(--color-plum))]',
    border: 'border-[hsl(var(--color-plum))]',
    dot: 'bg-[hsl(var(--color-plum))]',
  },
  orchid: {
    name: 'Orchid',
    bg: 'bg-[hsl(var(--color-orchid-light))]',
    text: 'text-[hsl(var(--color-orchid))]',
    border: 'border-[hsl(var(--color-orchid))]',
    dot: 'bg-[hsl(var(--color-orchid))]',
  },
  // Pinks/Reds
  berry: {
    name: 'Berry',
    bg: 'bg-[hsl(var(--color-berry-light))]',
    text: 'text-[hsl(var(--color-berry))]',
    border: 'border-[hsl(var(--color-berry))]',
    dot: 'bg-[hsl(var(--color-berry))]',
  },
  rose: {
    name: 'Rose',
    bg: 'bg-[hsl(var(--color-rose-light))]',
    text: 'text-[hsl(var(--color-rose))]',
    border: 'border-[hsl(var(--color-rose))]',
    dot: 'bg-[hsl(var(--color-rose))]',
  },
  coral: {
    name: 'Coral',
    bg: 'bg-[hsl(var(--color-coral-light))]',
    text: 'text-[hsl(var(--color-coral))]',
    border: 'border-[hsl(var(--color-coral))]',
    dot: 'bg-[hsl(var(--color-coral))]',
  },
  // Warm tones
  sienna: {
    name: 'Sienna',
    bg: 'bg-[hsl(var(--color-sienna-light))]',
    text: 'text-[hsl(var(--color-sienna))]',
    border: 'border-[hsl(var(--color-sienna))]',
    dot: 'bg-[hsl(var(--color-sienna))]',
  },
  copper: {
    name: 'Copper',
    bg: 'bg-[hsl(var(--color-copper-light))]',
    text: 'text-[hsl(var(--color-copper))]',
    border: 'border-[hsl(var(--color-copper))]',
    dot: 'bg-[hsl(var(--color-copper))]',
  },
  marigold: {
    name: 'Marigold',
    bg: 'bg-[hsl(var(--color-marigold-light))]',
    text: 'text-[hsl(var(--color-marigold))]',
    border: 'border-[hsl(var(--color-marigold))]',
    dot: 'bg-[hsl(var(--color-marigold))]',
  },
}

// Get color classes by color key
export function getColorClasses(colorKey) {
  return colorPalette[colorKey] || colorPalette.sage
}

// Get habit badge classes (uses habit's color field)
export function getHabitBadgeClasses(habit) {
  // habit can be a string (habit name) or object with color field
  if (typeof habit === 'string') {
    // Fallback for legacy usage - will be removed once all habits have colors
    return ''
  }
  const colorKey = habit.color || 'forest'
  const colors = colorPalette[colorKey]
  if (!colors) return ''
  return `${colors.bg} ${colors.text} ${colors.border}`
}

// Get habit badge classes by color key directly
export function getHabitBadgeClassesByColor(colorKey) {
  const colors = colorPalette[colorKey] || colorPalette.sage
  return `${colors.bg} ${colors.text} ${colors.border}`
}

// Entry type colors (for non-habit entries)
export const entryTypeColors = {
  life: {
    bg: 'bg-[hsl(var(--color-sky-light))]',
    text: 'text-[hsl(var(--color-sky))]',
    border: 'border-[hsl(var(--color-sky))]',
  },
  caution: {
    bg: 'bg-[hsl(var(--color-terracotta-light))]',
    text: 'text-[hsl(var(--color-terracotta))]',
    border: 'border-[hsl(var(--color-terracotta))]',
  },
}

// Get entry badge style (works for all entry types)
export function getEntryBadgeStyle(entry) {
  if (entry.type === 'habit' && entry.habit) {
    const classes = getHabitBadgeClasses(entry.habit)
    return { variant: 'outline', className: classes }
  }

  const colors = entryTypeColors[entry.type]
  if (colors) {
    return {
      variant: 'outline',
      className: `${colors.bg} ${colors.text} ${colors.border}`
    }
  }

  return { variant: 'secondary', className: '' }
}

// Day prompt colors
export const dayPromptColors = {
  start: {
    bg: 'bg-[hsl(var(--color-amber-light))]',
    border: 'border-[hsl(var(--color-amber))]',
    text: 'text-[hsl(var(--color-amber))]',
    hover: 'hover:bg-[hsl(var(--color-amber-light))]',
  },
  end: {
    bg: 'bg-[hsl(var(--color-slate-light))]',
    border: 'border-[hsl(var(--color-slate))]',
    text: 'text-[hsl(var(--color-slate))]',
    hover: 'hover:bg-[hsl(var(--color-slate-light))]',
  },
}

// Get day prompt button classes
export function getDayPromptClasses(type) {
  const colors = dayPromptColors[type]
  if (!colors) return ''
  return `${colors.bg} ${colors.border} ${colors.hover}`
}

export function getDayPromptIconClass(type) {
  return dayPromptColors[type]?.text || ''
}

// Status colors (for targets)
export const statusColors = {
  active: {
    dot: 'bg-[hsl(var(--color-eucalyptus))]',
    text: 'text-[hsl(var(--color-eucalyptus))]',
  },
  planned: {
    dot: 'bg-[hsl(var(--color-sky))]',
    text: 'text-[hsl(var(--color-sky))]',
  },
  parked: {
    dot: 'bg-[hsl(var(--color-sand))]',
    text: 'text-[hsl(var(--color-sand))]',
  },
}

// Highlight color (for highlighted entries)
export const highlightColors = {
  border: 'border-primary',
  bg: 'bg-accent',
}
