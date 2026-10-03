import { useTranslation } from 'react-i18next'
import { CalendarDays, FileSignature, GitBranch } from 'lucide-react'
import { ModulePageHeader } from '../../shared/components/module-pages'
import { ReportsPage, useReportRange } from '../../shared/components/reports'
import { DealContractsTable, DealCreateWizard, DealsHubCalendar, DealsHubList, PipelineTemplatesPanel, useDealsHubReport } from '../../features/deals'

/** Thin route pages of the deals hub (`/deals`, `/deals/new`, `/deals/contracts`, `/deals/calendar`, `/deals/reports`, `/deals/pipelines`). */

/** `/deals` — every deal as a table or a board, with quick info (products, team, last action). */
export function DealsListPage() {
  return <DealsHubList />
}

/** `/deals/new` — guided creation (stages → first data → products → team → review). */
export function DealsCreatePage() {
  return <DealCreateWizard />
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

/** `/deals/calendar` — every deal's dates, installments, tasks, calls and meetings. */
export function DealsCalendarPage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-4">
      <ModulePageHeader icon={CalendarDays} title={t('dealWorkspace.hub.pages.calendar')} description={t('dealWorkspace.hub.calendarDescription')} />
      <DealsHubCalendar />
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
