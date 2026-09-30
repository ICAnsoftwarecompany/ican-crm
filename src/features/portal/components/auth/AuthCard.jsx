import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { isModuleMocked } from '../../../service/portal-transport'
import { usePublicSettings } from '../../api/portalApi'
import { usePortalFormat } from '../../utils/format'

/** Centered card for sign-in and guest tracking, branded with the tenant's portal settings. */
export function AuthCard({ title, description, children, footer }) {
  const { t, i18n } = useTranslation()
  const settings = usePublicSettings()
  const format = usePortalFormat()
  const brand = format.label(settings.data?.brand_name, t('portal.brand'))
  return (
    <div className="grid min-h-screen place-items-center bg-[var(--brand-bg)] px-4 py-10 text-[var(--text)]">
      <div className="grid w-full max-w-md gap-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {settings.data?.logo_url ? <img src={settings.data.logo_url} alt="" className="h-9 w-9 rounded object-contain" /> : <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-accent font-bold text-white" aria-hidden="true">{brand.slice(0, 1)}</span>}
            <span className="font-bold">{brand}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => i18n.changeLanguage(format.language === 'ar' ? 'en' : 'ar')}><Languages size={16} aria-hidden="true" />{t('portal.layout.otherLanguage')}</Button>
        </div>
        <section className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <header className="grid gap-1">
            <h1 className="text-xl font-bold">{title}</h1>
            {description && <p className="text-sm text-[var(--text-muted)]">{description}</p>}
          </header>
          {children}
        </section>
        {isModuleMocked('portal') && <p className="rounded-lg border border-dashed border-sla-at-risk bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-muted)]">{t('portal.auth.demoHint')}</p>}
        {footer}
      </div>
    </div>
  )
}
