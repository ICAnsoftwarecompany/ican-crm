import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useTeamMutations } from '../../../teams'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { buildCreateTeamPayload, buildUpdateTeamPayload, diffMembers, normalizeId, toTeamForm, validateTeamForm } from '../utils/teamModel'

const CLOSED = { isOpen: false, team: null, form: toTeamForm(null), errors: {}, serverError: '' }

/**
 * Create / edit a team. Create = one JSON call (with type + members). Edit = FormData update (name, leader,
 * active), then attach / detach only the member differences.
 */
export function useTeamEditor() {
  const { t } = useTranslation()
  const mutations = useTeamMutations()
  const [state, setState] = useState(CLOSED)

  const open = (team = null) => setState({ ...CLOSED, isOpen: true, team, form: toTeamForm(team?.raw || null) })
  const close = () => setState(CLOSED)

  const setField = (key, value) => setState((current) => {
    const form = { ...current.form, [key]: value }
    if (key === 'team_leader_id') form.members = form.members.filter((id) => id !== normalizeId(value))
    return { ...current, form, errors: { ...current.errors, [key]: undefined } }
  })

  const toggleMember = (userId) => setState((current) => {
    const id = normalizeId(userId)
    if (!id || id === normalizeId(current.form.team_leader_id)) return current
    const members = current.form.members.includes(id) ? current.form.members.filter((item) => item !== id) : [...current.form.members, id]
    return { ...current, form: { ...current.form, members } }
  })

  const setMembers = (ids) => setState((current) => ({
    ...current,
    form: { ...current.form, members: [...new Set(ids.map(normalizeId))].filter((id) => id && id !== normalizeId(current.form.team_leader_id)) },
  }))

  const submit = async () => {
    const errors = validateTeamForm(state.form)
    if (Object.keys(errors).length) {
      setState((current) => ({ ...current, errors }))
      return
    }
    setState((current) => ({ ...current, serverError: '' }))
    try {
      if (state.team?.id) {
        await mutations.update.mutateAsync({ id: state.team.id, payload: buildUpdateTeamPayload(state.form) })
        const { attach, detach } = diffMembers(state.team.memberIds, state.form)
        if (attach.length) await mutations.attach.mutateAsync({ id: state.team.id, payload: { members: attach } })
        if (detach.length) await mutations.detach.mutateAsync({ id: state.team.id, payload: { members: detach } })
        toast.success(t('salesTeams.teams.updated'))
      } else {
        await mutations.create.mutateAsync(buildCreateTeamPayload(state.form))
        toast.success(t('salesTeams.teams.created'))
      }
      close()
    } catch (error) {
      setState((current) => ({ ...current, serverError: extractMessage(error, t('salesTeams.teams.saveFailed')) }))
    }
  }

  const saving = mutations.create.isPending || mutations.update.isPending || mutations.attach.isPending || mutations.detach.isPending

  return { ...state, isEdit: Boolean(state.team?.id), saving, open, close, setField, toggleMember, setMembers, submit }
}
