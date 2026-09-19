import { getActivityDerivedStates } from '../constants/activityConstants'

export function parseActivityDate(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatActivityDate(value, options = {}) {
  const date = parseActivityDate(value)
  if (!date) return '-'

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: options.dateStyle || 'medium',
    timeStyle: options.timeStyle || undefined,
  }).format(date)
}

export function formatActivityDateTime(value) {
  const date = parseActivityDate(value)
  if (!date) return '-'

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function formatActivityTime(value) {
  const date = parseActivityDate(value)
  if (!date) return '-'

  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatDuration(startAt, endAt, t) {
  const start = parseActivityDate(startAt)
  const end = parseActivityDate(endAt)
  if (!start || !end) return '-'

  const minutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000))
  if (minutes < 60) return t ? t('activities.duration.minute', { count: minutes }) : `${minutes} دقيقة`

  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  const hourText = t ? t('activities.duration.hour', { count: hours }) : `${hours} ساعة`
  if (!rest) return hourText

  const minuteText = t ? t('activities.duration.minute', { count: rest }) : `${rest} دقيقة`
  return `${hourText} ${minuteText}`
}

export function isToday(value) {
  const date = parseActivityDate(value)
  if (!date) return false

  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate()
  )
}

export function isOverdueActivity(activity) {
  const start = parseActivityDate(activity?.startAt)
  return Boolean(start && activity?.status === 'scheduled' && start.getTime() < Date.now())
}

export function getDerivedActivityState(activity, t) {
  const states = getActivityDerivedStates(t)
  if (isOverdueActivity(activity)) return states.overdue
  if (isToday(activity?.startAt)) return states.today
  return states.upcoming
}

export function toDateTimeLocalValue(value = new Date()) {
  const date = parseActivityDate(value) || new Date()
  const pad = (part) => String(part).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function addMinutes(value, minutes) {
  const date = parseActivityDate(value) || new Date()
  date.setMinutes(date.getMinutes() + minutes)
  return date
}

export function formatDateTimeForApi(value) {
  const date = parseActivityDate(value)
  if (!date) return ''

  const pad = (part) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`
}
