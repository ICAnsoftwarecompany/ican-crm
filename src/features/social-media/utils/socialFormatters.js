import { formatDate, formatTime } from '../../../shared/utils/dateTime'

/** Renders a metric that may be `null` (not available) — never a fake "0". */
export function formatMetric(value, language) {
  if (value === null || value === undefined) return '—'
  return Number(value).toLocaleString(String(language || '').startsWith('ar') ? 'ar-EG' : 'en-US')
}

export function formatContentDate(value, language) {
  if (!value) return '—'
  return formatDate(value, language, { dateStyle: 'medium' })
}

export function formatContentDateTime(value, language) {
  if (!value) return '—'
  return `${formatDate(value, language, { dateStyle: 'medium' })} ${formatTime(value, language, { hour: '2-digit', minute: '2-digit' })}`
}

/** Short caption preview for grid/list cards — never breaks on missing/short text. */
export function truncateCaption(text, maxLength = 120) {
  if (!text) return ''
  const trimmed = text.trim()
  if (trimmed.length <= maxLength) return trimmed
  return `${trimmed.slice(0, maxLength).trimEnd()}…`
}
