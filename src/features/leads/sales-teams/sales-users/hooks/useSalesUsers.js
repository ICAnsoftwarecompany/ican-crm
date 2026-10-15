import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useUserMutations, useUsers } from '../../../../users'
import { extractMessage } from '../../../../../shared/utils/apiResponse'
import { buildUserFieldPayload, normalizeSalesUser, priorityUpdateSteps, sortByPriority, swapPlan } from '../utils/salesUsersModel'

/**
 * Users for the sales users page + one-field updates. `savingKey` = `${userId}:${field}` while a field saves;
 * `bulk` = { done, total } while several updates run (swap, renumber). Updates run one after another.
 */
export function useSalesUsers() {
  const { t } = useTranslation()
  const query = useUsers()
  const { update } = useUserMutations()
  const [savingKey, setSavingKey] = useState('')
  const [bulk, setBulk] = useState(null)
  const users = useMemo(() => sortByPriority((query.data || []).map(normalizeSalesUser)), [query.data])

  const send = (user, field, value) => update.mutateAsync({ id: user.id, payload: buildUserFieldPayload(user, field, value) })

  const updateField = async (user, field, value) => {
    setSavingKey(`${user.id}:${field}`)
    try {
      await send(user, field, value)
      toast.success(t('salesTeams.salesUsers.saved', { name: user.name }))
      return true
    } catch (error) {
      toast.error(extractMessage(error, t('salesTeams.salesUsers.saveFailed')))
      return false
    } finally {
      setSavingKey('')
    }
  }

  /**
   * Several priority changes. Users whose current rank is the new rank of another user in the plan are cleared (0)
   * first, so a backend that enforces unique priorities never sees two users on the same rank.
   */
  const applyPriorities = async (plan, successKey) => {
    const steps = priorityUpdateSteps(plan)
    setBulk({ done: 0, total: steps.length })
    try {
      for (const [index, step] of steps.entries()) {
        await send(step.user, 'priority', step.priority)
        setBulk({ done: index + 1, total: steps.length })
      }
      toast.success(t(successKey))
      return true
    } catch (error) {
      toast.error(extractMessage(error, t('salesTeams.salesUsers.saveFailed')))
      return false
    } finally {
      setBulk(null)
      query.refetch()
    }
  }

  return {
    query,
    users,
    savingKey,
    bulk,
    updateField,
    swap: (a, b) => applyPriorities(swapPlan(a, b), 'salesTeams.salesUsers.swapped'),
    applyPriorities,
  }
}
