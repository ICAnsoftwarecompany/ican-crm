import { useMemo } from 'react'
import { useItemTypes } from '../../hooks/useCatalogSetup'

/**
 * The product's item type with its capabilities (2026-10-06, shared 2026-10-15): the product response may carry only
 * `item_type_id` or a summary, so the full entry of the item types list wins when the product has no capabilities.
 */
export function useResolvedItemType(product) {
  const itemTypesQuery = useItemTypes()
  return useMemo(() => {
    if (!product) return null
    const listed = (itemTypesQuery.data || []).find((item) => String(item.id) === String(product.itemTypeId))
    if (product.itemType?.capabilities?.length || !listed) return product.itemType || listed || null
    return listed
  }, [itemTypesQuery.data, product])
}
