import { useTranslation } from 'react-i18next'
import { Badge } from '../../../shared/components/ui/Badge'
import { getWorkflowStatusConfig } from '../constants/workflowStatus'

const TONE_TO_BADGE_VARIANT = {
  neutral: 'default',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
}

export function WorkflowStatusBadge({ status }) {
  const { t } = useTranslation()
  const config = getWorkflowStatusConfig(status)
  return <Badge variant={TONE_TO_BADGE_VARIANT[config.tone] || 'default'}>{t(config.labelKey)}</Badge>
}
