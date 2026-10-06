import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { RELATION_INCLUSIONS } from '../../constants/catalogOptions'
import { useCatalogProducts } from '../../hooks/useCatalogProducts'
import { useProductRelationMutations } from '../../hooks/useProductResources'
import { compactBody } from '../../utils/catalogPayloads'
import { formatApiError } from '../../utils/apiErrors'
import { CheckboxField, FormError, useOptionLabel, useOptions } from '../common/catalogUi'

const EMPTY = { child_product_id: '', inclusion: 'included', quantity: '1', price_override: '', auto_add: true, sort_order: '' }

/**
 * Attach / edit an included or optional product or service (2026-10-06). The child cannot change on edit.
 * Picking "included" pre-fills price 0 and auto-add, as in the collection example.
 */
export function RelationDialog({ open, product, relation, nextSortOrder = 1, onClose }) {
  const { t } = useTranslation()
  const isEdit = Boolean(relation)
  const catalogQuery = useCatalogProducts()
  const mutations = useProductRelationMutations(product.id)
  const optionLabel = useOptionLabel()
  const inclusionOptions = useOptions('inclusion', RELATION_INCLUSIONS)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setError('')
    setForm(relation ? {
      child_product_id: String(relation.childProductId ?? ''),
      inclusion: relation.inclusion,
      quantity: String(relation.quantity ?? 1),
      price_override: relation.priceOverride ?? '',
      auto_add: relation.autoAdd,
      sort_order: String(relation.sortOrder ?? ''),
    } : { ...EMPTY, sort_order: String(nextSortOrder), price_override: '0' })
  }, [nextSortOrder, open, relation])

  const childOptions = useMemo(() => (catalogQuery.data || [])
    .filter((item) => String(item.id) !== String(product.id) && (item.status || String(item.id) === form.child_product_id))
    .map((item) => ({ value: String(item.id), label: `${item.name} — ${optionLabel('kinds', item.kind)}` })), [catalogQuery.data, form.child_product_id, optionLabel, product.id])

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const changeInclusion = (value) => setForm((current) => ({
    ...current,
    inclusion: value || 'included',
    auto_add: value === 'included',
    price_override: value === 'included' && current.price_override === '' ? '0' : current.price_override,
  }))

  const submit = async () => {
    if (!isEdit && !form.child_product_id) return setError(t('catalog.validation.childRequired'))
    if (!(Number(form.quantity) > 0)) return setError(t('catalog.validation.quantityRequired'))
    const body = compactBody({
      inclusion: form.inclusion,
      quantity: Number(form.quantity),
      price_override: form.price_override === '' ? undefined : Number(form.price_override),
      auto_add: Boolean(form.auto_add),
      sort_order: form.sort_order === '' ? undefined : Number(form.sort_order),
    })
    try {
      if (isEdit) await mutations.update.mutateAsync({ id: relation.id, payload: body })
      else await mutations.add.mutateAsync({ ...body, child_product_id: form.child_product_id })
      toast.success(t(isEdit ? 'catalog.relations.updated' : 'catalog.relations.added'))
      onClose()
    } catch (requestError) {
      setError(formatApiError(requestError, t('catalog.common.saveFailed')))
    }
  }

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={submit}
      loading={mutations.add.isPending || mutations.update.isPending}
      title={t(isEdit ? 'catalog.relations.editTitle' : 'catalog.relations.addTitle')}
    >
      <div className="space-y-4">
        <FormError message={error} />
        <Select
          label={t('catalog.relations.fields.child')}
          value={form.child_product_id}
          options={isEdit && !childOptions.length ? [{ value: form.child_product_id, label: relation.childName || `#${form.child_product_id}` }] : childOptions}
          disabled={isEdit}
          onChange={(value) => set('child_product_id', value)}
        />
        <Select label={t('catalog.relations.fields.inclusion')} value={form.inclusion} options={inclusionOptions} onChange={changeInclusion} />
        <p className="-mt-2 text-xs text-[var(--text-muted)]">{t(`catalog.relations.inclusionHint.${form.inclusion}`)}</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label={t('catalog.relations.fields.quantity')} type="number" min={1} step="any" dir="ltr" value={form.quantity} onChange={(event) => set('quantity', event.target.value)} />
          <Input label={t('catalog.relations.fields.priceOverride')} type="number" min={0} step="any" dir="ltr" value={form.price_override} hint={t('catalog.relations.priceOverrideHint')} onChange={(event) => set('price_override', event.target.value)} />
          <Input label={t('catalog.relations.fields.sortOrder')} type="number" min={0} dir="ltr" value={form.sort_order} onChange={(event) => set('sort_order', event.target.value)} />
        </div>
        <CheckboxField label={t('catalog.relations.fields.autoAdd')} hint={t('catalog.relations.autoAddHint')} checked={form.auto_add} onChange={(value) => set('auto_add', value)} />
      </div>
    </FormDialog>
  )
}
