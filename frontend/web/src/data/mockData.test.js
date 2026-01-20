import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatDateKey,
  getLastSessionForHabit,
  renderWarmUpTemplate,
} from './mockData'

describe('formatDateKey', () => {
  it('formats date as YYYY-MM-DD', () => {
    // Use a fixed date to avoid timezone issues in tests
    const date = new Date('2024-06-15T12:00:00Z')
    const result = formatDateKey(date)
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('pads single digit months and days', () => {
    const date = new Date('2024-01-05T12:00:00Z')
    const result = formatDateKey(date)
    expect(result).toContain('-01-')
    expect(result).toContain('-05')
  })
})

describe('getLastSessionForHabit', () => {
  const mockEntries = [
    { type: 'habit', habit: 'Reading', occurred_at: '2024-06-10T10:00:00Z', note: 'Chapter 5' },
    { type: 'habit', habit: 'Reading', occurred_at: '2024-06-15T10:00:00Z', note: 'Chapter 6' },
    { type: 'habit', habit: 'Reading', occurred_at: '2024-06-20T10:00:00Z', note: 'Chapter 7', archived_at: '2024-06-21' },
    { type: 'habit', habit: 'Exercise', occurred_at: '2024-06-18T10:00:00Z', note: 'Gym session' },
    { type: 'life', habit: null, occurred_at: '2024-06-19T10:00:00Z', note: 'Life event' },
  ]

  it('returns most recent session for habit', () => {
    const result = getLastSessionForHabit('Reading', null, mockEntries)
    expect(result.note).toBe('Chapter 6') // Chapter 7 is archived
  })

  it('returns null for habit with no sessions', () => {
    const result = getLastSessionForHabit('Meditation', null, mockEntries)
    expect(result).toBeNull()
  })

  it('excludes archived entries', () => {
    const result = getLastSessionForHabit('Reading', null, mockEntries)
    expect(result.note).not.toBe('Chapter 7')
  })

  it('respects beforeDate parameter', () => {
    const result = getLastSessionForHabit('Reading', '2024-06-15T09:00:00Z', mockEntries)
    expect(result.note).toBe('Chapter 5')
  })

  it('returns falsy when no sessions before date', () => {
    const result = getLastSessionForHabit('Reading', '2024-06-01T00:00:00Z', mockEntries)
    expect(result).toBeFalsy()
  })

  it('returns null for empty entries array', () => {
    const result = getLastSessionForHabit('Reading', null, [])
    expect(result).toBeNull()
  })

  it('ignores non-habit entries', () => {
    const result = getLastSessionForHabit('Life event', null, mockEntries)
    expect(result).toBeNull()
  })
})

describe('renderWarmUpTemplate', () => {
  const mockEntries = [
    {
      type: 'habit',
      habit: 'Coding',
      occurred_at: '2024-06-15T10:00:00Z',
      note: 'Fixed bug in auth module',
      cool_down_note: 'Need to add tests'
    },
  ]

  it('returns content unchanged for non-dynamic template', () => {
    const template = {
      has_dynamic_elements: false,
      content: 'Static warm-up content'
    }
    const result = renderWarmUpTemplate(template, 'Coding', '2024-06-20', mockEntries)
    expect(result).toBe('Static warm-up content')
  })

  it('replaces {{last_session_note}} with session info', () => {
    const template = {
      has_dynamic_elements: true,
      content: 'Review: {{last_session_note}}'
    }
    const result = renderWarmUpTemplate(template, 'Coding', '2024-06-20', mockEntries)
    expect(result).toContain('Fixed bug in auth module')
    expect(result).toContain('Last session:')
  })

  it('includes cool_down_note when present', () => {
    const template = {
      has_dynamic_elements: true,
      content: '{{last_session_note}}'
    }
    const result = renderWarmUpTemplate(template, 'Coding', '2024-06-20', mockEntries)
    expect(result).toContain('Need to add tests')
    expect(result).toContain('Next steps from last time:')
  })

  it('shows placeholder when no previous sessions', () => {
    const template = {
      has_dynamic_elements: true,
      content: 'Review: {{last_session_note}}'
    }
    const result = renderWarmUpTemplate(template, 'NewHabit', '2024-06-20', mockEntries)
    expect(result).toContain('No previous sessions found')
  })

  it('handles session without note', () => {
    const entriesNoNote = [
      { type: 'habit', habit: 'Coding', occurred_at: '2024-06-15T10:00:00Z' }
    ]
    const template = {
      has_dynamic_elements: true,
      content: '{{last_session_note}}'
    }
    const result = renderWarmUpTemplate(template, 'Coding', '2024-06-20', entriesNoNote)
    expect(result).toContain('No notes')
  })
})
