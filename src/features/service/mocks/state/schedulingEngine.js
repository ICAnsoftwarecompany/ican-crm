/**
 * Mock of the Scheduling & Resource Capacity engine (spec §19): working hours per resource calendar
 * (in the calendar's time zone), reservations with holds that expire, no double booking, and slots.
 */
const MINUTE = 60 * 1000
export const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const ACTIVE = ['hold', 'confirmed']

/** Offset (minutes) of `timeZone` from UTC at the instant `utcMs`. */
export function tzOffsetMinutes(utcMs, timeZone) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
      .formatToParts(new Date(utcMs))
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)])
  )
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour % 24, parts.minute, parts.second)
  return Math.round((asUtc - utcMs) / MINUTE)
}

/** Local wall time ("2026-10-05", "09:30") in `timeZone` → UTC ISO string. */
export function zonedToUtc(date, time, timeZone = 'UTC') {
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  const guess = Date.UTC(y, m - 1, d, hh, mm)
  const first = guess - tzOffsetMinutes(guess, timeZone) * MINUTE
  const settled = guess - tzOffsetMinutes(first, timeZone) * MINUTE
  return new Date(settled).toISOString()
}

/** Local date (YYYY-MM-DD) and minutes since midnight of an instant in `timeZone`. */
export function zonedParts(iso, timeZone = 'UTC') {
  const ms = Date.parse(iso)
  const local = new Date(ms + tzOffsetMinutes(ms, timeZone) * MINUTE)
  return { date: local.toISOString().slice(0, 10), minutes: local.getUTCHours() * 60 + local.getUTCMinutes() }
}

export const weekdayOf = (date) => WEEKDAYS[new Date(`${date}T12:00:00Z`).getUTCDay()]
const overlaps = (a, b) => Date.parse(a.starts_at) < Date.parse(b.ends_at) && Date.parse(b.starts_at) < Date.parse(a.ends_at)

/** Holds past `hold_expires_at` become `expired` (spec §19.3 — the scheduler releases them). Returns the expired ones. */
export function expireHolds(reservations, now = Date.now()) {
  const expired = reservations.filter((entry) => entry.status === 'hold' && entry.hold_expires_at && Date.parse(entry.hold_expires_at) <= now)
  expired.forEach((entry) => Object.assign(entry, { status: 'expired', released_at: entry.hold_expires_at }))
  return expired
}

/** Capacity check (the server does it inside a transaction with a lock on the resource + period). */
export function hasConflict(reservations, resource, candidate, excludeId = null) {
  const used = reservations
    .filter((entry) => entry.id !== excludeId && entry.resource_id === resource.id && ACTIVE.includes(entry.status) && overlaps(entry, candidate))
    .reduce((sum, entry) => sum + (Number(entry.quantity) || 1), 0)
  return used + (Number(candidate.quantity) || 1) > (Number(resource.capacity) || 1)
}

/** Working window of a resource on a local date, or null (day off / holiday). */
export function workingWindow(calendar, date) {
  if (!calendar) return { start: '09:00', end: '17:00', timeZone: 'UTC' }
  if ((calendar.holidays || []).some((holiday) => holiday.date === date)) return null
  const day = (calendar.working_hours || []).find((entry) => entry.day === weekdayOf(date))
  if (!day?.enabled) return null
  return { start: day.start, end: day.end, timeZone: calendar.timezone || 'UTC' }
}

/**
 * Free slots (spec §19.4) for `resources` on a local `date`: every `step` minutes inside working hours,
 * `duration` long, without exceeding capacity, not in the past.
 */
export function availability({ resources, calendars, reservations, date, duration = 60, step = 30, now = Date.now() }) {
  const slots = []
  resources.forEach((resource) => {
    const calendar = calendars.find((entry) => entry.id === resource.calendar_id)
    const window = workingWindow(calendar, date)
    if (!window) return
    const [sh, sm] = window.start.split(':').map(Number)
    const [eh, em] = window.end.split(':').map(Number)
    for (let minutes = sh * 60 + sm; minutes + duration <= eh * 60 + em; minutes += step) {
      const time = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
      const startsAt = zonedToUtc(date, time, window.timeZone)
      const candidate = { starts_at: startsAt, ends_at: new Date(Date.parse(startsAt) + duration * MINUTE).toISOString(), quantity: 1 }
      if (Date.parse(candidate.starts_at) < now || hasConflict(reservations, resource, candidate)) continue
      slots.push({ resource_id: resource.id, resource_name: resource.name, ...candidate, time_zone: window.timeZone })
    }
  })
  return slots
}
