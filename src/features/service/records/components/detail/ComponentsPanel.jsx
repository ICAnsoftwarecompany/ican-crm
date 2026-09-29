import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/Button'
import { Input } from '../../../../../shared/components/ui/Input'
import { Select } from '../../../../../shared/components/ui/Select'
import { FormDialog } from '../../../../../shared/components/overlays/FormDialog'
import { ResourceState } from '../../../../../shared/components/data/ResourceState'
import { cn } from '../../../../../shared/utils/cn'
import { formatDate } from '../../../../../shared/utils/dateTime'
import { localizeLabel } from '../../../core/utils/localizeLabel'
import { getServiceFieldErrors } from '../../../core/utils/serviceErrors'
import { useRecordMutations, useRecordSection } from '../../hooks/useRecords'
import { componentMargin } from '../../utils/recordType'

const STATUS_TONE = {
  requested: 'bg-status-new',
  pending_supplier: 'bg-status-contacted',
  confirmed: 'bg-status-qualified',
  issued: 'bg-status-won',
  completed: 'bg-status-won',
  cancelled: 'bg-status-lost',
}
const EMPTY = { component_type: '', supplier_name: '', supplier_reference: '', status: 'requested', starts_at: '', cost_amount: '', sell_amount: '' }

/**
 * Parts of a composite service (flight, hotel…) with supplier status and
 * margin. Cost is sensitive: the server may omit it for some roles.
 */
export function ComponentsPanel({ record, recordType, statuses = [] }) {
  const { t, i18n } = useTranslation()
  const components = useRecordSection(record.id, 'components')
  const { saveIn, removeIn } = useRecordMutations(record.id)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const errors = getServiceFieldErrors(saveIn.error)
  const language = i18n.language
  const money = (value, currency = 'EGP') => (value == null || value === '' ? '—' : new Intl.NumberFormat(language, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value))
  const typeLabel = (key) => localizeLabel(recordType?.component_types?.find((entry) => entry.key === key)?.label, language, key)
  const set = (name) => (value) => setForm((current) => ({ ...current, [name]: value }))

  useEffect(() => {
    if (editing) {
      setForm({ ...EMPTY, ...editing, starts_at: editing.starts_at ? editing.starts_at.slice(0, 10) : '' })
      saveIn.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing])

  const submit = () =>
    saveIn.mutate(
      {
        section: 'components',
        itemId: editing?.id,
        component_type: form.component_type,
        title: recordType?.component_types?.find((entry) => entry.key === form.component_type)?.label,
        supplier_name: form.supplier_name || null,
        supplier_reference: form.supplier_reference || null,
        status: form.status,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        cost_amount: form.cost_amount === '' ? null : Number(form.cost_amount),
        sell_amount: form.sell_amount === '' ? null : Number(form.sell_amount),
        currency: form.currency || 'EGP',
      },
      { onSuccess: () => setEditing(null) }
    )

  const list = components.data || []
  const totals = list.reduce((sum, item) => ({ cost: sum.cost + (Number(item.cost_amount) || 0), sell: sum.sell + (Number(item.sell_amount) || 0) }), { cost: 0, sell: 0 })

  return (
    <ResourceState isLoading={components.isLoading} error={components.error} onRetry={components.refetch}>
      <section className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        <header className="flex items-center justify-between gap-2">
          <p className="text-xs text-[var(--text-muted)]">{t('service.records.components.totals', { sell: money(totals.sell), margin: money(totals.sell - totals.cost) })}</p>
          <Button size="sm" onClick={() => setEditing({})}>
            <Plus size={14} aria-hidden="true" />
            {t('service.records.components.add')}
          </Button>
        </header>
        {!list.length && <p className="py-6 text-center text-xs text-[var(--text-muted)]">{t('service.records.components.empty')}</p>}
        <ul className="divide-y divide-[var(--border)]">
          {list.map((item) => {
            const margin = componentMargin(item)
            return (
              <li key={item.id} className="grid gap-2 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="grid gap-0.5">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-[var(--text)]">
                    {typeLabel(item.component_type)}
                    <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-[11px] font-normal">
                      <span className={cn('h-2 w-2 rounded-full', STATUS_TONE[item.status])} aria-hidden="true" />
                      {t(`service.records.components.statuses.${item.status}`)}
                    </span>
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {[item.supplier_name, item.supplier_reference, item.starts_at && formatDate(item.starts_at, language, { dateStyle: 'medium' })].filter(Boolean).join(' · ') || '—'}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[var(--text-muted)]">{t('service.records.components.sell')} <span className="font-semibold text-[var(--text)]" dir="ltr">{money(item.sell_amount, item.currency)}</span></span>
                  {margin != null && <span className="text-[var(--text-muted)]">{t('service.records.components.margin')} <span className="font-semibold text-[var(--text)]" dir="ltr">{money(margin, item.currency)}</span></span>}
                  <Button variant="ghost" size="icon" aria-label={t('service.settings.actions.edit')} onClick={() => setEditing(item)}>
                    <Pencil size={14} aria-hidden="true" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label={t('service.settings.actions.delete')} onClick={() => removeIn.mutate({ section: 'components', itemId: item.id })}>
                    <Trash2 size={14} aria-hidden="true" />
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      </section>
      <FormDialog open={Boolean(editing)} onClose={() => setEditing(null)} title={t(editing?.id ? 'service.records.components.edit' : 'service.records.components.add')} loading={saveIn.isPending} onSubmit={submit} submitText={t('service.settings.actions.save')}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Select label={t('service.records.components.type')} value={form.component_type} error={errors.component_type && t('service.settings.validation.required')} onChange={set('component_type')} options={(recordType?.component_types || []).map((entry) => ({ value: entry.key, label: localizeLabel(entry.label, language, entry.key) }))} />
          <Select label={t('service.records.fields.status')} value={form.status} onChange={(next) => set('status')(next || 'requested')} options={statuses.map((value) => ({ value, label: t(`service.records.components.statuses.${value}`) }))} />
          <Input label={t('service.records.components.supplier')} dir="auto" value={form.supplier_name || ''} onChange={(event) => set('supplier_name')(event.target.value)} />
          <Input label={t('service.records.components.reference')} dir="ltr" value={form.supplier_reference || ''} onChange={(event) => set('supplier_reference')(event.target.value)} />
          <Input type="date" dir="ltr" label={t('service.records.fields.startsAt')} value={form.starts_at} onChange={(event) => set('starts_at')(event.target.value)} />
          <div />
          <Input type="number" dir="ltr" min="0" label={t('service.records.components.cost')} value={form.cost_amount ?? ''} onChange={(event) => set('cost_amount')(event.target.value)} />
          <Input type="number" dir="ltr" min="0" label={t('service.records.components.sell')} value={form.sell_amount ?? ''} error={errors.sell_amount && t('service.settings.validation.invalid')} onChange={(event) => set('sell_amount')(event.target.value)} />
        </div>
      </FormDialog>
    </ResourceState>
  )
}
