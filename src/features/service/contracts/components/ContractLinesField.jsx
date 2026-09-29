import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { localizeLabel } from '../../core/utils/localizeLabel'

/** Contract lines editor: item, quantity, unit price (defaults to the catalog price), discount. */
export function ContractLinesField({ lines, onChange, items = [], error }) {
  const { t, i18n } = useTranslation()
  const update = (index, patch) => onChange(lines.map((line, rowIndex) => (rowIndex === index ? { ...line, ...patch } : line)))
  const money = (value) => new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(value || 0)
  const total = lines.reduce((sum, line) => sum + (Number(line.unit_price) || 0) * (Number(line.quantity) || 1) - (Number(line.discount) || 0), 0)

  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1.5 text-sm font-medium text-[var(--text)]">{t('service.contracts.fields.items')}</legend>
      {lines.map((line, index) => (
        <div key={index} className="grid items-end gap-2 sm:grid-cols-[minmax(0,1fr)_4.5rem_7rem_6rem_auto]">
          <Select
            aria-label={t('service.contracts.fields.item')}
            value={line.item_id}
            onChange={(itemId) => update(index, { item_id: itemId, unit_price: items.find((item) => item.id === itemId)?.price ?? line.unit_price })}
            options={items.map((item) => ({ value: item.id, label: localizeLabel(item.name, i18n.language, item.id) }))}
          />
          <Input type="number" min="1" dir="ltr" aria-label={t('service.contracts.fields.quantity')} value={line.quantity} onChange={(event) => update(index, { quantity: event.target.value })} />
          <Input type="number" min="0" dir="ltr" aria-label={t('service.contracts.fields.unitPrice')} value={line.unit_price ?? ''} onChange={(event) => update(index, { unit_price: event.target.value })} />
          <Input type="number" min="0" dir="ltr" aria-label={t('service.contracts.fields.discount')} placeholder={t('service.contracts.fields.discount')} value={line.discount ?? ''} onChange={(event) => update(index, { discount: event.target.value })} />
          <Button type="button" variant="ghost" size="icon" aria-label={t('service.settings.actions.removeRow')} onClick={() => onChange(lines.filter((_, rowIndex) => rowIndex !== index))}>
            <Trash2 size={16} aria-hidden="true" />
          </Button>
        </div>
      ))}
      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="outline" size="sm" disabled={!items.length} onClick={() => onChange([...lines, { item_id: items[0]?.id, quantity: 1, unit_price: items[0]?.price ?? 0, discount: 0 }])}>
          <Plus size={14} aria-hidden="true" />
          {t('service.contracts.addLine')}
        </Button>
        <span className="text-sm font-semibold text-[var(--text)]" dir="ltr">{money(total)}</span>
      </div>
      {error && <p className="text-xs text-status-lost">{error}</p>}
    </fieldset>
  )
}
