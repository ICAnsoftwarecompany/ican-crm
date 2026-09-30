import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { cn } from '../../../../shared/utils/cn'
import { weightsTotal } from '../constants/quality'

/** Checklist criteria: key, label (ar/en) and weight. Weights must add up to 100. */
export function CriteriaField({ label, value = [], onChange, error }) {
  const { t } = useTranslation()
  const rows = value || []
  const total = weightsTotal(rows)
  const update = (index, patch) => onChange(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)))
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1.5 text-sm font-medium text-[var(--text)]">{label}</legend>
      {rows.map((row, index) => (
        <div key={index} className="grid gap-2 sm:grid-cols-[8rem_minmax(0,1fr)_minmax(0,1fr)_6rem_auto] sm:items-center">
          <Input dir="ltr" aria-label={t('service.settings.fields.key')} placeholder={t('service.settings.fields.key')} value={row.key || ''} onChange={(event) => update(index, { key: event.target.value.replace(/\s+/g, '_').toLowerCase() })} />
          <Input lang="ar" dir="auto" aria-label={t('service.settings.fields.language.ar')} placeholder={t('service.settings.fields.language.ar')} value={row.label?.ar || ''} onChange={(event) => update(index, { label: { ...row.label, ar: event.target.value } })} />
          <Input lang="en" dir="ltr" aria-label={t('service.settings.fields.language.en')} placeholder={t('service.settings.fields.language.en')} value={row.label?.en || ''} onChange={(event) => update(index, { label: { ...row.label, en: event.target.value } })} />
          <Input type="number" dir="ltr" min={0} max={100} aria-label={t('service.quality.fields.weight')} placeholder={t('service.quality.fields.weight')} value={row.weight ?? ''} onChange={(event) => update(index, { weight: Number(event.target.value) })} />
          <Button type="button" variant="ghost" size="icon" aria-label={t('service.settings.actions.removeRow')} onClick={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))}><Trash2 size={16} aria-hidden="true" /></Button>
        </div>
      ))}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...rows, { key: '', label: { ar: '', en: '' }, weight: 0 }])}><Plus size={14} aria-hidden="true" />{t('service.quality.addCriterion')}</Button>
        <span className={cn('text-xs font-medium', total === 100 ? 'text-sla-on-track' : 'text-sla-breached')}>{t('service.quality.weightsTotal', { total })}</span>
      </div>
      {error && <p className="text-xs text-status-lost">{t('service.quality.validation.weights')}</p>}
    </fieldset>
  )
}
