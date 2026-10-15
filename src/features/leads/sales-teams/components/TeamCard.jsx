import { useTranslation } from 'react-i18next'
import { Crown, GitBranch, Pencil, Plus } from 'lucide-react'
import { Avatar } from '../../../../shared/components/ui/Avatar'
import { Badge } from '../../../../shared/components/ui/Badge'
import { Button } from '../../../../shared/components/ui/Button'
import { userLabel } from '../utils/teamModel'

const MAX_AVATARS = 6

/** One team: type, status, leader, members and how many distribution rules route leads to it. */
export function TeamCard({ team, ruleCount, onEdit, onAddRule, onShowRules }) {
  const { t } = useTranslation()
  const shown = team.members.slice(0, MAX_AVATARS)
  const hidden = team.members.length - shown.length
  const activeRules = ruleCount?.active || 0

  return (
    <article className="flex min-w-0 flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="break-words text-base font-bold text-[var(--text)]">{team.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge variant="info">{t(`salesTeams.teamTypes.${team.type}.label`, { defaultValue: team.type })}</Badge>
            <Badge variant={team.active ? 'success' : 'danger'}>{t(team.active ? 'salesTeams.common.active' : 'salesTeams.common.inactive')}</Badge>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onEdit} aria-label={t('salesTeams.teams.editNamed', { name: team.name })} title={t('salesTeams.teams.edit')}>
          <Pencil size={16} />
        </Button>
      </header>

      <div className="flex items-center gap-2 rounded-lg bg-[var(--surface-2)] px-3 py-2 text-sm">
        <Crown size={15} className="shrink-0 text-amber-600 dark:text-amber-300" aria-hidden="true" />
        <span className="text-[var(--text-muted)]">{t('salesTeams.teams.leader')}:</span>
        <span className="min-w-0 truncate font-semibold text-[var(--text)]">{team.leader ? userLabel(team.leader) : t('salesTeams.teams.noLeader')}</span>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-semibold text-[var(--text-muted)]">{t('salesTeams.teams.membersCount', { count: team.members.length })}</p>
        {team.members.length ? (
          <div className="flex flex-wrap items-center gap-1">
            {shown.map((member) => (
              <span key={member.id} title={userLabel(member)}><Avatar name={userLabel(member)} src={member.avatar || member.image || undefined} size="sm" /></span>
            ))}
            {hidden > 0 && <span className="rounded-full bg-[var(--surface-2)] px-2 py-1 text-xs font-semibold text-[var(--text-muted)]">+{hidden}</span>}
          </div>
        ) : (
          <p className="text-xs text-[var(--text-light)]">{t('salesTeams.teams.noMembers')}</p>
        )}
      </div>

      <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] pt-3">
        <button type="button" onClick={onShowRules} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)]">
          <GitBranch size={14} aria-hidden="true" />
          {activeRules ? t('salesTeams.teams.receivesFrom', { count: activeRules }) : t('salesTeams.teams.noRules')}
        </button>
        <Button variant="outline" size="sm" onClick={onAddRule}>
          <Plus size={14} />
          {t('salesTeams.teams.addRule')}
        </Button>
      </footer>
    </article>
  )
}
