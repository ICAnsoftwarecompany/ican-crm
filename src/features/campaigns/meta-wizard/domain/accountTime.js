import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export const DEFAULT_ACCOUNT_TIMEZONE = 'Africa/Cairo'
export const DEFAULT_ACCOUNT_CURRENCY = 'EGP'

/** Currency + timezone of the selected Meta ad account (with safe fallbacks). */
export function getAccountSettings(accounts = [], accountId) {
  const account = accounts.find((item) => String(item.account_id || item.id) === String(accountId)) || {}
  const timezoneName = account.timezone_name || account.timezone || DEFAULT_ACCOUNT_TIMEZONE
  return {
    name: account.name || account.account_name || '',
    currency: String(account.currency || account.account_currency || DEFAULT_ACCOUNT_CURRENCY).toUpperCase(),
    timezone: isValidTimezone(timezoneName) ? timezoneName : DEFAULT_ACCOUNT_TIMEZONE,
    currencyIsFallback: !(account.currency || account.account_currency),
    timezoneIsFallback: !(account.timezone_name || account.timezone),
  }
}

function isValidTimezone(name) {
  try {
    Intl.DateTimeFormat('en', { timeZone: name })
    return true
  } catch {
    return false
  }
}

/**
 * A `datetime-local` value ("2026-10-05T10:00") is the wall-clock time in
 * the ad account's timezone — Ads Manager works the same way. Meta needs
 * an ISO-8601 timestamp with an explicit offset.
 */
export function toAccountIso(localValue, tz = DEFAULT_ACCOUNT_TIMEZONE) {
  if (!localValue) return undefined
  const parsed = dayjs.tz(localValue, tz)
  return parsed.isValid() ? parsed.format('YYYY-MM-DDTHH:mm:ssZ') : undefined
}

export function accountNow(tz = DEFAULT_ACCOUNT_TIMEZONE) {
  return dayjs().tz(tz)
}

/** `datetime-local` value for "now + minutes" in the account timezone. */
export function accountLocalInput(tz = DEFAULT_ACCOUNT_TIMEZONE, addMinutes = 0) {
  return accountNow(tz).add(addMinutes, 'minute').format('YYYY-MM-DDTHH:mm')
}

export function diffHours(fromLocal, toLocal, tz = DEFAULT_ACCOUNT_TIMEZONE) {
  if (!fromLocal || !toLocal) return null
  return dayjs.tz(toLocal, tz).diff(dayjs.tz(fromLocal, tz), 'minute') / 60
}

export function isInPast(localValue, tz = DEFAULT_ACCOUNT_TIMEZONE, graceMinutes = 0) {
  if (!localValue) return false
  return dayjs.tz(localValue, tz).isBefore(accountNow(tz).subtract(graceMinutes, 'minute'))
}

export function formatAccountOffset(tz = DEFAULT_ACCOUNT_TIMEZONE) {
  return `UTC${accountNow(tz).format('Z')}`
}
