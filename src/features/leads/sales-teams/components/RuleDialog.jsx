import { useTranslation } from 'react-i18next'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { normalizeId, userLabel } from '../utils/teamModel'
import { targetOf } from '../utils/ruleModel'
import { AssignTypePicker } from './AssignTypePicker'
import { RuleConditionFields } from './RuleConditionFields'

/** Create / edit an assignment rule. `editor` = useRuleEditor(). Body = the backend example shape. */
export function RuleDialog({ editor, teams = [], users = [] }) {
  const { t } = useTranslation()
  const { form, errors, isEdit, setField } = editor
  const errorText = (key) => (errors[key] ? t(`salesTeams.errors.${errors[key]}`) : undefined)
  const target = targetOf(form.assign_type)
  const team = teams.find((item) => item.id === form.team_id)

  return (
    <FormDialog
      open
      onClose={editor.close}
      onSubmit={editor.submit}
      loading={editor.saving}
      size="lg"
      className="sm:max-w-2xl"
      title={isEdit ? t('salesTeams.rules.editTitle') : t('salesTeams.rules.createTitle')}
      description={t('salesTeams.rules.dialogDescription')}
      submitText={isEdit ? t('salesTeams.common.save') : t('salesTeams.rules.create')}
    >
      <div className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
          <Input
            label={t('salesTeams.rules.name')}
            value={form.name}
            onChange={(event) => setField('name', event.target.value)}
            placeholder={t('salesTeams.rules.namePlaceholder')}
            error={errorText('name')}
            autoFocus
          />
          <Input
            type="number"
            min="0"
            step="1"
            label={t('salesTeams.rules.priority')}
            value={form.priority}
            onChange={(event) => setField('priority', event.target.value)}
            error={errorText('priority')}
            hint={t('salesTeams.rules.priorityHint')}
          />
        </div>

        <RuleConditionFields form={form} setField={setField} />

        <AssignTypePicker value={form.assign_type} onChange={(value) => setField('assign_type', value)} error={errorText('assign_type')} />

        {target === 'user' ? (
          <Select
            label={t('salesTeams.rules.targetUser')}
            value={form.user_id}
            onChange={(value) => setField('user_id', value)}
            error={errorText('user_id')}
            options={users.map((user) => ({ value: normalizeId(user.id), label: userLabel(user) }))}
          />
        ) : (
          <div className="grid gap-1">
            <Select
              label={t('salesTeams.rules.targetTeam')}
              value={form.team_id}
              onChange={(value) => setField('team_id', value)}
              error={errorText('team_id')}
              options={teams.map((item) => ({
                value: item.id,
                label: item.active ? item.name : `${item.name} (${t('salesTeams.common.inactive')})`,
              }))}
            />
            {team && (
              <p className="text-xs text-[var(--text-muted)]">
                {form.assign_type === 'team_leader'
                  ? t('salesTeams.rules.teamLeaderPreview', { name: team.leader ? userLabel(team.leader) : t('salesTeams.teams.noLeader') })
                  : t('salesTeams.rules.teamPreview', { count: team.members.length })}
              </p>
            )}
          </div>
        )}

        <label className="inline-flex w-fit cursor-pointer items-center gap-2 text-sm text-[var(--text)]">
          <input type="checkbox" className="h-4 w-4 accent-[var(--brand-accent)]" checked={form.active} onChange={(event) => setField('active', event.target.checked)} />
          {t('salesTeams.rules.activeLabel')}
        </label>

        {editor.serverError && <p role="alert" className="text-sm text-red-600 dark:text-red-300">{editor.serverError}</p>}
      </div>
    </FormDialog>
  )
}
