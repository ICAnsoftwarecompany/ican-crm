import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Search } from 'lucide-react'
import { Input } from '../../../../../../shared/components/ui/Input'
import { Avatar } from '../../../../../../shared/components/ui/Avatar'
import { cn } from '../../../../../../shared/utils/cn'
import { normalizeId, userLabel } from '../../../utils/teamModel'

/** All users, searchable, one selectable; shows which teams each user is in. */
export function UserChooser({ users, teams, value, onChange, error }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const teamsByUser = useMemo(() => {
    const map = new Map()
    teams.forEach((team) => [team.leaderId, ...team.memberIds].filter(Boolean).forEach((id) => map.set(id, [...(map.get(id) || []), team.name])))
    return map
  }, [teams])
  const needle = query.trim().toLowerCase()
  const visible = needle ? users.filter((user) => [userLabel(user), user.email, user.phone].filter(Boolean).join(' ').toLowerCase().includes(needle)) : users

  return (
    <div className="grid gap-2">
      <h3 className="text-sm font-medium text-[var(--text)]">{t('salesTeams.rules.targetUser')}</h3>
      <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('salesTeams.teams.searchUsers')} aria-label={t('salesTeams.teams.searchUsers')} startIcon={<Search size={15} />} />
      <div role="radiogroup" aria-label={t('salesTeams.rules.targetUser')} className="max-h-72 overflow-y-auto rounded-lg border border-[var(--border)]">
        {visible.length === 0 && <p className="p-4 text-center text-sm text-[var(--text-muted)]">{t('salesTeams.teams.noUsers')}</p>}
        {visible.map((user) => {
          const id = normalizeId(user.id)
          const selected = id === value
          const userTeams = teamsByUser.get(id) || []
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(id)}
              className={cn('flex w-full items-center gap-3 border-b border-[var(--border)] px-3 py-2 text-start last:border-b-0 transition-colors', selected ? 'bg-[var(--brand-accent-soft)]' : 'hover:bg-[var(--surface-2)]')}
            >
              <span className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded-full border', selected ? 'border-[var(--brand-accent)] bg-[var(--brand-accent)] text-white' : 'border-[var(--border)]')}>
                {selected && <Check size={11} aria-hidden="true" />}
              </span>
              <Avatar name={userLabel(user)} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-[var(--text)]">{userLabel(user)}</span>
                {user.email && <span className="block truncate text-xs text-[var(--text-muted)]" dir="ltr">{user.email}</span>}
              </span>
              <span className="max-w-[40%] truncate text-xs text-[var(--text-muted)]">{userTeams.length ? userTeams.join(' · ') : t('salesTeams.userChooser.noTeam')}</span>
            </button>
          )
        })}
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-300">{error}</p>}
    </div>
  )
}
