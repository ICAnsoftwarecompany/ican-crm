import { useTranslation } from 'react-i18next'
import { Clock } from 'lucide-react'
import { WorkflowNodeCard } from './WorkflowNodeCard'

function summarizeWait(t, config = {}) {
  if (config.mode === 'until' && config.until) {
    return t('workflow.builder.waitUntilSummary', { date: config.until })
  }
  if (config.mode === 'duration' && config.value && config.unit) {
    return t('workflow.builder.waitDurationSummary', { value: config.value, unit: t(`workflow.builder.units.${config.unit}`) })
  }
  return t('workflow.builder.waitNotConfigured')
}

export function WorkflowWaitNode({ step, selected, onClick, onRemove }) {
  const { t } = useTranslation()

  return (
    <WorkflowNodeCard
      icon={Clock}
      accent="#3B82F6"
      title={t('workflow.builder.waitLabel')}
      subtitle={summarizeWait(t, step?.config)}
      selected={selected}
      onClick={onClick}
      onRemove={onRemove}
    />
  )
}
