import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

/** Currency formatter in the UI language; amounts always come from the server. */
export function useMoney(currency = 'EGP', maximumFractionDigits = 2) {
  const { i18n } = useTranslation()
  return useMemo(() => {
    const format = new Intl.NumberFormat(i18n.language, { style: 'currency', currency, maximumFractionDigits })
    return (value) => format.format(Number(value) || 0)
  }, [i18n.language, currency, maximumFractionDigits])
}

export const PAYMENT_METHODS = ['cash', 'bank_transfer', 'card', 'cheque', 'wallet']
export const SCHEDULE_STATUSES = ['active', 'completed', 'rescheduled', 'transferred', 'cancelled']
export const COLLECTION_VIEWS = ['overdue', 'due_today', 'upcoming', 'promises']
