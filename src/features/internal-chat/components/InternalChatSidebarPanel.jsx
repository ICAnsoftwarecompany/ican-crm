import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronRight, Circle, ExternalLink, MessagesSquare, Search, UserRound, UsersRound, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useChatConversationMutations, useChatConversations } from '../hooks/useChatConversations'
import { useChatMessageMutations, useChatMessages } from '../hooks/useChatMessages'
import { useOnlineUsers, useUsers } from '../../users/hooks/useUsers'
import { useInternalChatUiStore } from '../store/internalChatUiStore'
import { getConversationDisplayInfo, getConversationId, getLastMessagePreview } from '../utils/conversationHelpers'
import { ConversationThread } from '../../conversations'
import { useAuthStore } from '../../../store/authStore'
import { cn } from '../../../shared/utils/cn'

function getConversationType(conversation) {
  return String(conversation?.type || '').toLowerCase()
}

function getConversationLastMessage(conversation) {
  if (typeof conversation?.last_message === 'string') return { text: conversation.last_message }
  return conversation?.last_message && typeof conversation.last_message === 'object' ? conversation.last_message : {}
}

function formatConversationTimestamp(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const now = new Date()
  const sameDay =
    date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate()

  if (sameDay) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  return date.toLocaleDateString('en-CA')
}

function getMemberId(user) {
  return Number(user?.id ?? user?.user_id ?? user?.userId ?? 0)
}

function getConversationUserId(user) {
  return Number(user?.pivot?.user_id ?? user?.user_id ?? user?.userId ?? user?.id ?? 0)
}

function toBooleanPresence(value) {
  if (typeof value === 'boolean') return value
  const text = String(value || '').trim().toLowerCase()
  if (!text) return null
  if (['online', 'active', 'connected', 'joined', 'available'].includes(text)) return true
  if (['offline', 'inactive', 'disconnected', 'left', 'logout', 'signed_out'].includes(text)) return false
  return null
}

function formatLastSeen(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })
}

function toMessageSenderId(message = {}) {
  return String(
    message?.sender_id
    || message?.raw?.sender_id
    || message?.sender?.id
    || message?.raw?.sender?.id
    || message?.raw?.sent_by?.id
    || ''
  )
}

function toMessageSenderName(message = {}) {
  return String(
    message?.sender?.name
    || message?.raw?.sender?.name
    || message?.raw?.sent_by?.name
    || ''
  )
}

function HeaderActions({ onOpenPage, onClose }) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        onClick={onOpenPage}
        className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-xs font-black text-[var(--brand-accent)] transition-colors hover:bg-[var(--brand-accent-soft)]"
      >
        <ExternalLink size={13} />
        فتح
      </button>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
      >
        <X size={15} />
      </button>
    </div>
  )
}

function toComposerMessage(message) {
  const seenValue =
    typeof message?.seen === 'boolean'
      ? message.seen
      : typeof message?.raw?.seen === 'boolean'
        ? message.raw.seen
        : null

  return {
    ...message,
    text: message?.text || message?.body || message?.message || '',
    createdAt: message?.createdAt || message?.created_at || '',
    seen: seenValue,
    status: String(message?.status || message?.raw?.status || '').toLowerCase(),
    raw: {
      ...message?.raw,
      id: message?.id,
      created_at: message?.createdAt || message?.created_at || '',
      sender_id: message?.sender_id || message?.raw?.sender_id || message?.sender?.id || message?.raw?.sender?.id || '',
      sent_by: message?.sender || message?.raw?.sent_by,
      body: message?.text || message?.body || message?.message || '',
      seen: seenValue,
    },
  }
}

