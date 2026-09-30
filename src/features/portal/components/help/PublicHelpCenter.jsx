import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Languages, LogIn } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { portalEndpoints as P } from '../../../service/portal-transport'
import { usePublicSettings } from '../../api/portalApi'
import { usePortalFormat } from '../../utils/format'
import { KbBrowser } from './KbBrowser'

const PUBLIC = { list: P.publicKb, article: P.publicKbArticle, vote: P.kbVote }

/** `/help-center` — no sign-in; `public` articles only. Hidden when the tenant turns the public help center off. */
export function PublicHelpCenter() {
  const { t, i18n } = useTranslation()
  const settings = usePublicSettings()
  const format = usePortalFormat()
  if (settings.isLoading) return <div className="p-6"><ResourceState isLoading /></div>
  if (!settings.data?.public_help_center) return <Navigate to="/login" replace />
  const brand = format.label(settings.data?.brand_name, t('portal.brand'))
  return (
    <div className="min-h-screen bg-[var(--brand-bg)] text-[var(--text)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 py-3">
          <span className="font-bold">{brand}</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => i18n.changeLanguage(format.language === 'ar' ? 'en' : 'ar')}><Languages size={16} aria-hidden="true" />{t('portal.layout.otherLanguage')}</Button>
            <Link to="/login" className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--surface-2)]"><LogIn size={16} aria-hidden="true" className="rtl:-scale-x-100" />{t('portal.help.signIn')}</Link>
          </div>
        </div>
      </header>
      <main className="mx-auto grid max-w-4xl gap-4 px-4 py-8">
        <div className="grid gap-1">
          <h1 className="text-2xl font-bold">{t('portal.help.publicTitle')}</h1>
          <p className="text-[var(--text-muted)]">{t('portal.help.publicDescription')}</p>
        </div>
        <KbBrowser endpoints={PUBLIC} scope="public" />
        <p className="text-sm text-[var(--text-muted)]">{t('portal.help.stillNeedHelp')} <Link to="/login" className="font-medium underline">{t('portal.help.signInToRequest')}</Link></p>
      </main>
    </div>
  )
}
