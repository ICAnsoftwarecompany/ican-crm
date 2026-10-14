import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PRODUCT_KINDS } from '../../constants/catalogOptions'
import { useItemType, useItemTypeMutations, useUnits } from '../../hooks/useCatalogSetup'
import { usePersistentFlag } from '../../hooks/usePersistentFlag'
import { formatApiError } from '../../utils/apiErrors'
import { buildItemTypePayload, itemTypeToForm, newTypeUnitRow } from '../utils/itemTypeForm'
import { getCreatedId } from '../../utils/catalogPayloads'
import {
  applyTemplate,
  blankFormForKind,
  firstInvalidTypeStep,
  getTypeSteps,
  toggleCapability,
  validateTypeStep,
} from '../utils/itemTypeWizard'

/** Only in-app paths are accepted as `returnTo` (no `//host` or absolute URLs). */
function safeReturnTo(value) {
  return typeof value === 'string' && /^\/(?!\/)/.test(value) ? value : ''
}

/**
 * State of the item type wizard (2026-10-14). `mode` is `create` (`/products/item-types/new?kind=&returnTo=`) or
 * `edit` (`/products/item-types/:id`). Saving is one request; with `returnTo` the user goes back to the product
 * wizard with `?item_type=<id>`, otherwise a success panel offers the next step.
 */
