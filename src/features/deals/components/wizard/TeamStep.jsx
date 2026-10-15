import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Send, UsersRound } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { useTeams } from '../../../teams'
import { useUsers } from '../../../users'
import { TEAM_ROLES } from '../../constants/dealOptions'
import { addQuickTeamToMembers } from '../../utils/quickTeam'
import { QuickTeamDialog } from './QuickTeamDialog'
import { TeamPicker } from './TeamPicker'

const DEFAULT_ROLE = 'sales_rep'
const teamMembersOf = (team) => [team?.members, team?.users].find(Array.isArray) || []

/**
 * Step 4 — who works on the deal (2026-10-16). Two ways, usable together, sent in ONE request
 * (`POST /deals/team` with `users[]` and `teams[]`):
 * - ready teams: pick existing teams (everyone in the team joins with the chosen role);
 * - build the team: pick users one by one, each with a role.
 * The owner (step 2) can be added as manager automatically. No fitting team? "Quick team" creates one
 * (`POST /teams/create`, QuickTeamDialog) and adds it to the deal right away.
 */
export function TeamStep({ value, onChange, ownerId, errors = {} }) {
  const { t, i18n } = useTranslation()
  const usersQuery = useUsers()
  const teamsQuery = useTeams()
  const [quickOpen, setQuickOpen] = useState(false)
  const users = useMemo(() => (usersQuery.data || []).map((user) => ({ id: String(user.id), name: user.name || user.email || `#${user.id}`, meta: user.email && user.name ? user.email : '' })), [usersQuery.data])
  const teams = useMemo(() => (teamsQuery.data || []).map((team) => {
    const members = teamMembersOf(team)
    const count = Number(team.members_count ?? team.users_count ?? members.length) || 0
    const names = new Intl.ListFormat(i18n.language, { type: 'unit' }).format(members.slice(0, 3).map((member) => member.name || member.user?.name).filter(Boolean))
    return { id: String(team.id), name: team.name || `#${team.id}`, meta: [t('dealWorkspace.wizard.team.membersCount', { count }), names].filter(Boolean).join(' · ') }
  }), [i18n.language, t, teamsQuery.data])

  const selectedOf = (kind) => new Map(value.members.filter((member) => (member.kind === 'team') === (kind === 'team')).map((member) => [String(member.refId), member.role]))
  const selectedTeams = selectedOf('team')
  const selectedUsers = selectedOf('user')
  const owner = users.find((user) => user.id === String(ownerId))
  const lockedUsers = owner && value.addOwner ? new Map([[owner.id, t('dealWorkspace.wizard.team.ownerLocked')]]) : new Map()

  const toggle = (kind) => (id) => {
    const exists = value.members.some((member) => member.kind === kind && String(member.refId) === id)
    onChange({ members: exists ? value.members.filter((member) => !(member.kind === kind && String(member.refId) === id)) : [...value.members, { kind, refId: id, role: DEFAULT_ROLE }] })
  }
  const setRole = (kind) => (id, role) => onChange({ members: value.members.map((member) => (member.kind === kind && String(member.refId) === id ? { ...member, role } : member)) })

  const pickedUserIds = value.members.filter((member) => member.kind !== 'team').map((member) => String(member.refId))
  const onQuickCreated = ({ teamId, memberIds, replaceUsers }) => {
    onChange({ members: addQuickTeamToMembers(value.members, { teamId, memberIds, replaceUsers }) })
    setQuickOpen(false)
  }
  const quickButton = (variant) => (
    <Button type="button" size="sm" variant={variant} onClick={() => setQuickOpen(true)}><Plus size={14} />{t(variant === 'outline' ? 'dealWorkspace.wizard.team.quick.open' : 'dealWorkspace.wizard.team.quick.openEmpty')}</Button>
  )

  const userCount = selectedUsers.size + (lockedUsers.size && !selectedUsers.has(owner.id) ? 1 : 0)
  const teamCount = selectedTeams.size

  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-2">
        <TeamPicker
          title={t('dealWorkspace.wizard.team.teams.title')}
          description={t('dealWorkspace.wizard.team.teams.description')}
          items={teams}
          selected={selectedTeams}
          onToggle={toggle('team')}
          onRole={setRole('team')}
          isLoading={teamsQuery.isLoading}
          error={teamsQuery.error}
          onRetry={teamsQuery.refetch}
          emptyTitle={t('dealWorkspace.wizard.team.teams.emptyTitle')}
          emptyDescription={t('dealWorkspace.wizard.team.teams.emptyDescription')}
          headerAction={teams.length ? quickButton('outline') : null}
          emptyAction={quickButton('primary')}
        />
        <TeamPicker
          title={t('dealWorkspace.wizard.team.users.title')}
          description={t('dealWorkspace.wizard.team.users.description')}
          items={users}
          selected={selectedUsers}
          locked={lockedUsers}
          onToggle={toggle('user')}
          onRole={setRole('user')}
          isLoading={usersQuery.isLoading}
          error={usersQuery.error}
          onRetry={usersQuery.refetch}
          emptyTitle={t('dealWorkspace.wizard.team.users.emptyTitle')}
          emptyDescription={t('dealWorkspace.wizard.team.users.emptyDescription')}
        />
      </div>

      {owner && (
        <label className="flex items-start gap-2 text-sm text-[var(--text)]">
          <input type="checkbox" className="mt-1" checked={value.addOwner} onChange={(event) => onChange({ addOwner: event.target.checked })} />
          <span>
            {t('dealWorkspace.wizard.team.addOwner', { name: owner.name })}
            <span className="block text-xs text-[var(--text-muted)]">{t('dealWorkspace.wizard.team.addOwnerHint')}</span>
          </span>
        </label>
      )}

      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
        <h3 className="mb-2 text-sm font-bold text-[var(--text)]">{t('dealWorkspace.wizard.team.rolesTitle')}</h3>
        <dl className="grid gap-2 sm:grid-cols-3">
          {TEAM_ROLES.map((role) => (
            <div key={role} className="rounded-md bg-[var(--surface-2)] p-2">
              <dt className="text-xs font-semibold text-[var(--text)]">{t(`dealWorkspace.options.teamRole.${role}`)}</dt>
              <dd className="text-xs leading-5 text-[var(--text-muted)]">{t(`dealWorkspace.wizard.team.roleHints.${role}`)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-[var(--border)] p-3 text-sm text-[var(--text)]" role="status">
        {userCount || teamCount ? <Send size={15} className="text-[var(--brand-accent)]" /> : <UsersRound size={15} className="text-[var(--text-muted)]" />}
        {userCount || teamCount ? t('dealWorkspace.wizard.team.summary', { users: userCount, teams: teamCount }) : t('dealWorkspace.wizard.team.none')}
      </div>
      <QuickTeamDialog open={quickOpen} users={users} initialMemberIds={pickedUserIds} onClose={() => setQuickOpen(false)} onCreated={onQuickCreated} />
      {errors.members && <p className="text-xs text-red-600 dark:text-red-400">{t(`dealWorkspace.wizard.errors.${errors.members}`)}</p>}
      <p className="text-xs text-[var(--text-muted)]">{t('dealWorkspace.team.add.notifyHint')}</p>
    </div>
  )
}
