import { useTranslation } from 'react-i18next'
import { Bot, CalendarDays, Settings, Workflow } from 'lucide-react'
import { AiSetupPage } from '../../shared/components/ai-setup'
import { ModulePageHeader, ModuleSettingsPage } from '../../shared/components/module-pages'
import { ReportsPage, useReportRange } from '../../shared/components/reports'
import { WorkflowModuleWorkspace } from '../../features/workflow-engine'
import {
  DEAL_AI_CAPABILITIES,
  DEAL_WORKSPACE_PAGES,
  DealActivitiesPanel,
  DealAssistant,
  DealCalendar,
  DealContractsTable,
  DealDangerZone,
  DealGeneralSettings,
  DealOverview,
  DealPipelineView,
  DealPreferencesSettings,
  DealProductsPanel,
  DealStagesSettings,
  DealTasksPanel,
  DealTeamPanel,
  useDealReport,
  useDealWorkspace,
} from '../../features/deals'
import { getSettingsSections } from '../settings/registry/settingsSections'

/**
 * Thin route pages of one deal workspace (`/deals/:dealId/*`). Everything deal-specific comes from
 * features/deals; each page = a header + one feature component. See README.md.
 */

function PageShell({ pageId, icon, children, actions }) {
  const { t } = useTranslation()
  const page = DEAL_WORKSPACE_PAGES.find((entry) => entry.id === pageId)
  return (
    <div className="space-y-4">
      <ModulePageHeader icon={icon || page?.icon} title={t(`dealWorkspace.pages.${pageId}`)} description={t(`dealWorkspace.pageDescriptions.${pageId}`)} actions={actions} />
      {children}
    </div>
  )
}

export function DealOverviewPage() {
  return <DealOverview />
}

export function DealPipelinePage() {
  return <DealPipelineView />
}

export function DealContractsPage() {
  const { dealId } = useDealWorkspace()
  return <PageShell pageId="contracts"><DealContractsTable dealId={dealId} /></PageShell>
}

export function DealTeamPage() {
  return <PageShell pageId="team"><DealTeamPanel /></PageShell>
}

export function DealMeetingsPage() {
  return <PageShell pageId="meetings"><DealActivitiesPanel type="meeting" /></PageShell>
}

export function DealCallsPage() {
  return <PageShell pageId="calls"><DealActivitiesPanel type="call" /></PageShell>
}

export function DealTasksPage() {
  return <PageShell pageId="tasks"><DealTasksPanel /></PageShell>
}

export function DealProductsPage() {
  return <PageShell pageId="products"><DealProductsPanel /></PageShell>
}

export function DealReportsPage() {
  const { t } = useTranslation()
  const { dealId } = useDealWorkspace()
  const [range, setRange] = useReportRange(`reports:deal-${dealId}`)
  const report = useDealReport(range)
  return (
    <ReportsPage
      title={t('dealWorkspace.pages.reports')}
      description={t('dealWorkspace.pageDescriptions.reports')}
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

export function DealCalendarPage() {
  return <PageShell pageId="calendar" icon={CalendarDays}><DealCalendar /></PageShell>
}

export function DealAutomationPage() {
  const { dealId } = useDealWorkspace()
  return (
    <PageShell pageId="automation" icon={Workflow}>
      <WorkflowModuleWorkspace context={{ module: 'deals', entity: 'deal', entityId: dealId, source: 'deal-automation' }} />
    </PageShell>
  )
}

export function DealAssistantPage() {
  return <PageShell pageId="assistant"><DealAssistant /></PageShell>
}

export function DealAiSetupPage() {
  const { t } = useTranslation()
  const capabilities = DEAL_AI_CAPABILITIES.map((id) => ({
    id,
    label: t(`dealWorkspace.ai.capabilities.${id}.label`),
    description: t(`dealWorkspace.ai.capabilities.${id}.description`),
  }))
  // One AI setup for the deals module (not per deal): how the assistant behaves in every deal workspace.
  return <AiSetupPage scopeKey="deals" icon={Bot} title={t('dealWorkspace.pages.ai')} description={t('dealWorkspace.pageDescriptions.ai')} capabilities={capabilities} />
}

export function DealSettingsPage() {
  const { t } = useTranslation()
  const sections = [
    { id: 'general', label: t('dealWorkspace.settings.sections.general'), description: t('dealWorkspace.settings.sections.generalHint'), element: <DealGeneralSettings /> },
    { id: 'stages', label: t('dealWorkspace.settings.sections.stages'), description: t('dealWorkspace.settings.sections.stagesHint'), element: <DealStagesSettings /> },
    { id: 'preferences', label: t('dealWorkspace.settings.sections.preferences'), description: t('dealWorkspace.settings.sections.preferencesHint'), element: <DealPreferencesSettings /> },
    // App-wide sections from the settings registry (identical to /settings).
    ...getSettingsSections(['deals.pipelines'], t),
    { id: 'danger', label: t('dealWorkspace.settings.sections.danger'), description: t('dealWorkspace.settings.sections.dangerHint'), element: <DealDangerZone /> },
  ]
  return <ModuleSettingsPage icon={Settings} title={t('dealWorkspace.pages.settings')} description={t('dealWorkspace.pageDescriptions.settings')} sections={sections} fullSettingsPath="/settings" />
}
