import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

/** Tenant labels `{ ar, en }` → text in the UI language. */
export const localize = (label, language, fallback = '') => (label && typeof label === 'object' ? label[language] || label.ar || label.en || fallback : label || fallback)

export function usePortalFormat() {
  const { i18n } = useTranslation()
  const language = i18n.language?.startsWith('en') ? 'en' : 'ar'
  return useMemo(() => {
    const date = new Intl.DateTimeFormat(language, { dateStyle: 'medium' })
    const dateTime = new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' })
    return {
      language,
      label: (value, fallback) => localize(value, language, fallback),
      date: (value) => (value ? date.format(new Date(value)) : '—'),
      dateTime: (value) => (value ? dateTime.format(new Date(value)) : '—'),
      money: (value, currency = 'EGP') => new Intl.NumberFormat(language, { style: 'currency', currency, maximumFractionDigits: 2 }).format(Number(value) || 0),
    }
  }, [language])
}
