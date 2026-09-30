import { describe, expect, it } from 'vitest'
import {
  buildDailySeries,
  countBy,
  filterByRange,
  filterPreviousRange,
  formatCompactNumber,
  getRangeStart,
  percentChange,
  percentOf,
  toDayKey,
} from './reportUtils'
import { CHART_MAX_SERIES, getSeriesColor } from './reportTokens'

const NOW = new Date(2026, 9, 10, 15, 0, 0)
const day = (d, h = 10) => new Date(2026, 9, d, h, 0, 0).toISOString()

describe('ranges', () => {
  it('starts the range at local midnight, inclusive of today', () => {
    expect(toDayKey(getRangeStart('7d', NOW))).toBe('2026-10-04')
    expect(getRangeStart('all', NOW)).toBeNull()
  })

  it('filters by range and keeps everything for "all"', () => {
    const items = [{ at: day(1) }, { at: day(5) }, { at: day(10) }, { at: null }]
    expect(filterByRange(items, (item) => item.at, '7d', NOW)).toHaveLength(2)
    expect(filterByRange(items, (item) => item.at, 'all', NOW)).toHaveLength(4)
  })

  it('returns the previous window of the same length', () => {
    const items = [{ at: day(1) }, { at: day(3) }, { at: day(5) }]
    expect(filterPreviousRange(items, (item) => item.at, '7d', NOW)).toHaveLength(2)
    expect(filterPreviousRange(items, (item) => item.at, 'all', NOW)).toEqual([])
  })
})

describe('buildDailySeries', () => {
  it('zero-fills every day of the range', () => {
    const series = buildDailySeries([{ at: day(9) }, { at: day(9, 18) }, { at: day(10) }], (item) => item.at, { range: '7d', now: NOW })
    expect(series).toHaveLength(7)
    expect(series[0]).toEqual({ date: '2026-10-04', count: 0 })
    expect(series.find((point) => point.date === '2026-10-09').count).toBe(2)
    expect(series[6].count).toBe(1)
  })

  it('splits by series and fills missing keys with 0', () => {
    const items = [{ at: day(9), s: 'won' }, { at: day(10), s: 'lost' }]
    const series = buildDailySeries(items, (item) => item.at, { range: '7d', now: NOW, getSeries: (item) => item.s })
    const last = series[6]
    expect(last).toMatchObject({ lost: 1, won: 0 })
    expect(series[0]).toMatchObject({ lost: 0, won: 0 })
  })

  it('starts "all" at the oldest item and returns [] without dates', () => {
    const series = buildDailySeries([{ at: day(8) }], (item) => item.at, { range: 'all', now: NOW })
    expect(series[0].date).toBe('2026-10-08')
    expect(series).toHaveLength(3)
    expect(buildDailySeries([{ at: null }], (item) => item.at, { range: 'all', now: NOW })).toEqual([])
  })
})

describe('countBy', () => {
  it('counts, sorts and marks empty keys', () => {
    const rows = countBy([{ k: 'a' }, { k: 'b' }, { k: 'a' }, { k: '' }], (item) => item.k)
    expect(rows).toEqual([{ key: 'a', value: 2 }, { key: 'b', value: 1 }, { key: '__none__', value: 1 }])
  })

  it('never returns more rows than chart slots, folding the tail into Other', () => {
    const items = Array.from({ length: 12 }, (_, index) => ({ k: `k${index}` }))
    const rows = countBy(items, (item) => item.k, { limit: 20 })
    expect(rows).toHaveLength(CHART_MAX_SERIES)
    expect(rows.at(-1)).toEqual({ key: '__other__', value: 5 })
  })
})

describe('numbers', () => {
  it('computes percents safely', () => {
    expect(percentOf(1, 3)).toBe(33)
    expect(percentOf(1, 0)).toBe(0)
    expect(percentChange(15, 10)).toBe(50)
    expect(percentChange(5, 0)).toBeNull()
  })

  it('formats compact numbers', () => {
    expect(formatCompactNumber(1284, 'en')).toBe('1,284')
    expect(formatCompactNumber(12900, 'en')).toBe('12.9K')
    expect(formatCompactNumber(null, 'en')).toBe('—')
  })

  it('never cycles hues: past the 8 slots the color is the neutral "other"', () => {
    expect(getSeriesColor(0)).toBe('var(--chart-1)')
    expect(getSeriesColor(7)).toBe('var(--chart-8)')
    expect(getSeriesColor(8)).toBe('var(--chart-other)')
  })
})
