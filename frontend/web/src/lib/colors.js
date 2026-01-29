// Centralized color utilities for The Shelf
// Change colors here to update across all screens

// Raw HSL values for use in JS (e.g., conic gradients)
// These should match the CSS variables in index.css
export const colorHslValues = {
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
  // Earth tones
  olive: '75 30% 38%',
  moss: '95 25% 35%',
  clay: '8 40% 45%',
  rust: '15 50% 40%',
  umber: '25 35% 32%',
  ochre: '42 50% 45%',
  bark: '22 30% 28%',
  sand: '38 45% 55%',
  stone: '45 15% 45%',
}

// Get raw HSL color string for a habit color key
export function getHabitColorHsl(colorKey) {
  return colorHslValues[colorKey] || colorHslValues.sage
}

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
  sky: {
    name: 'Sky',
    bg: 'bg-[hsl(var(--color-sky-light))]',
    text: 'text-[hsl(var(--color-sky))]',
    border: 'border-[hsl(var(--color-sky))]',
    dot: 'bg-[hsl(var(--color-sky))]',
  },
  dusk: {
    name: 'Dusk',
    bg: 'bg-[hsl(var(--color-dusk-light))]',
    text: 'text-[hsl(var(--color-dusk))]',
    border: 'border-[hsl(var(--color-dusk))]',
    dot: 'bg-[hsl(var(--color-dusk))]',
  },
  // Purples
  lavender: {
    name: 'Lavender',
    bg: 'bg-[hsl(var(--color-lavender-light))]',
    text: 'text-[hsl(var(--color-lavender))]',
    border: 'border-[hsl(var(--color-lavender))]',
    dot: 'bg-[hsl(var(--color-lavender))]',
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
  // Earth tones
  olive: {
    name: 'Olive',
    bg: 'bg-[hsl(var(--color-olive-light))]',
    text: 'text-[hsl(var(--color-olive))]',
    border: 'border-[hsl(var(--color-olive))]',
    dot: 'bg-[hsl(var(--color-olive))]',
  },
  moss: {
    name: 'Moss',
    bg: 'bg-[hsl(var(--color-moss-light))]',
    text: 'text-[hsl(var(--color-moss))]',
    border: 'border-[hsl(var(--color-moss))]',
    dot: 'bg-[hsl(var(--color-moss))]',
  },
  clay: {
    name: 'Clay',
    bg: 'bg-[hsl(var(--color-clay-light))]',
    text: 'text-[hsl(var(--color-clay))]',
    border: 'border-[hsl(var(--color-clay))]',
    dot: 'bg-[hsl(var(--color-clay))]',
  },
  rust: {
    name: 'Rust',
    bg: 'bg-[hsl(var(--color-rust-light))]',
    text: 'text-[hsl(var(--color-rust))]',
    border: 'border-[hsl(var(--color-rust))]',
    dot: 'bg-[hsl(var(--color-rust))]',
  },
  umber: {
    name: 'Umber',
    bg: 'bg-[hsl(var(--color-umber-light))]',
    text: 'text-[hsl(var(--color-umber))]',
    border: 'border-[hsl(var(--color-umber))]',
    dot: 'bg-[hsl(var(--color-umber))]',
  },
  ochre: {
    name: 'Ochre',
    bg: 'bg-[hsl(var(--color-ochre-light))]',
    text: 'text-[hsl(var(--color-ochre))]',
    border: 'border-[hsl(var(--color-ochre))]',
    dot: 'bg-[hsl(var(--color-ochre))]',
  },
  bark: {
    name: 'Bark',
    bg: 'bg-[hsl(var(--color-bark-light))]',
    text: 'text-[hsl(var(--color-bark))]',
    border: 'border-[hsl(var(--color-bark))]',
    dot: 'bg-[hsl(var(--color-bark))]',
  },
  sand: {
    name: 'Sand',
    bg: 'bg-[hsl(var(--color-sand-light))]',
    text: 'text-[hsl(var(--color-sand))]',
    border: 'border-[hsl(var(--color-sand))]',
    dot: 'bg-[hsl(var(--color-sand))]',
  },
  stone: {
    name: 'Stone',
    bg: 'bg-[hsl(var(--color-stone-light))]',
    text: 'text-[hsl(var(--color-stone))]',
    border: 'border-[hsl(var(--color-stone))]',
    dot: 'bg-[hsl(var(--color-stone))]',
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
    dot: 'bg-[hsl(var(--color-ui-accent))]',
    text: 'text-[hsl(var(--color-ui-accent))]',
  },
  planned: {
    dot: 'bg-[hsl(var(--color-sky))]',
    text: 'text-[hsl(var(--color-sky))]',
  },
  parked: {
    dot: 'bg-[hsl(var(--color-sand))]',
    text: 'text-[hsl(var(--color-sand))]',
  },
  completed: {
    dot: 'bg-[hsl(var(--color-forest))]',
    text: 'text-[hsl(var(--color-forest))]',
  },
  archived: {
    dot: 'bg-[hsl(var(--color-copper))]',
    text: 'text-[hsl(var(--color-copper))]',
  },
}

// Highlight color (for highlighted entries)
export const highlightColors = {
  border: 'border-primary',
  bg: 'bg-accent',
}
