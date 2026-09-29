import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'

const TYPES = ['down_payment', 'installments', 'delivery', 'maintenance', 'milestone', 'fee', 'custom']
const BASES = ['percent', 'fixed', 'remaining']
const DUES = ['on_contract', 'on_delivery']

/**
 * Plan components editor (spec §29.4): rules, not amounts. `due` accepts
 * on_contract | on_delivery | "+N unit" | "-N unit from delivery" (free text for the relative ones).
 */
export function PlanComponentsField({ label, value = [], onChange, error }) {
  const { t } = useTranslation()
  const rows = value || []
  const update = (index, patch) => onChange(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)))
  const option = (group) => (entry) => ({ value: entry, label: t(`service.billing.${group}.${entry}`) })

  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1.5 text-sm font-medium text-[var(--text)]">{label}</legend>
      <p className="-mt-1 text-xs text-[var(--text-muted)]">{t('service.billing.componentsHint')}</p>
      {rows.map((row, index) => {
        const isInstallments = row.type === 'installments'
        return (
          <div key={index} className="grid gap-2 rounded-lg border border-[var(--border)] p-3">
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_7rem_auto]">
              <Select aria-label={t('service.billing.fields.componentType')} value={row.type} onChange={(type) => update(index, { type: type || 'custom', ...(type === 'installments' ? { basis: 'remaining', count: row.count || 12, every: row.every || '1 month', first_due: row.first_due || '+1 month' } : {}) })} options={TYPES.map(option('componentTypes'))} />
              <Select aria-label={t('service.billing.fields.basis')} value={row.basis} disabled={isInstallments} onChange={(basis) => update(index, { basis: basis || 'percent' })} options={BASES.map(option('bases'))} />
              {!isInstallments ? (
                <Input type="number" dir="ltr" min="0" aria-label={t('service.billing.fields.value')} placeholder={t('service.billing.fields.value')} value={row.value ?? ''} onChange={(event) => update(index, { value: event.target.value === '' ? null : Number(event.target.value) })} />
              ) : (
                <Input type="number" dir="ltr" min="1" aria-label={t('service.billing.fields.count')} placeholder={t('service.billing.fields.count')} value={row.count ?? ''} onChange={(event) => update(index, { count: Number(event.target.value) || 1 })} />
              )}
              <Button type="button" variant="ghost" size="icon" aria-label={t('service.settings.actions.removeRow')} onClick={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))}>
                <Trash2 size={16} aria-hidden="true" />
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {isInstallments ? (
                <>
                  <Input dir="ltr" label={t('service.billing.fields.every')} placeholder={t('service.billing.placeholders.every')} value={row.every || ''} onChange={(event) => update(index, { every: event.target.value })} />
                  <Input dir="ltr" label={t('service.billing.fields.firstDue')} placeholder={t('service.billing.placeholders.firstDue')} value={row.first_due || ''} onChange={(event) => update(index, { first_due: event.target.value })} />
                </>
              ) : (
                <>
                  <Select label={t('service.billing.fields.due')} value={DUES.includes(row.due) ? row.due : 'relative'} onChange={(due) => update(index, { due: due === 'relative' ? '+1 month' : due })} options={[...DUES, 'relative'].map(option('dues'))} />
                  {!DUES.includes(row.due) && <Input dir="ltr" label={t('service.billing.fields.relativeDue')} placeholder={t('service.billing.placeholders.relativeDue')} value={row.due || ''} onChange={(event) => update(index, { due: event.target.value })} />}
                  <label className="inline-flex items-center gap-2 self-end pb-2 text-xs text-[var(--text)]">
                    <input type="checkbox" className="accent-[var(--brand-accent)]" checked={Boolean(row.outside_price)} onChange={(event) => update(index, { outside_price: event.target.checked })} />
                    {t('service.billing.fields.outsidePrice')}
                  </label>
                </>
              )}
            </div>
          </div>
        )
      })}
      <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => onChange([...rows, { type: 'down_payment', basis: 'percent', value: 10, due: 'on_contract' }])}>
        <Plus size={14} aria-hidden="true" />
        {t('service.billing.addComponent')}
      </Button>
      {error && <p className="text-xs text-status-lost">{error}</p>}
    </fieldset>
  )
}
