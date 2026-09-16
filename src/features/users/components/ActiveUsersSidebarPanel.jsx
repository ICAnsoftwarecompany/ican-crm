import { useEffect, useMemo, useState } from 'react'
import { Activity, Clock3, ExternalLink, Loader2, Search, UserRound, Users, X } from 'lucide-react'

import { useOnlineUsers, useUserHistory } from '../hooks/useUsers'

function HeaderActions({ onOpenPage, onClose }) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={onOpenPage}
        className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-[#D8E7EA] bg-white px-2 text-xs font-black text-[#00878D]"
      >
        <ExternalLink size={13} />
        فتح
      </button>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#64748B]"
      >
        <X size={15} />
      </button>
    </div>
  )
}

function formatDuration(seconds) {
  if (!Number.isFinite(Number(seconds))) return '—'

  const totalSeconds = Number(seconds)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours && minutes) return `${hours}س ${minutes}د`
  if (hours) return `${hours}س`
  if (minutes) return `${minutes}د`
  return `${totalSeconds}ث`
}

function getUserId(user) {
  return user?.id ?? user?.user_id ?? user?.userId ?? null
}

function normalizeHistoryEntries(historyValue) {
  if (Array.isArray(historyValue)) return historyValue
  if (Array.isArray(historyValue?.data)) return historyValue.data
  if (Array.isArray(historyValue?.user_history)) return historyValue.user_history
  return []
}

