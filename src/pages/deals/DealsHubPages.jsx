import { useTranslation } from 'react-i18next'
import { FileSignature, GitBranch } from 'lucide-react'
import { ModulePageHeader } from '../../shared/components/module-pages'
import { ReportsPage, useReportRange } from '../../shared/components/reports'
import { DealContractsTable, DealsTable, PipelineTemplatesPanel, useDealsHubReport } from '../../features/deals'

/** Thin route pages of the deals hub (`/deals`, `/deals/contracts`, `/deals/reports`, `/deals/pipelines`). */

export function DealsListPage() {
  return <DealsTable />
}

export function DealsContractsPage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-4">
      <ModulePageHeader icon={FileSignature} title={t('dealWorkspace.hub.pages.contracts')} description={t('dealWorkspace.hub.contractsDescription')} />
      <DealContractsTable />
    </div>
  )
}

export function DealsReportsPage() {
  const { t } = useTranslation()
  const [range, setRange] = useReportRange('reports:deals-hub')
  const report = useDealsHubReport(range)
  return (
    <ReportsPage
      title={t('dealWorkspace.hub.pages.reports')}
      description={t('dealWorkspace.hub.reportsDescription')}
      range={range}
      onRangeChange={setRange}
      kpis={report.kpis}
      charts={report.charts}
      isLoading={report.isLoading}
      error={report.error}
      onRetry={report.refetch}
      note={t('dealWorkspace.hub.reports.note', { count: report.recordCount })}
    />
  )
}

export function DealsPipelinesPage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-4">
      <ModulePageHeader icon={GitBranch} title={t('dealWorkspace.hub.pages.pipelines')} description={t('dealWorkspace.hub.pipelinesDescription')} />
      <PipelineTemplatesPanel />
    </div>
  )
}
