import i18n from 'i18next'

const DEFAULT_TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Cairo'

function parseDateValue(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date
}

function resolveLocale() {
  return String(i18n.language || '').startsWith('ar') ? 'ar-EG' : 'en-US'
}

export function toActivityDate(value) {
  return parseDateValue(value)
}

export function formatActivityTime(value, timeZone = DEFAULT_TIME_ZONE) {
  const date = parseDateValue(value)
  if (!date) return '-'

  return new Intl.DateTimeFormat(resolveLocale(), {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone,
  }).format(date)
}

export function formatActivityFullDate(value, timeZone = DEFAULT_TIME_ZONE) {
  const date = parseDateValue(value)
  if (!date) return '-'

  return new Intl.DateTimeFormat(resolveLocale(), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone,
  }).format(date)
}

export function formatActivityDayLabel(value, timeZone = DEFAULT_TIME_ZONE) {
  const date = parseDateValue(value)
  if (!date) return i18n.t('customers.activityTimeline.noDate')

  return new Intl.DateTimeFormat(resolveLocale(), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone,
  }).format(date)
}

export function formatRelativeActivityTime(value) {
  const date = parseDateValue(value)
  if (!date) return '-'

  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (60 * 1000))

  if (diffMinutes < 1) return i18n.t('customers.activityTimeline.relative.now')
  if (diffMinutes < 60) return i18n.t('customers.activityTimeline.relative.minutesAgo', { count: diffMinutes })

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return i18n.t('customers.activityTimeline.relative.hoursAgo', { count: diffHours })

  const diffDays = Math.floor(diffHours / 24)
  return i18n.t('customers.activityTimeline.relative.daysAgo', { count: diffDays })
}
