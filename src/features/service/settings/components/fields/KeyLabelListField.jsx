import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../../../shared/components/ui/Button'
import { Input } from '../../../../../shared/components/ui/Input'

/**
 * Rows of `{ key, label: {ar,en}, ...extra }`. `field.withRange` adds min/max
 * (participant roles). Used for participant roles, component types, entry types.
 */
export function KeyLabelListField({ label, hint, value = [], onChange, field }) {
  const { t } = useTranslation()
  const rows = value || []
  const withRange = Boolean(field?.withRange)
  const update = (index, patch) => onChange(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)))
  const empty = () => ({ key: '', label: { ar: '', en: '' }, ...(withRange ? { min: 0, max: 1 } : {}) })
  const columns = withRange ? 'sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_8rem_4.5rem_4.5rem_auto]' : 'sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_8rem_auto]'

  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1.5 text-sm font-medium text-[var(--text)]">{label}</legend>
      {hint && <p className="-mt-1 text-xs text-[var(--text-muted)]">{hint}</p>}
      {rows.map((row, index) => (
        <div key={index} className={`grid items-center gap-2 ${columns}`}>
          <Input lang="ar" dir="auto" value={row.label?.ar || ''} placeholder={t('service.settings.fields.language.ar')} aria-label={`${label} · ${t('service.settings.fields.language.ar')}`} onChange={(event) => update(index, { label: { ...row.label, ar: event.target.value } })} />
          <Input lang="en" dir="ltr" value={row.label?.en || ''} placeholder={t('service.settings.fields.language.en')} aria-label={`${label} · ${t('service.settings.fields.language.en')}`} onChange={(event) => update(index, { label: { ...row.label, en: event.target.value } })} />
          <Input dir="ltr" value={row.key} placeholder={t('service.settings.fields.key')} aria-label={t('service.settings.fields.key')} onChange={(event) => update(index, { key: event.target.value.replace(/\s+/g, '_').toLowerCase() })} />
          {withRange && (
            <>
              <Input type="number" dir="ltr" min="0" value={row.min ?? 0} aria-label={t('service.settings.fields.min')} placeholder={t('service.settings.fields.min')} onChange={(event) => update(index, { min: Number(event.target.value) })} />
              <Input type="number" dir="ltr" min="1" value={row.max ?? 1} aria-label={t('service.settings.fields.max')} placeholder={t('service.settings.fields.max')} onChange={(event) => update(index, { max: Number(event.target.value) })} />
            </>
          )}
          <Button type="button" variant="ghost" size="icon" aria-label={t('service.settings.actions.removeRow')} onClick={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))}>
            <Trash2 size={16} aria-hidden="true" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => onChange([...rows, empty()])}>
        <Plus size={14} aria-hidden="true" />
        {t('service.settings.actions.addRow')}
      </Button>
    </fieldset>
  )
}
