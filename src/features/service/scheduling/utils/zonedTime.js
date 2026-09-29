import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export const DEFAULT_TIME_ZONE = 'Africa/Cairo'

/** Minutes since local midnight of an instant in `timeZone` (board positioning). */
export function minutesInZone(iso, timeZone = DEFAULT_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone, hourCycle: 'h23', hour: '2-digit', minute: '2-digit' }).formatToParts(new Date(iso))
  const get = (type) => Number(parts.find((part) => part.type === type)?.value || 0)
  return get('hour') * 60 + get('minute')
}

/** Today's date (YYYY-MM-DD) in `timeZone`. */
export function todayInZone(timeZone = DEFAULT_TIME_ZONE) {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
}

export function shiftDate(date, days) {
  const value = new Date(`${date}T12:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

/** Time / date formatters that always show the calendar's zone (not the browser's). */
export function useZonedFormat(timeZone = DEFAULT_TIME_ZONE) {
  const { i18n } = useTranslation()
  return useMemo(() => {
    const time = new Intl.DateTimeFormat(i18n.language, { timeZone, hour: 'numeric', minute: '2-digit' })
    const day = new Intl.DateTimeFormat(i18n.language, { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' })
    const dateTime = new Intl.DateTimeFormat(i18n.language, { timeZone, dateStyle: 'medium', timeStyle: 'short' })
    return {
      time: (iso) => (iso ? time.format(new Date(iso)) : '—'),
      day: (date) => day.format(new Date(`${date}T12:00:00Z`)),
      dateTime: (iso) => (iso ? dateTime.format(new Date(iso)) : '—'),
    }
  }, [i18n.language, timeZone])
}
