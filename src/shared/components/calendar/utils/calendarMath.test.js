import { describe, expect, it } from 'vitest'
import { buildHourSlots, buildMonthGrid, buildWeekDays, buildYearMonths } from './calendarMath'

describe('buildMonthGrid', () => {
  it('always returns 6 weeks of 7 days so the grid height is stable', () => {
    const grid = buildMonthGrid('2026-09-18', 0)
    expect(grid).toHaveLength(6)
    grid.forEach((week) => expect(week).toHaveLength(7))
  })

  it('marks days outside the target month as not-current', () => {
    const grid = buildMonthGrid('2026-09-18', 0)
    const flat = grid.flat()
    const firstDay = flat[0]
    // September 2026 starts on a Tuesday, so with weekStartsOn=0 the grid's
    // first cell is a trailing August day, not part of the current month.
    expect(firstDay.isCurrentMonth).toBe(false)
    const septemberFirst = flat.find((cell) => cell.date.getDate() === 1 && cell.date.getMonth() === 8)
    expect(septemberFirst.isCurrentMonth).toBe(true)
  })

  it('flags today correctly using the injected "today" reference', () => {
    const today = new Date('2026-09-18T12:00:00')
    const grid = buildMonthGrid('2026-09-18', 0, today)
    const todayCell = grid.flat().find((cell) => cell.isToday)
    expect(todayCell.date.getDate()).toBe(18)
  })

  it('starts each week on Saturday when weekStartsOn is 6', () => {
    const grid = buildMonthGrid('2026-09-18', 6)
    grid.forEach((week) => expect(week[0].date.getDay()).toBe(6))
  })
})

describe('buildWeekDays', () => {
  it('returns exactly 7 consecutive days starting from the configured week start', () => {
    const days = buildWeekDays('2026-09-18', 0)
    expect(days).toHaveLength(7)
    expect(days[0].date.getDay()).toBe(0)
    for (let i = 1; i < days.length; i += 1) {
      const diff = (days[i].date.getTime() - days[i - 1].date.getTime()) / (1000 * 60 * 60 * 24)
      expect(diff).toBe(1)
    }
  })
})

describe('buildYearMonths', () => {
  it('returns 12 months, January through December, of the given year', () => {
    const months = buildYearMonths('2026-06-01')
    expect(months).toHaveLength(12)
    expect(months[0].getMonth()).toBe(0)
    expect(months[11].getMonth()).toBe(11)
    months.forEach((month) => expect(month.getFullYear()).toBe(2026))
  })
})

describe('buildHourSlots', () => {
  it('defaults to a full 24-hour day', () => {
    expect(buildHourSlots()).toHaveLength(24)
  })

  it('supports a custom range', () => {
    expect(buildHourSlots(7, 19)).toEqual(Array.from({ length: 12 }, (_, i) => i + 7))
  })
})
