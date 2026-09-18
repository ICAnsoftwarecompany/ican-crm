import { useTranslation } from 'react-i18next'
import { Zap } from 'lucide-react'
import { getTrigger } from '../registry/workflowRegistry'
import { resolveWorkflowIcon } from '../utils/resolveIcon'
import { WorkflowNodeCard } from './WorkflowNodeCard'

export function WorkflowTriggerNode({ trigger, selected, onClick }) {
  const { t } = useTranslation()
  const definition = trigger?.definitionId ? getTrigger(trigger.definitionId) : null
  const Icon = definition ? resolveWorkflowIcon(definition.icon, 'Zap') : Zap

  return (
    <WorkflowNodeCard
      icon={Icon}
      accent="#8B5CF6"
      title={definition ? t(definition.labelKey) : t('workflow.builder.selectTrigger')}
      subtitle={t('workflow.builder.triggerLabel')}
      backendSupport={definition?.backendSupport}
      selected={selected}
      onClick={onClick}
    />
  )
}
