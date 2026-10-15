import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useLeadMutations } from '../../hooks/useLeads'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { buildToggleRulePayload } from '../utils/ruleModel'

/** Activate / deactivate a rule from its card (update endpoint with the full rule and the new `active`). */
export function useRuleToggle() {
  const { t } = useTranslation()
  const mutations = useLeadMutations()
  const [togglingId, setTogglingId] = useState('')

  const toggle = async (rule) => {
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

  return { togglingId, toggle }
}
