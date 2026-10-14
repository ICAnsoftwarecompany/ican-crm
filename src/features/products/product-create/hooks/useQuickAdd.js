import { useCallback, useMemo, useState } from 'react'
import { useCatalogProductMutations } from '../../hooks/useCatalogProducts'
import { useItemType } from '../../hooks/useCatalogSetup'
import { formatApiError } from '../../utils/apiErrors'
import { getCreatedId } from '../../utils/catalogPayloads'
import { EMPTY_QUICK_ROW, buildQuickProduct, nextQuickRow, validateQuickRow } from '../utils/quickAdd'

/**
 * Quick add mode (2026-10-15): one row (name, category, price, optional item type), Enter saves and clears the name
 * and price for the next one. `added` lists what was saved in this session (newest first) for the side panel.
 */
export function useQuickAdd({ kind = 'product', t }) {
  const mutations = useCatalogProductMutations()
  const [row, setRow] = useState(EMPTY_QUICK_ROW)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [added, setAdded] = useState([])
  const itemTypeQuery = useItemType(row.item_type_id)

  const update = useCallback((patch) => setRow((current) => ({ ...current, ...patch })), [])

  const submit = useCallback(async () => {
    const own = validateQuickRow(row)
    setErrors(own)
    setError('')
    if (Object.keys(own).length) return false
    try {
      const response = await mutations.create.mutateAsync(buildQuickProduct(row, { kind, itemType: itemTypeQuery.data }))
      const id = getCreatedId(response)
      setAdded((current) => [{ key: `${id || 'new'}-${Date.now()}`, id, name: row.name.trim(), price: Number(row.price), categoryId: row.category_id }, ...current])
      setRow(nextQuickRow(row))
      return true
    } catch (requestError) {
      setError(formatApiError(requestError, t('catalog.common.saveFailed')))
      return false
    }
  }, [itemTypeQuery.data, kind, mutations.create, row, t])

  return useMemo(() => ({
    row, update, errors, error, added, submit, saving: mutations.create.isPending,
  }), [added, error, errors, mutations.create.isPending, row, submit, update])
}
