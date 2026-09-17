import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { UserPlus, X } from 'lucide-react'
import { AppModal } from '../../../shared/components/overlays/AppModal'
import { Button } from '../../../shared/components/ui/Button'
import { useOutreachCampaignMutations } from '../../../features/outreach-campaigns/hooks/useOutreachCampaigns'
import { getCustomerName } from '../../../features/outreach-campaigns/utils/campaignAudience'
import { extractMessage } from '../../../shared/utils/apiResponse'
import { CampaignAudienceBuilder } from './wizard/CampaignAudienceBuilder'

function getCustomerId(entry) {
  return typeof entry === 'object' ? (entry?.id ?? entry?.customer_id) : entry
}

export function CampaignDetailsAudience({ campaign }) {
  const { t } = useTranslation()
  const mutations = useOutreachCampaignMutations()
  const [isAdding, setIsAdding] = useState(false)
  const [pendingSelection, setPendingSelection] = useState([])

  const currentCustomers = campaign.customers || []
  const currentIds = new Set(currentCustomers.map(getCustomerId).map(String))

  const handleRemove = async (customerId) => {
    try {
      await mutations.removeCampaignCustomers.mutateAsync({ campaignId: campaign.id, customerIds: [customerId] })
      toast.success(t('outreachCampaigns.audience.removeSuccess'))
    } catch (error) {
      toast.error(extractMessage(error, t('outreachCampaigns.actions.actionError')))
    }
  }

  const handleAddConfirm = async () => {
    const newIds = pendingSelection.map((customer) => customer.id).filter((id) => !currentIds.has(String(id)))
    if (newIds.length === 0) {
      setIsAdding(false)
      return
    }
    try {
      await mutations.addCampaignCustomers.mutateAsync({ campaignId: campaign.id, customerIds: newIds })
      toast.success(t('outreachCampaigns.audience.addSuccess', { count: newIds.length }))
      setIsAdding(false)
      setPendingSelection([])
    } catch (error) {
      toast.error(extractMessage(error, t('outreachCampaigns.actions.actionError')))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-[var(--text)]">
          {t('outreachCampaigns.audience.matchCount', { count: currentCustomers.length })}
        </p>
        <Button size="sm" onClick={() => setIsAdding(true)}>
          <UserPlus size={14} />
          {t('outreachCampaigns.audience.addCustomers')}
        </Button>
      </div>

      {currentCustomers.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">{t('outreachCampaigns.audience.noCustomers')}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {currentCustomers.map((entry) => {
            const id = getCustomerId(entry)
            const name = typeof entry === 'object' ? getCustomerName(entry) : `#${id}`
            return (
              <span key={id} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-xs font-semibold text-[var(--text)]">
                {name}
                <button
                  type="button"
                  onClick={() => handleRemove(id)}
                  disabled={mutations.removeCampaignCustomers.isPending}
                  aria-label={t('actions.delete')}
                >
                  <X size={12} />
                </button>
              </span>
            )
          })}
        </div>
      )}

      <AppModal
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        title={t('outreachCampaigns.audience.addCustomers')}
        size="lg"
        className="max-w-3xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAdding(false)}>{t('actions.cancel')}</Button>
            <Button onClick={handleAddConfirm} loading={mutations.addCampaignCustomers.isPending}>{t('actions.add')}</Button>
          </div>
        }
      >
        <CampaignAudienceBuilder selectedCustomers={pendingSelection} onChange={setPendingSelection} />
      </AppModal>
    </div>
  )
}
