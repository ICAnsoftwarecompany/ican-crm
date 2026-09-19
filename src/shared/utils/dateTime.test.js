import { describe, expect, it } from 'vitest'
import {
  addDays,
  addMonths,
  formatMonthYear,
  getWeekStartDay,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from './dateTime'

describe('getWeekStartDay', () => {
  it('starts the week on Saturday for Arabic', () => {
    expect(getWeekStartDay('ar')).toBe(6)
  })

  it('starts the week on Sunday for English and anything else', () => {
    expect(getWeekStartDay('en')).toBe(0)
    expect(getWeekStartDay(undefined)).toBe(0)
  })
})

describe('startOfWeek', () => {
  it('rolls back to Saturday when weekStartsOn is 6', () => {
    // 2026-09-18 is a Friday.
    const result = startOfWeek('2026-09-18', 6)
    expect(result.getDay()).toBe(6)
    expect(result.getDate()).toBe(12)
  })

  it('rolls back to Sunday when weekStartsOn is 0', () => {
    const result = startOfWeek('2026-09-18', 0)
    expect(result.getDay()).toBe(0)
    expect(result.getDate()).toBe(13)
  })

  it('is a no-op when the date is already the week start', () => {
    const result = startOfWeek('2026-09-13', 0)
    expect(result.getDate()).toBe(13)
  })
})

describe('isSameDay / isSameMonth', () => {
  it('treats different times on the same calendar day as the same day', () => {
    expect(isSameDay('2026-09-18T01:00:00', '2026-09-18T23:00:00')).toBe(true)
    expect(isSameDay('2026-09-18', '2026-09-19')).toBe(false)
  })

  it('compares months regardless of day', () => {
    expect(isSameMonth('2026-09-01', '2026-09-30')).toBe(true)
    expect(isSameMonth('2026-09-30', '2026-10-01')).toBe(false)
  })

  it('is false for invalid input rather than throwing', () => {
    expect(isSameDay('not-a-date', '2026-09-18')).toBe(false)
  })
})

describe('addDays / addMonths', () => {
  it('crosses month boundaries correctly', () => {
    const result = addDays('2026-09-30', 1)
    expect(result.getMonth()).toBe(9) // October (0-indexed)
    expect(result.getDate()).toBe(1)
  })

  it('addMonths keeps the day when possible', () => {
    const result = addMonths('2026-01-15', 1)
    expect(result.getMonth()).toBe(1)
    expect(result.getDate()).toBe(15)
  })
})

describe('startOfMonth', () => {
  it('resets to day 1', () => {
    const result = startOfMonth('2026-09-18')
    expect(result.getDate()).toBe(1)
    expect(result.getMonth()).toBe(8)
  })
})

describe('formatMonthYear', () => {
  it('returns empty string for invalid input instead of throwing', () => {
    expect(formatMonthYear('not-a-date', 'en')).toBe('')
  })

  it('formats a valid date for English', () => {
    expect(formatMonthYear('2026-09-18', 'en')).toMatch(/2026/)
  })
})
