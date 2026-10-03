import { useTranslation } from 'react-i18next'
import { Badge } from '../../../../shared/components/ui/Badge'
import { getDealStatusValue } from '../../utils/dealDisplay'

const DEAL_VARIANTS = { draft: 'default', active: 'success', paused: 'warning', completed: 'info', cancelled: 'danger' }
const LEAD_VARIANTS = { open: 'info', won: 'success', lost: 'danger' }

/** Deal status pill (`draft | active | paused | completed | cancelled`). */
export function DealStatusBadge({ status, className }) {
  const { t } = useTranslation()
  const value = getDealStatusValue(status)
  if (!value) return null
  return <Badge variant={DEAL_VARIANTS[value] || 'default'} className={className}>{t(`dealWorkspace.options.dealStatus.${value}`, value)}</Badge>
}

/** Deal lead status pill (`open | won | lost`). */
export function LeadStatusBadge({ status, className }) {
  const { t } = useTranslation()
  if (!status) return null
  return <Badge variant={LEAD_VARIANTS[status] || 'default'} className={className}>{t(`dealWorkspace.options.leadStatus.${status}`, status)}</Badge>
}
