import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { PageToolbar } from '../../shared/components/data/PageToolbar'
import { ConfirmDialog } from '../../shared/components/overlays/ConfirmDialog'
import { useOutreachCampaigns, useOutreachCampaignMutations } from '../../features/outreach-campaigns/hooks/useOutreachCampaigns'
import { OutreachCampaignListContent } from '../../features/outreach-campaigns/components/OutreachCampaignListContent'
import { extractMessage } from '../../shared/utils/apiResponse'
import { useCampaignsTableColumns } from './components/useCampaignsTableColumns'
import { CampaignWizardModal } from './components/wizard/CampaignWizardModal'

export function OutreachCampaignsPage({ view = 'all', channel = null }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const campaignsQuery = useOutreachCampaigns()
  const campaigns = (campaignsQuery.campaigns || []).filter((campaign) =>
    (!channel || campaign.channel === channel) && (view !== 'live' || campaign.status === 'running')
  )
  const mutations = useOutreachCampaignMutations()

  const [wizardState, setWizardState] = useState({ open: false, campaign: null })
  const [confirmState, setConfirmState] = useState({ open: false, type: null, campaign: null })

  const openEditWizard = (campaign) => setWizardState({ open: true, campaign })
  const closeWizard = () => setWizardState((current) => ({ ...current, open: false }))

  const columns = useCampaignsTableColumns({
    onView: (campaign) => navigate(`/outreach-campaigns/${campaign.id}`),
    onEdit: openEditWizard,
    onCancel: (campaign) => setConfirmState({ open: true, type: 'cancel', campaign }),
    onDelete: (campaign) => setConfirmState({ open: true, type: 'delete', campaign }),
  })

  const handleConfirm = async () => {
    const { type, campaign } = confirmState
    try {
      if (type === 'cancel') {
        await mutations.cancelCampaign.mutateAsync(campaign.id)
        toast.success(t('outreachCampaigns.actions.cancelSuccess'))
      } else if (type === 'delete') {
        await mutations.deleteCampaign.mutateAsync(campaign.id)
        toast.success(t('outreachCampaigns.actions.deleteSuccess'))
      }
      setConfirmState({ open: false, type: null, campaign: null })
    } catch (error) {
      toast.error(extractMessage(error, t('outreachCampaigns.actions.actionError')))
    }
  }

  const isConfirmLoading = mutations.cancelCampaign.isPending || mutations.deleteCampaign.isPending

  return (
    <div className="space-y-6">
      <PageToolbar
        title={channel ? t(`outreachCampaigns.channels.${channel}.label`) : t(view === 'live' ? 'outreachCampaigns.navigation.live' : 'outreachCampaigns.navigation.all')}
        description={t('outreachCampaigns.pageDescription')}
      />

      <OutreachCampaignListContent campaigns={campaigns} columns={columns} query={campaignsQuery} onView={(row) => navigate(`/outreach-campaigns/${row.id}`)} />

      <CampaignWizardModal
        open={wizardState.open}
        mode="edit"
        campaign={wizardState.campaign}
        onClose={closeWizard}
        onSuccess={() => campaignsQuery.refetch()}
      />

      <ConfirmDialog
        isOpen={confirmState.open}
        onCancel={() => setConfirmState({ open: false, type: null, campaign: null })}
        onConfirm={handleConfirm}
        loading={isConfirmLoading}
        type={confirmState.type === 'delete' ? 'danger' : 'warning'}
        title={confirmState.type === 'delete' ? t('outreachCampaigns.actions.confirmDeleteTitle') : t('outreachCampaigns.actions.confirmCancelTitle')}
        message={confirmState.type === 'delete' ? t('outreachCampaigns.actions.confirmDeleteMessage') : t('outreachCampaigns.actions.confirmCancelMessage')}
        confirmText={confirmState.type === 'delete' ? t('actions.delete') : t('outreachCampaigns.actions.cancel')}
      />
    </div>
  )
}
