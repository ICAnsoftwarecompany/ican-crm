import { useTranslation } from 'react-i18next'
import { BarChart3 } from 'lucide-react'
import { ReportsPage } from '../../../../shared/components/reports'
import { useSalesTeamsReport } from './useSalesTeamsReport'

/** /LeadsCenter/teams/reports — team sizes, coverage and how the distribution rules are set up. */
export function SalesTeamsReportView() {
  const { t } = useTranslation()
  const report = useSalesTeamsReport()
  return (
    <ReportsPage
      icon={BarChart3}
      title={t('salesTeams.reports.title')}
      description={t('salesTeams.reports.description')}
      kpis={report.kpis}
      charts={report.charts}
      isLoading={report.isLoading}
      error={report.error}
      onRetry={report.refetch}
      note={t('salesTeams.reports.note')}
    />
  )
}
