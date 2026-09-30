import { useTranslation } from 'react-i18next'
import { ReportsPage, useReportRange } from '../../shared/components/reports'
import { useProductsReport } from '../../features/products/reports'

/** /products/reports — catalog statistics on the shared reports engine (added 2026-10-01). */
export function ProductsReportsPage() {
  const { t } = useTranslation()
  const [range, setRange] = useReportRange('reports:products')
  const report = useProductsReport(range)

  return (
    <ReportsPage
      title={t('products.nav.reports')}
      description={t('products.reports.description')}
      range={range}
      onRangeChange={setRange}
      kpis={report.kpis}
      charts={report.charts}
      isLoading={report.isLoading}
      error={report.error}
      onRetry={report.refetch}
      note={t('reports.basedOnRecords', { count: report.recordCount })}
    />
  )
}
