import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { getServiceFieldErrors } from '../../core/utils/serviceErrors'
import { useBatches, useRecordMutations } from '../hooks/useRecords'
import { CustomerSelect } from './CustomerSelect'

const empty = (customer) => ({ customer_id: customer?.id || '', starts_at: '', ends_at: '', batch_id: '' })

/**
 * Manual record creation (standalone mode / walk-in). Records created from a
 * signed contract come from the handoff instead.
 */
export function RecordCreateDialog({ open, onClose, recordType, customer, detailPath }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { create } = useRecordMutations()
  const batches = useBatches(recordType?.batch_enabled ? { type: recordType.key } : undefined)
  const [form, setForm] = useState(() => empty(customer))
  const errors = getServiceFieldErrors(create.error)
  const typeLabel = localizeLabel(recordType?.label, i18n.language, recordType?.key)
  const set = (field) => (value) => setForm((current) => ({ ...current, [field]: value }))

  useEffect(() => {
    if (open) {
      setForm(empty(customer))
      create.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const submit = () =>
    create.mutate(
      {
        record_type_id: recordType.id,
        customer_id: form.customer_id,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
        batch_id: form.batch_id || null,
      },
      {
        onSuccess: (record) => {
          toast.success(t('service.records.create.done', { reference: record.reference_no }))
          onClose()
          if (detailPath) navigate(detailPath(record))
        },
      }
    )

  return (
    <FormDialog open={open} onClose={onClose} title={t('service.records.create.title', { type: typeLabel })} description={t('service.records.create.description')} submitText={t('service.cases.create.submit')} loading={create.isPending} onSubmit={submit}>
      <CustomerSelect value={form.customer_id} onChange={set('customer_id')} fixed={customer} error={errors.customer_id ? t('service.settings.validation.required') : undefined} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input type="date" dir="ltr" label={t('service.records.fields.startsAt')} value={form.starts_at} onChange={(event) => set('starts_at')(event.target.value)} />
        <Input type="date" dir="ltr" label={t('service.records.fields.endsAt')} value={form.ends_at} onChange={(event) => set('ends_at')(event.target.value)} />
      </div>
      {recordType?.batch_enabled && (
        <Select
          label={localizeLabel(recordType.batch_label, i18n.language, t('service.records.fields.batch'))}
          placeholder={t('service.records.noBatch')}
          value={form.batch_id}
          onChange={set('batch_id')}
          options={(batches.data || []).map((batch) => ({ value: batch.id, label: `${batch.reference_no} · ${localizeLabel(batch.name, i18n.language, '')}` }))}
        />
      )}
    </FormDialog>
  )
}
