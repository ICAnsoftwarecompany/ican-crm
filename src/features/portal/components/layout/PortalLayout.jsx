import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Languages, LogOut, Moon, Sun } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { cn } from '../../../../shared/utils/cn'
import { usePublicSettings, useSignOut } from '../../api/portalApi'
import { PortalAssistant } from '../assistant/PortalAssistant'
import { PortalIncidentBanner } from './PortalIncidentBanner'
import { visibleSections } from '../../constants/sections'
import { usePortalAccess } from '../../hooks/usePortalAccess'
import { usePortalPreferences } from '../../store/portalPreferencesStore'
import { usePortalFormat } from '../../utils/format'
import { ProfileSwitcher } from './ProfileSwitcher'

/** Portal shell: brand header, profile switcher, language / theme, sign-out and the permitted sections. */
export function PortalLayout() {
  const { t, i18n } = useTranslation()
  const settings = usePublicSettings()
  const { me, can, recordTypes, membership } = usePortalAccess()
  const signOut = useSignOut()
  const { isDark, toggleDark } = usePortalPreferences()
  const format = usePortalFormat()
  const sections = visibleSections({ settings: settings.data, can, recordTypes })
  const brand = format.label(settings.data?.brand_name, t('portal.brand'))

  return (
    <div className="min-h-screen bg-[var(--brand-bg)] text-[var(--text)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {settings.data?.logo_url ? <img src={settings.data.logo_url} alt="" className="h-8 w-8 rounded object-contain" /> : <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-accent font-bold text-white" aria-hidden="true">{brand.slice(0, 1)}</span>}
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{brand}</p>
              {membership && <p className="truncate text-xs text-[var(--text-muted)]">{me?.account?.name} · {membership.customer?.name}</p>}
            </div>
          </div>
          <ProfileSwitcher />
          <Button variant="ghost" size="icon" aria-label={t('portal.layout.language')} title={t('portal.layout.language')} onClick={() => i18n.changeLanguage(format.language === 'ar' ? 'en' : 'ar')}><Languages size={18} aria-hidden="true" /></Button>
          <Button variant="ghost" size="icon" aria-label={t('portal.layout.theme')} title={t('portal.layout.theme')} onClick={toggleDark}>{isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}</Button>
          <Button variant="outline" size="sm" onClick={() => signOut.mutate()}><LogOut size={16} aria-hidden="true" className="rtl:-scale-x-100" />{t('portal.layout.signOut')}</Button>
        </div>
        <nav aria-label={t('portal.layout.sections')} className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <NavLink key={section.key} to={section.path} end={section.path === '/'} className={({ isActive }) => cn('inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-sm transition-colors', isActive ? 'border-brand-accent font-semibold text-[var(--text)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]')}>
                <Icon size={16} aria-hidden="true" />
                {t(`portal.sections.${section.key}`)}
              </NavLink>
            )
          })}
        </nav>
      </header>
      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-6">
        <PortalIncidentBanner />
        <Outlet />
      </main>
      {settings.data?.ai_agent && <PortalAssistant />}
    </div>
  )
}
