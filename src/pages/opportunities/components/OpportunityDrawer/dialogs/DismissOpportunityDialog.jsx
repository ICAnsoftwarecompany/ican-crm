import { useState } from 'react'
import { toast } from 'sonner'
import { FormDialog } from '../../../../../shared/components/overlays/FormDialog'
import { Select } from '../../../../../shared/components/ui/Select'
import { useOpportunityMutations } from '../../../../../features/opportunities/hooks/useOpportunities'
import { OPPORTUNITY_DISMISS_REASONS } from '../../../../../features/opportunities/constants/opportunityTypes'
import { extractMessage } from '../../../../../shared/utils/apiResponse'

export function DismissOpportunityDialog({ opportunity, onClose }) {
  const mutations = useOpportunityMutations()
  const [form, setForm] = useState({ reason: '', note: '' })

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = async () => {
    if (!form.reason) {
      toast.error('اختر سبب الرفض أولًا')
      return
    }

    try {
      await mutations.dismiss.mutateAsync({
        id: opportunity.id,
        payload: { reason: form.reason, note: form.note || null },
      })
      toast.success('تم رفض الفرصة')
      onClose()
    } catch (error) {
      toast.error(extractMessage(error, 'تعذر رفض الفرصة'))
    }
  }

  return (
    <FormDialog
      open
      onClose={onClose}
      title="رفض الفرصة"
      description={opportunity.customer?.name}
      submitText="رفض الفرصة"
      loading={mutations.dismiss.isPending}
      onSubmit={handleSubmit}
    >
      <Select
        label="سبب الرفض"
        value={form.reason}
        onChange={(value) => updateField('reason', value)}
        options={OPPORTUNITY_DISMISS_REASONS}
      />
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium font-arabic text-[var(--text)]">ملاحظة</span>
        <textarea
          rows={3}
          value={form.note}
          onChange={(event) => updateField('note', event.target.value)}
          placeholder="اختياري"
          className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-arabic text-[var(--text)] outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#00C2CB]"
        />
      </label>
    </FormDialog>
  )
}
