import { Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { ModuleNotice } from '../../../../shared/components/module-pages'
import { CheckboxField } from '../common/catalogUi'
import { stockComesFromInstances } from '../../utils/productCreateWizard'
import { newUnitRow } from './useProductForm'

/**
 * Stock & units tab / step. Services have no stock. When the item type holds serials or units, stock is the count
 * of available instances, so the manual quantity is hidden. `onCreateUnit` (wizard) adds a "new unit" button.
 *
 * Alternative units are sent with the product on create only (`products[i][units][j]`);
 * after that they are managed from the product page (Units tab). The base unit is created by the server.
 */
export function ProductStockFields({ mode, state, onCreateUnit }) {
  const { t } = useTranslation()
  const { form, errors, update, units, selectedItemType } = state
  const isService = form.kind === 'service'
  const fromInstances = stockComesFromInstances(selectedItemType)
  const rows = form.units || []
  const unitOptions = units.map((unit) => ({ value: String(unit.id), label: unit.code ? `${unit.name} (${unit.code})` : unit.name }))

  const setRow = (key, field, value) => update('units', rows.map((row) => (row.key === key ? { ...row, [field]: value } : row)))

  return (
    <div className="space-y-4">
      {isService && <ModuleNotice>{t('catalog.create.serviceNoStock')}</ModuleNotice>}
      {!isService && fromInstances && <ModuleNotice>{t('catalog.create.stockFromInstances')}</ModuleNotice>}
      {!isService && !fromInstances && (
        <>
          <CheckboxField
            label={t('catalog.product.fields.isStockTracked')}
            hint={t('catalog.product.stockHint')}
            checked={form.is_stock_tracked}
            onChange={(value) => update('is_stock_tracked', value)}
          />
          {form.is_stock_tracked && (
            <Input
              label={t('catalog.product.fields.stockQuantity')}
              type="number"
              min={0}
              step="any"
              dir="ltr"
              value={form.stock_quantity}
              error={errors.stock_quantity ? t(`catalog.validation.${errors.stock_quantity}`) : undefined}
              onChange={(event) => update('stock_quantity', event.target.value)}
            />
          )}
        </>
      )}

      <div className="border-t border-[var(--border)] pt-4">
        <h3 className="text-sm font-semibold text-[var(--text)]">{t('catalog.product.alternativeUnits')}</h3>
        <p className="mt-1 text-xs text-[var(--text-muted)]">{t('catalog.product.baseUnitHint')}</p>
      </div>

      {mode === 'edit' ? (
        <ModuleNotice>{t('catalog.product.unitsOnProductPage')}</ModuleNotice>
      ) : (
        <div className="space-y-3">
          {!units.length && !onCreateUnit && <ModuleNotice>{t('catalog.product.noUnitsDefined')}</ModuleNotice>}
          {rows.map((row, index) => (
            <div key={row.key} className="grid gap-2 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-2">
              <Select label={t('catalog.productUnits.fields.unit')} value={row.unit_id} options={unitOptions} onChange={(value) => setRow(row.key, 'unit_id', value)} />
              <Input
                label={t('catalog.productUnits.fields.factor')}
                type="number"
                min={0}
                step="any"
                dir="ltr"
                value={row.factor}
                hint={t('catalog.productUnits.factorHint')}
                error={errors[`units.${index}.factor`] ? t(`catalog.validation.${errors[`units.${index}.factor`]}`) : undefined}
                onChange={(event) => setRow(row.key, 'factor', event.target.value)}
              />
              <Input label={t('catalog.productUnits.fields.price')} type="number" min={0} step="any" dir="ltr" value={row.price} onChange={(event) => setRow(row.key, 'price', event.target.value)} />
              <Input label={t('catalog.productUnits.fields.barcode')} dir="ltr" value={row.barcode} onChange={(event) => setRow(row.key, 'barcode', event.target.value)} />
              <div className="flex items-center justify-between gap-2 sm:col-span-2">
                <CheckboxField label={t('catalog.productUnits.fields.isDefault')} checked={row.is_default} onChange={(value) => setRow(row.key, 'is_default', value)} />
                <Button variant="ghost" size="sm" onClick={() => update('units', rows.filter((item) => item.key !== row.key))} aria-label={t('catalog.common.remove')}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" disabled={!units.length} onClick={() => update('units', [...rows, newUnitRow()])}>
              <Plus size={14} />
              {t('catalog.product.addAlternativeUnit')}
            </Button>
            {onCreateUnit && <Button variant="ghost" size="sm" onClick={onCreateUnit}><Plus size={14} />{t('catalog.create.newUnit')}</Button>}
          </div>
        </div>
      )}
    </div>
  )
}
