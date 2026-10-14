import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  STEP_ERROR_KEYS,
  buildCreatePlan,
  createInstancesState,
  instanceModesForItemType,
  validateWizardStep,
} from '../../utils/productCreateWizard'
import { applyTypeDefaults } from '../../item-type-wizard'
import { serializeAdditionalData } from '../../components/common/AdditionalDataFields'
import { useProductForm } from '../../components/products/useProductForm'
import { getCreateSteps } from '../utils/createSteps'
import { newDraftId, toDraft } from '../utils/productDrafts'
import { useCreateSubmission } from './useCreateSubmission'
import { useProductDrafts } from './useProductDrafts'

/**
 * State of `/products/new` (2026-10-07; rebuilt 2026-10-15).
 * - Steps follow the item type (`getCreateSteps`): every step without a type, only what applies with one.
 * - The type's default units and attached items fill the product (`applyTypeDefaults`), never over the user's rows.
 * - `?item_type=` preselects a type; `?draft=` restores a draft (and keeps it updated while open).
 * - Saving: see useCreateSubmission. The draft is deleted once the product is created.
 */
export function useProductCreateWizard({ kind = 'product', initialItemTypeId = '', draftId: startDraftId = '', t }) {
  const drafts = useProductDrafts(kind)
  const [draftId, setDraftId] = useState(() => (startDraftId && drafts.get(startDraftId) ? startDraftId : ''))
  const [snapshot] = useState(() => (draftId ? drafts.get(draftId) : null))
  const formState = useProductForm({ open: true, product: null, kind, initial: snapshot })
  const itemType = formState.selectedItemType
  const steps = useMemo(() => getCreateSteps(formState.form.item_type_id ? itemType : null), [formState.form.item_type_id, itemType])
  const [rawStep, setStep] = useState(() => snapshot?.step || 'basics')
  const step = steps.includes(rawStep) ? rawStep : steps[Math.max(0, steps.length - 2)]
  const [relations, setRelations] = useState(() => snapshot?.relations || [])
  const [instances, setInstances] = useState(() => snapshot?.instances || createInstancesState(''))
  const [stepErrors, setStepErrors] = useState({})
  const submission = useCreateSubmission({ t })

  // `?item_type=` (back from the item type page, quick type, or "add a product of this type").
  const { update: updateForm } = formState
  useEffect(() => {
    if (initialItemTypeId) updateForm('item_type_id', String(initialItemTypeId))
    // Only on mount: later changes come from the select.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // A plan / bundle type opened from `?item_type=` sets the product kind to match it.
  const formKind = formState.form.kind
  useEffect(() => {
    if (!itemType || String(itemType.id) !== String(initialItemTypeId)) return
    if (['plan', 'bundle'].includes(itemType.kind) && formKind !== itemType.kind) updateForm('kind', itemType.kind)
  }, [formKind, initialItemTypeId, itemType, updateForm])

  // Defaults of the item type (2026-10-14): units and attached items, unless the user already has rows of their own.
  const latest = useRef({})
  latest.current = { units: formState.form.units, relations }
  const memo = useRef({})
  const [typeDefaults, setTypeDefaults] = useState(null)
  useEffect(() => {
    const result = applyTypeDefaults(latest.current, itemType, memo.current)
    memo.current = result.memo
    if (result.units) updateForm('units', result.units)
    if (result.relations) setRelations(result.relations)
    if (result.applied.units || result.applied.relations) {
      setTypeDefaults({ typeName: itemType.name, units: result.applied.units, relations: result.applied.relations })
    }
  }, [itemType, updateForm])

  const instanceModes = useMemo(() => instanceModesForItemType(itemType), [itemType])
  useEffect(() => {
    setInstances((current) => (instanceModes.includes(current.mode) ? current : { ...current, mode: instanceModes[0] || '' }))
  }, [instanceModes])

  const state = useMemo(() => ({ form: formState.form, relations, instances }), [formState.form, instances, relations])
  const plan = useMemo(
    () => buildCreatePlan(state, itemType, { data: serializeAdditionalData(formState.additionalRows) }),
    [formState.additionalRows, itemType, state]
  )

  /* ----------------------------------- drafts ----------------------------------- */
  const { save: storeDraft, remove: removeDraft } = drafts
  const snapshotNow = useCallback((id) => toDraft({
    id, kind, step, form: formState.form, additionalRows: formState.additionalRows, relations, instances,
  }), [formState.additionalRows, formState.form, instances, kind, relations, step])

  /** Saves the answers as a draft (creating one if needed) and returns its id. */
  const saveDraft = useCallback(() => {
    const id = draftId || newDraftId()
    storeDraft(snapshotNow(id))
    setDraftId(id)
    return id
  }, [draftId, snapshotNow, storeDraft])

  // An open draft follows the edits (debounced), so coming back always restores the latest answers.
  useEffect(() => {
    if (!draftId || submission.locked) return undefined
    const timer = setTimeout(() => storeDraft(snapshotNow(draftId)), 500)
    return () => clearTimeout(timer)
  }, [draftId, snapshotNow, storeDraft, submission.locked])

  /* --------------------------------- navigation --------------------------------- */
  const validateStep = useCallback((id = step) => {
    const fieldErrors = STEP_ERROR_KEYS[id] ? formState.validate(STEP_ERROR_KEYS[id]) : {}
    const own = validateWizardStep(id, state, itemType)
    setStepErrors(own)
    return !Object.keys(fieldErrors).length && !Object.keys(own).length
  }, [formState, itemType, state, step])

  const goTo = useCallback((id) => {
    const target = steps.indexOf(id)
    if (target < 0) return false
    // Moving forward checks every step on the way; moving back is always allowed.
    for (const previous of steps.slice(steps.indexOf(step), target)) {
      if (!validateStep(previous)) {
        setStep(previous)
        return false
      }
    }
    setStepErrors({})
    setStep(id)
    return true
  }, [step, steps, validateStep])

  const submit = useCallback(async () => {
    for (const id of steps.slice(0, -1)) {
      if (!validateStep(id)) {
        setStep(id)
        return null
      }
    }
    const productId = await submission.run(plan)
    if (productId && draftId) removeDraft(draftId)
    return productId
  }, [draftId, plan, removeDraft, steps, submission, validateStep])

  return {
    steps,
    step,
    goTo,
    validateStep,
    formState,
    itemType: formState.form.item_type_id ? itemType : null,
    relations,
    setRelations,
    instances,
    setInstances,
    instanceModes,
    typeDefaults,
    stepErrors,
    plan,
    done: submission.done,
    locked: submission.locked,
    progress: submission.progress,
    error: submission.error,
    submitting: submission.submitting,
    submit,
    draftId,
    restoredDraft: snapshot,
    saveDraft,
    drafts: drafts.drafts.filter((item) => item.id !== draftId),
    removeDraft,
  }
}
