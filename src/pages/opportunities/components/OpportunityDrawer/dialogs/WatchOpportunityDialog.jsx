import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { FormDialog } from '../../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../../shared/components/ui/Input'
import { useOpportunityMutations } from '../../../../../features/opportunities/hooks/useOpportunities'
import { extractMessage } from '../../../../../shared/utils/apiResponse'

export function WatchOpportunityDialog({ opportunity, onClose }) {
  const { t } = useTranslation()
  const mutations = useOpportunityMutations()
  const [form, setForm] = useState({ watch_until: '', reason: '' })

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = async () => {
    try {
      await mutations.watch.mutateAsync({
        id: opportunity.id,
        payload: { watch_until: form.watch_until || null, reason: form.reason || null },
      })
      toast.success(t('opportunities.dialogs.watch.successMsg'))
      onClose()
    } catch (error) {
      toast.error(extractMessage(error, t('opportunities.dialogs.watch.errorMsg')))
    }
  }

  return (
    <FormDialog
      open
      onClose={onClose}
      title={t('opportunities.dialogs.watch.title')}
      description={opportunity.customer?.name}
      submitText={t('opportunities.dialogs.watch.submit')}
      loading={mutations.watch.isPending}
      onSubmit={handleSubmit}
    >
      <Input
        label={t('opportunities.dialogs.watch.reviewDateLabel')}
        type="date"
        value={form.watch_until}
        onChange={(event) => updateField('watch_until', event.target.value)}
      />
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium font-arabic text-[var(--text)]">{t('opportunities.dialogs.watch.reasonLabel')}</span>
        <textarea
          rows={3}
          value={form.reason}
          onChange={(event) => updateField('reason', event.target.value)}
          placeholder={t('opportunities.dialogs.optionalPlaceholder')}
          className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-arabic text-[var(--text)] outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#00C2CB]"
        />
      </label>
    </FormDialog>
  )
}
