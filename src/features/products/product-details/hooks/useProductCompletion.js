import { useCallback, useEffect, useMemo, useState } from 'react'
import { useCatalogProductMutations, useProductInfo } from '../../hooks/useCatalogProducts'
import { buildProductPayload } from '../../utils/catalogForms'
import { formatApiError } from '../../utils/apiErrors'
import { serializeAdditionalData } from '../../components/common/AdditionalDataFields'
import { useProductForm } from '../../components/products/useProductForm'
import { getCompletionSteps, validateCompletionStep } from '../utils/completionSteps'
import { productCompleteness } from '../utils/productCompleteness'

/**
 * State of `/products/:productId/complete` (2026-10-15). The missing list is taken once when the product loads, so
 * the steps stay put while the user fills them. Saving is one `POST /product/update/{id}` (same body as edit).
 */
export function useProductCompletion({ productId, t }) {
  const infoQuery = useProductInfo(productId)
  const product = infoQuery.data || null
  const formState = useProductForm({ open: Boolean(product), product, kind: product?.kind || 'product' })
  const mutations = useCatalogProductMutations()
  const [missing, setMissing] = useState(null)
  const [step, setStep] = useState('')
  const [error, setError] = useState('')
  const [stepError, setStepError] = useState('')

  useEffect(() => {
    if (product && missing === null) setMissing(productCompleteness(product).missing)
  }, [missing, product])

  const chosenItemType = formState.form.item_type_id ? formState.selectedItemType : null
  const steps = useMemo(() => getCompletionSteps(missing || [], { chosenItemType }), [chosenItemType, missing])
  const current = steps.includes(step) ? step : steps[0]
  const index = steps.indexOf(current)

  const next = useCallback(() => {
    const own = validateCompletionStep(current, formState.form)
    setStepError(own || '')
    if (own) return
    setStep(steps[Math.min(index + 1, steps.length - 1)])
  }, [current, formState.form, index, steps])
  const back = useCallback(() => { setStepError(''); setStep(steps[Math.max(0, index - 1)]) }, [index, steps])
  const goTo = useCallback((id) => { setStepError(''); setStep(id) }, [])

  // What the item will look like after saving (for the review and the live meter).
  const preview = useMemo(() => ({
    ...(product || {}),
    name: formState.form.name,
    price: formState.form.price === '' ? null : Number(formState.form.price),
    itemTypeId: formState.form.item_type_id || null,
    categoryId: formState.form.category_id || null,
    description: formState.form.description,
    image: formState.form.image ? formState.form.image.name : product?.image,
  }), [formState.form, product])

  const save = useCallback(async () => {
    setError('')
    const invalid = steps.find((id) => validateCompletionStep(id, formState.form))
    if (invalid) return setStep(invalid)
    try {
      await mutations.update.mutateAsync({
        id: product.id,
        payload: buildProductPayload(formState.form, { mode: 'update', data: serializeAdditionalData(formState.additionalRows) }),
      })
      return true
    } catch (requestError) {
      setError(formatApiError(requestError, t('catalog.product.saveFailed')))
      return false
    }
  }, [formState.additionalRows, formState.form, mutations.update, product, steps, t])

  return {
    product,
    loading: infoQuery.isLoading,
    loadError: infoQuery.error,
    retry: () => infoQuery.refetch(),
    formState,
    chosenItemType,
    missing: missing || [],
    steps,
    step: current,
    index,
    next,
    back,
    goTo,
    stepError,
    preview,
    save,
    saving: mutations.update.isPending,
    error,
  }
}
