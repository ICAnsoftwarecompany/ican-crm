import { useTranslation } from 'react-i18next'
import { PageToolbar } from '../../shared/components/data/PageToolbar'
import { OutreachWorkflowContent } from '../../features/outreach-campaigns/components/OutreachWorkflowContent'

export function OutreachWorkflowPage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-4">
      <PageToolbar title={t('outreachCampaigns.navigation.workflow')} />
      <OutreachWorkflowContent />
    </div>
  )
}
