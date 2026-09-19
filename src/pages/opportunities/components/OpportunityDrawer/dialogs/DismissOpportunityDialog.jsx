import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { FormDialog } from '../../../../../shared/components/overlays/FormDialog'
import { Select } from '../../../../../shared/components/ui/Select'
import { useOpportunityMutations } from '../../../../../features/opportunities/hooks/useOpportunities'
import { getOpportunityDismissReasons } from '../../../../../features/opportunities/constants/opportunityTypes'
import { extractMessage } from '../../../../../shared/utils/apiResponse'

export function DismissOpportunityDialog({ opportunity, onClose }) {
  const { t } = useTranslation()
  const mutations = useOpportunityMutations()
  const [form, setForm] = useState({ reason: '', note: '' })

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = async () => {
    if (!form.reason) {
      toast.error(t('opportunities.dialogs.dismiss.reasonRequired'))
      return
    }

    try {
      await mutations.dismiss.mutateAsync({
        id: opportunity.id,
        payload: { reason: form.reason, note: form.note || null },
      })
      toast.success(t('opportunities.dialogs.dismiss.successMsg'))
      onClose()
    } catch (error) {
      toast.error(extractMessage(error, t('opportunities.dialogs.dismiss.errorMsg')))
    }
  }

  return (
    <FormDialog
      open
      onClose={onClose}
      title={t('opportunities.dialogs.dismiss.title')}
      description={opportunity.customer?.name}
      submitText={t('opportunities.dialogs.dismiss.submit')}
      loading={mutations.dismiss.isPending}
      onSubmit={handleSubmit}
    >
      <Select
        label={t('opportunities.dialogs.dismiss.reasonLabel')}
        value={form.reason}
        onChange={(value) => updateField('reason', value)}
        options={getOpportunityDismissReasons(t)}
      />
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium font-arabic text-[var(--text)]">{t('opportunities.dialogs.dismiss.noteLabel')}</span>
        <textarea
          rows={3}
          value={form.note}
          onChange={(event) => updateField('note', event.target.value)}
          placeholder={t('opportunities.dialogs.optionalPlaceholder')}
          className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-arabic text-[var(--text)] outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#00C2CB]"
        />
      </label>
    </FormDialog>
  )
}
