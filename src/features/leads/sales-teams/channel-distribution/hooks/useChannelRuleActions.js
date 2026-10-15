import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { extractMessage } from '../../../../../shared/utils/apiResponse'
import { buildChannelRuleUpdate, nextChannelPriority } from '../utils/channelDistributionModel'

/**
 * Row actions on a channel's user rules: active toggle, new priority, swap with the neighbour (through a free
 * priority so a unique check never sees two rules on one number), delete. `busyId` = the rule being saved.
 */
export function useChannelRuleActions({ rules, mutations }) {
  const { t } = useTranslation()
  const [busyId, setBusyId] = useState('')

  const run = async (id, task, successKey) => {
    setBusyId(id)
    try {
      await task()
      toast.success(t(successKey))
      return true
    } catch (error) {
      toast.error(extractMessage(error, t('salesTeams.channels.rules.saveFailed')))
      return false
    } finally {
      setBusyId('')
    }
  }

  const update = (rule, patch) => mutations.updateRule.mutateAsync({ id: rule.id, payload: buildChannelRuleUpdate({ priority: rule.priority, active: rule.active, ...patch }) })

  return {
    busyId,
    toggle: (rule) => run(rule.id, () => update(rule, { active: !rule.active }), 'salesTeams.channels.rules.saved'),
    setPriority: (rule, priority) => run(rule.id, () => update(rule, { priority }), 'salesTeams.channels.rules.saved'),
    swap: (a, b) => run(a.id, async () => {
      const temp = nextChannelPriority(rules, a.channel, a.identifier)
      await update(a, { priority: temp })
      await update(b, { priority: a.priority })
      await update(a, { priority: b.priority })
    }, 'salesTeams.channels.rules.reordered'),
    remove: (rule) => run(rule.id, () => mutations.deleteRule.mutateAsync(rule.id), 'salesTeams.channels.rules.deleted'),
  }
}
