/**
 * Pure helpers of the shared reports engine: date ranges, time series, grouping, formatting.
 * No React, no i18n, no API. Modules turn their own records into report data with these.
 */

import { CHART_MAX_SERIES } from './reportTokens'

export const REPORT_RANGES = ['7d', '30d', '90d', '365d', 'all']
export const DEFAULT_REPORT_RANGE = '30d'

const RANGE_DAYS = { '7d': 7, '30d': 30, '90d': 90, '365d': 365 }
const DAY_MS = 24 * 60 * 60 * 1000

export function toReportDate(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/** 'YYYY-MM-DD' in local time — the bucket key used by every time series. */
export function toDayKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** First day included by a range preset (local midnight), or null for 'all'. */
export function getRangeStart(range, now = new Date()) {
  const days = RANGE_DAYS[range]
  if (!days) return null
  const today = startOfLocalDay(now)
  return new Date(today.getTime() - (days - 1) * DAY_MS)
}

/** Items whose date falls inside the range. Undated items are kept only for 'all'. */
export function filterByRange(items = [], getDate, range, now = new Date()) {
  const start = getRangeStart(range, now)
  if (!start) return items
  return items.filter((item) => {
    const date = toReportDate(getDate(item))
    return date && date.getTime() >= start.getTime() && date.getTime() <= now.getTime()
  })
}

/**
 * Daily counts across the range, zero-filled so the line never skips a day.
 * With `getSeries`, each point has one count per series key (e.g. by status).
 * For 'all', the range starts at the oldest dated item (capped to 365 days).
 * @returns {{ date: string, [seriesKey: string]: number }[]}
 */
export function buildDailySeries(items = [], getDate, { range = DEFAULT_REPORT_RANGE, now = new Date(), getSeries, seriesKeys } = {}) {
  let start = getRangeStart(range, now)
  if (!start) {
    const dates = items.map((item) => toReportDate(getDate(item))).filter(Boolean)
    if (!dates.length) return []
    const oldest = startOfLocalDay(new Date(Math.min(...dates.map((date) => date.getTime()))))
    start = new Date(Math.max(oldest.getTime(), startOfLocalDay(now).getTime() - 364 * DAY_MS))
  }

  const keys = seriesKeys || (getSeries ? [] : ['count'])
  const buckets = new Map()
  for (let time = start.getTime(); time <= startOfLocalDay(now).getTime(); time += DAY_MS) {
    const point = { date: toDayKey(new Date(time)) }
    keys.forEach((key) => { point[key] = 0 })
    buckets.set(point.date, point)
  }

  items.forEach((item) => {
    const date = toReportDate(getDate(item))
    if (!date) return
    const point = buckets.get(toDayKey(date))
    if (!point) return
    const key = getSeries ? String(getSeries(item) ?? '') : 'count'
    if (!key) return
    point[key] = (point[key] || 0) + 1
  })

  const points = [...buckets.values()]
  if (getSeries && !seriesKeys) {
    const allKeys = new Set(points.flatMap((point) => Object.keys(point).filter((key) => key !== 'date')))
    points.forEach((point) => allKeys.forEach((key) => { point[key] = point[key] || 0 }))
  }
  return points
}

/**
 * Counts per key, biggest first. Past `limit` (default and max = 8 slots) the tail folds into
 * one `otherKey` row so no chart ever needs a 9th color. Empty keys count under `emptyKey`.
 * @returns {{ key: string, value: number }[]}
 */
export function countBy(items = [], getKey, { limit = CHART_MAX_SERIES, otherKey = '__other__', emptyKey = '__none__' } = {}) {
  const counts = new Map()
  items.forEach((item) => {
    const raw = getKey(item)
    const key = raw === undefined || raw === null || raw === '' ? emptyKey : String(raw)
    counts.set(key, (counts.get(key) || 0) + 1)
  })

  const rows = [...counts.entries()].map(([key, value]) => ({ key, value })).sort((left, right) => right.value - left.value)
  const cap = Math.min(Math.max(1, limit), CHART_MAX_SERIES)
  if (rows.length <= cap) return rows
  const head = rows.slice(0, cap - 1)
  const other = rows.slice(cap - 1).reduce((sum, row) => sum + row.value, 0)
  return [...head, { key: otherKey, value: other }]
}

/** Integer percentage, safe for a zero total. */
export function percentOf(part, total) {
  if (!total) return 0
  return Math.round((part / total) * 100)
}

/** Change between two numbers as a signed integer percent; null when there is no base. */
export function percentChange(current, previous) {
  if (!previous) return null
  return Math.round(((current - previous) / previous) * 100)
}

/** Items in the range immediately before the selected one (same length) — for deltas. */
export function filterPreviousRange(items = [], getDate, range, now = new Date()) {
  const days = RANGE_DAYS[range]
  if (!days) return []
  const currentStart = getRangeStart(range, now)
  const previousStart = new Date(currentStart.getTime() - days * DAY_MS)
  return items.filter((item) => {
    const date = toReportDate(getDate(item))
    return date && date.getTime() >= previousStart.getTime() && date.getTime() < currentStart.getTime()
  })
}

/** 1,284 · 12.9K · 4.2M in the viewer's locale. */
export function formatCompactNumber(value, language) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  const locale = String(language || '').startsWith('ar') ? 'ar-EG' : 'en-US'
  const number = Number(value)
  if (Math.abs(number) < 10000) return new Intl.NumberFormat(locale).format(number)
  return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(number)
}
