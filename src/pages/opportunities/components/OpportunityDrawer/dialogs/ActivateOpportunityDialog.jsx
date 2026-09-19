import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { FormDialog } from '../../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../../shared/components/ui/Input'
import { Select } from '../../../../../shared/components/ui/Select'
import { useUsers, useTeams } from '../../../../../features/teams/hooks/useTeams'
import { useOpportunityMutations } from '../../../../../features/opportunities/hooks/useOpportunities'
import { extractMessage } from '../../../../../shared/utils/apiResponse'

export function ActivateOpportunityDialog({ opportunity, onClose }) {
  const { t } = useTranslation()
  const usersQuery = useUsers()
  const teamsQuery = useTeams()
  const mutations = useOpportunityMutations()

  const nextActionOptions = [
    { value: 'call_customer', label: t('opportunities.dialogs.activate.nextActionOptions.call_customer') },
    { value: 'send_proposal', label: t('opportunities.dialogs.activate.nextActionOptions.send_proposal') },
    { value: 'schedule_meeting', label: t('opportunities.dialogs.activate.nextActionOptions.schedule_meeting') },
    { value: 'send_email', label: t('opportunities.dialogs.activate.nextActionOptions.send_email') },
  ]

  const [form, setForm] = useState({
    estimated_value: opportunity.estimated_value || '',
    assigned_user_id: opportunity.assigned_user?.id || '',
    assigned_team_id: opportunity.assigned_team?.id || '',
    next_action_type: 'call_customer',
    next_action_at: '',
  })

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = async () => {
    const selectedUser = (usersQuery.data || []).find((user) => String(user.id) === String(form.assigned_user_id))
    const selectedTeam = (teamsQuery.data || []).find((team) => String(team.id) === String(form.assigned_team_id))
    const actionMeta = nextActionOptions.find((item) => item.value === form.next_action_type)

    try {
      await mutations.activate.mutateAsync({
        id: opportunity.id,
        payload: {
          estimated_value: Number(form.estimated_value) || opportunity.estimated_value,
          assigned_user: selectedUser
            ? { id: selectedUser.id, name: selectedUser.name || selectedUser.username }
            : opportunity.assigned_user,
          assigned_team: selectedTeam
            ? { id: selectedTeam.id, name: selectedTeam.name }
            : opportunity.assigned_team,
          next_action: form.next_action_at
            ? { label: actionMeta?.label, due_at: form.next_action_at }
            : opportunity.next_action,
        },
      })
      toast.success(t('opportunities.dialogs.activate.successMsg'))
      onClose()
    } catch (error) {
      toast.error(extractMessage(error, t('opportunities.dialogs.activate.errorMsg')))
    }
  }

  return (
    <FormDialog
      open
      onClose={onClose}
      title={t('opportunities.dialogs.activate.title')}
      description={opportunity.customer?.name}
      submitText={t('opportunities.dialogs.activate.submit')}
      loading={mutations.activate.isPending}
      onSubmit={handleSubmit}
    >
      <Input label={t('opportunities.dialogs.activate.productLabel')} value={opportunity.product?.name || ''} disabled readOnly />
      <Input
        label={t('opportunities.dialogs.activate.estimatedValueLabel')}
        type="number"
        value={form.estimated_value}
        onChange={(event) => updateField('estimated_value', event.target.value)}
      />
      <Select
        label={t('opportunities.dialogs.activate.assignToLabel')}
        value={form.assigned_user_id}
        onChange={(value) => updateField('assigned_user_id', value)}
        options={(usersQuery.data || []).map((user) => ({ value: String(user.id), label: user.name || user.username || `#${user.id}` }))}
      />
      <Select
        label={t('opportunities.dialogs.activate.teamLabel')}
        value={form.assigned_team_id}
        onChange={(value) => updateField('assigned_team_id', value)}
        options={(teamsQuery.data || []).map((team) => ({ value: String(team.id), label: team.name || `#${team.id}` }))}
      />
      <Select
        label={t('opportunities.dialogs.activate.nextActionLabel')}
        value={form.next_action_type}
        onChange={(value) => updateField('next_action_type', value)}
        options={nextActionOptions}
      />
      <Input
        label={t('opportunities.dialogs.activate.nextActionAtLabel')}
        type="datetime-local"
        value={form.next_action_at}
        onChange={(event) => updateField('next_action_at', event.target.value)}
      />
    </FormDialog>
  )
}
