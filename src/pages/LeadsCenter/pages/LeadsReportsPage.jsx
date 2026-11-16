import { useTranslation } from 'react-i18next'
import { ReportsPage, useReportRange } from '../../../shared/components/reports'
import { useLeadsCenterReport } from '../../../features/customers/reports'

/** /LeadsCenter/reports — Leads Center statistics on the shared reports engine (added 2026-10-01). */
export function LeadsReportsPage() {
  const { t } = useTranslation()
  const [range, setRange] = useReportRange('reports:leads-center')
  const report = useLeadsCenterReport(range)

  return (
    <ReportsPage
      title={t('customers.nav.reports')}
      description={t('customers.reports.description')}
      range={range}
      onRangeChange={setRange}
      kpis={report.kpis}
      charts={report.charts}
      isLoading={report.isLoading}
      error={report.error}
      onRetry={report.refetch}
      note={[
        t('reports.basedOnRecords', { count: report.recordCount }),
        report.isPartial ? t('customers.reports.partialNote') : '',
      ].filter(Boolean).join(' ')}
    />
  )
}
