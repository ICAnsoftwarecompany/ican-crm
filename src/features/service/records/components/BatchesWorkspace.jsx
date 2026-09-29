import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Layers, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { formatDate } from '../../../../shared/utils/dateTime'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { LocalizedTextField } from '../../settings/components/fields/ResourceField'
import { getServiceFieldErrors } from '../../core/utils/serviceErrors'
import { useBatchMutations, useBatches } from '../hooks/useRecords'

/** Batches (manifest, trip group, class…) of one record type. */
export function BatchesWorkspace({ recordType, detailPath }) {
  const { t, i18n } = useTranslation()
  const batches = useBatches({ type: recordType.key })
  const { create } = useBatchMutations()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: { ar: '', en: '' }, starts_at: '', capacity: '' })
  const errors = getServiceFieldErrors(create.error)
  const label = localizeLabel(recordType.batch_label, i18n.language, t('service.records.fields.batch'))
  const list = batches.data || []

  const submit = () =>
    create.mutate(
      { record_type_id: recordType.id, name: form.name, starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null, capacity: form.capacity ? Number(form.capacity) : null },
      {
        onSuccess: (batch) => {
          toast.success(t('service.records.batches.created', { reference: batch.reference_no }))
          setOpen(false)
        },
      }
    )

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <Button onClick={() => { setForm({ name: { ar: '', en: '' }, starts_at: '', capacity: '' }); create.reset(); setOpen(true) }}>
          <Plus size={16} aria-hidden="true" />
          {t('service.records.batches.create', { batch: label })}
        </Button>
      </div>
      <ResourceState isLoading={batches.isLoading} error={batches.error} onRetry={batches.refetch} empty={!list.length} emptyIcon={<Layers size={24} />} emptyTitle={t('service.records.batches.empty', { batch: label })}>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((batch) => (
            <li key={batch.id}>
              <Link to={detailPath(batch)} className="grid gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-brand-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent">
                <span className="flex items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
                  <span dir="ltr" className="font-mono">{batch.reference_no}</span>
                  {t(`service.records.batches.statuses.${batch.status}`, { defaultValue: batch.status })}
                </span>
                <span className="text-sm font-semibold text-[var(--text)]">{localizeLabel(batch.name, i18n.language, batch.reference_no)}</span>
                <span className="text-xs text-[var(--text-muted)]">
                  {t('service.records.batches.recordsCount', { count: batch.records_count })}
                  {batch.capacity ? ` / ${batch.capacity}` : ''}
                  {batch.starts_at ? ` · ${formatDate(batch.starts_at, i18n.language, { dateStyle: 'medium' })}` : ''}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </ResourceState>
      <FormDialog open={open} onClose={() => setOpen(false)} title={t('service.records.batches.create', { batch: label })} loading={create.isPending} onSubmit={submit} submitText={t('service.cases.create.submit')}>
        <LocalizedTextField label={t('service.settings.fields.name')} value={form.name} error={errors.name && t('service.settings.validation.required')} onChange={(name) => setForm((current) => ({ ...current, name }))} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input type="date" dir="ltr" label={t('service.records.fields.startsAt')} value={form.starts_at} onChange={(event) => setForm((current) => ({ ...current, starts_at: event.target.value }))} />
          <Input type="number" dir="ltr" min="1" label={t('service.records.batches.capacity')} value={form.capacity} onChange={(event) => setForm((current) => ({ ...current, capacity: event.target.value }))} />
        </div>
      </FormDialog>
    </div>
  )
}
