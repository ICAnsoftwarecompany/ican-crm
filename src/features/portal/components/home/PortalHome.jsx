import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { portalEndpoints as P } from '../../../service/portal-transport'
import { usePortalList, usePublicSettings } from '../../api/portalApi'
import { visibleSections } from '../../constants/sections'
import { usePortalAccess } from '../../hooks/usePortalAccess'
import { usePortalFormat } from '../../utils/format'
import { Card } from '../PortalPage'

/** Home: welcome text, open requests, next payment, services and shortcuts to the permitted sections. */
export function PortalHome() {
  const { t } = useTranslation()
  const format = usePortalFormat()
  const settings = usePublicSettings()
  const { me, can, recordTypes } = usePortalAccess()
  const cases = usePortalList('cases', P.cases, undefined, { enabled: can('case') })
  const schedules = usePortalList('schedules', P.schedules, undefined, { enabled: can('payment_schedule') })
  const records = usePortalList('records', P.records, undefined, { enabled: recordTypes.length > 0 })
  const openCases = (cases.data || []).filter((item) => !['resolved', 'closed', 'cancelled'].includes(item.status?.category)).length
  const nextDue = (schedules.data || []).map((entry) => entry.next_due && { ...entry.next_due, currency: entry.currency }).filter(Boolean).sort((a, b) => String(a.date).localeCompare(String(b.date)))[0]
  const overdue = (schedules.data || []).reduce((sum, entry) => sum + (entry.totals?.overdue || 0), 0)
  const sections = visibleSections({ settings: settings.data, can, recordTypes }).filter((section) => section.key !== 'home')

  const tiles = [
    recordTypes.length > 0 && { key: 'services', value: records.data?.length ?? '—', to: '/services' },
    can('case') && { key: 'openRequests', value: cases.isLoading ? '—' : openCases, to: '/requests' },
    can('payment_schedule') && { key: 'nextPayment', value: nextDue ? `${format.money(nextDue.amount, nextDue.currency)} · ${format.date(nextDue.date)}` : t('portal.home.nothingDue'), to: '/payments', ltr: Boolean(nextDue) },
    can('payment_schedule') && overdue > 0 && { key: 'overdue', value: format.money(overdue), to: '/payments', tone: 'text-sla-breached', ltr: true },
  ].filter(Boolean)

  return (
    <div className="grid gap-5">
      <Card className="grid gap-1">
        <h1 className="text-xl font-bold">{t('portal.home.hello', { name: me?.account?.name || '' })}</h1>
        <p className="text-sm text-[var(--text-muted)]">{format.label(settings.data?.welcome, t('portal.home.welcome'))}</p>
      </Card>
      {tiles.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((tile) => (
            <Link key={tile.key} to={tile.to} className="grid gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-brand-accent">
              <span className="text-xs text-[var(--text-muted)]">{t(`portal.home.tiles.${tile.key}`)}</span>
              <span className={`text-lg font-bold ${tile.tone || 'text-[var(--text)]'}`}><bdi>{tile.value}</bdi></span>
            </Link>
          ))}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <Link key={section.key} to={section.path} className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-brand-accent">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--brand-accent-soft)] text-brand-accent"><Icon size={18} aria-hidden="true" /></span>
              <span className="grid gap-0.5">
                <span className="font-semibold text-[var(--text)]">{t(`portal.sections.${section.key}`)}</span>
                <span className="text-xs text-[var(--text-muted)]">{t(`portal.sectionHints.${section.key}`)}</span>
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
