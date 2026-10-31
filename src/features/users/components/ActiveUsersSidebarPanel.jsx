import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowLeft, ArrowRight, Circle, Clock3, ExternalLink, Loader2, Search, UserRound, Users, X } from 'lucide-react'

import { useOnlineUsers, useUserHistory, useUsers } from '../hooks/useUsers'
import { useRealtimeChannel } from '../../../realtime/hooks/useRealtimeChannel'

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

function normalizeDateValue(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString()
}

function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })
}

function isPresenceFresh(lastSeenValue) {
  if (!lastSeenValue) return false
  const lastSeenAt = new Date(lastSeenValue)
  if (Number.isNaN(lastSeenAt.getTime())) return false
  return (Date.now() - lastSeenAt.getTime()) <= 120000
}

function normalizePresenceStatus(rawValue = '') {
  const value = String(rawValue || '').trim().toLowerCase()
  if (!value) return null
  if (['online', 'active', 'connected', 'joined', 'available'].includes(value)) return true
  if (['offline', 'inactive', 'disconnected', 'left', 'logout', 'signed_out'].includes(value)) return false
  return null
}

function extractPresenceEntries(payload = {}) {
  const root = payload?.data ?? payload
  const candidate =
    root?.users ??
    root?.online_users ??
    root?.members ??
    root?.presence ??
    root?.user ??
    root

  const rows = Array.isArray(candidate) ? candidate : [candidate]

  return rows
    .map((row) => {
      if (!row || typeof row !== 'object') return null
      const userId = getUserId(row)
      if (!userId) return null

      const fromBoolean =
        typeof row.online === 'boolean'
          ? row.online
          : typeof row.is_online === 'boolean'
            ? row.is_online
            : typeof row.isOnline === 'boolean'
              ? row.isOnline
              : null
      const fromStatus = normalizePresenceStatus(row.status ?? row.presence_status ?? row.state ?? row.event)

      return {
        userId: String(userId),
        isOnline: fromBoolean ?? fromStatus,
        lastSeenAt: normalizeDateValue(row.last_seen_at ?? row.lastSeenAt ?? row.last_seen),
      }
    })
    .filter(Boolean)
}

function normalizeHistoryEntries(historyValue) {
  if (Array.isArray(historyValue)) return historyValue
  if (Array.isArray(historyValue?.data)) return historyValue.data
  if (Array.isArray(historyValue?.user_history)) return historyValue.user_history
  return []
}

