import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { ModuleNotice } from '../../../../shared/components/module-pages'
import { instanceModesFor } from '../../constants/capabilityRegistry'
import { useProductInstanceMutations } from '../../hooks/useProductResources'
import { buildInstancesPayload } from '../../utils/catalogForms'
import { formatApiError } from '../../utils/apiErrors'
import { FormError, TextAreaField } from '../common/catalogUi'

const ALL_MODES = ['serial', 'unit', 'batch']
const newUnitRow = () => ({ key: Math.random().toString(36).slice(2), building: '', floor: '', unit: '' })
const newBatchRow = () => ({ key: Math.random().toString(36).slice(2), batch_no: '', expiry_date: '' })

/**
 * Add instances to a product (2026-10-06): serial numbers (`serial_tracking`, checked against the item type's
 * pattern), real-estate units (`unique_unit`) or batches with expiry (`batch_lot` / `expiry`).
 */
export function CreateInstancesDialog({ open, product, itemType, onClose }) {
  const { t } = useTranslation()
  const mutations = useProductInstanceMutations()
  const codes = useMemo(() => (itemType?.capabilities || []).map((capability) => capability.code), [itemType])
  const allowed = instanceModesFor(codes)
  const modes = allowed.length ? allowed : ALL_MODES
  const pattern = itemType?.capabilities?.find((capability) => capability.code === 'serial_tracking')?.config?.pattern
  const [mode, setMode] = useState(modes[0])
  const [serials, setSerials] = useState('')
  const [unitRows, setUnitRows] = useState([newUnitRow()])
  const [batchRows, setBatchRows] = useState([newBatchRow()])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setMode(modes[0])
    setSerials('')
    setUnitRows([newUnitRow()])
    setBatchRows([newBatchRow()])
    setError('')
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the dialog opens
  }, [open])

  const input = mode === 'serial' ? serials : mode === 'unit' ? unitRows : batchRows
  const { instances, invalid } = buildInstancesPayload(mode, input, { pattern })

  const submit = async () => {
    if (!instances.length) return setError(t('catalog.instances.nothingToAdd'))
    if (invalid.length) return setError(t('catalog.instances.patternMismatch', { pattern, serials: invalid.join(', ') }))
    try {
      await mutations.create.mutateAsync({ productId: product.id, instances })
      toast.success(t('catalog.instances.added', { count: instances.length }))
      onClose()
    } catch (requestError) {
      setError(formatApiError(requestError, t('catalog.common.saveFailed')))
    }
  }

  const editRows = (rows, setRows, key, field, value) => setRows(rows.map((row) => (row.key === key ? { ...row, [field]: value } : row)))

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={submit}
      loading={mutations.create.isPending}
      size="lg"
      title={t('catalog.instances.addTitle', { name: product.name })}
      submitText={t('catalog.instances.addCount', { count: instances.length })}
    >
      <div className="space-y-4">
        <FormError message={error} />
        {!allowed.length && <ModuleNotice tone="warning">{t('catalog.instances.noInstanceCapability')}</ModuleNotice>}
        {modes.length > 1 && (
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('catalog.instances.modeLabel')}>
            {modes.map((value) => (
              <Button key={value} size="sm" variant={mode === value ? 'primary' : 'outline'} role="radio" aria-checked={mode === value} onClick={() => setMode(value)}>
                {t(`catalog.instances.modes.${value}`)}
              </Button>
            ))}
          </div>
        )}

        {mode === 'serial' && (
          <TextAreaField
            label={t('catalog.instances.fields.serialNumbers')}
            value={serials}
            onChange={setSerials}
            rows={6}
            dir="ltr"
            hint={pattern ? t('catalog.instances.patternHint', { pattern }) : t('catalog.instances.serialsHint')}
          />
        )}

        {mode === 'unit' && (
          <div className="space-y-2">
            {unitRows.map((row) => (
              <div key={row.key} className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2">
                <Input label={t('catalog.instances.fields.building')} value={row.building} onChange={(event) => editRows(unitRows, setUnitRows, row.key, 'building', event.target.value)} />
                <Input label={t('catalog.instances.fields.floor')} value={row.floor} dir="ltr" onChange={(event) => editRows(unitRows, setUnitRows, row.key, 'floor', event.target.value)} />
                <Input label={t('catalog.instances.fields.unit')} value={row.unit} dir="ltr" onChange={(event) => editRows(unitRows, setUnitRows, row.key, 'unit', event.target.value)} />
                <Button variant="ghost" size="icon" disabled={unitRows.length === 1} onClick={() => setUnitRows(unitRows.filter((item) => item.key !== row.key))} aria-label={t('catalog.common.remove')}><Trash2 size={16} /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setUnitRows([...unitRows, newUnitRow()])}><Plus size={14} />{t('catalog.instances.addRow')}</Button>
          </div>
        )}

        {mode === 'batch' && (
          <div className="space-y-2">
            {batchRows.map((row) => (
              <div key={row.key} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
                <Input label={t('catalog.instances.fields.batchNo')} value={row.batch_no} dir="ltr" onChange={(event) => editRows(batchRows, setBatchRows, row.key, 'batch_no', event.target.value)} />
                <Input label={t('catalog.instances.fields.expiryDate')} type="date" value={row.expiry_date} onChange={(event) => editRows(batchRows, setBatchRows, row.key, 'expiry_date', event.target.value)} />
                <Button variant="ghost" size="icon" disabled={batchRows.length === 1} onClick={() => setBatchRows(batchRows.filter((item) => item.key !== row.key))} aria-label={t('catalog.common.remove')}><Trash2 size={16} /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setBatchRows([...batchRows, newBatchRow()])}><Plus size={14} />{t('catalog.instances.addRow')}</Button>
          </div>
        )}
      </div>
    </FormDialog>
  )
}
