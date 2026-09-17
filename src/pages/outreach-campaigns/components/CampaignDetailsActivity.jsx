import { useTranslation } from 'react-i18next'
import { History } from 'lucide-react'
import { EmptyState } from '../../../shared/components/feedback/EmptyState'

/**
 * The backend has no campaign lifecycle/events endpoint today (see docs
 * "Backend Gaps" — CampaignMember model). Rendering an honest empty state
 * instead of fabricating a timeline.
 */
export function CampaignDetailsActivity() {
  const { t } = useTranslation()
  return (
    <EmptyState
      icon={<History size={24} />}
      title={t('outreachCampaigns.activity.notAvailableTitle')}
      description={t('outreachCampaigns.activity.notAvailableDescription')}
    />
  )
}
