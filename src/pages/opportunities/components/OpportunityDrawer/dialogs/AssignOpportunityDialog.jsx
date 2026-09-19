import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { FormDialog } from '../../../../../shared/components/overlays/FormDialog'
import { Select } from '../../../../../shared/components/ui/Select'
import { useUsers, useTeams } from '../../../../../features/teams/hooks/useTeams'
import { useOpportunityMutations } from '../../../../../features/opportunities/hooks/useOpportunities'
import { extractMessage } from '../../../../../shared/utils/apiResponse'

export function AssignOpportunityDialog({ opportunity, onClose }) {
  const { t } = useTranslation()
  const usersQuery = useUsers()
  const teamsQuery = useTeams()
  const mutations = useOpportunityMutations()

  const [form, setForm] = useState({
    assigned_user_id: opportunity.assigned_user?.id || '',
    assigned_team_id: opportunity.assigned_team?.id || '',
  })

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = async () => {
    const selectedUser = (usersQuery.data || []).find((user) => String(user.id) === String(form.assigned_user_id))
    const selectedTeam = (teamsQuery.data || []).find((team) => String(team.id) === String(form.assigned_team_id))

    try {
      await mutations.assign.mutateAsync({
        id: opportunity.id,
        payload: {
          assigned_user: selectedUser ? { id: selectedUser.id, name: selectedUser.name || selectedUser.username } : null,
          assigned_team: selectedTeam ? { id: selectedTeam.id, name: selectedTeam.name } : null,
        },
      })
      toast.success(t('opportunities.dialogs.assign.successMsg'))
      onClose()
    } catch (error) {
      toast.error(extractMessage(error, t('opportunities.dialogs.assign.errorMsg')))
    }
  }

  return (
    <FormDialog
      open
      onClose={onClose}
      title={t('opportunities.dialogs.assign.title')}
      description={opportunity.customer?.name}
      submitText={t('opportunities.dialogs.assign.submit')}
      loading={mutations.assign.isPending}
      onSubmit={handleSubmit}
    >
      <Select
        label={t('opportunities.dialogs.assign.userLabel')}
        value={form.assigned_user_id}
        onChange={(value) => updateField('assigned_user_id', value)}
        options={(usersQuery.data || []).map((user) => ({ value: String(user.id), label: user.name || user.username || `#${user.id}` }))}
      />
      <Select
        label={t('opportunities.dialogs.assign.teamLabel')}
        value={form.assigned_team_id}
        onChange={(value) => updateField('assigned_team_id', value)}
        options={(teamsQuery.data || []).map((team) => ({ value: String(team.id), label: team.name || `#${team.id}` }))}
      />
    </FormDialog>
  )
}
