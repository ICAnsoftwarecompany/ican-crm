import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { PageToolbar } from '../../shared/components/data/PageToolbar'
import { DataTable } from '../../shared/components/data-table'
import { ConfirmDialog } from '../../shared/components/overlays/ConfirmDialog'
import { useOutreachCampaigns, useOutreachCampaignMutations } from '../../features/outreach-campaigns/hooks/useOutreachCampaigns'
import { extractMessage } from '../../shared/utils/apiResponse'
import { CampaignStatsCards } from './components/CampaignStatsCards'
import { useCampaignsTableColumns } from './components/useCampaignsTableColumns'
import { CampaignWizardModal } from './components/wizard/CampaignWizardModal'

export function OutreachCampaignsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const campaignsQuery = useOutreachCampaigns()
  const mutations = useOutreachCampaignMutations()

  const [wizardState, setWizardState] = useState({ open: false, mode: 'create', campaign: null })
  const [confirmState, setConfirmState] = useState({ open: false, type: null, campaign: null })

  const openCreateWizard = () => setWizardState({ open: true, mode: 'create', campaign: null })
  const openEditWizard = (campaign) => setWizardState({ open: true, mode: 'edit', campaign })
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
        title={t('outreachCampaigns.pageTitle')}
        description={t('outreachCampaigns.pageDescription')}
        actionLabel={t('outreachCampaigns.createCampaign')}
        actionIcon={<Plus size={16} />}
        onAction={openCreateWizard}
      />

      <CampaignStatsCards campaigns={campaignsQuery.campaigns} />

      <DataTable
        data={campaignsQuery.campaigns}
        columns={columns}
        tableId="outreach-campaigns"
        isLoading={campaignsQuery.isLoading}
        error={campaignsQuery.error}
        onRetry={campaignsQuery.refetch}
        onRowDoubleClick={(row) => navigate(`/outreach-campaigns/${row.id}`)}
        emptyMessage={t('outreachCampaigns.emptyTable')}
        enableSorting
        enableFiltering
        enableGlobalSearch
        enablePagination
        enableColumnVisibility
        enableExport
        showToolbar
        showFooter
      />

      <CampaignWizardModal
        open={wizardState.open}
        mode={wizardState.mode}
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
