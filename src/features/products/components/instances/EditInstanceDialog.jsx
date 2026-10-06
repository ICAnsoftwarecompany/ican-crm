import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../shared/components/ui/Input'
import { useProductInstanceMutations } from '../../hooks/useProductResources'
import { formatApiError } from '../../utils/apiErrors'
import { FormError } from '../common/catalogUi'

const blankToNull = (value) => (value === undefined || String(value).trim() === '' ? null : String(value).trim())

/**
 * Edit one instance (`PUT /product-instances/{id}`). Fields shown follow what the instance holds; a field emptied
 * is sent as null, as in the collection (`"batch_no": null`). Status is changed with void / restore.
 */
export function EditInstanceDialog({ instance, onClose }) {
  const { t } = useTranslation()
  const mutations = useProductInstanceMutations()
  const [form, setForm] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    if (!instance) return
    setError('')
    setForm({
      serial_number: instance.serialNumber,
      batch_no: instance.batchNo,
      expiry_date: instance.expiryDate,
      building: instance.unitAttributes.building ?? '',
      floor: instance.unitAttributes.floor ?? '',
      unit: instance.unitAttributes.unit ?? '',
    })
  }, [instance])

  if (!instance) return null

  const hasUnit = Object.keys(instance.unitAttributes || {}).length > 0
  const hasSerial = Boolean(instance.serialNumber) || (!hasUnit && !instance.batchNo && !instance.expiryDate)
  const hasBatch = Boolean(instance.batchNo || instance.expiryDate) || (!hasUnit && !instance.serialNumber)
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async () => {
    const payload = {}
    if (hasSerial) payload.serial_number = blankToNull(form.serial_number)
    if (hasBatch) {
      payload.batch_no = blankToNull(form.batch_no)
      payload.expiry_date = blankToNull(form.expiry_date)
    }
    if (hasUnit) {
      const floor = blankToNull(form.floor)
      payload.unit_attributes = {
        ...instance.unitAttributes,
        building: blankToNull(form.building),
        floor: floor !== null && Number.isFinite(Number(floor)) ? Number(floor) : floor,
        unit: blankToNull(form.unit),
      }
    }
    try {
      await mutations.update.mutateAsync({ id: instance.id, payload })
      toast.success(t('catalog.instances.updated'))
      onClose()
    } catch (requestError) {
      setError(formatApiError(requestError, t('catalog.common.saveFailed')))
    }
  }

  return (
    <FormDialog open onClose={onClose} onSubmit={submit} loading={mutations.update.isPending} title={t('catalog.instances.editTitle')}>
      <div className="space-y-4">
        <FormError message={error} />
        {hasSerial && <Input label={t('catalog.instances.fields.serialNumber')} dir="ltr" value={form.serial_number || ''} onChange={(event) => set('serial_number', event.target.value)} />}
        {hasUnit && (
          <div className="grid gap-3 sm:grid-cols-3">
            <Input label={t('catalog.instances.fields.building')} value={form.building} onChange={(event) => set('building', event.target.value)} />
            <Input label={t('catalog.instances.fields.floor')} dir="ltr" value={form.floor} onChange={(event) => set('floor', event.target.value)} />
            <Input label={t('catalog.instances.fields.unit')} dir="ltr" value={form.unit} onChange={(event) => set('unit', event.target.value)} />
          </div>
        )}
        {hasBatch && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label={t('catalog.instances.fields.batchNo')} dir="ltr" value={form.batch_no || ''} onChange={(event) => set('batch_no', event.target.value)} />
            <Input label={t('catalog.instances.fields.expiryDate')} type="date" value={form.expiry_date || ''} onChange={(event) => set('expiry_date', event.target.value)} />
          </div>
        )}
      </div>
    </FormDialog>
  )
}
