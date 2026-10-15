import { useEffect, useMemo, useState } from 'react'
import { useCatalogProducts, useItemTypes, useProductInstances, useProductRelations, useProductUnits } from '../../../products'
import { useLeadMutations } from '../../hooks/useLeads'
import { getInterestProfile, resolveItemType } from '../utils/interestProfile'
import {
  EMPTY_INTEREST_FORM,
  buildInterestPayload,
  estimateInterest,
  interestToForm,
  validateInterestForm,
} from '../utils/interestForm'

/**
 * State of the lead interest dialog (2026-10-15): the catalog (normalized products + item types), the chosen
 * product with its profile, the per-product resources the profile needs (units, attached items, pieces), the
 * estimate and the save. `stage` = `pick` (choose a product) | `details`.
 * `leadIds`: one lead, or several for the bulk action (the same interest is saved on each, one request per lead).
 * `prepare()` validates and returns `{ payloads }` (or `{ errors }`) for callers that save it themselves (the
 * follow-up dialog saves it after the follow-up); `submit()` validates and saves.
 */
export function useLeadInterestForm({ open, interest, leadIds = [] }) {
  const productsQuery = useCatalogProducts()
  const itemTypesQuery = useItemTypes()
  const mutations = useLeadMutations()
  const [form, setForm] = useState(EMPTY_INTEREST_FORM)
  const [stage, setStage] = useState('pick')
  const [errors, setErrors] = useState({})
  const isEdit = Boolean(interest?.id)

  useEffect(() => {
    if (!open) return
    const next = interestToForm(interest)
    setForm(next)
    setStage(next.productId ? 'details' : 'pick')
    setErrors({})
  }, [interest, open])

  const itemTypes = useMemo(() => itemTypesQuery.data || [], [itemTypesQuery.data])
  // Inactive products are hidden, except the one an edited interest already points to.
  const products = useMemo(
    () => (productsQuery.data || []).filter((product) => product.status || String(product.id) === form.productId),
    [form.productId, productsQuery.data]
  )
  const product = useMemo(() => products.find((item) => String(item.id) === form.productId) || null, [form.productId, products])
  const itemType = useMemo(() => resolveItemType(product, itemTypes), [itemTypes, product])
  const profile = useMemo(() => getInterestProfile(product, itemType), [itemType, product])

  const productId = product?.id
  const unitsQuery = useProductUnits(profile?.units ? productId : null)
  const relationsQuery = useProductRelations(productId)
  const instancesQuery = useProductInstances({ product_id: productId }, { enabled: Boolean(productId && profile?.candidates) })

  const units = useMemo(() => (unitsQuery.data || []).filter((unit) => unit.status && !unit.isBase), [unitsQuery.data])
  const relations = useMemo(() => relationsQuery.data || [], [relationsQuery.data])
  const instances = useMemo(() => (instancesQuery.data || []).filter((instance) => !instance.voided), [instancesQuery.data])
  const estimate = useMemo(() => estimateInterest({ product, profile, form, units, relations }), [form, product, profile, relations, units])

  const update = (patch) => {
    setForm((current) => ({ ...current, ...patch }))
    setErrors((current) => {
      const next = { ...current }
      Object.keys(patch).forEach((key) => delete next[key])
      return next
    })
  }

  /** Choosing a product resets what depended on the previous one; level and note stay. */
  const chooseProduct = (id) => {
    setForm((current) => ({ ...EMPTY_INTEREST_FORM, level: current.level, note: current.note, productId: String(id) }))
    setErrors({})
    setStage('details')
  }

  const toggleIn = (key, id) => {
    const value = String(id)
    setForm((current) => ({
      ...current,
      [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value],
    }))
  }

  const prepare = () => {
    const nextErrors = validateInterestForm(form, profile)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      if (nextErrors.productId) setStage('pick')
      return { errors: nextErrors }
    }
    const interestId = isEdit ? interest.id : null
    return { payloads: leadIds.map((leadId) => buildInterestPayload({ leadId, form, product, profile, interestId, estimate })) }
  }

  /** `{ saved, failed, response, payload }`, or null when the form is invalid. Bulk: failures don't stop the rest. */
  const submit = async () => {
    const prepared = prepare()
    if (prepared.errors) return null
    const save = isEdit ? mutations.updateInterested : mutations.saveInterested
    let response = null
    let saved = 0
    const failed = []
    for (const payload of prepared.payloads) {
      try {
        response = await save.mutateAsync(payload)
        saved += 1
      } catch (error) {
        if (prepared.payloads.length === 1) throw error
        failed.push({ leadId: payload.lead_id, error })
      }
    }
    return { saved, failed, response, payload: prepared.payloads[0] }
  }

  return {
    form,
    errors,
    stage,
    setStage,
    isEdit,
    update,
    chooseProduct,
    toggleIn,
    prepare,
    submit,
    saving: mutations.saveInterested.isPending || mutations.updateInterested.isPending,
    catalog: { products, itemTypes, isLoading: productsQuery.isLoading, error: productsQuery.error, refetch: productsQuery.refetch },
    product,
    itemType,
    profile,
    units,
    relations,
    instances,
    resources: {
      unitsLoading: unitsQuery.isLoading && Boolean(profile?.units),
      relationsLoading: relationsQuery.isLoading && Boolean(productId),
      instancesLoading: instancesQuery.isLoading && Boolean(profile?.candidates),
      instancesError: instancesQuery.error,
    },
    estimate,
  }
}
