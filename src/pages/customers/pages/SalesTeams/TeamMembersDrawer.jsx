import { useEffect, useMemo, useState } from 'react'
import { Mail, Phone, Plus, Search, Trash2, UserRound, UsersRound, X } from 'lucide-react'
import { AppDrawer } from '../../../../shared/components/overlays/AppDrawer'
import { Button } from '../../../../shared/components/ui/Button'
import { Badge } from '../../../../shared/components/ui/Badge'
import { cn } from '../../../../shared/utils/cn'

const TABS = [
  { id: 'current', label: 'الأعضاء الحاليون', icon: UsersRound },
  { id: 'add', label: 'إضافة أعضاء', icon: Plus },
]

function normalizeId(value) {
  if (value === null || value === undefined || value === '') return ''
  return String(value)
}

function getUserLabel(user) {
  return user?.name || user?.username || user?.email || `User #${user?.id || user?.user_id || user}`
}

function getUserSearchText(user) {
  if (!user || typeof user !== 'object') return String(user || '').toLowerCase()

  return Object.values(user)
    .filter((value) => ['string', 'number', 'boolean'].includes(typeof value))
    .join(' ')
    .toLowerCase()
}

function getTeamLeaderId(team) {
  return normalizeId(team?.team_leader_id || team?.leader_id || team?.leader?.id || team?.team_leader?.id)
}

function getTeamMembers(team) {
  if (Array.isArray(team?._members)) return team._members
  if (Array.isArray(team?.members)) return team.members
  if (Array.isArray(team?.users)) return team.users
  if (Array.isArray(team?.team_members)) return team.team_members
  return []
}

function getTeamMemberIds(team) {
  if (Array.isArray(team?._memberIds)) {
    return team._memberIds.map(normalizeId).filter(Boolean)
  }

  return getTeamMembers(team)
    .map((member) => normalizeId(member?.id || member?.user_id || member))
    .filter(Boolean)
}

function getTeamName(team) {
  return team?.name || team?.team_name || `Team #${team?.id || team?.team_id || ''}`
}

function getResolvedTeamMembers(team, usersById) {
  const rawMembers = getTeamMembers(team)
  const rawMemberById = new Map(
    rawMembers
      .map((member) => [normalizeId(member?.id || member?.user_id || member), member])
      .filter(([id]) => Boolean(id))
  )

  return getTeamMemberIds(team).map((id) => usersById.get(id) || rawMemberById.get(id) || { id })
}

