import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Crown, Search } from 'lucide-react'
import { Input } from '../../../../shared/components/ui/Input'
import { Avatar } from '../../../../shared/components/ui/Avatar'
import { Skeleton } from '../../../../shared/components/feedback/Skeleton'
import { cn } from '../../../../shared/utils/cn'
import { normalizeId, userLabel } from '../utils/teamModel'

/** Searchable checkbox list of users. The leader is shown but cannot be picked as a member. */
export function TeamMembersPicker({ users = [], loading, selected = [], leaderId, onToggle, onSetAll }) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const selectedSet = new Set(selected)

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return users
    return users.filter((user) => [userLabel(user), user.email, user.phone].filter(Boolean).join(' ').toLowerCase().includes(query))
  }, [users, search])

  const selectableVisible = visible.map((user) => normalizeId(user.id)).filter((id) => id && id !== leaderId)
  const allVisibleSelected = selectableVisible.length > 0 && selectableVisible.every((id) => selectedSet.has(id))
  const toggleVisible = () => onSetAll(allVisibleSelected
    ? selected.filter((id) => !selectableVisible.includes(id))
    : [...selected, ...selectableVisible])

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-[var(--text)]">{t('salesTeams.teams.members')} <span className="text-[var(--text-muted)]">({selected.length})</span></span>
        {selectableVisible.length > 0 && (
          <button type="button" onClick={toggleVisible} className="text-xs font-semibold text-[var(--brand-accent)] hover:underline">
            {t(allVisibleSelected ? 'salesTeams.teams.unselectShown' : 'salesTeams.teams.selectShown')}
          </button>
        )}
      </div>
      <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('salesTeams.teams.searchUsers')} aria-label={t('salesTeams.teams.searchUsers')} startIcon={<Search size={15} />} />
      <div className="max-h-64 overflow-y-auto rounded-lg border border-[var(--border)]">
        {loading && <div className="grid gap-2 p-2">{[0, 1, 2].map((key) => <Skeleton key={key} className="h-10" />)}</div>}
        {!loading && visible.length === 0 && <p className="p-4 text-center text-sm text-[var(--text-muted)]">{t('salesTeams.teams.noUsers')}</p>}
        {!loading && visible.map((user) => {
          const id = normalizeId(user.id)
          const isLeader = id === leaderId
          const checked = isLeader || selectedSet.has(id)
          return (
            <button
              key={id}
              type="button"
              role="checkbox"
              aria-checked={checked}
              disabled={isLeader}
              onClick={() => onToggle(id)}
              className={cn('flex w-full items-center gap-3 border-b border-[var(--border)] px-3 py-2 text-start last:border-b-0 transition-colors', isLeader ? 'cursor-default bg-[var(--surface-2)]' : 'hover:bg-[var(--surface-2)]')}
            >
              <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded border', checked ? 'border-[var(--brand-accent)] bg-[var(--brand-accent)] text-white' : 'border-[var(--border)]')}>
                {checked && <Check size={13} />}
              </span>
              <Avatar name={userLabel(user)} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-[var(--text)]">{userLabel(user)}</span>
                {user.email && <span className="block truncate text-xs text-[var(--text-muted)]" dir="ltr">{user.email}</span>}
              </span>
              {isLeader && <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-300"><Crown size={13} />{t('salesTeams.teams.leader')}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
