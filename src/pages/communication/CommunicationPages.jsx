import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bot, CalendarDays, Plus, SlidersHorizontal, Workflow } from 'lucide-react'
import { ModulePageHeader, ModulePlaceholderPage, ModuleSettingsPage } from '../../shared/components/module-pages'
import { AiSetupPage } from '../../shared/components/ai-setup'
import { ReportsPage, useReportRange } from '../../shared/components/reports'
import {
  CommunicationAutomation,
  useActivityReport,
  useConversationsReport,
  useTeamChatReport,
  CommunicationCalendar,
  getCommunicationModule,
} from '../../features/communication'
import { ScheduleActivityDialog } from '../../features/activities'
import { getSettingsSections } from '../settings/registry/settingsSections'

/**
 * Thin route pages shared by the four Communication hub modules. Each takes `moduleId` and pulls
 * everything module-specific from features/communication's registry. See README.md.
 */

const ACTIVITY_TYPE = { calls: 'call', meetings: 'meeting' }

function usePlannedList(key) {
  const { t } = useTranslation()
  const value = t(key, { returnObjects: true })
  return value && typeof value === 'object' ? Object.values(value) : []
}

function useModuleText(moduleId) {
  const { t } = useTranslation()
  return (key, options) => t(`communication.modules.${moduleId}.${key}`, options)
}

export function CommunicationCreatePage({ moduleId }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const module = getCommunicationModule(moduleId)
  const text = useModuleText(moduleId)
  const planned = usePlannedList(`communication.modules.${moduleId}.create.items`)
  const activityType = ACTIVITY_TYPE[moduleId]

  if (!activityType) {
    return (
      <ModulePlaceholderPage
        icon={Plus}
        title={text('create.title')}
        description={text('create.description')}
        plannedItems={planned}
      />
    )
  }

  const backToList = () => navigate(module.basePath)

  return (
    <div className="space-y-4">
      <ModulePageHeader icon={Plus} title={text('create.title')} description={text('create.description')} />
      <ScheduleActivityDialog
        type={activityType}
        isOpen
        presentation="inline"
        allowEntityBinding
        relatedType="lead"
        onClose={backToList}
        onCreated={backToList}
      />
      <p className="text-xs text-[var(--text-light)]">{t('communication.create.bindingHint')}</p>
    </div>
  )
}

function ReportsView({ moduleId, report, range, setRange }) {
  const { t } = useTranslation()
  return (
    <ReportsPage
      title={t(`communication.modules.${moduleId}.reports.title`)}
      description={t(`communication.modules.${moduleId}.reports.description`)}
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

function ActivityReportsView({ moduleId }) {
  const [range, setRange] = useReportRange(`reports:${moduleId}`)
  const report = useActivityReport(ACTIVITY_TYPE[moduleId], range)
  return <ReportsView moduleId={moduleId} report={report} range={range} setRange={setRange} />
}

function ConversationsReportsView() {
  const [range, setRange] = useReportRange('reports:conversations')
  const report = useConversationsReport(range)
  return <ReportsView moduleId="conversations" report={report} range={range} setRange={setRange} />
}

function TeamChatReportsView() {
  const [range, setRange] = useReportRange('reports:team-chat')
  const report = useTeamChatReport(range)
  return <ReportsView moduleId="team-chat" report={report} range={range} setRange={setRange} />
}

/** /<module>/reports — every Communication module on the shared reports engine (2026-10-01). */
export function CommunicationReportsPage({ moduleId }) {
  if (ACTIVITY_TYPE[moduleId]) return <ActivityReportsView moduleId={moduleId} />
  if (moduleId === 'conversations') return <ConversationsReportsView />
  return <TeamChatReportsView />
}

export function CommunicationCalendarPage({ moduleId }) {
  const { t } = useTranslation()
  const text = useModuleText(moduleId)
  return (
    <div className="space-y-4">
      <ModulePageHeader icon={CalendarDays} title={t('communication.pages.calendar')} description={text('calendarDescription')} />
      <CommunicationCalendar moduleId={moduleId} />
    </div>
  )
}

export function CommunicationAutomationPage({ moduleId }) {
  const { t } = useTranslation()
  const text = useModuleText(moduleId)
  return (
    <div className="space-y-4">
      <ModulePageHeader icon={Workflow} title={t('communication.pages.automation')} description={text('automationDescription')} />
      <CommunicationAutomation moduleId={moduleId} />
    </div>
  )
}

export function CommunicationCustomizationPage({ moduleId }) {
  const { t } = useTranslation()
  const module = getCommunicationModule(moduleId)
  const text = useModuleText(moduleId)
  return (
    <ModulePlaceholderPage
      icon={SlidersHorizontal}
      title={t('communication.pages.customization')}
      description={text('customization.description')}
      plannedItems={module.plannedCustomization.map((key) => text(`customization.items.${key}`))}
    />
  )
}

export function CommunicationAiPage({ moduleId }) {
  const { t } = useTranslation()
  const module = getCommunicationModule(moduleId)
  const text = useModuleText(moduleId)
  const capabilities = module.aiCapabilities.map((id) => ({
    id,
    label: text(`ai.${id}.label`),
    description: text(`ai.${id}.description`),
  }))

  return (
    <AiSetupPage
      scopeKey={`communication.${module.id}`}
      icon={Bot}
      title={t('communication.pages.ai')}
      description={text('ai.pageDescription')}
      capabilities={capabilities}
    />
  )
}

export function CommunicationModuleSettingsPage({ moduleId }) {
  const { t } = useTranslation()
  const module = getCommunicationModule(moduleId)
  return (
    <ModuleSettingsPage
      title={t('communication.pages.settings')}
      description={t(`communication.modules.${module.id}.settingsDescription`)}
      sections={getSettingsSections(module.settingsSectionIds, t)}
      fullSettingsPath="/settings"
    />
  )
}
