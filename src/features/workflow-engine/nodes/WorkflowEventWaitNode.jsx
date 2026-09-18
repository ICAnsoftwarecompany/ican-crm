import { useTranslation } from 'react-i18next'
import { TimerReset } from 'lucide-react'
import { getTrigger } from '../registry/workflowRegistry'
import { WorkflowNodeCard } from './WorkflowNodeCard'

export function WorkflowEventWaitNode({ step, selected, onClick, onRemove }) {
  const { t } = useTranslation()
  const config = step?.config || {}
  const eventDefinition = config.eventTriggerId ? getTrigger(config.eventTriggerId) : null

  const subtitle = eventDefinition
    ? config.timeout?.value
      ? t('workflow.builder.waitForEventWithTimeout', {
          event: t(eventDefinition.labelKey),
          value: config.timeout.value,
          unit: t(`workflow.builder.units.${config.timeout.unit}`),
        })
      : t('workflow.builder.waitForEventNoTimeout', { event: t(eventDefinition.labelKey) })
    : t('workflow.builder.waitForEventNotConfigured')

  return (
    <WorkflowNodeCard
      icon={TimerReset}
      accent="#0EA5E9"
      title={t('workflow.builder.waitForEventLabel')}
      subtitle={subtitle}
      selected={selected}
      onClick={onClick}
      onRemove={onRemove}
    />
  )
}
