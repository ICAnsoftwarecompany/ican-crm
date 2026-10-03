import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { ModuleNotice } from '../../../../shared/components/module-pages'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { LOST_REASONS } from '../../constants/dealOptions'
import { useDealLeadMutations } from '../../hooks/useDealLeads'
import { FieldLabel, dealInputClass } from '../common/FieldLabel'

/** "Mark as lost" with a reason (`POST /deals/leads/{id}/lost`). Only open leads can be closed. */
export function LostDialog({ dealId, lead, open, onClose, onLost }) {
  const { t } = useTranslation()
  const [reason, setReason] = useState('price')
  const [serverError, setServerError] = useState('')
  const { markLost } = useDealLeadMutations(dealId)

  useEffect(() => {
    if (open) {
      setReason('price')
      setServerError('')
    }
  }, [open])

  const submit = async () => {
    if (!lead) return
    setServerError('')
    try {
      await markLost.mutateAsync({ dealLeadId: lead.id, reason })
      toast.success(t('dealWorkspace.closing.lost.success'))
      onLost?.()
      onClose()
    } catch (error) {
      setServerError(extractMessage(error, t('dealWorkspace.closing.lost.failed')))
    }
  }

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={submit}
      size="sm"
      loading={markLost.isPending}
      title={t('dealWorkspace.closing.lost.title')}
      description={lead ? t('dealWorkspace.closing.lost.description', { name: lead.name || `#${lead.id}` }) : ''}
      submitText={t('dealWorkspace.closing.lost.submit')}
    >
      <div className="space-y-3">
        {serverError && <ModuleNotice tone="warning">{serverError}</ModuleNotice>}
        <FieldLabel label={t('dealWorkspace.closing.lost.reason')}>
          <select className={dealInputClass} value={reason} onChange={(event) => setReason(event.target.value)}>
            {LOST_REASONS.map((value) => <option key={value} value={value}>{t(`dealWorkspace.options.lostReason.${value}`)}</option>)}
          </select>
        </FieldLabel>
      </div>
    </FormDialog>
  )
}
