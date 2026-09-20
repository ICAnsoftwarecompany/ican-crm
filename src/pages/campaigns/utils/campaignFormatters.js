import { displayValue } from '../../../shared/utils/apiResponse'
import { formatDate as formatLocalizedDate } from '../../../shared/utils/dateTime'

export function resolveLocale(language) {
  return String(language || '').startsWith('ar') ? 'ar-EG' : 'en-US'
}

export function formatDate(value, language) {
  if (!value) return '—'
  const formatted = formatLocalizedDate(value, language, { dateStyle: 'medium', timeStyle: 'short' })
  return formatted || displayValue(value)
}

export function formatNumber(value, language) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '—'
  return amount.toLocaleString(resolveLocale(language))
}

export function formatPercent(value) {
  const amount = Number(value)
  return Number.isFinite(amount) ? `${amount.toFixed(2)}%` : '—'
}

export function formatDecimal(value, digits = 2) {
  const amount = Number(value)
  return Number.isFinite(amount) ? amount.toFixed(digits) : '—'
}

export function formatCurrencyValue(value, currency, language) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '—'

  const locale = resolveLocale(language)
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currency || 'EGP', maximumFractionDigits: 0 }).format(amount)
  } catch {
    return `${amount.toLocaleString(locale)} ${currency || 'EGP'}`
  }
}
