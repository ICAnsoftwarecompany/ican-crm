import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useLeadMutations } from '../../../hooks/useLeads'
import { extractMessage } from '../../../../../shared/utils/apiResponse'
import { applyRuleField, buildRulePayload } from '../../utils/ruleModel'
import { RULE_STEPS, firstInvalidStep, reachableSteps, stepErrors } from '../utils/ruleBuilder'

/**
 * State of the rule builder page: the form, the current step, per-step validation and save.
 * `initialForm` comes from the page (stored rule, or defaults such as a preset team). `onSaved` runs after a
 * successful create / update (the page navigates back to the rules list).
 */
export function useRuleBuilder({ initialForm, ruleId = '', onSaved }) {
  const { t } = useTranslation()
  const mutations = useLeadMutations()
  const isEdit = Boolean(ruleId)
  const [form, setForm] = useState(initialForm)
  const [step, setStep] = useState(RULE_STEPS[0])
  const [showErrors, setShowErrors] = useState(false)
  const [serverError, setServerError] = useState('')
  const [dirty, setDirty] = useState(false)

  const stepIndex = RULE_STEPS.indexOf(step)
  const reachable = reachableSteps(form)
  const errors = showErrors ? stepErrors(step, form) : {}

  const setField = (key, value) => {
    setForm((current) => applyRuleField(current, key, value))
    setDirty(true)
  }

  const goTo = (target) => {
    if (!reachable.includes(target)) return
    setShowErrors(false)
    setStep(target)
  }

  const next = () => {
    if (Object.keys(stepErrors(step, form)).length) {
      setShowErrors(true)
      return
    }
    setShowErrors(false)
    setStep(RULE_STEPS[Math.min(stepIndex + 1, RULE_STEPS.length - 1)])
  }

  const back = () => {
    setShowErrors(false)
    setStep(RULE_STEPS[Math.max(stepIndex - 1, 0)])
  }

  const submit = async () => {
    const invalid = firstInvalidStep(form)
    if (invalid) {
      setStep(invalid)
      setShowErrors(true)
      return
    }
    setServerError('')
    try {
      const payload = buildRulePayload(form)
      if (isEdit) await mutations.updateRule.mutateAsync({ id: ruleId, payload })
      else await mutations.createRule.mutateAsync(payload)
      toast.success(t(isEdit ? 'salesTeams.rules.updated' : 'salesTeams.rules.created'))
      setDirty(false)
      onSaved?.()
    } catch (error) {
      setServerError(extractMessage(error, t('salesTeams.rules.saveFailed')))
    }
  }

  return {
    form,
    step,
    stepIndex,
    steps: RULE_STEPS,
    reachable,
    errors,
    isEdit,
    dirty,
    isFirst: stepIndex === 0,
    isLast: stepIndex === RULE_STEPS.length - 1,
    saving: mutations.createRule.isPending || mutations.updateRule.isPending,
    serverError,
    setField,
    goTo,
    next,
    back,
    submit,
  }
}