export function ActiveUsersSidebarPanel({ open, onClose }) {
  const [query, setQuery] = useState('')
  const [view, setView] = useState('list')
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [presenceOverrides, setPresenceOverrides] = useState({})

  const usersQuery = useUsers(undefined, { enabled: open })
  const onlineUsersQuery = useOnlineUsers(undefined, {
    enabled: open,
    refetchInterval: open ? 30000 : false,
  })

  const users = Array.isArray(usersQuery.data) ? usersQuery.data : []
  const onlineUsers = Array.isArray(onlineUsersQuery.data) ? onlineUsersQuery.data : []

  useRealtimeChannel({
    channelName: import.meta.env.VITE_USERS_PRESENCE_CHANNEL || 'online.users',
    eventNames: [
      import.meta.env.VITE_USERS_PRESENCE_EVENT || '.users.presence.updated',
      '.user.presence.updated',
      'user.presence.updated',
      '.users.status.changed',
      'users.status.changed',
    ],
    enabled: open,
    isPrivate: false,
    listenToAll: true,
    onEvent: (payload) => {
      const entries = extractPresenceEntries(payload)
      if (!entries.length) return

      setPresenceOverrides((prev) => {
        const next = { ...prev }
        entries.forEach((entry) => {
          next[entry.userId] = {
            ...(next[entry.userId] || {}),
            ...(entry.isOnline === null ? {} : { isOnline: entry.isOnline }),
            ...(entry.lastSeenAt ? { lastSeenAt: entry.lastSeenAt } : {}),
          }
        })
        return next
      })

      onlineUsersQuery.refetch()
      usersQuery.refetch()
    },
  })

  const onlineUsersById = useMemo(() => {
    const map = new Map()
    onlineUsers.forEach((user) => {
      const userId = getUserId(user)
      if (!userId) return
      map.set(String(userId), user)
    })
    return map
  }, [onlineUsers])

  const mergedUsers = useMemo(() => {
    const base = new Map()

    users.forEach((user) => {
      const userId = getUserId(user)
      if (!userId) return
      base.set(String(userId), user)
    })

    onlineUsers.forEach((user) => {
      const userId = getUserId(user)
      if (!userId) return
      const key = String(userId)
      const current = base.get(key) || {}
      base.set(key, { ...current, ...user })
    })

    return Array.from(base.values())
  }, [onlineUsers, users])

  const usersWithPresence = useMemo(() => {
    return mergedUsers.map((user) => {
      const userId = String(getUserId(user) || '')
      const onlineUser = onlineUsersById.get(userId)
      const override = presenceOverrides[userId] || {}
      const statusFromUser =
        typeof user?.is_online === 'boolean'
          ? user.is_online
          : typeof user?.online === 'boolean'
            ? user.online
            : null
      const statusFromOnlineList = onlineUser ? true : null
      const status =
        typeof override.isOnline === 'boolean'
          ? override.isOnline
          : typeof statusFromUser === 'boolean'
            ? statusFromUser
            : typeof statusFromOnlineList === 'boolean'
              ? statusFromOnlineList
              : false

      const resolvedLastSeenAt = override.lastSeenAt || user?.last_seen_at || user?.lastSeenAt || onlineUser?.last_seen_at || ''
      const guardedOnlineStatus = status && (resolvedLastSeenAt ? isPresenceFresh(resolvedLastSeenAt) : true)

      return {
        ...user,
        is_online: guardedOnlineStatus,
        last_seen_at: resolvedLastSeenAt,
      }
    })
  }, [mergedUsers, onlineUsersById, presenceOverrides])

  useEffect(() => {
    if (!open) return
    const firstUserId = getUserId(usersWithPresence[0])
    if (!selectedUserId && firstUserId) {
      setSelectedUserId(String(firstUserId))
    }
  }, [open, usersWithPresence, selectedUserId])

  useEffect(() => {
    if (!open) {
      setView('list')
      setQuery('')
      return
    }

    const refreshId = window.setInterval(() => {
      onlineUsersQuery.refetch()
    }, 45000)

    return () => window.clearInterval(refreshId)
  }, [open, onlineUsersQuery])

  const filteredUsers = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return usersWithPresence

    return usersWithPresence.filter((user) => {
      const text = [user?.name, user?.username, user?.login, user?.email].filter(Boolean).join(' ').toLowerCase()
      return text.includes(value)
    })
  }, [usersWithPresence, query])

  const selectedUser = useMemo(() => {
    return usersWithPresence.find((user) => String(getUserId(user)) === String(selectedUserId)) || usersWithPresence[0] || null
  }, [selectedUserId, usersWithPresence])

  const selectedHistoryUserId = getUserId(selectedUser)
  const historyQuery = useUserHistory(selectedHistoryUserId, { page: 1 }, Boolean(open && view === 'activity' && selectedHistoryUserId))
  const entries = normalizeHistoryEntries(historyQuery.data)

  const isRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl'

  return (
    <aside
      className="fixed end-0 top-12 bottom-0 z-30 w-[min(340px,calc(100vw-56px))] border-s border-[#DDECEF] bg-white shadow-[-14px_0_30px_rgba(15,23,42,0.08)] transition-transform duration-300"
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
                <p className="truncate text-xs font-semibold text-[#64748B]">إجمالي {usersWithPresence.length}</p>
              </div>
            </div>
            <HeaderActions onOpenPage={() => {}} onClose={onClose} />
          </div>
        </header>

        {view === 'list' ? (
          <>
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

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {usersQuery.isLoading || onlineUsersQuery.isLoading ? (
                <div className="rounded-xl border border-[#E5EEF0] bg-white p-3 text-center text-xs font-semibold text-[#64748B]">
                  <Loader2 size={16} className="mx-auto mb-2 animate-spin text-[#007A80]" />
                  جاري تحميل المستخدمين...
                </div>
              ) : filteredUsers.length ? (
                <div className="space-y-2">
                  {filteredUsers.map((user) => {
                    const userId = getUserId(user)
                    const isOnline = Boolean(user?.is_online)
                    return (
                      <button
                        key={userId || user.login || user.email || user.name}
                        type="button"
                        onClick={() => {
                          if (!userId) return
                          setSelectedUserId(String(userId))
                          setView('activity')
                        }}
                        className="w-full rounded-xl border border-[#E5EEF0] bg-white p-2 text-start transition-colors hover:bg-[#F8FEFF]"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#E8F9FA] text-[#007A80]">
                              <UserRound size={15} />
                            </span>
                            <div className="min-w-0">
                              <div className="truncate text-xs font-black text-[#0F172A]">{user.name || user.username || user.login || 'User'}</div>
                              <div className="truncate text-[10px] font-semibold text-[#64748B]">{user.email || user.username || user.login || '—'}</div>
                              {!isOnline ? (
                                <div className="mt-1 truncate text-[10px] font-semibold text-[#64748B]">
                                  آخر تواجد: {formatDateTime(user?.last_seen_at)}
                                </div>
                              ) : null}
                            </div>
                          </div>

                          <span
                            className={[
                              'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-black',
                              isOnline ? 'bg-[#ECFDF3] text-[#047857]' : 'bg-[#F1F5F9] text-[#475569]',
                            ].join(' ')}
                          >
                            <Circle size={8} className={isOnline ? 'fill-[#22C55E] text-[#22C55E]' : 'fill-[#94A3B8] text-[#94A3B8]'} />
                            {isOnline ? 'Online' : 'Offline'}
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
          </>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <div className="mb-3">
              <button
                type="button"
                onClick={() => setView('list')}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#D8E7EA] bg-white px-2 text-xs font-black text-[#00878D]"
              >
                {isRtl ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
                رجوع للمستخدمين
              </button>
            </div>

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
                    <span
                      className={[
                        'inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black',
                        selectedUser?.is_online ? 'bg-[#ECFDF3] text-[#047857]' : 'bg-[#F1F5F9] text-[#475569]',
                      ].join(' ')}
                    >
                      <Circle size={8} className={selectedUser?.is_online ? 'fill-[#22C55E] text-[#22C55E]' : 'fill-[#94A3B8] text-[#94A3B8]'} />
                      {selectedUser?.is_online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  {!selectedUser?.is_online ? (
                    <p className="mt-2 text-[11px] font-semibold text-[#64748B]">آخر تواجد: {formatDateTime(selectedUser?.last_seen_at)}</p>
                  ) : null}
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
                              {formatDateTime(entry.started_at)}
                            </span>
                            <span className={entry.is_active ? 'text-[#047857]' : 'text-[#64748B]'}>
                              {entry.is_active ? 'نشط' : 'منتهي'}
                            </span>
                          </div>
                          <div className="mt-2 space-y-1 text-[11px] font-semibold text-[#334155]">
                            <div>Connection ID: <span className="font-black text-[#0F172A]">{entry.connection_id || '—'}</span></div>
                            <div>Duration: <span className="font-black text-[#0F172A]">{entry.duration_human || formatDuration(entry.duration_seconds)}</span></div>
                            <div>Ended: <span className="font-black text-[#0F172A]">{formatDateTime(entry.ended_at)}</span></div>
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
        )}
      </div>
    </aside>
  )
}
