import { useTranslation } from 'react-i18next'

export function useDirection() {
  const { i18n } = useTranslation()
  return i18n.resolvedLanguage?.startsWith('ar') || i18n.language?.startsWith('ar') ? 'rtl' : 'ltr'
}
