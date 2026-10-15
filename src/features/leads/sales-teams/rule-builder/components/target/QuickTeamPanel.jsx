import { useTranslation } from 'react-i18next'
import { UsersRound } from 'lucide-react'
import { Input } from '../../../../../../shared/components/ui/Input'
import { Select } from '../../../../../../shared/components/ui/Select'
import { Button } from '../../../../../../shared/components/ui/Button'
import { TEAM_TYPES, normalizeId, userLabel } from '../../../utils/teamModel'
import { TeamMembersPicker } from '../../../components/TeamMembersPicker'

/** Inline "quick team" form: name, type, leader and members from all users. `quick` = useQuickTeam(). */
export function QuickTeamPanel({ quick, users, usersLoading }) {
  const { t } = useTranslation()
  const { form, errors } = quick

  return (
    <section className="grid gap-3 rounded-lg border border-[var(--brand-accent)] bg-[var(--surface)] p-4" aria-labelledby="quick-team-title">
      <header className="flex items-start gap-2">
        <UsersRound size={18} className="mt-0.5 shrink-0 text-[var(--brand-accent)]" aria-hidden="true" />
        <div>
          <h3 id="quick-team-title" className="text-sm font-bold text-[var(--text)]">{t('salesTeams.quickTeam.title')}</h3>
          <p className="mt-0.5 text-xs leading-5 text-[var(--text-muted)]">{t('salesTeams.quickTeam.description')}</p>
        </div>
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          label={t('salesTeams.teams.name')}
          value={form.name}
          onChange={(event) => quick.setField('name', event.target.value)}
          placeholder={t('salesTeams.teams.namePlaceholder')}
          error={errors.name ? t(`salesTeams.errors.${errors.name}`) : undefined}
          autoFocus
        />
        <Select
          label={t('salesTeams.teams.type')}
          value={form.type}
          onChange={(value) => quick.setField('type', value)}
          options={TEAM_TYPES.map((type) => ({ value: type, label: t(`salesTeams.teamTypes.${type}.label`) }))}
        />
        <Select
          label={t('salesTeams.teams.leader')}
          value={form.team_leader_id}
          onChange={(value) => quick.setField('team_leader_id', value)}
          placeholder={t('salesTeams.teams.noLeader')}
          options={users.map((user) => ({ value: normalizeId(user.id), label: userLabel(user) }))}
        />
      </div>
      <TeamMembersPicker
        users={users}
        loading={usersLoading}
        selected={form.members}
        leaderId={normalizeId(form.team_leader_id)}
        onToggle={quick.toggleMember}
        onSetAll={quick.setMembers}
      />
      {quick.serverError && <p role="alert" className="text-sm text-red-600 dark:text-red-300">{quick.serverError}</p>}
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="ghost" onClick={quick.close} disabled={quick.saving}>{t('salesTeams.quickTeam.cancel')}</Button>
        <Button variant="accent" onClick={quick.submit} loading={quick.saving}>{t('salesTeams.quickTeam.create')}</Button>
      </div>
    </section>
  )
}
