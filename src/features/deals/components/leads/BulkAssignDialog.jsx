import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { useDealLeadMutations } from '../../hooks/useDealLeads'
import { FieldLabel } from '../common/FieldLabel'
import { PersonSelect } from '../common/PersonSelect'

/** Assign the selected deal leads to one owner (`POST /deals/leads/bulk-assign`). */
export function BulkAssignDialog({ dealId, leads = [], people = [], open, onClose, onDone }) {
  const { t } = useTranslation()
  const [ownerId, setOwnerId] = useState('')
  const { bulkAssign } = useDealLeadMutations(dealId)

  useEffect(() => {
    if (open) setOwnerId('')
  }, [open])

  const submit = async () => {
    if (!ownerId || !leads.length) return
    try {
      await bulkAssign.mutateAsync({ dealLeadIds: leads.map((lead) => lead.id), ownerId: Number(ownerId) || ownerId })
      toast.success(t('dealWorkspace.leads.assign.success', { count: leads.length }))
      onDone?.()
      onClose()
    } catch (error) {
      toast.error(extractMessage(error, t('dealWorkspace.leads.assign.failed')))
    }
  }

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={submit}
      size="sm"
      loading={bulkAssign.isPending}
      submitDisabled={!ownerId}
      title={t('dealWorkspace.leads.assign.title')}
      description={t('dealWorkspace.leads.assign.description', { count: leads.length })}
      submitText={t('dealWorkspace.leads.assign.submit')}
    >
      <FieldLabel label={t('dealWorkspace.fields.owner')}>
        <PersonSelect people={people} value={ownerId} onChange={setOwnerId} />
      </FieldLabel>
    </FormDialog>
  )
}
