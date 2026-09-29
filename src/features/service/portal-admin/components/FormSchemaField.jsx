import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { FORM_FIELD_TYPES } from '../constants/portalObjects'

/** Request form fields shown to the customer: key, label (ar/en), type, required, options for selects. */
export function FormSchemaField({ label, value = [], onChange, error }) {
  const { t } = useTranslation()
  const rows = value || []
  const update = (index, patch) => onChange(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)))
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1.5 text-sm font-medium text-[var(--text)]">{label}</legend>
      <p className="-mt-1 text-xs text-[var(--text-muted)]">{t('service.portal.formHint')}</p>
      {rows.map((row, index) => (
        <div key={index} className="grid gap-2 rounded-lg border border-[var(--border)] p-3">
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_8rem_8rem_auto] sm:items-center">
            <Input lang="ar" dir="auto" aria-label={`${label} · ${t('service.settings.fields.language.ar')}`} placeholder={t('service.settings.fields.language.ar')} value={row.label?.ar || ''} onChange={(event) => update(index, { label: { ...row.label, ar: event.target.value } })} />
            <Input lang="en" dir="ltr" aria-label={`${label} · ${t('service.settings.fields.language.en')}`} placeholder={t('service.settings.fields.language.en')} value={row.label?.en || ''} onChange={(event) => update(index, { label: { ...row.label, en: event.target.value } })} />
            <Input dir="ltr" aria-label={t('service.settings.fields.key')} placeholder={t('service.settings.fields.key')} value={row.key || ''} onChange={(event) => update(index, { key: event.target.value.replace(/\s+/g, '_').toLowerCase() })} />
            <Select aria-label={t('service.portal.fields.fieldType')} value={row.type || 'text'} onChange={(type) => update(index, { type: type || 'text' })} options={FORM_FIELD_TYPES.map((type) => ({ value: type, label: t(`service.portal.fieldTypes.${type}`) }))} />
            <Button type="button" variant="ghost" size="icon" aria-label={t('service.settings.actions.removeRow')} onClick={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))}>
              <Trash2 size={16} aria-hidden="true" />
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-xs text-[var(--text)]">
              <input type="checkbox" checked={Boolean(row.required)} onChange={(event) => update(index, { required: event.target.checked })} />
              {t('service.portal.fields.required')}
            </label>
            {row.type === 'select' && (
              <div className="min-w-[16rem] flex-1">
                <Input dir="ltr" aria-label={t('service.portal.fields.options')} placeholder={t('service.portal.fields.optionsHint')} value={(row.options || []).join(', ')} onChange={(event) => update(index, { options: event.target.value.split(',').map((entry) => entry.trim()).filter(Boolean) })} />
              </div>
            )}
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => onChange([...rows, { key: '', label: { ar: '', en: '' }, type: 'text', required: false, options: [] }])}>
        <Plus size={14} aria-hidden="true" />
        {t('service.portal.addField')}
      </Button>
      {error && <p className="text-xs text-status-lost">{error}</p>}
    </fieldset>
  )
}
