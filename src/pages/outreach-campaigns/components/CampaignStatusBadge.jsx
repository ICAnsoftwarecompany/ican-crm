import { useTranslation } from 'react-i18next'
import { Badge } from '../../../shared/components/ui/Badge'
import { getCampaignStatusConfig } from '../../../features/outreach-campaigns'

const TONE_TO_BADGE_VARIANT = {
  neutral: 'default',
  info: 'info',
  warning: 'warning',
  success: 'success',
  danger: 'danger',
}

export function CampaignStatusBadge({ status }) {
  const { t } = useTranslation()
  const config = getCampaignStatusConfig(status)
  const label = config.labelKey ? t(config.labelKey) : (status || t('outreachCampaigns.status.unknown'))

  return <Badge variant={TONE_TO_BADGE_VARIANT[config.tone] || 'default'}>{label}</Badge>
}
