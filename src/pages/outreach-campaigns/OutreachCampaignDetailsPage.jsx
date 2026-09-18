import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowRight, Ban, Pencil, Trash2 } from 'lucide-react'
import { Button } from '../../shared/components/ui/Button'
import { Tabs } from '../../shared/components/ui/Tabs'
import { ResourceState } from '../../shared/components/data/ResourceState'
import { ConfirmDialog } from '../../shared/components/overlays/ConfirmDialog'
import { useOutreachCampaign, useOutreachCampaignMutations } from '../../features/outreach-campaigns/hooks/useOutreachCampaigns'
import { getCampaignStatusConfig } from '../../features/outreach-campaigns/constants/campaignStatus'
import { extractMessage } from '../../shared/utils/apiResponse'
import { CampaignChannelBadge } from './components/CampaignChannelBadge'
import { CampaignStatusBadge } from './components/CampaignStatusBadge'
import { CampaignDetailsOverview } from './components/CampaignDetailsOverview'
import { CampaignDetailsAudience } from './components/CampaignDetailsAudience'
import { CampaignDetailsContent } from './components/CampaignDetailsContent'
import { CampaignDetailsActivity } from './components/CampaignDetailsActivity'
import { CampaignDetailsPerformance } from './components/CampaignDetailsPerformance'
import { CampaignAutomationTab } from './components/CampaignAutomationTab'
import { CampaignWizardModal } from './components/wizard/CampaignWizardModal'

export function OutreachCampaignDetailsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { campaignId } = useParams()
  const { campaign, isLoading, error, refetch } = useOutreachCampaign(campaignId)
  const mutations = useOutreachCampaignMutations()

  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [confirmType, setConfirmType] = useState(null)

  const statusConfig = campaign ? getCampaignStatusConfig(campaign.status) : null

  const handleConfirm = async () => {
    try {
      if (confirmType === 'cancel') {
        await mutations.cancelCampaign.mutateAsync(campaignId)
        toast.success(t('outreachCampaigns.actions.cancelSuccess'))
      } else if (confirmType === 'delete') {
        await mutations.deleteCampaign.mutateAsync(campaignId)
        toast.success(t('outreachCampaigns.actions.deleteSuccess'))
        navigate('/outreach-campaigns')
        return
      }
      setConfirmType(null)
    } catch (err) {
      toast.error(extractMessage(err, t('outreachCampaigns.actions.actionError')))
    }
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/outreach-campaigns')}>
        <ArrowRight size={16} />
        {t('outreachCampaigns.details.back')}
      </Button>

      <ResourceState isLoading={isLoading} error={error} empty={!isLoading && !campaign} onRetry={refetch} emptyTitle={t('outreachCampaigns.details.notFound')}>
        {campaign && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-lg font-black text-[var(--text)]">{campaign.name}</h1>
                  <div className="mt-1 flex items-center gap-2">
                    <CampaignChannelBadge channel={campaign.channel} />
                    <CampaignStatusBadge status={campaign.status} />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {statusConfig?.canEdit && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Pencil size={14} />
                    {t('outreachCampaigns.actions.edit')}
                  </Button>
                )}
                {statusConfig?.canCancel && (
                  <Button variant="outline" size="sm" onClick={() => setConfirmType('cancel')}>
                    <Ban size={14} />
                    {t('outreachCampaigns.actions.cancel')}
                  </Button>
                )}
                {statusConfig?.canDelete && (
                  <Button variant="danger" size="sm" onClick={() => setConfirmType('delete')}>
                    <Trash2 size={14} />
                    {t('outreachCampaigns.actions.delete')}
                  </Button>
                )}
              </div>
            </div>

            <Tabs
              variant="underline"
              active={activeTab}
              onChange={setActiveTab}
              items={[
                { id: 'overview', label: t('outreachCampaigns.details.tabs.overview'), content: <CampaignDetailsOverview campaign={campaign} /> },
                { id: 'audience', label: t('outreachCampaigns.details.tabs.audience'), content: <CampaignDetailsAudience campaign={campaign} /> },
                { id: 'content', label: t('outreachCampaigns.details.tabs.content'), content: <CampaignDetailsContent campaign={campaign} /> },
                { id: 'activity', label: t('outreachCampaigns.details.tabs.activity'), content: <CampaignDetailsActivity /> },
                { id: 'performance', label: t('outreachCampaigns.details.tabs.performance'), content: <CampaignDetailsPerformance campaign={campaign} /> },
                { id: 'automation', label: t('outreachCampaigns.details.tabs.automation'), content: <CampaignAutomationTab campaign={campaign} /> },
              ]}
            />

            <CampaignWizardModal
              open={isEditing}
              mode="edit"
              campaign={campaign}
              onClose={() => setIsEditing(false)}
              onSuccess={() => refetch()}
            />

            <ConfirmDialog
              isOpen={Boolean(confirmType)}
              onCancel={() => setConfirmType(null)}
              onConfirm={handleConfirm}
              loading={mutations.cancelCampaign.isPending || mutations.deleteCampaign.isPending}
              type={confirmType === 'delete' ? 'danger' : 'warning'}
              title={confirmType === 'delete' ? t('outreachCampaigns.actions.confirmDeleteTitle') : t('outreachCampaigns.actions.confirmCancelTitle')}
              message={confirmType === 'delete' ? t('outreachCampaigns.actions.confirmDeleteMessage') : t('outreachCampaigns.actions.confirmCancelMessage')}
              confirmText={confirmType === 'delete' ? t('actions.delete') : t('outreachCampaigns.actions.cancel')}
            />
          </>
        )}
      </ResourceState>
    </div>
  )
}