export function InternalChatSidebarPanel({ open, onClose }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [conversationFilter, setConversationFilter] = useState('all')
  const [mode, setMode] = useState('list')
  const selectedConversationId = useInternalChatUiStore((state) => state.activeConversationId)
  const setSelectedConversationId = useInternalChatUiStore((state) => state.setActiveConversationId)
  const currentUser = useAuthStore((state) => state.user)
  const currentUserId = String(currentUser?.id ?? currentUser?.user_id ?? currentUser?.userId ?? '')
  const listScrollRef = useRef(null)
  const [listScrollPercent, setListScrollPercent] = useState(0)

  const conversationsQuery = useChatConversations({ per_page: 30 }, { enabled: open })
  const conversations = Array.isArray(conversationsQuery.data) ? conversationsQuery.data : []
  const usersQuery = useUsers(undefined, { enabled: open })
  const onlineUsersQuery = useOnlineUsers(undefined, { enabled: open, refetchInterval: open ? 30000 : false })
  const users = Array.isArray(usersQuery.data) ? usersQuery.data : []
  const onlineUsers = Array.isArray(onlineUsersQuery.data) ? onlineUsersQuery.data : []

  const onlinePresenceByUserId = useMemo(() => {
    const map = new Map()

    onlineUsers.forEach((entry) => {
      const userId = Number(entry?.user_id ?? entry?.id ?? 0)
      if (!userId) return

      const status =
        toBooleanPresence(entry?.is_online) ??
        toBooleanPresence(entry?.online) ??
        toBooleanPresence(entry?.status) ??
        false

      map.set(String(userId), {
        isOnline: status,
        lastSeenAt: entry?.last_seen_at || entry?.lastSeenAt || '',
      })
    })

    return map
  }, [onlineUsers])

  const resolveMemberPresence = useMemo(() => (
    (member) => {
      const conversationUserId = getConversationUserId(member)
      if (!conversationUserId) return { isOnline: false, lastSeenAt: '' }

      const byOnlineApi = onlinePresenceByUserId.get(String(conversationUserId))
      if (byOnlineApi) return byOnlineApi

      const byUsersApi = users.find((item) => String(getMemberId(item)) === String(conversationUserId))
      return {
        isOnline: false,
        lastSeenAt: byUsersApi?.last_seen_at || byUsersApi?.lastSeenAt || '',
      }
    }
  ), [onlinePresenceByUserId, users])

  const getConversationMembers = useMemo(() => (
    (conversation) => (Array.isArray(conversation?.users) ? conversation.users : (Array.isArray(conversation?.members) ? conversation.members : []))
  ), [])

  const getConversationPresence = useMemo(() => (
    (conversation) => {
      const members = getConversationMembers(conversation)
      if (!members.length) {
        return { isOnline: false, lastSeenAt: '', members: [], onlineCount: 0, totalCount: 0 }
      }

      const normalizedMembers = members.map((member) => {
        const presence = resolveMemberPresence(member)
        return {
          ...member,
          is_online: presence.isOnline,
          last_seen_at: presence.lastSeenAt || member?.last_seen_at || member?.lastSeenAt || '',
        }
      })

      const onlineCount = normalizedMembers.filter((member) => Boolean(member?.is_online)).length
      const type = getConversationType(conversation)
      if (type === 'group') {
        return {
          isOnline: onlineCount > 0,
          lastSeenAt: '',
          members: normalizedMembers,
          onlineCount,
          totalCount: normalizedMembers.length,
        }
      }

      const directTarget = normalizedMembers.find((member) => String(getConversationUserId(member)) !== currentUserId) || normalizedMembers[0]
      return {
        isOnline: Boolean(directTarget?.is_online),
        lastSeenAt: directTarget?.last_seen_at || '',
        members: normalizedMembers,
        onlineCount,
        totalCount: normalizedMembers.length,
      }
    }
  ), [currentUserId, getConversationMembers, resolveMemberPresence])

  useEffect(() => {
    if (!open) return
    setMode('list')
    if (selectedConversationId) return

    const firstId = getConversationId(conversations[0])
    if (firstId) {
      setSelectedConversationId(firstId)
    }
  }, [conversations, open, selectedConversationId, setSelectedConversationId])

  useEffect(() => {
    if (open) return
    setMode('list')
    setQuery('')
    setConversationFilter('all')
    setListScrollPercent(0)
  }, [open])

  const filteredConversations = useMemo(() => {
    const value = String(query || '').trim().toLowerCase()
    const withFilter = conversations.filter((conversation) => {
      const type = getConversationType(conversation)
      const presence = getConversationPresence(conversation)

      if (conversationFilter === 'online' && !presence.isOnline) return false
      if (conversationFilter === 'groups' && type !== 'group') return false
      if (conversationFilter === 'unread' && Number(conversation?.unread_count || 0) <= 0) return false

      return true
    })

    const sorted = [...withFilter].sort((first, second) => {
      const firstStamp = new Date(
        getConversationLastMessage(first)?.created_at
        || getConversationLastMessage(first)?.createdAt
        || first?.last_message_at
        || first?.updated_at
        || 0
      ).getTime()
      const secondStamp = new Date(
        getConversationLastMessage(second)?.created_at
        || getConversationLastMessage(second)?.createdAt
        || second?.last_message_at
        || second?.updated_at
        || 0
      ).getTime()
      return secondStamp - firstStamp
    })

    if (!value) return sorted

    return sorted.filter((conversation) => {
      const text = [conversation?.display_name, conversation?.name, getLastMessagePreview(conversation)].filter(Boolean).join(' ').toLowerCase()
      return text.includes(value)
    })
  }, [conversationFilter, conversations, getConversationPresence, query])

  useEffect(() => {
    if (mode !== 'list') return
    const frameId = window.requestAnimationFrame(syncListScrollPercent)
    return () => window.cancelAnimationFrame(frameId)
  }, [filteredConversations.length, mode, query, conversationFilter])

  const selectedConversation = useMemo(() => (
    filteredConversations.find((item) => String(getConversationId(item)) === String(selectedConversationId || ''))
      || conversations.find((item) => String(getConversationId(item)) === String(selectedConversationId || ''))
      || null
  ), [conversations, filteredConversations, selectedConversationId])

  const conversationMutations = useChatConversationMutations()
  const messagesQuery = useChatMessages(getConversationId(selectedConversation), { page: 1 }, {
    enabled: open && mode === 'chat' && Boolean(getConversationId(selectedConversation)),
  })
  const messageMutations = useChatMessageMutations(getConversationId(selectedConversation), { page: 1 })

  const messages = useMemo(() => {
    const list = Array.isArray(messagesQuery.data) ? messagesQuery.data : []
    const mapped = list.map(toComposerMessage)
    const isGroupConversation = getConversationType(selectedConversation) === 'group'

    return mapped.map((message) => {
      const senderId = toMessageSenderId(message)
      const senderName = toMessageSenderName(message)
      const isMine = Boolean(senderId && currentUserId && senderId === currentUserId)
      const existingStatus = String(message?.status || '').toLowerCase()

      let resolvedStatus = existingStatus
      if (isMine && (!resolvedStatus || resolvedStatus === 'sent' || resolvedStatus === 'delivered' || resolvedStatus === 'read')) {
        if (message?.seen === true || message?.raw?.seen === true) {
          resolvedStatus = 'read'
        } else if (!resolvedStatus || resolvedStatus === 'sent') {
          resolvedStatus = 'delivered'
        }
      }

      if (!resolvedStatus) {
        resolvedStatus = isMine ? 'delivered' : 'received'
      }

      return {
        ...message,
        direction: isMine ? 'outgoing' : 'incoming',
        status: resolvedStatus,
        senderName,
        showSenderName: isGroupConversation && !isMine && Boolean(senderName),
      }
    })
  }, [currentUserId, messagesQuery.data, selectedConversation])

  useEffect(() => {
    if (!open || mode !== 'chat') return
    const currentConversationId = getConversationId(selectedConversation)
    if (!currentConversationId) return
    conversationMutations.markAsRead.mutate(currentConversationId)
  }, [conversationMutations.markAsRead, mode, open, selectedConversation])

  const handleSend = async ({ text, attachment, replyToMessageId }) => {
    const conversationId = getConversationId(selectedConversation)
    if (!conversationId) return

    try {
      await messageMutations.sendMessage.mutateAsync({
        body: text,
        attachments: attachment ? [attachment] : [],
        reply_to_message_id: replyToMessageId || '',
      })
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'تعذر إرسال الرسالة')
    }
  }

  const isRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl'
  const details = getConversationDisplayInfo(selectedConversation || {}, null)
  const selectedConversationPresence = getConversationPresence(selectedConversation)
  const selectedConversationType = getConversationType(selectedConversation)

  const syncListScrollPercent = () => {
    const container = listScrollRef.current
    if (!container) return

    const scrollableHeight = container.scrollHeight - container.clientHeight
    if (scrollableHeight <= 0) {
      setListScrollPercent(0)
      return
    }

    const percent = Math.round((container.scrollTop / scrollableHeight) * 100)
    setListScrollPercent(Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0)
  }

  const handleListSliderChange = (event) => {
    const value = Number(event.target.value || 0)
    setListScrollPercent(value)

    const container = listScrollRef.current
    if (!container) return

    const scrollableHeight = container.scrollHeight - container.clientHeight
    container.scrollTop = Math.round((Math.max(0, Math.min(100, value)) / 100) * Math.max(0, scrollableHeight))
  }

  const openConversation = (conversationId) => {
    setSelectedConversationId(conversationId)
    setMode('chat')
  }

  const handleOpenPage = () => {
    const conversationId = selectedConversationId ? `?conversation=${encodeURIComponent(String(selectedConversationId))}` : ''
    navigate(`/team-chat${conversationId}`)
    onClose?.()
  }

  return (
    <aside
      className="fixed end-0 top-12 bottom-0 z-30 w-[min(390px,calc(100vw-72px))] border-s border-[var(--border)] bg-[var(--surface)] shadow-[-14px_0_30px_rgba(15,23,42,0.08)] transition-transform duration-300"
      style={{ transform: open ? 'translateX(0)' : `translateX(${isRtl ? '-100%' : '100%'})` }}
      aria-hidden={!open}
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        {mode === 'list' ? (
          <>
            <header className="border-b border-[var(--border)] bg-[var(--surface-2)] p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]">
                    <MessagesSquare size={18} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-black text-[var(--text)]">الشات الداخلي</h2>
                    <p className="truncate text-xs font-semibold text-[var(--text-muted)]">{conversations.length} محادثة</p>
                  </div>
                </div>
                <HeaderActions onOpenPage={handleOpenPage} onClose={onClose} />
              </div>

              <label className="relative mt-3 block">
                <Search size={14} className="pointer-events-none absolute start-2.5 top-2.5 text-[var(--text-muted)]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="ابحث..."
                  className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] ps-8 pe-3 text-xs font-semibold text-[var(--text)] outline-none focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]"
                />
              </label>

              <div className="mt-2 flex items-center gap-1">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'online', label: 'النشط' },
                  { id: 'groups', label: 'جروبات' },
                  { id: 'unread', label: 'غير مقروء' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setConversationFilter(item.id)}
                    className={[
                      'inline-flex h-7 items-center justify-center rounded-full border px-2 text-[10px] font-black transition-colors',
                      conversationFilter === item.id
                        ? 'border-[#00C2CB] bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]',
                    ].join(' ')}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </header>

            <div className="relative min-h-0 flex-1">
              <div
                ref={listScrollRef}
                onScroll={syncListScrollPercent}
                className="h-full overflow-y-auto p-2 pe-6"
              >
                {filteredConversations.map((conversation) => {
                  const id = getConversationId(conversation)
                  const isActive = String(id || '') === String(getConversationId(selectedConversation) || '')
                  const type = getConversationType(conversation)
                  const presence = getConversationPresence(conversation)
                  const unreadCount = Number(conversation?.unread_count || 0)
                  const hasUnread = unreadCount > 0
                  return (
                    <button
                      key={id || conversation?.name}
                      type="button"
                      onClick={() => openConversation(id)}
                      className={[
                        'mb-2 w-full rounded-xl border p-2 text-start transition-colors',
                        isActive
                          ? hasUnread
                            ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)] shadow-sm shadow-[#00C2CB]/15'
                            : 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]'
                          : hasUnread
                            ? 'border-[#FECACA] bg-[#FFF7F7] hover:border-[#FCA5A5]'
                            : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]',
                      ].join(' ')}
                    >
                      <div className="flex items-start gap-2">
                        <span className={cn('inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full', hasUnread ? 'bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]' : 'bg-[var(--surface-2)] text-[var(--text-muted)]')}>
                          {type === 'group' ? <UsersRound size={14} /> : <UserRound size={14} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className="flex min-w-0 items-center gap-1">
                              <Circle size={8} className={presence.isOnline ? 'shrink-0 fill-[#22C55E] text-[#22C55E]' : 'shrink-0 fill-[#94A3B8] text-[#94A3B8]'} />
                              <span className={cn('truncate text-xs font-black', hasUnread ? 'text-[var(--text)]' : 'text-[var(--text)]')}>{conversation?.display_name || conversation?.name || 'Conversation'}</span>
                            </span>
                            {hasUnread ? (
                              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-black text-white">
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </span>
                            ) : null}
                          </span>
                          <span className="mt-1 flex items-center justify-between gap-2 text-[10px] font-semibold text-[var(--text-muted)]">
                            <span className={cn('min-w-0 truncate', hasUnread && 'font-black text-[var(--text)]')}>{getLastMessagePreview(conversation)}</span>
                            <span className={cn('shrink-0', hasUnread && 'font-black text-[var(--text)]')}>{formatConversationTimestamp(getConversationLastMessage(conversation)?.created_at || getConversationLastMessage(conversation)?.createdAt || conversation?.updated_at)}</span>
                          </span>
                          <span className={[
                            'mt-1 block truncate text-[10px] font-black',
                            hasUnread ? 'text-[var(--text)]' : presence.isOnline ? 'text-[#15803D]' : 'text-[var(--text-muted)]',
                          ].join(' ')}>
                            {type === 'group'
                              ? `Online ${presence.onlineCount}/${presence.totalCount}`
                              : (presence.isOnline ? 'Online' : `Offline${presence.lastSeenAt ? ` • آخر تواجد ${formatLastSeen(presence.lastSeenAt)}` : ''}`)}
                          </span>
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {filteredConversations.length > 5 ? (
                <div className="pointer-events-none absolute inset-y-3 end-1 flex w-4 items-center justify-center">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={listScrollPercent}
                    onChange={handleListSliderChange}
                    className="pointer-events-auto h-full w-4 cursor-pointer accent-[var(--brand-accent)]"
                    style={{ writingMode: 'vertical-rl' }}
                    aria-label="سلايدر التنقل بين المحادثات"
                  />
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <header className="border-b border-[var(--border)] bg-[var(--surface-2)] p-3">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setMode('list')}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-xs font-black text-[var(--text)] transition-colors hover:bg-[var(--surface-2)]"
                >
                  <ChevronRight size={14} />
                  رجوع
                </button>
                <div className="min-w-0 text-center">
                  <h3 className="truncate text-sm font-black text-[var(--text)]">{details.name || 'Internal chat'}</h3>
                  <p className="truncate text-[10px] font-semibold text-[var(--text-muted)]">{details.subtitle || 'Team discussion'}</p>
                  <div className="mt-1 flex items-center justify-center gap-1.5 text-[10px] font-black">
                    <Circle size={8} className={selectedConversationPresence.isOnline ? 'fill-[#22C55E] text-[#22C55E]' : 'fill-[#94A3B8] text-[#94A3B8]'} />
                    <span className={selectedConversationPresence.isOnline ? 'text-[#15803D]' : 'text-[var(--text-muted)]'}>
                      {selectedConversationType === 'group'
                        ? `Group • Online ${selectedConversationPresence.onlineCount}/${selectedConversationPresence.totalCount}`
                        : (selectedConversationPresence.isOnline
                          ? 'Direct • Online'
                          : `Direct • Offline${selectedConversationPresence.lastSeenAt ? ` • آخر تواجد ${formatLastSeen(selectedConversationPresence.lastSeenAt)}` : ''}`)}
                    </span>
                  </div>
                </div>
                <HeaderActions onOpenPage={handleOpenPage} onClose={onClose} />
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-hidden">
              <ConversationThread
                title={details.name || 'Internal chat'}
                contactText={details.subtitle || 'Team discussion'}
                avatarUrl={details.avatar || ''}
                contactDetails={{
                  name: details.name || 'Internal chat',
                  contact: details.subtitle || 'Team discussion',
                  channel: 'Internal Chat',
                  conversationId: getConversationId(selectedConversation),
                  users: getConversationPresence(selectedConversation).members,
                  presence: {
                    isOnline: getConversationPresence(selectedConversation).isOnline,
                    lastSeenAt: getConversationPresence(selectedConversation).lastSeenAt,
                  },
                  status: selectedConversation?.status || '',
                }}
                messages={messages}
                isLoadingMessages={messagesQuery.isLoading}
                error={messagesQuery.error?.message || ''}
                hasMoreMessages={false}
                isSending={messageMutations.sendMessage.isPending}
                onSend={handleSend}
                supportsAttachments
                supportsReply
                supportsReactions={false}
                showCrmControls={false}
                showConversationStatusControl={false}
                channelColor="#0F766E"
                autoFocusKey={getConversationId(selectedConversation)}
                composerDisabled={!getConversationId(selectedConversation)}
                emptyMessage={getConversationId(selectedConversation) ? 'لا توجد رسائل بعد.' : 'اختر محادثة'}
                emptyDescription={getConversationId(selectedConversation) ? 'ابدأ المحادثة مع الفريق.' : 'اختر محادثة من القائمة.'}
              />
            </div>
          </>
        )}
      </div>
    </aside>
  )
}
