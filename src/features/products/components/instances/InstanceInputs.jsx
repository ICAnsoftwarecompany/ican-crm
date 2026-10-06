import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { newBatchRow, newUnitInstanceRow } from '../../utils/productCreateWizard'
import { TextAreaField } from '../common/catalogUi'

/**
 * Inputs for new instances (2026-10-07): serial numbers, real-estate units or batches with expiry.
 * `value = { mode, serials, unitRows, batchRows }` (see createInstancesState); `modes` = allowed modes.
 * Used by the create wizard and the "add" dialog of the product page.
 */
export function InstanceInputs({ value, modes, pattern, onChange }) {
  const { t } = useTranslation()
  const set = (patch) => onChange({ ...value, ...patch })
  const editRow = (listKey, key, field, fieldValue) => set({
    [listKey]: value[listKey].map((row) => (row.key === key ? { ...row, [field]: fieldValue } : row)),
  })
  const removeRow = (listKey, key) => set({ [listKey]: value[listKey].filter((row) => row.key !== key) })

  return (
    <div className="space-y-4">
      {modes.length > 1 && (
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('catalog.instances.modeLabel')}>
          {modes.map((mode) => (
            <Button key={mode} size="sm" variant={value.mode === mode ? 'primary' : 'outline'} role="radio" aria-checked={value.mode === mode} onClick={() => set({ mode })}>
              {t(`catalog.instances.modes.${mode}`)}
            </Button>
          ))}
        </div>
      )}

      {value.mode === 'serial' && (
        <TextAreaField
          label={t('catalog.instances.fields.serialNumbers')}
          value={value.serials}
          onChange={(serials) => set({ serials })}
          rows={6}
          dir="ltr"
          hint={pattern ? t('catalog.instances.patternHint', { pattern }) : t('catalog.instances.serialsHint')}
        />
      )}

      {value.mode === 'unit' && (
        <div className="space-y-2">
          {value.unitRows.map((row) => (
            <div key={row.key} className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2">
              <Input label={t('catalog.instances.fields.building')} value={row.building} onChange={(event) => editRow('unitRows', row.key, 'building', event.target.value)} />
              <Input label={t('catalog.instances.fields.floor')} value={row.floor} dir="ltr" onChange={(event) => editRow('unitRows', row.key, 'floor', event.target.value)} />
              <Input label={t('catalog.instances.fields.unit')} value={row.unit} dir="ltr" onChange={(event) => editRow('unitRows', row.key, 'unit', event.target.value)} />
              <Button variant="ghost" size="icon" disabled={value.unitRows.length === 1} onClick={() => removeRow('unitRows', row.key)} aria-label={t('catalog.common.remove')}><Trash2 size={16} /></Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => set({ unitRows: [...value.unitRows, newUnitInstanceRow()] })}><Plus size={14} />{t('catalog.instances.addRow')}</Button>
        </div>
      )}

      {value.mode === 'batch' && (
        <div className="space-y-2">
          {value.batchRows.map((row) => (
            <div key={row.key} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
              <Input label={t('catalog.instances.fields.batchNo')} value={row.batch_no} dir="ltr" onChange={(event) => editRow('batchRows', row.key, 'batch_no', event.target.value)} />
              <Input label={t('catalog.instances.fields.expiryDate')} type="date" value={row.expiry_date} onChange={(event) => editRow('batchRows', row.key, 'expiry_date', event.target.value)} />
              <Button variant="ghost" size="icon" disabled={value.batchRows.length === 1} onClick={() => removeRow('batchRows', row.key)} aria-label={t('catalog.common.remove')}><Trash2 size={16} /></Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => set({ batchRows: [...value.batchRows, newBatchRow()] })}><Plus size={14} />{t('catalog.instances.addRow')}</Button>
        </div>
      )}
    </div>
  )
}
