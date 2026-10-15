import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useLeadMutations } from '../../hooks/useLeads'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { applyRuleField, buildRulePayload, buildToggleRulePayload, toRuleForm, validateRuleForm } from '../utils/ruleModel'

const CLOSED = { isOpen: false, rule: null, form: toRuleForm(null), errors: {}, serverError: '' }

/** Create / edit an assignment rule, plus the inline active toggle (update endpoint with the full rule). */
export function useRuleEditor() {
  const { t } = useTranslation()
  const mutations = useLeadMutations()
  const [state, setState] = useState(CLOSED)
  const [togglingId, setTogglingId] = useState('')

  /** `defaults` pre-fills a new rule, e.g. `{ team_id }` from a team card. */
  const open = (rule = null, defaults = {}) => setState({ ...CLOSED, isOpen: true, rule, form: toRuleForm(rule, defaults) })
  const close = () => setState(CLOSED)

  const setField = (key, value) => setState((current) => ({
    ...current,
    form: applyRuleField(current.form, key, value),
    errors: { ...current.errors, [key]: undefined, ...(key === 'assign_type' ? { team_id: undefined, user_id: undefined } : {}) },
  }))

  const submit = async () => {
    const errors = validateRuleForm(state.form)
    if (Object.keys(errors).length) {
      setState((current) => ({ ...current, errors }))
      return
    }
    setState((current) => ({ ...current, serverError: '' }))
    try {
      const payload = buildRulePayload(state.form)
      if (state.rule?.id) {
        await mutations.updateRule.mutateAsync({ id: state.rule.id, payload })
        toast.success(t('salesTeams.rules.updated'))
      } else {
        await mutations.createRule.mutateAsync(payload)
        toast.success(t('salesTeams.rules.created'))
      }
      close()
    } catch (error) {
      setState((current) => ({ ...current, serverError: extractMessage(error, t('salesTeams.rules.saveFailed')) }))
    }
  }

  const toggleActive = async (rule) => {
    if (!rule?.id) return
    setTogglingId(rule.id)
    try {
      await mutations.updateRule.mutateAsync({ id: rule.id, payload: buildToggleRulePayload(rule, !rule.active) })
      toast.success(t(rule.active ? 'salesTeams.rules.deactivated' : 'salesTeams.rules.activated'))
    } catch (error) {
      toast.error(extractMessage(error, t('salesTeams.rules.saveFailed')))
    } finally {
      setTogglingId('')
    }
  }

  const saving = mutations.createRule.isPending || (mutations.updateRule.isPending && !togglingId)

  return { ...state, isEdit: Boolean(state.rule?.id), saving, togglingId, open, close, setField, submit, toggleActive }
}
