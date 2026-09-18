import { useTranslation } from 'react-i18next'
import { GitBranch } from 'lucide-react'
import { getOperatorLabelKey } from '../constants/operators'
import { WorkflowNodeCard } from './WorkflowNodeCard'

function summarizeConditions(t, rules = [], groupOperator = 'and') {
  if (!rules.length) return null
  return rules
    .map((rule) => {
      const operatorLabel = getOperatorLabelKey(rule.operator)
      return `${rule.fieldLabel || rule.field || '?'} ${operatorLabel ? t(operatorLabel) : rule.operator} ${rule.value ?? ''}`.trim()
    })
    .join(` ${t(`workflow.builder.groupOperator.${groupOperator.toLowerCase()}`)} `)
}

export function WorkflowConditionNode({ step, selected, onClick, onRemove }) {
  const { t } = useTranslation()
  const rules = step?.config?.conditions || []
  const groupOperator = step?.config?.groupOperator || 'and'

  return (
    <WorkflowNodeCard
      icon={GitBranch}
      accent="#F59E0B"
      title={t('workflow.builder.conditionLabel')}
      subtitle={summarizeConditions(t, rules, groupOperator) || t('workflow.builder.noConditionsYet')}
      selected={selected}
      onClick={onClick}
      onRemove={onRemove}
    />
  )
}