export function useItemTypeWizard({ mode = 'create', itemTypeId, initialKind, returnTo, t }) {
  const navigate = useNavigate()
  const mutations = useItemTypeMutations()
  const unitsQuery = useUnits()
  const itemTypeQuery = useItemType(mode === 'edit' ? itemTypeId : null)
  const startKind = PRODUCT_KINDS.includes(initialKind) ? initialKind : 'product'

  const [form, setForm] = useState(() => blankFormForKind(startKind))
  const [loaded, setLoaded] = useState(mode === 'create')
  const [choice, setChoice] = useState(null) // null | 'manual' | template id
  const [missingUnits, setMissingUnits] = useState([])
  const [step, setStep] = useState(mode === 'edit' ? 'basics' : 'kind')
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [saved, setSaved] = useState(null)
  const [tutorial, setTutorial] = usePersistentFlag('type-tutorial', true)
  const [templatesHidden, setTemplatesHidden] = usePersistentFlag('type-templates-hidden', false)

  useEffect(() => {
    if (mode !== 'edit' || loaded || !itemTypeQuery.data) return
    setForm(itemTypeToForm(itemTypeQuery.data))
    setLoaded(true)
  }, [itemTypeQuery.data, loaded, mode])

  const steps = useMemo(() => getTypeSteps(form, { mode }), [form, mode])
  // A step can disappear (units when "unique unit" is turned on); fall back to the closest one.
  const currentStep = steps.includes(step) ? step : steps[Math.min(steps.length - 1, Math.max(0, steps.indexOf('relations')))]
  const index = steps.indexOf(currentStep)
  const units = useMemo(() => unitsQuery.data || [], [unitsQuery.data])

  // A template picked before the units list loaded: match its suggested units once they arrive.
  useEffect(() => {
    if (!missingUnits.length || !units.length) return
    const byCode = new Map(units.map((unit) => [String(unit.code).toLowerCase(), unit]))
    const found = missingUnits.filter((suggestion) => byCode.has(suggestion.code))
    if (!found.length) return
    setForm((current) => ({
      ...current,
      units: [...current.units, ...found.map((suggestion) => newTypeUnitRow({ unit_id: String(byCode.get(suggestion.code).id), factor: String(suggestion.factor) }))],
    }))
    setMissingUnits((current) => current.filter((suggestion) => !byCode.has(suggestion.code)))
  }, [missingUnits, units])

  const update = useCallback((patch) => setForm((current) => ({ ...current, ...patch })), [])
  const toggle = useCallback((code, on) => setForm((current) => toggleCapability(current, code, on)), [])
  const setCapabilityConfig = useCallback((code, patch) => setForm((current) => ({
    ...current,
    capabilities: current.capabilities.map((capability) => (capability.code === code ? { ...capability, ...patch } : capability)),
  })), [])

  const chooseKind = useCallback((kind) => {
    if (kind === form.kind) return
    setForm((current) => ({ ...blankFormForKind(kind), name: current.name, description: current.description }))
    setChoice(null)
    setMissingUnits([])
  }, [form.kind])

  const goTo = useCallback((target) => {
    const targetIndex = steps.indexOf(target)
    if (targetIndex < 0) return false
    if (targetIndex > index) {
      const invalid = firstInvalidTypeStep(form, { mode, target })
      if (invalid) {
        setErrors(validateTypeStep(invalid, form, { mode }))
        setStep(invalid)
        return false
      }
    }
    setErrors({})
    setStep(target)
    return true
  }, [form, index, mode, steps])

  const next = useCallback(() => {
    if (index < 0 || index >= steps.length - 1) return
    const own = validateTypeStep(currentStep, form, { mode })
    if (Object.keys(own).length) return setErrors(own)
    if (currentStep === 'kind' && !choice) setChoice('manual')
    setErrors({})
    setStep(steps[index + 1])
  }, [choice, currentStep, form, index, mode, steps])

  const back = useCallback(() => {
    setErrors({})
    if (index > 0) setStep(steps[index - 1])
  }, [index, steps])

  const pickTemplate = useCallback((template) => {
    const result = applyTemplate(template, {
      name: form.name || t(`catalogSetup.templates.${template.id}.name`),
      description: form.description || t(`catalogSetup.templates.${template.id}.description`),
      units,
    })
    setForm(result.form)
    setMissingUnits(result.missingUnits)
    setChoice(template.id)
    setErrors({})
    setStep('basics')
  }, [form.description, form.name, t, units])

  const startManual = useCallback(() => {
    setForm((current) => ({ ...blankFormForKind(current.kind), name: current.template_id ? '' : current.name, description: current.template_id ? '' : current.description }))
    setMissingUnits([])
    setChoice('manual')
    setErrors({})
    setStep('basics')
  }, [])

  /** A unit created from the units step: added as a row (and dropped from the template's missing list). */
  const addCreatedUnit = useCallback((unitId, suggestion) => {
    if (!unitId) return
    setForm((current) => ({
      ...current,
      units: [...current.units, { key: `type-unit-new-${unitId}`, unit_id: String(unitId), factor: suggestion ? String(suggestion.factor) : '', is_default: false }],
    }))
    if (suggestion) setMissingUnits((current) => current.filter((item) => item.code !== suggestion.code))
  }, [])

  const submitting = mutations.create.isPending || mutations.update.isPending

  const submit = useCallback(async () => {
    setSubmitError('')
    const invalid = firstInvalidTypeStep(form, { mode, target: 'review' })
    if (invalid) {
      setErrors(validateTypeStep(invalid, form, { mode }))
      setStep(invalid)
      return
    }
    let payload
    try {
      payload = buildItemTypePayload(form, { mode: mode === 'edit' ? 'update' : 'create' })
    } catch {
      setStep('capabilities')
      return
    }
    try {
      let id = itemTypeId
      if (mode === 'edit') await mutations.update.mutateAsync({ id: itemTypeId, payload })
      else id = getCreatedId(await mutations.create.mutateAsync(payload))
      const back = safeReturnTo(returnTo)
      if (back && id) {
        const separator = back.includes('?') ? '&' : '?'
        navigate(`${back}${separator}item_type=${encodeURIComponent(id)}`)
        return
      }
      setSaved({ id, kind: form.kind, name: form.name })
    } catch (error) {
      setSubmitError(formatApiError(error, t('catalog.common.saveFailed')))
    }
  }, [form, itemTypeId, mode, mutations.create, mutations.update, navigate, returnTo, t])

  return {
    mode,
    form,
    update,
    toggle,
    setCapabilityConfig,
    steps,
    step: currentStep,
    index,
    goTo,
    next,
    back,
    errors,
    choice,
    chooseKind,
    pickTemplate,
    startManual,
    missingUnits,
    addCreatedUnit,
    units,
    unitsLoading: unitsQuery.isLoading,
    loading: mode === 'edit' && !loaded && itemTypeQuery.isLoading,
    loadError: mode === 'edit' && !loaded ? itemTypeQuery.error : null,
    notFound: mode === 'edit' && !loaded && itemTypeQuery.isSuccess && !itemTypeQuery.data,
    retryLoad: () => itemTypeQuery.refetch(),
    tutorial,
    setTutorial,
    templatesHidden,
    setTemplatesHidden,
    submit,
    submitting,
    submitError,
    saved,
    returnTo: safeReturnTo(returnTo),
  }
}
