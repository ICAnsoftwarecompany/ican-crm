import { useEffect, useMemo, useState } from 'react'
import { Check, Search, UserCog, UsersRound, X } from 'lucide-react'
import { AppDrawer } from '../../../../shared/components/overlays/AppDrawer'
import { Button } from '../../../../shared/components/ui/Button'
import { Badge } from '../../../../shared/components/ui/Badge'
import { Input } from '../../../../shared/components/ui/Input'
import { cn } from '../../../../shared/utils/cn'

const TABS = [
  { id: 'details', label: 'بيانات التيم', icon: UserCog },
  { id: 'members', label: 'الأعضاء', icon: UsersRound },
]

function normalizeId(value) {
  if (value === null || value === undefined || value === '') return ''
  return String(value)
}

function getUserLabel(user) {
  return user?.name || user?.username || user?.email || `User #${user?.id}`
}

function getUserSearchText(user) {
  if (!user || typeof user !== 'object') return ''

  return Object.values(user)
    .filter((value) => ['string', 'number', 'boolean'].includes(typeof value))
    .join(' ')
    .toLowerCase()
}

function getTeamLabel(team) {
  return team?.name || team?.team_name || team?.title || `Team #${team?.id || team?.team_id}`
}

export function TeamDrawer({
  open,
  mode,
  form,
  users,
  userTeamsById,
  error,
  loading,
  onClose,
  onSubmit,
  onChange,
  onToggleMember,
}) {
  const [activeTab, setActiveTab] = useState('details')
  const [leaderSearch, setLeaderSearch] = useState('')
  const [leaderPickerOpen, setLeaderPickerOpen] = useState(false)
  const [membersSearch, setMembersSearch] = useState('')
  const [showUsersWithoutTeamsOnly, setShowUsersWithoutTeamsOnly] = useState(false)

  useEffect(() => {
    if (open) {
      setActiveTab('details')
      setLeaderSearch('')
      setLeaderPickerOpen(false)
      setMembersSearch('')
      setShowUsersWithoutTeamsOnly(false)
    }
  }, [open])

  const leaderId = normalizeId(form.team_leader_id)
  const selectedLeader = useMemo(() => {
    return users.find((user) => normalizeId(user.id) === leaderId)
  }, [leaderId, users])
  const filteredLeaderUsers = useMemo(() => {
    const query = leaderSearch.trim().toLowerCase()
    if (!query) return users
    return users.filter((user) => getUserSearchText(user).includes(query))
  }, [leaderSearch, users])
  const filteredMemberUsers = useMemo(() => {
    const query = membersSearch.trim().toLowerCase()
    return users.filter((user) => {
      const linkedTeams = userTeamsById?.get(normalizeId(user.id)) || []
      const matchesTeamFilter = !showUsersWithoutTeamsOnly || linkedTeams.length === 0
      const matchesSearch = !query || getUserSearchText(user).includes(query)
      return matchesTeamFilter && matchesSearch
    })
  }, [membersSearch, showUsersWithoutTeamsOnly, userTeamsById, users])
  const memberIds = useMemo(() => {
    return new Set((form.members || []).map(normalizeId).filter(Boolean))
  }, [form.members])
  const selectedMembersCount = [...memberIds].filter((id) => id !== leaderId).length

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit()
  }

  const selectLeader = (userId) => {
    onChange('team_leader_id', normalizeId(userId))
    setLeaderSearch('')
    setLeaderPickerOpen(false)
  }

  const clearLeader = () => {
    onChange('team_leader_id', '')
    setLeaderSearch('')
    setLeaderPickerOpen(false)
  }

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      size="xl"
      title={mode === 'create' ? 'إنشاء تيم جديد' : 'تعديل التيم'}
      description="حدد بيانات التيم، قائد الفريق، ثم اختر الأعضاء المرتبطين به."
    >
      <form onSubmit={handleSubmit} className="flex min-h-[calc(100vh-7.5rem)] flex-col">
        <div className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

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
                  {tab.id === 'members' && selectedMembersCount > 0 && (
                    <Badge variant="info" className="px-2 py-0">
                      {selectedMembersCount}
                    </Badge>
                  )}
                </button>
              )
            })}
          </div>

          {activeTab === 'details' && (
            <div className="space-y-4">
              <Input
                label="اسم التيم"
                value={form.name}
                onChange={(event) => onChange('name', event.target.value)}
                placeholder="مثال: فريق مبيعات القاهرة"
              />

              <div className="grid gap-1.5 text-sm font-medium text-[var(--text)]">
                <span>قائد التيم</span>
                {selectedLeader && (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-[#A0ECF0] bg-[#E8F9FA] px-3 py-2">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-[#007A80]">
                        {getUserLabel(selectedLeader)}
                      </span>
                      {selectedLeader.email && (
                        <span className="block truncate text-xs text-[#007A80]/75">
                          {selectedLeader.email}
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={clearLeader}
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#007A80] hover:bg-white/70"
                      aria-label="إزالة قائد التيم"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <div className="relative">
                  <Search
                    size={16}
                    className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                  />
                  <input
                    type="search"
                    value={leaderSearch}
                    onFocus={() => setLeaderPickerOpen(true)}
                    onChange={(event) => {
                      setLeaderSearch(event.target.value)
                      setLeaderPickerOpen(true)
                    }}
                    placeholder={selectedLeader ? 'بحث لاختيار قائد آخر' : 'ابحث باسم المستخدم أو البريد'}
                    className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 ps-9 text-sm text-[var(--text)] placeholder:text-[var(--text-light)] focus:outline-none focus:ring-2 focus:ring-[#00C2CB]"
                  />

                  {leaderPickerOpen && (
                    <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-lg">
                      {filteredLeaderUsers.length ? (
                        filteredLeaderUsers.map((user) => {
                          const userId = normalizeId(user.id)
                          const selected = userId === leaderId

                          return (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => selectLeader(userId)}
                              className={cn(
                                'flex w-full items-center justify-between gap-3 border-b border-[var(--border)] px-3 py-2 text-start last:border-b-0 hover:bg-[var(--surface-2)]',
                                selected && 'bg-[#E8F9FA]'
                              )}
                            >
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-medium text-[var(--text)]">
                                  {getUserLabel(user)}
                                </span>
                                {user.email && (
                                  <span className="block truncate text-xs text-[var(--text-muted)]">
                                    {user.email}
                                  </span>
                                )}
                              </span>
                              {selected && <Check size={16} className="shrink-0 text-[#00C2CB]" />}
                            </button>
                          )
                        })
                      ) : (
                        <div className="p-3 text-sm text-[var(--text-muted)]">
                          لا توجد نتائج مطابقة.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-[var(--text)]">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => onChange('active', event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                التيم نشط
              </label>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-[var(--text)]">أعضاء التيم</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    قائد التيم يظهر هنا للعلم فقط ولا يمكن اختياره كعضو.
                  </div>
                </div>
                <Badge variant="info">{selectedMembersCount} عضو</Badge>
              </div>

              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  type="search"
                  value={membersSearch}
                  onChange={(event) => setMembersSearch(event.target.value)}
                  placeholder="ابحث داخل بيانات المستخدمين"
                  className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 ps-9 text-sm text-[var(--text)] placeholder:text-[var(--text-light)] focus:outline-none focus:ring-2 focus:ring-[#00C2CB]"
                />
                {membersSearch.trim() && (
                  <button
                    type="button"
                    onClick={() => setMembersSearch('')}
                    className="absolute end-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
                    aria-label="مسح بحث الأعضاء"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <label className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                <span>
                  <span className="block text-sm font-semibold text-[var(--text)]">بدون فرق فقط</span>
                  <span className="block text-xs text-[var(--text-muted)]">
                    عرض المستخدمين غير المرتبطين بأي فريق.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={showUsersWithoutTeamsOnly}
                  onChange={(event) => setShowUsersWithoutTeamsOnly(event.target.checked)}
                  className="peer sr-only"
                />
                <span className="relative h-6 w-11 shrink-0 rounded-full bg-slate-300 transition-colors after:absolute after:start-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-[#00C2CB] peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5" />
              </label>

              <div className="text-xs text-[var(--text-muted)]">
                المعروض: {filteredMemberUsers.length} من {users.length} مستخدم
              </div>

              <div className="max-h-[calc(100vh-17rem)] overflow-y-auto rounded-lg border border-[var(--border)]">
                {filteredMemberUsers.length ? (
                  filteredMemberUsers.map((user) => {
                    const userId = normalizeId(user.id)
                    const isLeader = leaderId && userId === leaderId
                    const checked = !isLeader && memberIds.has(userId)
                    const linkedTeams = userTeamsById?.get(userId) || []

                    return (
                      <label
                        key={user.id}
                        className={cn(
                          'flex items-center justify-between gap-3 border-b border-[var(--border)] px-3 py-2.5 last:border-b-0',
                          isLeader
                            ? 'cursor-not-allowed bg-[var(--surface-2)] opacity-75'
                            : 'cursor-pointer hover:bg-[var(--surface-2)]'
                        )}
                      >
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium text-[var(--text)]">
                              {getUserLabel(user)}
                            </span>
                            {isLeader && <Badge variant="warning">قائد التيم</Badge>}
                          </span>
                          {user.email && (
                            <span className="block truncate text-xs text-[var(--text-muted)]">
                              {user.email}
                            </span>
                          )}
                          <span className="mt-1 flex flex-wrap gap-1">
                            {linkedTeams.length ? (
                              linkedTeams.slice(0, 3).map((team) => (
                                <Badge key={team.id || team.team_id || getTeamLabel(team)} variant="default">
                                  {getTeamLabel(team)}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-[var(--text-muted)]">بدون فريق</span>
                            )}
                            {linkedTeams.length > 3 && <Badge>+{linkedTeams.length - 3}</Badge>}
                          </span>
                        </span>
                        <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={Boolean(isLeader)}
                            onChange={() => onToggleMember(userId)}
                            className="peer h-5 w-5 appearance-none rounded border border-[var(--border)] bg-[var(--surface)] checked:border-[#00C2CB] checked:bg-[#00C2CB] disabled:cursor-not-allowed"
                          />
                          <Check
                            size={14}
                            className="pointer-events-none absolute hidden text-white peer-checked:block"
                          />
                        </span>
                      </label>
                    )
                  })
                ) : (
                  <div className="p-4 text-sm text-[var(--text-muted)]">
                    {users.length ? 'لا توجد نتائج مطابقة.' : 'لا يوجد مستخدمون متاحون.'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto flex items-center justify-end gap-2 border-t border-[var(--border)] pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            إلغاء
          </Button>
          <Button type="submit" loading={loading} disabled={!form.name.trim()}>
            {mode === 'create' ? 'إنشاء التيم' : 'حفظ التعديل'}
          </Button>
        </div>
      </form>
    </AppDrawer>
  )
}
