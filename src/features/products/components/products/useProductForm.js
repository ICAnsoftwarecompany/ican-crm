import { useEffect, useMemo, useState } from 'react'
import { useProductCategories } from '../../hooks/useProducts'
import { useItemType, useItemTypes, useUnits } from '../../hooks/useCatalogSetup'
import { categoryTypeForKind } from '../../constants/catalogOptions'
import { filterCategoryTreeByType, flattenCategoryTree } from '../../utils/categoryTree'
import { productToForm, validateProductForm } from '../../utils/catalogForms'
import { parseAdditionalData } from '../common/AdditionalDataFields'

let unitRowId = 0
export const newUnitRow = () => ({ key: `unit-${(unitRowId += 1)}`, unit_id: '', factor: '', price: '', barcode: '', is_default: false })

/** State + lookups of the product form (drawer and create wizard), 2026-10-06. */
export function useProductForm({ open, product, kind }) {
  const [form, setForm] = useState(() => productToForm(product, kind))
  const [additionalRows, setAdditionalRows] = useState([])
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    setForm(productToForm(product, kind))
    setAdditionalRows(parseAdditionalData(product?.data))
    setErrors({})
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

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

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
