import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { RELATION_INCLUSIONS } from '../../constants/catalogOptions'
import { useCatalogProducts } from '../../hooks/useCatalogProducts'
import { newRelationRow } from '../../utils/productCreateWizard'
import { CheckboxField, useOptionLabel, useOptions } from '../common/catalogUi'

/** Wizard step: items sold with the new product (e.g. free installation, optional maintenance contract). */
export function RelationsStep({ rows, errors = {}, onChange }) {
  const { t } = useTranslation()
  const catalogQuery = useCatalogProducts()
  const optionLabel = useOptionLabel()
  const inclusionOptions = useOptions('inclusion', RELATION_INCLUSIONS)
  const itemOptions = useMemo(() => (catalogQuery.data || [])
    .filter((item) => item.status)
    .map((item) => ({ value: String(item.id), label: `${item.name} — ${optionLabel('kinds', item.kind)}` })), [catalogQuery.data, optionLabel])

  const set = (key, patch) => onChange(rows.map((row) => (row.key === key ? { ...row, ...patch } : row)))
  const changeInclusion = (row, inclusion) => set(row.key, {
    inclusion,
    auto_add: inclusion === 'included',
    price_override: inclusion === 'included' && row.price_override === '' ? '0' : row.price_override,
  })

  return (
    <div className="space-y-3">
      {!rows.length && <p className="text-sm text-[var(--text-muted)]">{t('catalog.create.relationsEmpty')}</p>}
      {rows.map((row) => (
        <div key={row.key} className="space-y-3 rounded-lg border border-[var(--border)] p-3">
          <div className="grid gap-3 sm:grid-cols-[2fr_1fr_auto]">
            <Select label={t('catalog.relations.fields.child')} value={row.child_product_id} options={itemOptions} onChange={(value) => set(row.key, { child_product_id: value })} />
            <Select label={t('catalog.relations.fields.inclusion')} value={row.inclusion} options={inclusionOptions} onChange={(value) => changeInclusion(row, value || 'included')} />
            <Button className="self-end" variant="ghost" size="icon" onClick={() => onChange(rows.filter((item) => item.key !== row.key))} aria-label={t('catalog.common.remove')}><Trash2 size={16} /></Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input label={t('catalog.relations.fields.quantity')} type="number" min={1} step="any" dir="ltr" value={row.quantity} onChange={(event) => set(row.key, { quantity: event.target.value })} />
            <Input label={t('catalog.relations.fields.priceOverride')} type="number" min={0} step="any" dir="ltr" value={row.price_override} hint={t('catalog.relations.priceOverrideHint')} onChange={(event) => set(row.key, { price_override: event.target.value })} />
            <div className="flex items-end pb-2">
              <CheckboxField label={t('catalog.relations.fields.autoAdd')} checked={row.auto_add} onChange={(value) => set(row.key, { auto_add: value })} />
            </div>
          </div>
          {errors[`relations.${row.key}`] && <p className="text-xs text-[#EF4444]">{t(`catalog.validation.${errors[`relations.${row.key}`]}`)}</p>}
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => onChange([...rows, newRelationRow('included')])}><Plus size={14} />{t('catalog.create.addIncluded')}</Button>
        <Button variant="outline" size="sm" onClick={() => onChange([...rows, newRelationRow('optional')])}><Plus size={14} />{t('catalog.create.addOptional')}</Button>
      </div>
    </div>
  )
}
