import { useTranslation } from 'react-i18next'
import { AgentChat } from '../../../features/ai-agent/components/AgentChat'
import { WorkflowBuilder, WorkflowLocalStorageNotice } from '../../../features/workflow-engine'
import { CalendarPage } from '../../../pages/calendar/CalendarPage'
import { PageToolbar } from '../data/PageToolbar'

export function CenterCalendarToolPage() {
  return <CalendarPage />
}

export function CenterWorkflowToolPage({ module, entity, source }) {
  const { t } = useTranslation()

  return (
    <div className="flex h-full min-h-[560px] flex-col gap-3">
      <PageToolbar title={t('workflow.center.title')} />
      <WorkflowLocalStorageNotice />
      <div className="min-h-0 flex-1 overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
        <WorkflowBuilder mode="context" context={{ module, entity, source }} embedded />
      </div>
    </div>
  )
}

export function CenterAiAssistantToolPage({ titleKey }) {
  const { t } = useTranslation()

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      <PageToolbar title={t(titleKey)} />
      <AgentChat />
    </div>
  )
}
