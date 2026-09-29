import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Plus, Trash2, UserRound } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/Button'
import { Input } from '../../../../../shared/components/ui/Input'
import { Select } from '../../../../../shared/components/ui/Select'
import { FormDialog } from '../../../../../shared/components/overlays/FormDialog'
import { ResourceState } from '../../../../../shared/components/data/ResourceState'
import { localizeLabel } from '../../../core/utils/localizeLabel'
import { getServiceFieldErrors } from '../../../core/utils/serviceErrors'
import { useRecordMutations, useRecordSection } from '../../hooks/useRecords'

const EMPTY = { role: '', name: '', phone: '', identifier: '' }

/** Participants grouped by the record type's roles (min/max enforced by the server). */
export function ParticipantsPanel({ record, recordType }) {
  const { t, i18n } = useTranslation()
  const participants = useRecordSection(record.id, 'participants')
  const { saveIn, removeIn } = useRecordMutations(record.id)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const errors = getServiceFieldErrors(saveIn.error)
  const roles = recordType?.participant_roles || []
  const list = participants.data || []

  useEffect(() => {
    if (editing) {
      setForm({ ...EMPTY, ...editing })
      saveIn.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing])

  const submit = () =>
    saveIn.mutate(
      { section: 'participants', itemId: editing?.id, role: form.role, name: form.name, phone: form.phone || null, identifier: form.identifier || null },
      { onSuccess: () => setEditing(null) }
    )
  const errorText = (name) => errors[name] && t(`service.records.validation.${errors[name][0]}`, { defaultValue: t('service.settings.validation.required') })

  return (
    <ResourceState isLoading={participants.isLoading} error={participants.error} onRetry={participants.refetch}>
      <div className="grid gap-4">
        {roles.map((role) => {
          const inRole = list.filter((entry) => entry.role === role.key)
          return (
            <section key={role.key} className="grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
              <header className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-[var(--text)]">
                  {localizeLabel(role.label, i18n.language, role.key)} <span className="text-xs font-normal text-[var(--text-muted)]" dir="ltr">{inRole.length}/{role.max}</span>
                </h3>
                <Button variant="ghost" size="sm" disabled={inRole.length >= role.max} onClick={() => setEditing({ role: role.key })}>
                  <Plus size={14} aria-hidden="true" />
                  {t('service.records.participants.add')}
                </Button>
              </header>
              {inRole.length < role.min && <p className="text-xs text-sla-at-risk">{t('service.records.participants.belowMin', { min: role.min })}</p>}
              <ul className="divide-y divide-[var(--border)]">
                {inRole.map((participant) => (
                  <li key={participant.id} className="flex items-center gap-3 py-2">
                    <UserRound size={16} aria-hidden="true" className="text-[var(--text-muted)]" />
                    <span className="grid min-w-0 flex-1">
                      <span className="text-sm text-[var(--text)]">{participant.name}</span>
                      <span className="text-xs text-[var(--text-muted)]" dir="ltr">{[participant.phone, participant.identifier].filter(Boolean).join(' · ')}</span>
                      {participant.data?.address && <span className="text-xs text-[var(--text-muted)]">{participant.data.address}</span>}
                    </span>
                    <Button variant="ghost" size="icon" aria-label={t('service.settings.actions.edit')} onClick={() => setEditing(participant)}>
                      <Pencil size={14} aria-hidden="true" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label={t('service.settings.actions.delete')} onClick={() => removeIn.mutate({ section: 'participants', itemId: participant.id })}>
                      <Trash2 size={14} aria-hidden="true" />
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
      <FormDialog open={Boolean(editing)} onClose={() => setEditing(null)} title={t(editing?.id ? 'service.records.participants.edit' : 'service.records.participants.add')} loading={saveIn.isPending} onSubmit={submit} submitText={t('service.settings.actions.save')}>
        <Select label={t('service.records.participants.role')} value={form.role} error={errorText('role')} onChange={(role) => setForm((current) => ({ ...current, role }))} options={roles.map((role) => ({ value: role.key, label: localizeLabel(role.label, i18n.language, role.key) }))} />
        <Input label={t('service.records.participants.name')} dir="auto" value={form.name} error={errorText('name')} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label={t('service.records.participants.phone')} dir="ltr" value={form.phone || ''} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
          <Input label={t('service.records.participants.identifier')} dir="ltr" value={form.identifier || ''} onChange={(event) => setForm((current) => ({ ...current, identifier: event.target.value }))} />
        </div>
      </FormDialog>
    </ResourceState>
  )
}
