import { useTranslation } from 'react-i18next'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { formatMoney } from '../../utils/dealMoney'
import { ProgressBar } from '../common/ProgressBar'

/** Owners performance (`GET /deals/{id}/analytics/owners`, normalized): leads, won, win rate, revenue per owner. */
export function DealOwnersTable({ owners = [], isLoading, error, onRetry }) {
  const { t, i18n } = useTranslation()
  const top = owners.reduce((max, owner) => Math.max(max, owner.revenue), 0)
  return (
    <section className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <header>
        <h3 className="text-sm font-bold text-[var(--text)]">{t('dealWorkspace.analytics.owners.title')}</h3>
        <p className="text-xs text-[var(--text-muted)]">{t('dealWorkspace.analytics.owners.description')}</p>
      </header>
      <ResourceState isLoading={isLoading} error={error} onRetry={onRetry} empty={!owners.length} emptyTitle={t('dealWorkspace.analytics.owners.emptyTitle')} emptyDescription={t('dealWorkspace.analytics.owners.emptyDescription')}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs text-[var(--text-muted)]">
                <th className="py-2 text-start font-medium">{t('dealWorkspace.analytics.owners.owner')}</th>
                <th className="py-2 text-end font-medium">{t('dealWorkspace.analytics.kpis.total')}</th>
                <th className="py-2 text-end font-medium">{t('dealWorkspace.analytics.kpis.won')}</th>
                <th className="py-2 text-end font-medium">{t('dealWorkspace.analytics.kpis.winRate')}</th>
                <th className="w-48 py-2 ps-4 text-start font-medium">{t('dealWorkspace.analytics.kpis.revenue')}</th>
              </tr>
            </thead>
            <tbody>
              {owners.map((owner) => (
                <tr key={owner.id || owner.name} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2">
                    <span className="block font-semibold text-[var(--text)]">{owner.name || '—'}</span>
                    {owner.email && <span className="block text-xs text-[var(--text-muted)]" dir="ltr">{owner.email}</span>}
                  </td>
                  <td className="py-2 text-end tabular-nums text-[var(--text)]">{owner.leads}</td>
                  <td className="py-2 text-end tabular-nums text-[var(--text)]">{owner.won}</td>
                  <td className="py-2 text-end tabular-nums text-[var(--text)]" dir="ltr">{owner.winRate}%</td>
                  <td className="py-2 ps-4">
                    <ProgressBar value={top ? (owner.revenue / top) * 100 : 0} label={<span dir="ltr" className="tabular-nums text-[var(--text)]">{formatMoney(owner.revenue, i18n.language)}</span>} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ResourceState>
    </section>
  )
}
