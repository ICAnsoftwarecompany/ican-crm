import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/Button'
import { Input } from '../../../../../shared/components/ui/Input'
import { Select } from '../../../../../shared/components/ui/Select'
import { ResourceState } from '../../../../../shared/components/data/ResourceState'
import { formatDate } from '../../../../../shared/utils/dateTime'
import { localizeLabel } from '../../../core/utils/localizeLabel'
import { useRecordMutations, useRecordSection } from '../../hooks/useRecords'

/**
 * Repeated entries on a record (attendance, grades, delivery attempts…).
 * Known values are translated (`service.records.entryValues.*`); anything
 * else is user data and shown as typed.
 */
export function EntriesPanel({ record, recordType }) {
  const { t, i18n } = useTranslation()
  const entries = useRecordSection(record.id, 'entries')
  const { saveIn } = useRecordMutations(record.id)
  const types = recordType?.entry_types || []
  const [form, setForm] = useState({ entry_type: types[0]?.key || '', value: '', note: '' })
  const [filter, setFilter] = useState('')
  const language = i18n.language
  const typeLabel = (key) => localizeLabel(types.find((entry) => entry.key === key)?.label, language, key)
  const list = (entries.data || []).filter((entry) => !filter || entry.entry_type === filter)

  const submit = (event) => {
    event.preventDefault()
    saveIn.mutate({ section: 'entries', entry_type: form.entry_type, value: form.value, note: form.note || null }, { onSuccess: () => setForm((current) => ({ ...current, value: '', note: '' })) })
  }

  return (
    <div className="grid gap-4">
      <form onSubmit={submit} className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-[10rem_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
        <Select label={t('service.records.entries.type')} value={form.entry_type} onChange={(next) => setForm((current) => ({ ...current, entry_type: next }))} options={types.map((entry) => ({ value: entry.key, label: localizeLabel(entry.label, language, entry.key) }))} />
        <Input label={t('service.records.entries.value')} dir="auto" value={form.value} onChange={(event) => setForm((current) => ({ ...current, value: event.target.value }))} />
        <Input label={t('service.records.entries.note')} dir="auto" value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} />
        <Button type="submit" loading={saveIn.isPending} disabled={!form.entry_type || !form.value.trim()}>
          <Plus size={14} aria-hidden="true" />
          {t('service.records.entries.add')}
        </Button>
      </form>
      <div className="w-48">
        <Select aria-label={t('service.records.entries.type')} placeholder={t('service.records.entries.all')} value={filter} onChange={setFilter} options={types.map((entry) => ({ value: entry.key, label: localizeLabel(entry.label, language, entry.key) }))} />
      </div>
      <ResourceState isLoading={entries.isLoading} error={entries.error} onRetry={entries.refetch} empty={!list.length} emptyTitle={t('service.records.entries.empty')}>
        <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          {list.map((entry) => (
            <li key={entry.id} className="flex flex-wrap items-center gap-3 px-4 py-2 text-sm">
              <span className="w-28 text-xs text-[var(--text-muted)]">{typeLabel(entry.entry_type)}</span>
              <span className="font-medium text-[var(--text)]">
                <bdi>{t(`service.records.entryValues.${entry.value}`, { defaultValue: entry.value })}</bdi>
              </span>
              {entry.note && <span className="text-xs text-[var(--text-muted)]">{entry.note}</span>}
              <span className="ms-auto text-xs text-[var(--text-muted)]">
                {formatDate(entry.occurred_at, language, { dateStyle: 'medium', timeStyle: 'short' })} · {entry.created_by?.name}
              </span>
            </li>
          ))}
        </ul>
      </ResourceState>
    </div>
  )
}
