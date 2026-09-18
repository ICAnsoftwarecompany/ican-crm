import { useTranslation } from 'react-i18next'
import { Flag } from 'lucide-react'
import { WorkflowNodeCard } from './WorkflowNodeCard'

export function WorkflowEndNode({ selected, onClick, onRemove }) {
  const { t } = useTranslation()

  return (
    <WorkflowNodeCard
      icon={Flag}
      accent="#64748B"
      title={t('workflow.builder.endLabel')}
      selected={selected}
      onClick={onClick}
      onRemove={onRemove}
    />
  )
}
