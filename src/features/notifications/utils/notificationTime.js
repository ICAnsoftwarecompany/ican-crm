export function formatNotificationTime(value, locale, t) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))
  if (seconds < 60) return t('notifications.time.justNow')
  if (seconds < 3600) return t('notifications.time.minutes', { count: Math.floor(seconds / 60) })
  if (seconds < 86400) return t('notifications.time.hours', { count: Math.floor(seconds / 3600) })
  if (seconds < 172800) return t('notifications.time.yesterday')
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(date)
}

export function getNotificationGroup(value, t) {
  const date = new Date(value)
  const today = new Date()
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const startValue = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dayDifference = Math.round((startToday - startValue) / 86400000)
  if (dayDifference <= 0) return t('notifications.groups.today')
  if (dayDifference === 1) return t('notifications.groups.yesterday')
  return t('notifications.groups.earlier')
}
