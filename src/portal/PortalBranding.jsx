import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { usePublicSettings } from '../features/portal'

/** Applies the tenant's portal branding: accent color and page title. */
export function PortalBranding() {
  const { t, i18n } = useTranslation()
  const settings = usePublicSettings()
  const color = settings.data?.primary_color
  const name = settings.data?.brand_name
  useEffect(() => {
    if (color && /^#[0-9a-f]{6}$/i.test(color)) document.documentElement.style.setProperty('--brand-accent', color)
  }, [color])
  useEffect(() => {
    const language = i18n.language?.startsWith('en') ? 'en' : 'ar'
    document.title = (name && (name[language] || name.ar || name.en)) || t('portal.brand')
  }, [name, i18n.language, t])
  return null
}
