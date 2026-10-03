import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '../../../../shared/components/overlays/ConfirmDialog'
import { Button } from '../../../../shared/components/ui/Button'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { useDealMutations } from '../../hooks/useDeals'
import { useDealWorkspace } from '../../hooks/useDealWorkspace'

/** Delete the deal (`DELETE /deals/{id}`). Contracts already signed stay on the backend's side. */
export function DealDangerZone() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { dealId, deal } = useDealWorkspace()
  const { delete: remove } = useDealMutations()
  const [confirming, setConfirming] = useState(false)

  const confirm = async () => {
    try {
      await remove.mutateAsync(dealId)
      toast.success(t('dealWorkspace.settings.deleted'))
      navigate('/deals')
    } catch (error) {
      toast.error(extractMessage(error, t('dealWorkspace.settings.deleteFailed')))
      setConfirming(false)
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-red-200 p-4 dark:border-red-900">
      <p className="text-sm text-[var(--text-muted)]">{t('dealWorkspace.settings.deleteHint')}</p>
      <Button variant="danger" onClick={() => setConfirming(true)}><Trash2 size={15} />{t('dealWorkspace.settings.delete')}</Button>
      <ConfirmDialog
        isOpen={confirming}
        onCancel={() => setConfirming(false)}
        onConfirm={confirm}
        type="danger"
        loading={remove.isPending}
        title={t('dealWorkspace.settings.deleteTitle')}
        message={t('dealWorkspace.settings.deleteMessage', { name: deal?.name || '' })}
        confirmText={t('dealWorkspace.settings.delete')}
        cancelText={t('dealWorkspace.common.cancel')}
      />
    </div>
  )
}