export function ActiveUsersSidebarPanel({ open, onClose }) {
  const [query, setQuery] = useState('')
  const [selectedUserId, setSelectedUserId] = useState(null)
  const onlineUsersQuery = useOnlineUsers()
  const onlineUsers = Array.isArray(onlineUsersQuery.data) ? onlineUsersQuery.data : []

  useEffect(() => {
    if (!open) return
    const firstUserId = getUserId(onlineUsers[0])
    if (!selectedUserId && firstUserId) {
      setSelectedUserId(String(firstUserId))
    }
  }, [open, onlineUsers, selectedUserId])

  const filteredUsers = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return onlineUsers

    return onlineUsers.filter((user) => {
      const text = [user?.name, user?.username, user?.login, user?.email].filter(Boolean).join(' ').toLowerCase()
      return text.includes(value)
    })
  }, [onlineUsers, query])

  const selectedUser = useMemo(() => {
    return filteredUsers.find((user) => String(getUserId(user)) === String(selectedUserId)) || filteredUsers[0] || onlineUsers[0] || null
  }, [filteredUsers, onlineUsers, selectedUserId])

  const selectedHistoryUserId = getUserId(selectedUser)
  const historyQuery = useUserHistory(selectedHistoryUserId, { page: 1 }, Boolean(open && selectedHistoryUserId))
  const entries = normalizeHistoryEntries(historyQuery.data)

  const isRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl'

  return (
    <aside
      className="fixed end-0 top-12 bottom-0 z-30 w-[min(390px,calc(100vw-72px))] border-s border-[#DDECEF] bg-white shadow-[-14px_0_30px_rgba(15,23,42,0.08)] transition-transform duration-300"
      style={{ transform: open ? 'translateX(0)' : `translateX(${isRtl ? '-100%' : '100%'})` }}
      aria-hidden={!open}
    >
      <div className="flex h-full flex-col overflow-hidden">
        <header className="border-b border-[#E5EEF0] bg-[#F8FEFF] p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#00878D]">
                <Users size={18} />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-black text-[#111827]">المستخدمون النشطون</h2>
                <p className="truncate text-xs font-semibold text-[#64748B]">إجمالي {onlineUsers.length}</p>
              </div>
            </div>
            <HeaderActions onOpenPage={() => {}} onClose={onClose} />
          </div>
        </header>

        <div className="border-b border-[#EEF2F4] bg-white p-3">
          <label className="relative block">
            <Search size={14} className="pointer-events-none absolute start-2.5 top-2.5 text-[#94A3B8]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث في المستخدمين..."
              className="h-9 w-full rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] ps-8 pe-3 text-xs font-semibold text-[#0F172A] outline-none focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]"
            />
          </label>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[1fr_1.2fr]">
          <div className="min-h-0 overflow-y-auto border-b border-[#EEF2F4] p-3 md:border-b-0 md:border-e">
            {onlineUsersQuery.isLoading ? (
              <div className="rounded-xl border border-[#E5EEF0] bg-white p-3 text-center text-xs font-semibold text-[#64748B]">
                <Loader2 size={16} className="mx-auto mb-2 animate-spin text-[#007A80]" />
                جاري تحميل المستخدمين...
              </div>
            ) : filteredUsers.length ? (
              <div className="space-y-2">
                {filteredUsers.map((user) => {
                  const userId = getUserId(user)
                  return (
                    <button
                      key={userId || user.login || user.email || user.name}
                      type="button"
                      onClick={() => userId && setSelectedUserId(String(userId))}
                      className={[
                        'w-full rounded-xl border p-2 text-start transition-colors',
                        String(getUserId(selectedUser)) === String(userId)
                          ? 'border-[#7FDDE1] bg-[#F3FDFF]'
                          : 'border-[#E5EEF0] bg-white hover:bg-[#F8FEFF]',
                      ].join(' ')}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#E8F9FA] text-[#007A80]">
                            <UserRound size={15} />
                          </span>
                          <div className="min-w-0">
                            <div className="truncate text-xs font-black text-[#0F172A]">{user.name || user.username || user.login || 'User'}</div>
                            <div className="truncate text-[10px] font-semibold text-[#64748B]">{user.email || user.username || user.login || '—'}</div>
                          </div>
                        </div>
                        <span className="inline-flex rounded-full bg-[#ECFDF3] px-1.5 py-0.5 text-[10px] font-black text-[#047857]">
                          Online
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#D7EEF0] bg-[#F8FEFF] p-3 text-center text-xs font-semibold text-[#64748B]">
                لا يوجد مستخدمون متطابقون.
              </div>
            )}
          </div>

          <div className="min-h-0 overflow-y-auto p-3">
            {!selectedUser ? (
              <div className="flex h-full min-h-52 items-center justify-center rounded-xl border border-dashed border-[#D7EEF0] bg-[#F8FEFF] text-center text-xs font-semibold text-[#64748B]">
                اختر مستخدمًا لعرض نشاطه.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl border border-[#E5EEF0] bg-white p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#E8F9FA] text-[#007A80]">
                        <UserRound size={15} />
                      </span>
                      <div>
                        <h3 className="text-sm font-black text-[#0F172A]">{selectedUser.name || selectedUser.username || selectedUser.login || 'User'}</h3>
                        <p className="text-[11px] font-semibold text-[#64748B]">{selectedUser.email || selectedUser.username || selectedUser.login || '—'}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#ECFDF3] px-2 py-1 text-[10px] font-black text-[#047857]">نشط</span>
                  </div>
                </div>

                <div className="rounded-xl border border-[#E5EEF0] bg-white p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <Activity size={15} className="text-[#007A80]" />
                    <h4 className="text-xs font-black text-[#0F172A]">Activity</h4>
                  </div>

                  {historyQuery.isLoading ? (
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
                      <Loader2 size={14} className="animate-spin text-[#007A80]" />
                      جاري تحميل النشاط...
                    </div>
                  ) : entries.length ? (
                    <div className="space-y-2">
                      {entries.map((entry) => (
                        <div key={entry.id} className="rounded-lg border border-[#E5EEF0] bg-[#F8FEFF] p-2">
                          <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-[#475569]">
                            <span className="inline-flex items-center gap-1">
                              <Clock3 size={11} />
                              {entry.started_at ? new Date(entry.started_at).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                            </span>
                            <span className={entry.is_active ? 'text-[#047857]' : 'text-[#64748B]'}>
                              {entry.is_active ? 'نشط' : 'منتهي'}
                            </span>
                          </div>
                          <div className="mt-2 space-y-1 text-[11px] font-semibold text-[#334155]">
                            <div>Connection ID: <span className="font-black text-[#0F172A]">{entry.connection_id || '—'}</span></div>
                            <div>Duration: <span className="font-black text-[#0F172A]">{entry.duration_human || formatDuration(entry.duration_seconds)}</span></div>
                            <div>Ended: <span className="font-black text-[#0F172A]">{entry.ended_at ? new Date(entry.ended_at).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-[#D7EEF0] bg-[#F8FEFF] p-3 text-center text-[11px] font-semibold text-[#64748B]">
                      لا يوجد نشاط لهذا المستخدم.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
