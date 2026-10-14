import { useTranslation } from 'react-i18next'
import { BarChart3 } from 'lucide-react'
import { ResourceState } from '../data/ResourceState'
import { ModuleNotice, ModulePageHeader } from '../module-pages'
import { ReportChart } from './ReportChart'
import { ReportRangeFilter } from './ReportRangeFilter'
import { KpiRow } from './StatTile'

/**
 * The shared "Reports" page every area uses (Leads Center, Communication modules, Products, …).
 * Presentation only: the area computes `kpis` and `charts` from its own data (with reportUtils)
 * and passes them in. Layout: header → range filter row → KPI row → 2-column chart grid.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {string} [props.range] - Current preset; omit to hide the range filter.
 * @param {(range: string) => void} [props.onRangeChange]
 * @param {string[]} [props.ranges] - Allowed presets.
 * @param {{ id: string, label: string, value: number|string, delta?: number|null, positiveIsGood?: boolean, hint?: string, icon?: React.ComponentType }[]} [props.kpis]
 * @param {import('./ReportChart').ReportChartConfig[]} [props.charts]
 * @param {boolean} [props.isLoading]
 * @param {Error|null} [props.error]
 * @param {() => void} [props.onRetry]
 * @param {React.ReactNode} [props.note] - Data-scope note under the charts (e.g. "based on the latest 500 records").
 * @param {React.ReactNode} [props.notice] - Warning banner above the charts (e.g. "not connected yet").
 * @param {React.ReactNode} [props.actions] - Extra header actions.
 * @param {React.ReactNode} [props.children] - Extra sections after the charts.
 */
export function ReportsPage({
  icon = BarChart3,
  title,
  description,
  range,
  onRangeChange,
  ranges,
  kpis = [],
  charts = [],
  isLoading = false,
  error = null,
  onRetry,
  note,
  notice,
  actions,
  children,
}) {
  const { t } = useTranslation()
  const hasContent = kpis.length > 0 || charts.length > 0

  return (
    <div className="space-y-4">
      <ModulePageHeader icon={icon} title={title} description={description} actions={actions} />

      {range && onRangeChange && (
        <div className="flex flex-wrap items-center gap-3">
          <ReportRangeFilter value={range} onChange={onRangeChange} ranges={ranges} />
        </div>
      )}

      {notice && <ModuleNotice tone="warning">{notice}</ModuleNotice>}

      <ResourceState
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        empty={!hasContent && !children}
        emptyIcon={<BarChart3 size={24} />}
        emptyTitle={t('reports.emptyTitle')}
        emptyDescription={t('reports.emptyDescription')}
      >
        <div className="space-y-4">
          <KpiRow items={kpis} />
          {charts.length > 0 && (
            <div className="grid gap-4 lg:grid-cols-2">
              {charts.map((chart) => <ReportChart key={chart.id} chart={chart} />)}
            </div>
          )}
          {children}
          {note && <p className="text-xs text-[var(--text-light)]">{note}</p>}
        </div>
      </ResourceState>
    </div>
  )
}
