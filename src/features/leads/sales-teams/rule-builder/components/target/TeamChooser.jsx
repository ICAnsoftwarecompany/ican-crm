import { useTranslation } from 'react-i18next'
import { Check, Crown, Plus } from 'lucide-react'
import { Badge } from '../../../../../../shared/components/ui/Badge'
import { Button } from '../../../../../../shared/components/ui/Button'
import { cn } from '../../../../../../shared/utils/cn'
import { userLabel } from '../../../utils/teamModel'

/** Teams as selectable cards (active first) + a "quick team" button. */
export function TeamChooser({ teams, value, onChange, error, onQuickTeam, quickOpen }) {
  const { t } = useTranslation()
  const ordered = [...teams].sort((a, b) => Number(b.active) - Number(a.active))

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-[var(--text)]">{t('salesTeams.rules.targetTeam')}</h3>
        {!quickOpen && (
          <Button variant="outline" size="sm" onClick={onQuickTeam}>
            <Plus size={14} />
            {t('salesTeams.quickTeam.open')}
          </Button>
        )}
      </div>
      {ordered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--border)] p-4 text-center text-sm text-[var(--text-muted)]">{t('salesTeams.quickTeam.noTeams')}</p>
      ) : (
        <div role="radiogroup" aria-label={t('salesTeams.rules.targetTeam')} className="grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2">
          {ordered.map((team) => {
            const selected = team.id === value
            return (
              <button
                key={team.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(team.id)}
                className={cn('flex items-start gap-3 rounded-lg border p-3 text-start transition-colors', selected ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]' : 'border-[var(--border)] hover:bg-[var(--surface-2)]', !team.active && 'opacity-70')}
              >
                <span className={cn('mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border', selected ? 'border-[var(--brand-accent)] bg-[var(--brand-accent)] text-white' : 'border-[var(--border)]')}>
                  {selected && <Check size={11} aria-hidden="true" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="truncate text-sm font-semibold text-[var(--text)]">{team.name}</span>
                    {!team.active && <Badge variant="danger">{t('salesTeams.common.inactive')}</Badge>}
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-xs text-[var(--text-muted)]">
                    <Crown size={12} className="text-amber-600 dark:text-amber-300" aria-hidden="true" />
                    {team.leader ? userLabel(team.leader) : t('salesTeams.teams.noLeader')}
                    <span aria-hidden="true">·</span>
                    {t('salesTeams.teams.membersCount', { count: team.members.length })}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}
      {error && <p className="text-xs text-red-600 dark:text-red-300">{error}</p>}
    </div>
  )
}
