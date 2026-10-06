import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { useUnits } from '../../hooks/useCatalogSetup'
import { useProductUnitMutations } from '../../hooks/useProductResources'
import { compactBody } from '../../utils/catalogPayloads'
import { formatApiError } from '../../utils/apiErrors'
import { CheckboxField, FormError } from '../common/catalogUi'

const EMPTY = { unit_id: '', factor: '', price: '', barcode: '', is_default: false, status: true }

/**
 * Add / edit a unit of a product (2026-10-06). On edit `unit_id` is never sent, and the factor of a unit the
 * product was already sold in is refused by the server (its message is shown).
 */
export function ProductUnitDialog({ open, productId, productUnit, onClose }) {
  const { t } = useTranslation()
  const isEdit = Boolean(productUnit)
  const unitsQuery = useUnits()
  const mutations = useProductUnitMutations(productId)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setError('')
    setForm(productUnit ? {
      unit_id: String(productUnit.unitId ?? ''),
      factor: productUnit.factor ?? '',
      price: productUnit.price ?? '',
      barcode: productUnit.barcode,
      is_default: productUnit.isDefault,
      status: productUnit.status,
    } : EMPTY)
  }, [open, productUnit])

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const saving = mutations.add.isPending || mutations.update.isPending

  const submit = async () => {
    if (!isEdit && !form.unit_id) return setError(t('catalog.validation.unitRequired'))
    if (!(Number(form.factor) > 0)) return setError(t('catalog.validation.factorRequired'))
    const body = compactBody({
      factor: Number(form.factor),
      price: form.price === '' ? undefined : Number(form.price),
      barcode: form.barcode?.trim(),
      is_default: Boolean(form.is_default),
      status: Boolean(form.status),
    })
    try {
      if (isEdit) await mutations.update.mutateAsync({ id: productUnit.id, payload: body })
      else await mutations.add.mutateAsync({ ...body, unit_id: form.unit_id })
      toast.success(t(isEdit ? 'catalog.productUnits.updated' : 'catalog.productUnits.added'))
      onClose()
    } catch (requestError) {
      setError(formatApiError(requestError, t('catalog.common.saveFailed')))
    }
  }

  const unitOptions = (unitsQuery.data || [])
    .filter((unit) => unit.status || String(unit.id) === form.unit_id)
    .map((unit) => ({ value: String(unit.id), label: unit.code ? `${unit.name} (${unit.code})` : unit.name }))

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={submit}
      loading={saving}
      title={t(isEdit ? 'catalog.productUnits.editTitle' : 'catalog.productUnits.addTitle')}
    >
      <div className="space-y-4">
        <FormError message={error} />
        <Select label={t('catalog.productUnits.fields.unit')} value={form.unit_id} options={unitOptions} disabled={isEdit} onChange={(value) => set('unit_id', value)} />
        <Input
          label={t('catalog.productUnits.fields.factor')}
          type="number"
          min={0}
          step="any"
          dir="ltr"
          value={form.factor}
          hint={isEdit ? t('catalog.productUnits.factorLockedHint') : t('catalog.productUnits.factorHint')}
          onChange={(event) => set('factor', event.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t('catalog.productUnits.fields.price')} type="number" min={0} step="any" dir="ltr" value={form.price} onChange={(event) => set('price', event.target.value)} />
          <Input label={t('catalog.productUnits.fields.barcode')} dir="ltr" value={form.barcode} onChange={(event) => set('barcode', event.target.value)} />
        </div>
        <CheckboxField label={t('catalog.productUnits.fields.isDefault')} checked={form.is_default} onChange={(value) => set('is_default', value)} />
        <CheckboxField label={t('catalog.common.active')} checked={form.status} onChange={(value) => set('status', value)} />
      </div>
    </FormDialog>
  )
}
