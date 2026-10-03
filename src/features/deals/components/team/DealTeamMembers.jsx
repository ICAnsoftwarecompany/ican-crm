import { useTranslation } from 'react-i18next'
import { Trash2, User, Users } from 'lucide-react'
import { Avatar } from '../../../../shared/components/ui/Avatar'
import { Badge } from '../../../../shared/components/ui/Badge'

const ROLE_VARIANTS = { manager: 'purple', sales_rep: 'info', viewer: 'default' }

/** Teams (with their members) and individual users on the deal, each with a role and a remove button. */
export function DealTeamMembers({ members, workloadById, onRemove }) {
  const { t } = useTranslation()
  const teams = members.filter((member) => member.kind === 'team')
  const users = members.filter((member) => member.kind === 'user')

  const role = (member) => <Badge variant={ROLE_VARIANTS[member.role] || 'default'}>{t(`dealWorkspace.options.teamRole.${member.role}`, member.role)}</Badge>
  const removeButton = (member) => (
    <button type="button" onClick={() => onRemove(member)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-red-600" aria-label={t('dealWorkspace.team.remove')} title={t('dealWorkspace.team.remove')}>
      <Trash2 size={15} />
    </button>
  )
  const openLeads = (id) => t('dealWorkspace.team.openLeads', { count: workloadById.get(String(id)) || 0 })

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {teams.map((team) => (
        <section key={team.id} className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <header className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]"><Users size={17} /></span>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-[var(--text)]">{team.name || `#${team.refId}`}</h3>
                <p className="text-xs text-[var(--text-muted)]">{t('dealWorkspace.team.membersCount', { count: team.members.length })}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">{role(team)}{removeButton(team)}</div>
          </header>
          <ul className="space-y-1">
            {team.members.map((person) => (
              <li key={person.id} className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-[var(--surface-2)]">
                <span className="flex min-w-0 items-center gap-2 text-sm text-[var(--text)]"><Avatar name={person.name} size="sm" /><span className="truncate">{person.name || `#${person.id}`}</span></span>
                <span className="text-xs text-[var(--text-muted)]">{openLeads(person.id)}</span>
              </li>
            ))}
            {!team.members.length && <li className="text-xs text-[var(--text-muted)]">{t('dealWorkspace.team.noMembersLoaded')}</li>}
          </ul>
        </section>
      ))}
      {users.length > 0 && (
        <section className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text)]"><User size={16} />{t('dealWorkspace.team.individuals')}</h3>
          <ul className="space-y-1">
            {users.map((member) => (
              <li key={member.id} className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-[var(--surface-2)]">
                <span className="flex min-w-0 items-center gap-2 text-sm text-[var(--text)]"><Avatar name={member.name} size="sm" /><span className="truncate">{member.name || `#${member.refId}`}</span></span>
                <span className="flex items-center gap-2"><span className="hidden text-xs text-[var(--text-muted)] sm:inline">{openLeads(member.refId)}</span>{role(member)}{removeButton(member)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
