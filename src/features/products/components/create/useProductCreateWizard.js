import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { productsApi } from '../../api/productsApi'
import { productInstancesApi, productRelationsApi } from '../../api/catalogApi'
import { catalogKeys } from '../../hooks/catalogQueryKeys'
import { getCreatedId } from '../../utils/catalogPayloads'
import { formatApiError } from '../../utils/apiErrors'
import {
  CREATE_STEPS,
  STEP_ERROR_KEYS,
  buildCreatePlan,
  createInstancesState,
  instanceModesForItemType,
  remainingRequests,
  validateWizardStep,
} from '../../utils/productCreateWizard'
import { serializeAdditionalData } from '../common/AdditionalDataFields'
import { useProductForm } from '../products/useProductForm'

const EMPTY_DONE = { productId: null, relations: [], instances: false }

/**
 * State and submission of `/products/new` (2026-10-07). The answers stay in memory (an image file cannot be kept
 * in a draft). Saving runs: create product → each attached item → instances. What already succeeded is
 * remembered, so "retry" continues from the failed request and never creates the product twice.
 */
export function useProductCreateWizard({ kind = 'product', t }) {
  const client = useQueryClient()
  const formState = useProductForm({ open: true, product: null, kind })
  const itemType = formState.selectedItemType
  const [step, setStep] = useState('basics')
  const [relations, setRelations] = useState([])
  const [instances, setInstances] = useState(() => createInstancesState(''))
  const [stepErrors, setStepErrors] = useState({})
  const [done, setDone] = useState(EMPTY_DONE)
  const [progress, setProgress] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const instanceModes = useMemo(() => instanceModesForItemType(itemType), [itemType])
  // Keep the instance mode in line with the item type (first allowed mode, or none).
  useEffect(() => {
    setInstances((current) => (instanceModes.includes(current.mode) ? current : { ...current, mode: instanceModes[0] || '' }))
  }, [instanceModes])

  const state = useMemo(() => ({ form: formState.form, relations, instances }), [formState.form, instances, relations])
  const plan = useMemo(
    () => buildCreatePlan(state, itemType, { data: serializeAdditionalData(formState.additionalRows) }),
    [formState.additionalRows, itemType, state]
  )
  const locked = Boolean(done.productId)

  /** Validates the current step; returns true when the wizard can move on. */
  const validateStep = useCallback((id = step) => {
    const fieldErrors = STEP_ERROR_KEYS[id] ? formState.validate(STEP_ERROR_KEYS[id]) : {}
    const own = validateWizardStep(id, state, itemType)
    setStepErrors(own)
    return !Object.keys(fieldErrors).length && !Object.keys(own).length
  }, [formState, itemType, state, step])

  const goTo = useCallback((id) => {
    const target = CREATE_STEPS.indexOf(id)
    // Moving forward checks every step on the way; moving back is always allowed.
    for (const previous of CREATE_STEPS.slice(0, target)) {
      if (CREATE_STEPS.indexOf(previous) < CREATE_STEPS.indexOf(step)) continue
      if (!validateStep(previous)) {
        setStep(previous)
        return false
      }
    }
    setStepErrors({})
    setStep(id)
    return true
  }, [step, validateStep])

  const submit = useCallback(async () => {
    for (const id of CREATE_STEPS.slice(0, -1)) {
      if (!validateStep(id)) {
        setStep(id)
        return null
      }
    }
    setSubmitting(true)
    setError('')
    const current = { ...done, relations: [...done.relations] }
    const left = remainingRequests(plan, current)
    const mark = (key, value) => setProgress((previous) => ({ ...previous, [key]: value }))
    try {
      if (left.product) {
        mark('product', 'running')
        const response = await productsApi.createProducts(plan.product)
        current.productId = getCreatedId(response)
        if (!current.productId) throw new Error(t('catalog.create.noIdReturned'))
        setDone({ ...current })
        mark('product', 'done')
      }
      for (const relation of left.relations) {
        mark(`relation:${relation.key}`, 'running')
        await productRelationsApi.add(current.productId, relation.body)
        current.relations.push(relation.key)
        setDone({ ...current, relations: [...current.relations] })
        mark(`relation:${relation.key}`, 'done')
      }
      if (left.instances) {
        mark('instances', 'running')
        await productInstancesApi.create(current.productId, plan.instances.instances)
        current.instances = true
        setDone({ ...current })
        mark('instances', 'done')
      }
      return current.productId
    } catch (requestError) {
      setProgress((previous) => Object.fromEntries(Object.entries(previous).map(([key, value]) => [key, value === 'running' ? 'failed' : value])))
      setError(formatApiError(requestError, t('catalog.common.saveFailed')))
      return null
    } finally {
      setSubmitting(false)
      client.invalidateQueries({ queryKey: catalogKeys.root })
    }
  }, [client, done, plan, t, validateStep])

  return {
    step,
    goTo,
    validateStep,
    formState,
    itemType,
    relations,
    setRelations,
    instances,
    setInstances,
    instanceModes,
    stepErrors,
    plan,
    done,
    locked,
    progress,
    error,
    submitting,
    submit,
  }
}
