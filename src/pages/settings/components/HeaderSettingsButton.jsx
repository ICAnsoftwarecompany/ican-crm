import { lazy, Suspense, useState } from 'react'
import { ArrowLeft, ChevronRight, ExternalLink, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AppDrawer } from '../../../shared/components/overlays/AppDrawer'
import { getSettingsNavigationGroups, SETTINGS_ROUTE } from '../constants/settingsNavigation'

const SettingsSectionOutlet = lazy(() => import('../registry/settingsSections').then((module) => ({ default: module.SettingsSectionOutlet })))

function sectionIdForRoute(route) {
  const path = route.slice(`${SETTINGS_ROUTE}/`.length)
  return path.startsWith('communication/') ? path.replace('communication/', 'communication.') : path
}

export function HeaderSettingsButton() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const groups = getSettingsNavigationGroups(t)
  const activeItem = groups.flatMap((group) => group.items).find((item) => item.to === selected)
  const close = () => setOpen(false)

  return (
    <>
      <button
        type="button"
        onClick={() => { setSelected(null); setOpen((current) => !current) }}
        aria-label={t('settings.nav.title')}
        title={t('settings.nav.title')}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${open ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'}`}
      >
        <Settings size={16} />
      </button>
      {open && <AppDrawer
        open={open}
        onClose={close}
        title={activeItem?.label || t('settings.nav.title')}
        size="xl"
        drawerKey="header-settings"
        portal
        pushPage={false}
        topOffset="var(--layout-header-height, 48px)"
        headerActions={<Link to={activeItem?.to || SETTINGS_ROUTE} onClick={close} title={t('settings.headerPanel.openPage')} aria-label={t('settings.headerPanel.openPage')} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--brand-accent)] hover:bg-[var(--surface-2)]"><ExternalLink size={16} /></Link>}
      >
        <div className="min-w-0 space-y-4 text-[var(--text)]">
          {activeItem ? <>
            <button type="button" onClick={() => setSelected(null)} className="inline-flex items-center gap-2 rounded-md px-2 py-2 text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-2)]"><ArrowLeft size={15} className="rtl:rotate-180" />{t('settings.headerPanel.back')}</button>
            <Suspense fallback={<p role="status" className="p-4 text-sm text-[var(--text-muted)]">{t('common.loading')}</p>}>
              <SettingsSectionOutlet key={selected} sectionId={sectionIdForRoute(selected)} />
            </Suspense>
          </> : groups.map((group) => <section key={group.id}>
            <h3 className="mb-2 text-xs font-bold text-[var(--text-muted)]">{group.label}</h3>
            <div className="space-y-1">
              {group.items.map((item) => <button key={item.to} type="button" onClick={() => setSelected(item.to)} className="flex w-full items-center gap-3 rounded-md border border-transparent px-3 py-3 text-start text-sm font-semibold transition hover:border-[var(--border)] hover:bg-[var(--surface-2)]">
                <item.icon size={18} className="shrink-0 text-[var(--brand-accent)]" />
                <span className="min-w-0 flex-1 break-words">{item.label}</span>
                <ChevronRight size={15} className="shrink-0 text-[var(--text-muted)] rtl:rotate-180" />
              </button>)}
            </div>
          </section>)}
        </div>
      </AppDrawer>}
    </>
  )
}
