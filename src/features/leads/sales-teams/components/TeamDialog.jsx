import { useTranslation } from 'react-i18next'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { TEAM_TYPES, normalizeId, userLabel } from '../utils/teamModel'
import { TeamMembersPicker } from './TeamMembersPicker'

/** Create / edit team. `editor` = useTeamEditor(). The type can only be set on create (update has no `type`). */
export function TeamDialog({ editor, users, usersLoading }) {
  const { t } = useTranslation()
  const { form, errors, isEdit } = editor
  const errorText = (key) => (errors[key] ? t(`salesTeams.errors.${errors[key]}`) : undefined)

  return (
    <FormDialog
      open
      onClose={editor.close}
      onSubmit={editor.submit}
      loading={editor.saving}
      size="lg"
      className="sm:max-w-xl"
      title={isEdit ? t('salesTeams.teams.editTitle') : t('salesTeams.teams.createTitle')}
      description={t('salesTeams.teams.dialogDescription')}
      submitText={isEdit ? t('salesTeams.common.save') : t('salesTeams.teams.create')}
    >
      <div className="grid gap-4">
        <Input
          label={t('salesTeams.teams.name')}
          value={form.name}
          onChange={(event) => editor.setField('name', event.target.value)}
          placeholder={t('salesTeams.teams.namePlaceholder')}
          error={errorText('name')}
          autoFocus
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <Select
              label={t('salesTeams.teams.type')}
              value={form.type}
              onChange={(value) => editor.setField('type', value)}
              disabled={isEdit}
              error={errorText('type')}
              options={TEAM_TYPES.map((type) => ({ value: type, label: t(`salesTeams.teamTypes.${type}.label`) }))}
            />
            <p className="text-xs text-[var(--text-muted)]">
              {isEdit ? t('salesTeams.teams.typeLocked') : t(`salesTeams.teamTypes.${form.type}.hint`, { defaultValue: '' })}
            </p>
          </div>
          <Select
            label={t('salesTeams.teams.leader')}
            value={form.team_leader_id}
            onChange={(value) => editor.setField('team_leader_id', value)}
            placeholder={usersLoading ? t('salesTeams.common.loading') : t('salesTeams.teams.noLeader')}
            options={users.map((user) => ({ value: normalizeId(user.id), label: userLabel(user) }))}
          />
        </div>

        <label className="inline-flex w-fit cursor-pointer items-center gap-2 text-sm text-[var(--text)]">
          <input type="checkbox" className="h-4 w-4 accent-[var(--brand-accent)]" checked={form.active} onChange={(event) => editor.setField('active', event.target.checked)} />
          {t('salesTeams.teams.activeLabel')}
        </label>

        <TeamMembersPicker
          users={users}
          loading={usersLoading}
          selected={form.members}
          leaderId={normalizeId(form.team_leader_id)}
          onToggle={editor.toggleMember}
          onSetAll={editor.setMembers}
        />

        {editor.serverError && <p role="alert" className="text-sm text-red-600 dark:text-red-300">{editor.serverError}</p>}
      </div>
    </FormDialog>
  )
}
