import dayjs from 'dayjs'

function toDayjs(value) {
  return value instanceof Date || typeof value === 'string' || typeof value === 'number'
    ? dayjs(value)
    : dayjs(value)
}

export function toDate(value) {
  const parsed = toDayjs(value)
  return parsed.isValid() ? parsed.toDate() : null
}

export function isSameDay(a, b) {
  const dateA = toDayjs(a)
  const dateB = toDayjs(b)
  return dateA.isValid() && dateB.isValid() && dateA.isSame(dateB, 'day')
}

export function isSameMonth(a, b) {
  const dateA = toDayjs(a)
  const dateB = toDayjs(b)
  return dateA.isValid() && dateB.isValid() && dateA.isSame(dateB, 'month')
}

export function startOfDay(value) {
  return toDayjs(value).startOf('day').toDate()
}

export function endOfDay(value) {
  return toDayjs(value).endOf('day').toDate()
}

export function startOfMonth(value) {
  return toDayjs(value).startOf('month').toDate()
}

export function endOfMonth(value) {
  return toDayjs(value).endOf('month').toDate()
}

export function addDays(value, amount) {
  return toDayjs(value).add(amount, 'day').toDate()
}

export function addMonths(value, amount) {
  return toDayjs(value).add(amount, 'month').toDate()
}

/**
 * Arabic-first tenants in this CRM run a Sun-Thu work week (Fri/Sat
 * weekend), so the calendar week starts on Saturday for 'ar' and Sunday
 * for everything else. See ARCHITECTURE.md's i18n section for the same
 * ar-is-the-fallback-language assumption used elsewhere in the app.
 */
export function getWeekStartDay(language) {
  return String(language || '').startsWith('ar') ? 6 : 0
}

export function startOfWeek(value, weekStartsOn = 0) {
  const date = toDayjs(value)
  const day = date.day()
  const diff = (day - weekStartsOn + 7) % 7
  return date.subtract(diff, 'day').startOf('day').toDate()
}

function resolveLocale(language) {
  return String(language || '').startsWith('ar') ? 'ar-EG' : 'en-US'
}

export function formatDate(value, language, options) {
  const date = toDate(value)
  if (!date) return ''
  return new Intl.DateTimeFormat(resolveLocale(language), options || { dateStyle: 'medium' }).format(date)
}

export function formatTime(value, language, options) {
  const date = toDate(value)
  if (!date) return ''
  return new Intl.DateTimeFormat(resolveLocale(language), options || { hour: '2-digit', minute: '2-digit' }).format(date)
}

export function formatWeekday(value, language, width = 'short') {
  const date = toDate(value)
  if (!date) return ''
  return new Intl.DateTimeFormat(resolveLocale(language), { weekday: width }).format(date)
}

export function formatMonthYear(value, language) {
  const date = toDate(value)
  if (!date) return ''
  return new Intl.DateTimeFormat(resolveLocale(language), { month: 'long', year: 'numeric' }).format(date)
}

export function formatDay(value) {
  const date = toDate(value)
  return date ? date.getDate() : ''
}

/** "YYYY-MM-DD" for a native date input / a `due_date`-style API field. */
export function formatDateInput(value) {
  const date = toDate(value)
  if (!date) return ''
  return toDayjs(date).format('YYYY-MM-DD')
}

/** "HH:mm" for a native time input / a `due_time`-style API field. */
export function formatTimeInput(value) {
  const date = toDate(value)
  if (!date) return ''
  return toDayjs(date).format('HH:mm')
}

/** "YYYY-MM-DD HH:mm:ss" — the non-ISO shape several backend endpoints expect. */
export function formatDateTimeForApi(value) {
  const date = toDate(value)
  if (!date) return ''
  return toDayjs(date).format('YYYY-MM-DD HH:mm:ss')
}
