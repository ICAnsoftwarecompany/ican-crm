import { useTranslation } from 'react-i18next'
import { Play } from 'lucide-react'
import { getAction } from '../registry/workflowRegistry'
import { resolveWorkflowIcon } from '../utils/resolveIcon'
import { WorkflowNodeCard } from './WorkflowNodeCard'

export function WorkflowActionNode({ step, selected, onClick, onRemove }) {
  const { t } = useTranslation()
  const definition = step?.definitionId ? getAction(step.definitionId) : null
  const Icon = definition ? resolveWorkflowIcon(definition.icon, 'Play') : Play

  return (
    <WorkflowNodeCard
      icon={Icon}
      accent="#00C2CB"
      title={definition ? t(definition.labelKey) : t('workflow.builder.selectAction')}
      subtitle={t('workflow.builder.actionLabel')}
      backendSupport={definition?.backendSupport}
      selected={selected}
      onClick={onClick}
      onRemove={onRemove}
    />
  )
}
