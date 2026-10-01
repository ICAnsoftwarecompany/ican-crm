import i18n from 'i18next'

const d = (key, values) => i18n.t(`customers.activityTimeline.duration.${key}`, values)

export function formatActivityDuration(seconds) {
  const value = Number(seconds)
  if (!Number.isFinite(value) || value <= 0) return '-'

  const totalSeconds = Math.floor(value)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const remainingSeconds = totalSeconds % 60

  if (days > 0) {
    if (hours > 0) return d('daysHours', { days, hours })
    return d('days', { days })
  }

  if (hours > 0) {
    if (minutes > 0) return d('hoursMinutes', { hours, minutes })
    return d('hours', { hours })
  }

  if (minutes > 0) {
    if (remainingSeconds > 0) return d('minutesSeconds', { minutes, seconds: remainingSeconds })
    return d('minutes', { minutes })
  }

  return d('seconds', { seconds: remainingSeconds })
}
