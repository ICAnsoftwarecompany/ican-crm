import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { Input } from '../../../../../shared/components/ui/Input'
import { Avatar } from '../../../../../shared/components/ui/Avatar'
import { useUsers } from '../../../../../features/users/hooks/useUsers'

/**
 * Step 6 — Team. `user_ids` on the campaign are the people responsible for
 * the campaign and its follow-up, not recipients.
 */
export function CampaignTeamStep({ form, onChange }) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const usersQuery = useUsers()
  const users = usersQuery.data || []
  const filteredUsers = users.filter((user) => !search || (user.name || user.email || '').toLowerCase().includes(search.toLowerCase()))

  const selectedIds = new Set(form.team.userIds.map(String))

  const toggleUser = (userId) => {
    const idStr = String(userId)
    const next = selectedIds.has(idStr)
      ? form.team.userIds.filter((id) => String(id) !== idStr)
      : [...form.team.userIds, userId]
    onChange({ team: { userIds: next } })
  }

  return (
    <div className="space-y-3">
      <Input
        startIcon={<Search size={16} />}
        placeholder={t('outreachCampaigns.team.search')}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-[var(--border)]">
        {usersQuery.isLoading && <p className="p-3 text-sm text-[var(--text-muted)]">{t('common.loading')}</p>}
        {filteredUsers.map((user) => {
          const isSelected = selectedIds.has(String(user.id))
          return (
            <button
              key={user.id}
              type="button"
              onClick={() => toggleUser(user.id)}
              className={`flex w-full items-center gap-3 px-3 py-2 text-start transition-colors ${isSelected ? 'bg-[#E8F9FA]' : 'hover:bg-[var(--surface-2)]'}`}
            >
              <Avatar name={user.name || user.email} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[var(--text)]">{user.name || user.email || `#${user.id}`}</p>
                {user.role && <p className="truncate text-xs text-[var(--text-muted)]">{user.role}</p>}
              </div>
              <input type="checkbox" checked={isSelected} readOnly className="h-4 w-4" />
            </button>
          )
        })}
      </div>

      <p className="text-xs text-[var(--text-muted)]">{t('outreachCampaigns.team.note')}</p>
    </div>
  )
}
