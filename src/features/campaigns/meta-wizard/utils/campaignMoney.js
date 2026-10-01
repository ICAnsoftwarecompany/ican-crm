// Meta stores budgets in the account currency's minor unit ("offset").
// Most currencies use 100; the ones below have no minor unit in Meta's
// currency table. Verify against Meta's "Currencies" reference if you add
// support for a new account currency.
const ZERO_DECIMAL_CURRENCIES = new Set(['CLP', 'COP', 'CRC', 'HUF', 'ISK', 'IDR', 'JPY', 'KRW', 'PYG', 'TWD', 'VND'])

// Soft floors for daily budgets (warn, never block — Meta confirms the
// real minimum for the chosen optimization goal when the ad set is created).
const SUGGESTED_DAILY_MINIMUM = { EGP: 50, USD: 1, EUR: 1, GBP: 1, SAR: 5, AED: 5, KWD: 1, QAR: 5, BHD: 1, OMR: 1, JOD: 1, TRY: 30, MAD: 10 }

export function getCurrencyOffset(currency) {
  return ZERO_DECIMAL_CURRENCIES.has(String(currency || '').toUpperCase()) ? 1 : 100
}

export function toMinorCurrencyUnit(value, currency = 'EGP') {
  const amount = Number(value)
  if (value === '' || value === null || value === undefined || !Number.isFinite(amount)) return undefined
  return Math.round(amount * getCurrencyOffset(currency))
}

export function getSuggestedDailyMinimum(currency) {
  return SUGGESTED_DAILY_MINIMUM[String(currency || '').toUpperCase()] ?? null
}

export function isPositiveNumber(value) {
  return value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value)) && Number(value) > 0
}

export function formatMoney(value, currency = 'EGP', language = 'en') {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return ''
  try {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount)
  } catch {
    return `${amount} ${currency}`
  }
}
