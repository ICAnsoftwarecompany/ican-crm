/**
 * The backend expects `starts_at` formatted exactly as `YYYY-MM-DD HH:mm:ss`
 * (see CodeA1_API_BackEndDocumentation.md examples), not ISO-8601. No shared
 * date/timezone utility exists elsewhere in the app (checked
 * src/shared/utils/) so these are intentionally small and local to this
 * feature rather than introducing a new dependency.
 */

function pad(value) {
  return String(value).padStart(2, '0')
}

/** @param {Date} date */
export function formatCampaignStartsAt(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/** Combines a `<input type="date">` value and a `<input type="time">` value into a local Date. */
export function combineDateAndTime(dateValue, timeValue) {
  if (!dateValue) return null
  const [hours = '00', minutes = '00'] = (timeValue || '00:00').split(':')
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return null
  date.setHours(Number(hours), Number(minutes), 0, 0)
  return date
}

/** Splits a backend `starts_at` ("YYYY-MM-DD HH:mm:ss") back into date/time input values. */
export function splitCampaignStartsAt(startsAt) {
  if (!startsAt || typeof startsAt !== 'string') return { date: '', time: '' }
  const [datePart = '', timePart = ''] = startsAt.split(' ')
  return { date: datePart, time: timePart.slice(0, 5) }
}

export function getTenantTimezoneLabel() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  } catch {
    return ''
  }
}
