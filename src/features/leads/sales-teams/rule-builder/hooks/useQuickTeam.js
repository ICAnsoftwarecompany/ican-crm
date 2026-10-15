import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTeamMutations } from '../../../../teams'
import { QUERY_KEYS } from '../../../../../shared/constants/queryKeys'
import { extractMessage } from '../../../../../shared/utils/apiResponse'
import { buildCreateTeamPayload, findCreatedTeamId, normalizeId, toTeamForm, validateTeamForm } from '../../utils/teamModel'
import { extractRows } from '../../utils/ruleSources'

/**
 * "Quick team" inside the rule builder: create a team with POST teams/create (name, type, leader, members), refresh
 * the teams list, then hand the new team id to `onCreated` so the rule selects it.
 */
export function useQuickTeam({ onCreated }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { create } = useTeamMutations()
  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')

  const open = (defaults = {}) => {
    setForm({ ...toTeamForm(null), ...defaults })
    setErrors({})
    setServerError('')
  }
  const close = () => setForm(null)

  const setField = (key, value) => setForm((current) => {
    const next = { ...current, [key]: value }
    if (key === 'team_leader_id') next.members = next.members.filter((id) => id !== normalizeId(value))
    return next
  })
  const toggleMember = (userId) => setForm((current) => {
    const id = normalizeId(userId)
    if (!id || id === normalizeId(current.team_leader_id)) return current
    return { ...current, members: current.members.includes(id) ? current.members.filter((item) => item !== id) : [...current.members, id] }
  })
  const setMembers = (ids) => setForm((current) => ({ ...current, members: [...new Set(ids.map(normalizeId))].filter((id) => id && id !== normalizeId(current.team_leader_id)) }))

  const submit = async () => {
    const found = validateTeamForm(form)
    if (Object.keys(found).length) {
      setErrors(found)
      return
    }
    setServerError('')
    try {
      const response = await create.mutateAsync(buildCreateTeamPayload(form))
      await queryClient.refetchQueries({ queryKey: QUERY_KEYS.teams.list })
      const teams = extractRows(queryClient.getQueryData(QUERY_KEYS.teams.list), ['teams'])
      const id = findCreatedTeamId(response, teams, form.name)
      toast.success(t('salesTeams.teams.created'))
      setForm(null)
      onCreated?.(id)
    } catch (error) {
      setServerError(extractMessage(error, t('salesTeams.teams.saveFailed')))
    }
  }

  return { isOpen: Boolean(form), form, errors, serverError, saving: create.isPending, open, close, setField, toggleMember, setMembers, submit }
}
