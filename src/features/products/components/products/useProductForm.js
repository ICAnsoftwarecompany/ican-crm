import { useCallback, useEffect, useMemo, useState } from 'react'
import { useProductCategories } from '../../hooks/useProducts'
import { useItemType, useItemTypes, useUnits } from '../../hooks/useCatalogSetup'
import { categoryTypeForKind } from '../../constants/catalogOptions'
import { filterCategoryTreeByType, flattenCategoryTree } from '../../utils/categoryTree'
import { productToForm, validateProductForm } from '../../utils/catalogForms'
import { parseAdditionalData } from '../common/AdditionalDataFields'

let unitRowId = 0
export const newUnitRow = () => ({ key: `unit-${(unitRowId += 1)}`, unit_id: '', factor: '', price: '', barcode: '', is_default: false })

/**
 * State + lookups of the product form (drawer and create wizard), 2026-10-06.
 * `initial` (create wizard, 2026-10-15) = `{ form, additionalRows }` restored from a draft; read once on open.
 */
export function useProductForm({ open, product, kind, initial }) {
  const startForm = () => (initial?.form ? { ...productToForm(null, kind), ...initial.form, image: null } : productToForm(product, kind))
  const [form, setForm] = useState(startForm)
  const [additionalRows, setAdditionalRows] = useState(() => initial?.additionalRows || [])
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    setForm(startForm())
    setAdditionalRows(initial?.additionalRows || parseAdditionalData(product?.data))
    setErrors({})
    // `initial` is read once (it is a draft snapshot), so it is not a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product, kind])

  const itemTypesQuery = useItemTypes()
  const unitsQuery = useUnits()
  const categoriesQuery = useProductCategories()

  const itemTypes = useMemo(() => (itemTypesQuery.data || []).filter((itemType) => (
    itemType.kind === form.kind && (itemType.status || String(itemType.id) === String(form.item_type_id))
  )), [form.item_type_id, form.kind, itemTypesQuery.data])

  // The full item type (GET /item-types/{id}) wins: the list may not carry capability configs.
  const itemTypeQuery = useItemType(form.item_type_id)
  const selectedItemType = useMemo(() => {
    if (!form.item_type_id) return null
    if (itemTypeQuery.data) return itemTypeQuery.data
    return (itemTypesQuery.data || []).find((itemType) => String(itemType.id) === String(form.item_type_id)) || product?.itemType || null
  }, [form.item_type_id, itemTypeQuery.data, itemTypesQuery.data, product?.itemType])

  const categories = useMemo(
    () => flattenCategoryTree(filterCategoryTreeByType(categoriesQuery.data || [], categoryTypeForKind(form.kind))),
    [categoriesQuery.data, form.kind]
  )

  const update = useCallback((key, value) => setForm((current) => ({ ...current, [key]: value })), [])

  const setCapabilityValue = (code, config) => setForm((current) => ({
    ...current,
    capability_values: { ...current.capability_values, [code]: config },
  }))

  /** Validates the whole form, or only `keys` (error key prefixes such as `name`, `units.`). */
  const validate = (keys) => {
    const all = validateProductForm(form)
    const next = keys ? Object.fromEntries(Object.entries(all).filter(([key]) => keys.some((prefix) => key === prefix || key.startsWith(prefix)))) : all
    setErrors(next)
    return next
  }

  return {
    form,
    errors,
    update,
    setCapabilityValue,
    validate,
    additionalRows,
    setAdditionalRows,
    itemTypes,
    selectedItemType,
    categories,
    units: (unitsQuery.data || []).filter((unit) => unit.status),
    isLoadingItemType: itemTypeQuery.isLoading,
    isLoadingLookups: itemTypesQuery.isLoading || unitsQuery.isLoading || categoriesQuery.isLoading,
  }
}
