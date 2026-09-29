import { useTranslation } from 'react-i18next'
import { cn } from '../../../../shared/utils/cn'
import { formatMinutes } from '../../settings/resources/resourceHelpers'

/** Stat tiles — the headline numbers are figures, not charts. Missing values read "–". */
export function KpiTiles({ report }) {
  const { t, i18n } = useTranslation()
  const number = (value) => (value == null ? '–' : new Intl.NumberFormat(i18n.language).format(value))
  const kpis = report?.kpis || {}
  const tiles = [
    { key: 'created', value: number(kpis.created) },
    { key: 'resolved', value: number(kpis.resolved) },
    { key: 'open_now', value: number(kpis.open_now) },
    { key: 'avg_first_response', value: kpis.avg_first_response_minutes == null ? '–' : formatMinutes(kpis.avg_first_response_minutes, t), text: true },
    { key: 'avg_resolution', value: kpis.avg_resolution_minutes == null ? '–' : formatMinutes(kpis.avg_resolution_minutes, t), text: true },
    {
      key: 'sla_compliance',
      value: kpis.sla_compliance_percent == null ? '–' : `${number(kpis.sla_compliance_percent)}%`,
      tone: kpis.sla_compliance_percent == null ? null : kpis.sla_compliance_percent >= 85 ? 'text-sla-on-track' : kpis.sla_compliance_percent >= 70 ? 'text-sla-at-risk' : 'text-sla-breached',
      hint: t('service.reports.slaBreakdown', { met: number(report?.sla?.met), breached: number(report?.sla?.breached) }),
    },
    {
      key: 'csat',
      value: report?.csat?.average == null ? '–' : `${number(report.csat.average)} / 5`,
      hint: t('service.reports.csatResponses', { count: number(report?.csat?.count ?? 0), percent: number(report?.csat?.satisfied_percent ?? 0) }),
    },
    { key: 'reopened', value: number(kpis.reopened) },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {tiles.map((tile) => (
        <div key={tile.key} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs text-[var(--text-muted)]">{t(`service.reports.kpis.${tile.key}`)}</p>
          <p className={cn('mt-1 text-2xl font-bold', tile.tone || 'text-[var(--text)]')} dir={tile.text ? undefined : 'ltr'}>{tile.value}</p>
          {tile.hint && <p className="mt-0.5 text-xs text-[var(--text-muted)]">{tile.hint}</p>}
        </div>
      ))}
    </div>
  )
}
