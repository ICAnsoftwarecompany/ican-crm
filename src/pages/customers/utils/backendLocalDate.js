// Backend activity timestamps are local wall-clock strings ("YYYY-MM-DD HH:mm[:ss]"), not UTC.

export function parseBackendLocalDateParts(value) {
  if (!value) return null

  const normalized = String(value)
    .trim()
    .replace('T', ' ')
    .replace(/(\.\d+)?(Z|[+-]\d{2}:?\d{2})$/, '')

  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/)
  if (!match) return null

  const [, year, month, day, hour, minute, second = '0'] = match
  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
    second: Number(second),
  }
}

export function formatBackendTime12(value, t) {
  const parts = parseBackendLocalDateParts(value)
  if (!parts) return '-'

  const hour12 = parts.hour % 12 || 12
  const period = parts.hour >= 12 ? (t ? t('common.pm') : 'PM') : (t ? t('common.am') : 'AM')
  const minutes = String(parts.minute).padStart(2, '0')
  return `${hour12}:${minutes} ${period}`
}

export function formatBackendDateShort(value) {
  const parts = parseBackendLocalDateParts(value)
  if (!parts) return ''

  return `${String(parts.day).padStart(2, '0')}/${String(parts.month).padStart(2, '0')}/${parts.year}`
}