export function TeamMembersDrawer({
  open,
  team,
  users,
  userTeamsById,
  loading,
  onClose,
  onAttachUsers,
  onDetachUsers,
}) {
  const [activeTab, setActiveTab] = useState('current')
  const [currentSearch, setCurrentSearch] = useState('')
  const [availableSearch, setAvailableSearch] = useState('')
  const [selectedCurrentIds, setSelectedCurrentIds] = useState(new Set())
  const [selectedAvailableIds, setSelectedAvailableIds] = useState(new Set())
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setActiveTab('current')
    setCurrentSearch('')
    setAvailableSearch('')
    setSelectedCurrentIds(new Set())
    setSelectedAvailableIds(new Set())
    setError('')
  }, [open, team])

  const usersById = useMemo(() => {
    return new Map(users.map((user) => [normalizeId(user.id || user.user_id), user]))
  }, [users])

  const memberIds = useMemo(() => new Set(getTeamMemberIds(team)), [team])
  const leaderId = getTeamLeaderId(team)
  const currentMembers = useMemo(() => getResolvedTeamMembers(team, usersById), [team, usersById])
  const availableUsers = useMemo(() => {
    return users.filter((user) => {
      const userId = normalizeId(user.id || user.user_id)
      if (!userId) return false
      if (memberIds.has(userId)) return false
      if (leaderId && userId === leaderId) return false
      return true
    })
  }, [leaderId, memberIds, users])

  const filteredCurrentMembers = useMemo(() => {
    const query = currentSearch.trim().toLowerCase()
    if (!query) return currentMembers
    return currentMembers.filter((user) => getUserSearchText(user).includes(query))
  }, [currentMembers, currentSearch])

  const filteredAvailableUsers = useMemo(() => {
    const query = availableSearch.trim().toLowerCase()
    if (!query) return availableUsers
    return availableUsers.filter((user) => getUserSearchText(user).includes(query))
  }, [availableSearch, availableUsers])

  const toggleCurrentSelection = (userId) => {
    const id = normalizeId(userId)
    setSelectedCurrentIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAvailableSelection = (userId) => {
    const id = normalizeId(userId)
    setSelectedAvailableIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const runAttach = async () => {
    const ids = [...selectedAvailableIds]
    if (!ids.length) return
    setError('')

    try {
      await onAttachUsers(ids)
      setSelectedAvailableIds(new Set())
      setActiveTab('current')
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'تعذر إضافة الأعضاء')
    }
  }

  const runDetach = async (ids) => {
    const normalizedIds = ids.map(normalizeId).filter(Boolean)
    if (!normalizedIds.length) return
    setError('')

    try {
      await onDetachUsers(normalizedIds)
      setSelectedCurrentIds(new Set())
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'تعذر إلغاء ربط الأعضاء')
    }
  }

  const renderUserMeta = (user) => (
    <div className="mt-1 flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
      {user.email && (
        <span className="inline-flex items-center gap-1">
          <Mail size={13} />
          {user.email}
        </span>
      )}
      {user.phone && (
        <span className="inline-flex items-center gap-1">
          <Phone size={13} />
          {user.phone}
        </span>
      )}
      {user.username && <span>@{user.username}</span>}
    </div>
  )

  const renderLinkedTeams = (userId) => {
    const linkedTeams = userTeamsById?.get(normalizeId(userId)) || []

    return (
      <div className="mt-2 flex flex-wrap gap-1.5">
        {linkedTeams.length ? (
          linkedTeams.slice(0, 4).map((linkedTeam) => (
            <Badge key={linkedTeam.id || linkedTeam.team_id || linkedTeam.name} variant="default">
              {getTeamName(linkedTeam)}
            </Badge>
          ))
        ) : (
          <span className="text-xs text-[var(--text-muted)]">بدون فرق مرتبطة</span>
        )}
      </div>
    )
  }

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      size="lg"
      title="أعضاء الفريق"
      description={team ? getTeamName(team) : ''}
    >
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
          <span className="text-sm font-semibold text-[var(--text)]">إجمالي الأعضاء</span>
          <Badge variant="info">{currentMembers.length} عضو</Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-lg bg-[var(--surface-2)] p-1">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const selected = activeTab === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'inline-flex h-10 items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors',
                  selected
                    ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                )}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {activeTab === 'current' && (
          <div className="space-y-3">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="search"
                value={currentSearch}
                onChange={(event) => setCurrentSearch(event.target.value)}
                placeholder="ابحث في الأعضاء الحاليين"
                className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 ps-9 text-sm text-[var(--text)] placeholder:text-[var(--text-light)] focus:outline-none focus:ring-2 focus:ring-[#00C2CB]"
              />
            </div>

            {selectedCurrentIds.size > 0 && (
              <Button
                variant="danger"
                onClick={() => runDetach([...selectedCurrentIds])}
                loading={loading}
                className="w-full"
              >
                <Trash2 size={16} />
                إلغاء ربط المحدد ({selectedCurrentIds.size})
              </Button>
            )}

            {filteredCurrentMembers.length ? (
              <div className="space-y-2">
                {filteredCurrentMembers.map((member, index) => {
                  const memberId = normalizeId(member?.id || member?.user_id || member)
                  const label = getUserLabel(member)
                  const checked = selectedCurrentIds.has(memberId)

                  return (
                    <div
                      key={memberId || index}
                      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3"
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCurrentSelection(memberId)}
                          className="mt-2 h-4 w-4 rounded border-slate-300"
                        />
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#007A80]">
                          <UserRound size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-bold text-[var(--text)]">{label}</div>
                          {renderUserMeta(member)}
                          {renderLinkedTeams(memberId)}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => runDetach([memberId])}
                          loading={loading}
                        >
                          <X size={14} />
                          فك الربط
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--text-muted)]">
                {currentMembers.length ? 'لا توجد نتائج مطابقة.' : 'لا يوجد أعضاء داخل هذا الفريق.'}
              </div>
            )}
          </div>
        )}

        {activeTab === 'add' && (
          <div className="space-y-3">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="search"
                value={availableSearch}
                onChange={(event) => setAvailableSearch(event.target.value)}
                placeholder="ابحث عن مستخدمين لإضافتهم"
                className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 ps-9 text-sm text-[var(--text)] placeholder:text-[var(--text-light)] focus:outline-none focus:ring-2 focus:ring-[#00C2CB]"
              />
            </div>

            <Button
              onClick={runAttach}
              loading={loading}
              disabled={selectedAvailableIds.size === 0}
              className="w-full"
            >
              <Plus size={16} />
              إضافة المحدد ({selectedAvailableIds.size})
            </Button>

            {filteredAvailableUsers.length ? (
              <div className="space-y-2">
                {filteredAvailableUsers.map((user) => {
                  const userId = normalizeId(user.id || user.user_id)
                  const checked = selectedAvailableIds.has(userId)

                  return (
                    <label
                      key={userId}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 hover:bg-[var(--surface-2)]"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAvailableSelection(userId)}
                        className="mt-2 h-4 w-4 rounded border-slate-300"
                      />
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#007A80]">
                        <UserRound size={18} />
                      </div>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-[var(--text)]">
                          {getUserLabel(user)}
                        </span>
                        {renderUserMeta(user)}
                        {renderLinkedTeams(userId)}
                      </span>
                    </label>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--text-muted)]">
                لا يوجد مستخدمون متاحون للإضافة.
              </div>
            )}
          </div>
        )}
      </div>
    </AppDrawer>
  )
}
