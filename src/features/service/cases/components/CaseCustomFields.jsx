import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { useCaseMutations } from '../hooks/useCases'

const TEXTAREA = 'min-h-[72px] w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-brand-accent'

/** Inputs for the request type's extra fields (form builder, F6). `value` = { key: value }. */
export function CustomFieldInputs({ fields = [], value = {}, onChange, errors = {} }) {
  const { t, i18n } = useTranslation()
  if (!fields.length) return null
  const set = (key) => (next) => onChange({ ...value, [key]: next })
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {fields.map((field) => {
        const label = `${localizeLabel(field.label, i18n.language, field.key)}${field.required ? ' *' : ''}`
        const error = errors[`custom_fields.${field.key}`] && t('service.cases.validation.required')
        if (field.type === 'select') return <Select key={field.key} label={label} value={value[field.key] || ''} onChange={set(field.key)} error={error} options={(field.options || []).map((option) => ({ value: option, label: option }))} />
        if (field.type === 'textarea') {
          return (
            <label key={field.key} className="grid gap-1.5 text-sm font-medium text-[var(--text)] sm:col-span-2">
              {label}
              <textarea dir="auto" className={TEXTAREA} value={value[field.key] || ''} onChange={(event) => set(field.key)(event.target.value)} />
              {error && <span className="text-xs font-normal text-status-lost">{error}</span>}
            </label>
          )
        }
        return <Input key={field.key} label={label} type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'} dir={['number', 'date'].includes(field.type) ? 'ltr' : 'auto'} value={value[field.key] || ''} onChange={(event) => set(field.key)(event.target.value)} error={error} />
      })}
    </div>
  )
}

/** Case side panel: the request type's extra fields, editable. Hidden when the type has none. */
export function CaseCustomFieldsPanel({ caseItem, setup, disabled }) {
  const { t, i18n } = useTranslation()
  const { update } = useCaseMutations()
  const [editing, setEditing] = useState(null)
  const fields = setup?.case_types?.find((type) => type.id === caseItem.type?.id)?.form_fields || []
  if (!fields.length) return null
  const values = caseItem.custom_fields || {}
  return (
    <section className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4" aria-label={t('service.cases.customFields.title')}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--text)]">{t('service.cases.customFields.title')}</h2>
        {!editing && !disabled && <Button size="sm" variant="ghost" onClick={() => setEditing(values)}><Pencil size={14} aria-hidden="true" />{t('service.settings.actions.edit')}</Button>}
      </div>
      {editing ? (
        <form className="grid gap-3" onSubmit={(event) => { event.preventDefault(); update.mutate({ caseId: caseItem.id, version: caseItem.version, custom_fields: editing }, { onSuccess: () => setEditing(null) }) }}>
          <CustomFieldInputs fields={fields} value={editing} onChange={setEditing} />
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={update.isPending}>{t('service.settings.actions.save')}</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(null)}>{t('service.cases.customFields.cancel')}</Button>
          </div>
        </form>
      ) : (
        <dl className="grid gap-2 text-sm">
          {fields.map((field) => (
            <div key={field.key} className="grid">
              <dt className="text-xs text-[var(--text-muted)]">{localizeLabel(field.label, i18n.language, field.key)}</dt>
              <dd dir="auto" className="text-start text-[var(--text)]">{values[field.key] || '—'}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}
