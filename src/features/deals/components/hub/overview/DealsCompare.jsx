import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { ReportChart } from '../../../../../shared/components/reports'
import { useDealsAnalyticsOverview } from '../../../hooks/useDealAnalytics'
import { buildDealsComparison } from '../../../utils/dealAnalytics'
import { formatMoney } from '../../../utils/dealMoney'

const pct = (value) => (value === null || value === undefined ? '—' : `${Number(value).toLocaleString('en-US', { maximumFractionDigits: 2 })}%`)

/** The open deals side by side (`analytics/overview` of each, same cache as their tabs). */
export function DealsCompare({ dealIds, names, onOpenTab }) {
  const { t, i18n } = useTranslation()
  const items = useDealsAnalyticsOverview(dealIds)
  const rows = useMemo(() => buildDealsComparison(items.map((item) => ({ ...item, name: names.get(item.dealId) }))), [items, names])
  const loading = new Set(items.filter((item) => item.isLoading).map((item) => item.dealId))
  const failed = new Set(items.filter((item) => item.error).map((item) => item.dealId))
  const money = (value) => (value === null || value === undefined ? '—' : formatMoney(value, i18n.language))
  const loaded = rows.filter((row) => row.loaded)

  const charts = [
    {
      id: 'compare-leads', type: 'bar', title: t('dealWorkspace.hub.overview.compareLeads'),
      data: loaded.map((row) => ({ key: row.dealId, label: row.name, open: row.open, won: row.won, lost: row.lost })),
      series: [
        { key: 'open', label: t('dealWorkspace.analytics.kpis.open'), colorIndex: 0 },
        { key: 'won', label: t('dealWorkspace.analytics.kpis.won'), colorIndex: 2 },
        { key: 'lost', label: t('dealWorkspace.analytics.kpis.lost'), colorIndex: 7 },
      ],
      options: { stacked: true },
    },
    {
      id: 'compare-revenue', type: 'bar', title: t('dealWorkspace.hub.overview.compareRevenue'), valueLabel: t('dealWorkspace.analytics.kpis.revenue'),
      data: loaded.map((row) => ({ key: row.dealId, label: row.name, value: row.revenue })),
    },
  ]
  const cols = ['total', 'open', 'won', 'lost', 'winRate', 'revenue', 'achievement']

  return (
    <div className="space-y-4">
      <section className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs text-[var(--text-muted)]">
              <th className="px-3 py-2 text-start font-medium">{t('dealWorkspace.fields.name')}</th>
              {cols.map((col) => <th key={col} className="px-3 py-2 text-end font-medium">{t(`dealWorkspace.analytics.kpis.${col}`)}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.dealId} className="border-b border-[var(--border)] last:border-0">
                <td className="px-3 py-2">
                  <button type="button" onClick={() => onOpenTab(row.dealId)} className="font-semibold text-[var(--brand-accent)] hover:underline">{row.name}</button>
                </td>
                {!row.loaded ? (
                  <td colSpan={cols.length} className="px-3 py-2 text-xs text-[var(--text-muted)]">
                    {loading.has(row.dealId) ? <span className="inline-flex items-center gap-1.5"><Loader2 size={13} className="animate-spin" />{t('dealWorkspace.common.loading')}</span> : failed.has(row.dealId) ? t('dealWorkspace.hub.overview.compareFailed') : '—'}
                  </td>
                ) : (
                  <>
                    <td className="px-3 py-2 text-end tabular-nums">{row.total}{row.targetLeads ? <span className="text-xs text-[var(--text-muted)]"> / {row.targetLeads}</span> : null}</td>
                    <td className="px-3 py-2 text-end tabular-nums">{row.open}</td>
                    <td className="px-3 py-2 text-end tabular-nums text-emerald-700 dark:text-emerald-300">{row.won}</td>
                    <td className="px-3 py-2 text-end tabular-nums text-red-600 dark:text-red-400">{row.lost}</td>
                    <td className="px-3 py-2 text-end tabular-nums" dir="ltr">{pct(row.winRate)}</td>
                    <td className="px-3 py-2 text-end tabular-nums" dir="ltr">{money(row.revenue)}</td>
                    <td className="px-3 py-2 text-end tabular-nums" dir="ltr">{pct(row.achievement)}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <div className="grid gap-4 xl:grid-cols-2">{charts.map((chart) => <ReportChart key={chart.id} chart={chart} />)}</div>
    </div>
  )
}
