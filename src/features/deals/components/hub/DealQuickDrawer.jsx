import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CircleCheck, CircleDashed, CircleX, ExternalLink } from 'lucide-react'
import { AppDrawer } from '../../../../shared/components/overlays/AppDrawer'
import { StatTile } from '../../../../shared/components/reports'
import { Button } from '../../../../shared/components/ui/Button'
import { getDealPagePath } from '../../constants/dealWorkspacePages'
import { useDealAnalytics } from '../../hooks/useDealAnalytics'
import { useDealAnalyticsView } from '../../hooks/useDealAnalyticsView'
import { CompletenessMeter } from './CompletenessMeter'

// Where each missing completeness item is fixed inside the deal workspace.
const FIX_PAGE = { products: 'products', team: 'team', leads: 'pipeline' }
const ICONS = { true: CircleCheck, false: CircleX, null: CircleDashed }
const ICON_TONES = { true: 'text-emerald-600 dark:text-emerald-400', false: 'text-red-600 dark:text-red-400', null: 'text-[var(--text-muted)]' }

/**
 * The deal's table columns in a drawer (2026-10-16): "open deal page" on top, setup completeness with what is missing
 * (each item links to where it is fixed), live numbers from `analytics/overview`, then every field (useDealFields).
 */
export function DealQuickDrawer({ row, fields, onClose }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dealId = row ? String(row.id) : ''
  const analytics = useDealAnalytics(dealId, { enabled: Boolean(row), owners: false })
  const view = useDealAnalyticsView(analytics)

  return (
    <AppDrawer
      open={Boolean(row)}
      onClose={onClose}
      size="lg"
      drawerKey="deals-quick-view"
      title={row?.name || ''}
      description={row?.typeLabel || t('dealWorkspace.drawer.description')}
      headerActions={row ? <Button size="sm" onClick={() => navigate(`/deals/${dealId}`)}><ExternalLink size={14} />{t('dealWorkspace.drawer.openPage')}</Button> : null}
    >
      {row && (
        <div className="space-y-4 p-4">
          <section className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
            <h3 className="text-sm font-bold text-[var(--text)]">{t('dealWorkspace.completeness.title')}</h3>
            <CompletenessMeter completeness={row.completeness} />
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {row.completeness.items.map((item) => {
                const key = String(item.done)
                const Icon = ICONS[key]
                const to = item.done === false ? getDealPagePath(dealId, FIX_PAGE[item.id] || 'settings') : null
                const label = t(`dealWorkspace.completeness.items.${item.id}`)
                return (
                  <li key={item.id} className="flex items-center gap-1.5 text-xs text-[var(--text)]">
                    <Icon size={14} className={`shrink-0 ${ICON_TONES[key]}`} />
                    {to ? <Link to={to} className="hover:text-[var(--brand-accent)] hover:underline">{label}</Link> : <span className={item.done === null ? 'text-[var(--text-muted)]' : ''}>{label}</span>}
                  </li>
                )
              })}
            </ul>
            {row.completeness.unknown.length > 0 && <p className="text-[11px] text-[var(--text-muted)]">{t('dealWorkspace.completeness.unknownNote')}</p>}
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-[var(--text)]">{t('dealWorkspace.drawer.liveNumbers')}</h3>
            {analytics.isLoading ? <p className="text-xs text-[var(--text-muted)]">{t('dealWorkspace.common.loading')}</p>
              : analytics.error ? <p className="text-xs text-red-600 dark:text-red-400">{t('dealWorkspace.drawer.analyticsFailed')}</p>
                : <div className="grid grid-cols-2 gap-2">{view.leadKpis.map(({ id, ...item }) => <StatTile key={id} {...item} />)}</div>}
          </section>

          <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            <h3 className="border-b border-[var(--border)] px-3 py-2 text-sm font-bold text-[var(--text)]">{t('dealWorkspace.drawer.fields')}</h3>
            <dl className="divide-y divide-[var(--border)]">
              {fields.filter((field) => field.id !== 'name' && field.id !== 'completeness').map((field) => (
                <div key={field.id} className="grid grid-cols-[9rem_minmax(0,1fr)] items-center gap-3 px-3 py-2 text-sm">
                  <dt className="text-xs text-[var(--text-muted)]">{field.label}</dt>
                  <dd className="min-w-0 text-[var(--text)]">{field.render(row)}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      )}
    </AppDrawer>
  )
}
