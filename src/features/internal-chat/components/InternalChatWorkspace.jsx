import { EntityMentionsButton } from '../../mentions'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronsLeft, ChevronsRight, Circle, MessagesSquare, Plus, Search, UserRound, UsersRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { AppModal } from '../../../shared/components/overlays/AppModal'
import { ConversationThread } from '../../conversations'
import { useOnlineUsers, useUsers } from '../../users/hooks/useUsers'
import { useChatConversationMutations, useChatConversations } from '../hooks/useChatConversations'
import { useChatMessageMutations, useChatMessages } from '../hooks/useChatMessages'
import { useChatRealtime } from '../hooks/useChatRealtime'
import { useInternalChatUiStore } from '../store/internalChatUiStore'
import { getConversationDisplayInfo, getConversationId, getLastMessagePreview } from '../utils/conversationHelpers'
import { InternalChatCreatePanel } from '..'
import { cn } from '../../../shared/utils/cn'
import { useAuthStore } from '../../../store/authStore'

const SENDER_COLORS = [
  { text: '#1D4ED8', background: '#EFF6FF', border: '#BFDBFE' },
  { text: '#047857', background: '#ECFDF5', border: '#A7F3D0' },
  { text: '#B45309', background: '#FFFBEB', border: '#FDE68A' },
  { text: '#7C3AED', background: '#F5F3FF', border: '#DDD6FE' },
  { text: '#BE123C', background: '#FFF1F2', border: '#FDA4AF' },
  { text: '#0F766E', background: '#F0FDFA', border: '#99F6E4' },
  { text: '#4338CA', background: '#EEF2FF', border: '#C7D2FE' },
  { text: '#A16207', background: '#FEFCE8', border: '#FDE047' },
]

const DETAILS_AUTO_CLOSE_MAX_WIDTH = 1500

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

function getSenderId(message) {
  return String(
    message?.raw?.sender_id
    || message?.sender_id
    || message?.raw?.sent_by?.id
    || message?.raw?.sent_by_user?.id
    || message?.raw?.sender?.id
    || message?.sender?.id
    || ''
  )
}

function getSenderName(message) {
  return String(
    message?.raw?.sent_by?.name
    || message?.raw?.sent_by_user?.name
    || message?.raw?.sender?.name
    || message?.sender?.name
    || ''
  )
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

function getMemberRole(user) {
  return String(user?.role || user?.member_role || user?.pivot?.role || 'member').toLowerCase()
}

function mapMessage(message) {
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

export function InternalChatWorkspace({ conversations: scopedConversations, scopeKey, conversationFilter: scopeFilter = null, title = null, headerAction = null, emptyList = null } = {}) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [conversationFilter, setConversationFilter] = useState('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [hoveredConversationId, setHoveredConversationId] = useState('')
  const globalActiveId = useInternalChatUiStore((state) => state.activeConversationId)
  const setGlobalActiveId = useInternalChatUiStore((state) => state.setActiveConversationId)
  const sidebarCollapsed = useInternalChatUiStore((state) => state.sidebarCollapsed)
  const setSidebarCollapsed = useInternalChatUiStore((state) => state.setSidebarCollapsed)
  const detailsPanelOpen = useInternalChatUiStore((state) => state.detailsPanelOpen)
  const setDetailsPanelOpen = useInternalChatUiStore((state) => state.setDetailsPanelOpen)
  const [localActiveId, setLocalActiveId] = useState(null)
  const activeConversationId = scopeKey ? localActiveId : globalActiveId
  const setActiveConversationId = scopeKey ? setLocalActiveId : setGlobalActiveId
  const isRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl'
  const currentUser = useAuthStore((state) => state.user)
  const currentUserId = String(currentUser?.id ?? currentUser?.user_id ?? currentUser?.userId ?? '')

  const conversationsQuery = useChatConversations({ per_page: 50 }, { enabled: scopedConversations === undefined })
  const allConversations = scopedConversations ?? (Array.isArray(conversationsQuery.data) ? conversationsQuery.data : [])
  const conversations = useMemo(() => (scopeFilter ? allConversations.filter(scopeFilter) : allConversations), [allConversations, scopeFilter])
  const usersQuery = useUsers()
  const onlineUsersQuery = useOnlineUsers(undefined, { refetchInterval: 30000 })
  const users = Array.isArray(usersQuery.data) ? usersQuery.data : []
  const onlineUsers = Array.isArray(onlineUsersQuery.data) ? onlineUsersQuery.data : []
  const [selectedUserToAdd, setSelectedUserToAdd] = useState('')
  const [memberActionId, setMemberActionId] = useState('')
  const wasCompactViewportRef = useRef(false)

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
    if (activeConversationId && conversations.some((item) => String(getConversationId(item)) === String(activeConversationId))) return
    const firstId = getConversationId(conversations[0])
    if (firstId) setActiveConversationId(firstId)
  }, [activeConversationId, conversations, setActiveConversationId])

  useEffect(() => {
    if (activeConversationId) {
      setDetailsPanelOpen(false)
    }
  }, [activeConversationId, setDetailsPanelOpen])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const syncViewportState = () => {
      const isCompact = window.innerWidth <= DETAILS_AUTO_CLOSE_MAX_WIDTH

      // Close once when entering compact width; user can reopen manually.
      if (isCompact && !wasCompactViewportRef.current && detailsPanelOpen) {
        setDetailsPanelOpen(false)
      }

      wasCompactViewportRef.current = isCompact
    }

    syncViewportState()
    window.addEventListener('resize', syncViewportState)
    return () => window.removeEventListener('resize', syncViewportState)
  }, [detailsPanelOpen, setDetailsPanelOpen])

  const filtered = useMemo(() => {
    const value = String(query || '').trim().toLowerCase()
    return conversations.filter((conversation) => {
      const type = getConversationType(conversation)
      const presence = getConversationPresence(conversation)

      if (conversationFilter === 'groups' && type !== 'group') return false
      if (conversationFilter === 'direct' && type !== 'direct') return false
      if (conversationFilter === 'online' && !presence.isOnline) return false
      if (conversationFilter === 'unread' && Number(conversation?.unread_count || 0) <= 0) return false

      if (!value) return true
      const text = [conversation?.display_name, conversation?.name, getLastMessagePreview(conversation)].filter(Boolean).join(' ').toLowerCase()
      return text.includes(value)
    })
  }, [conversationFilter, conversations, getConversationPresence, query])

  const activeConversation = useMemo(() => (
    filtered.find((conversation) => String(getConversationId(conversation)) === String(activeConversationId || ''))
      || conversations.find((conversation) => String(getConversationId(conversation)) === String(activeConversationId || ''))
      || null
  ), [activeConversationId, conversations, filtered])

  const messagesQuery = useChatMessages(getConversationId(activeConversation), { page: 1 }, {
    enabled: Boolean(getConversationId(activeConversation)),
  })
  const messageMutations = useChatMessageMutations(getConversationId(activeConversation), { page: 1 })
  const conversationMutations = useChatConversationMutations()
  const activeId = getConversationId(activeConversation)
  const markAsRead = conversationMutations.markAsRead.mutate

  useChatRealtime({ activeConversationId: getConversationId(activeConversation), enabled: true })

  useEffect(() => {
    if (!activeId) return
    markAsRead(activeId)
  }, [activeId, markAsRead])

  const messages = useMemo(() => {
    const list = Array.isArray(messagesQuery.data) ? messagesQuery.data : []
    const mapped = list.map(mapMessage)
    const isGroupConversation = getConversationType(activeConversation) === 'group'

    const colorBySender = new Map()
    let colorIndex = 0

    return mapped.map((message) => {
      const senderId = getSenderId(message)
      const senderName = getSenderName(message)
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

      if (isGroupConversation && !isMine && senderId && !colorBySender.has(senderId)) {
        colorBySender.set(senderId, SENDER_COLORS[colorIndex % SENDER_COLORS.length])
        colorIndex += 1
      }

      const senderColor = senderId ? colorBySender.get(senderId) : null

      return {
        ...message,
        status: resolvedStatus,
        direction: isMine ? 'outgoing' : 'incoming',
        senderName,
        showSenderName: isGroupConversation && !isMine && Boolean(senderName),
        incomingStyle: isGroupConversation && !isMine && senderColor ? senderColor : undefined,
      }
    })
  }, [activeConversation, currentUserId, messagesQuery.data])

  const details = getConversationDisplayInfo(activeConversation || {}, null)
  const hoveredConversation = useMemo(() => {
    if (!hoveredConversationId) return null
    return conversations.find((item) => String(getConversationId(item)) === String(hoveredConversationId)) || null
  }, [conversations, hoveredConversationId])

  const detailsItems = useMemo(() => {
    if (!activeConversation) return []
    return [
      { key: 'name', label: 'الاسم', value: details.name || 'Internal chat' },
      { key: 'contact', label: 'التواصل', value: details.subtitle || 'Team collaboration' },
      { key: 'channel', label: 'القناة', value: 'Internal Chat' },
      { key: 'conversation', label: 'المحادثة', value: getConversationId(activeConversation) ? `#${getConversationId(activeConversation)}` : '' },
      { key: 'type', label: 'نوع المحادثة', value: activeConversation?.type || 'group' },
      { key: 'members', label: 'الأعضاء', value: String(activeConversation?.users_count || activeConversation?.users?.length || 0) },
    ].filter((item) => item.value)
  }, [activeConversation, details])

  const groupMembers = useMemo(() => {
    if (getConversationType(activeConversation) !== 'group') return []
    return getConversationPresence(activeConversation).members
  }, [activeConversation, getConversationPresence])

  const activeConversationPresence = useMemo(() => (
    getConversationPresence(activeConversation)
  ), [activeConversation, getConversationPresence])

  const currentMember = useMemo(() => groupMembers.find((member) => String(getMemberId(member)) === currentUserId) || null, [currentUserId, groupMembers])
  const currentMemberRole = getMemberRole(currentMember)
  const canManageMembers = currentMemberRole === 'admin' || currentMemberRole === 'owner'

  const candidateUsers = useMemo(() => {
    const existingIds = new Set(groupMembers.map((member) => String(getMemberId(member))))
    return users.filter((user) => {
      const id = String(getMemberId(user) || '')
      return id && !existingIds.has(id)
    })
  }, [groupMembers, users])

  const handleSend = async ({ text, attachment, replyToMessageId }) => {
    const conversationId = getConversationId(activeConversation)
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

  const handleChangeRole = async (member, role) => {
    const conversationId = getConversationId(activeConversation)
    const userId = getMemberId(member)
    if (!conversationId || !userId || !canManageMembers) return

    try {
      setMemberActionId(`role-${userId}`)
      await conversationMutations.updateMemberRole.mutateAsync({ conversationId, userId, role })
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'تعذر تحديث دور العضو')
    } finally {
      setMemberActionId('')
    }
  }

  const handleRemoveMember = async (member) => {
    const conversationId = getConversationId(activeConversation)
    const userId = getMemberId(member)
    if (!conversationId || !userId || !canManageMembers) return

    try {
      setMemberActionId(`remove-${userId}`)
      await conversationMutations.removeMember.mutateAsync({ conversationId, userId })
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'تعذر إزالة العضو')
    } finally {
      setMemberActionId('')
    }
  }

  const handleAddMember = async () => {
    const conversationId = getConversationId(activeConversation)
    const userId = Number(selectedUserToAdd)
    if (!conversationId || !userId || !canManageMembers) return

    try {
      setMemberActionId(`add-${userId}`)
      await conversationMutations.addMembers.mutateAsync({ conversationId, userIds: [userId] })
      setSelectedUserToAdd('')
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'تعذر إضافة العضو')
    } finally {
      setMemberActionId('')
    }
  }

  return (
    <div
      className={cn(
        'grid min-h-[calc(100vh-170px)] gap-4 overflow-x-auto border-s border-[var(--border)] pe-3 xl:items-start',
        sidebarCollapsed ? 'grid-cols-[76px_minmax(0,1fr)]' : 'grid-cols-[280px_minmax(0,1fr)]',
        detailsPanelOpen
          ? (sidebarCollapsed ? 'xl:grid-cols-[76px_minmax(0,1fr)_320px]' : 'xl:grid-cols-[280px_minmax(0,1fr)_320px]')
          : null
      )}
    >
      <section className={cn('min-h-[360px] rounded-lg border border-[var(--border)] bg-[var(--surface)] xl:sticky xl:top-16 xl:max-h-[calc(100vh-5rem)] xl:self-start xl:overflow-hidden', sidebarCollapsed && 'relative')}>
        <header className="border-b border-[var(--border)] p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]">
              <MessagesSquare size={18} />
            </span>
            {!sidebarCollapsed ? (
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-black text-[var(--text)]">{title || 'محادثات الفريق'}</h2>
                <p className="text-xs font-semibold text-[var(--text-muted)]">{conversations.length} محادثة</p>
              </div>
            ) : null}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-[10px] font-black text-[var(--brand-accent)] transition-colors hover:bg-[var(--brand-accent-soft)]"
                title={t('communication.modules.team-chat.create.form.shortcutTitle')}
                aria-label={t('communication.modules.team-chat.create.form.shortcutTitle')}
              >
                <Plus size={14} />
                {!sidebarCollapsed ? <span>{t('communication.modules.team-chat.create.form.shortcutLabel')}</span> : null}
              </button>
              <button
                type="button"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                title={sidebarCollapsed ? 'فتح قائمة محادثات الفريق' : 'إغلاق قائمة محادثات الفريق'}
                aria-label={sidebarCollapsed ? 'فتح قائمة محادثات الفريق' : 'إغلاق قائمة محادثات الفريق'}
              >
                {sidebarCollapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
              </button>
            </div>
            {headerAction ? <div className="ms-auto">{headerAction}</div> : null}
          </div>

          {!sidebarCollapsed ? (
            <>
              <div className="mt-3 flex items-center gap-2">
                <label className="relative block flex-1">
                  <Search size={14} className="pointer-events-none absolute start-2.5 top-2.5 text-[var(--text-muted)]" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="ابحث في المحادثات..."
                    className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] ps-8 pe-3 text-xs font-semibold text-[var(--text)] outline-none focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]"
                  />
                </label>
              </div>

              <div className="mt-2 flex items-center gap-1">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'online', label: 'اونلاين' },
                  { id: 'groups', label: 'جروبات' },
                  { id: 'direct', label: 'مباشر' },
                  { id: 'unread', label: 'غير مقروء' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setConversationFilter(item.id)}
                    className={cn(
                      'inline-flex h-7 items-center justify-center rounded-full border px-2 text-[10px] font-black transition-colors',
                      conversationFilter === item.id
                        ? 'border-[#00C2CB] bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </header>

        {!sidebarCollapsed ? (
          <div className="max-h-[calc(100vh-240px)] overflow-y-auto p-2">
            {!conversations.length && !conversationsQuery.isLoading && emptyList}
            {filtered.map((conversation) => {
              const id = getConversationId(conversation)
              const active = String(id || '') === String(getConversationId(activeConversation) || '')
              const type = getConversationType(conversation)
              const presence = getConversationPresence(conversation)
              const unreadCount = Number(conversation?.unread_count || 0)
              const hasUnread = unreadCount > 0
              return (
                <button
                  key={id || conversation?.name}
                  type="button"
                  onClick={() => setActiveConversationId(id)}
                  className={[
                    'mb-2 w-full rounded-xl border p-3 text-start transition-colors',
                    active
                      ? hasUnread
                        ? 'border-[#00C2CB] bg-[var(--brand-accent-soft)] shadow-sm shadow-[#00C2CB]/15'
                        : 'border-[#00C2CB] bg-[var(--brand-accent-soft)]'
                      : hasUnread
                        ? 'border-[#FECACA] bg-[#FFF7F7] hover:border-[#FCA5A5]'
                        : 'border-[var(--border)] bg-[var(--surface-2)] hover:border-[#B8EFF2]',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1.5">
                      {type === 'group' ? <UsersRound size={13} className="shrink-0 text-[var(--text-muted)]" /> : <UserRound size={13} className="shrink-0 text-[var(--text-muted)]" />}
                      <Circle size={8} className={presence.isOnline ? 'shrink-0 fill-[#22C55E] text-[#22C55E]' : 'shrink-0 fill-[#94A3B8] text-[#94A3B8]'} />
                      <span className={cn('truncate text-sm font-black', hasUnread ? 'text-[var(--text)]' : 'text-[var(--text)]')}>{conversation?.display_name || conversation?.name || 'Conversation'}</span>
                    </span>
                    {hasUnread ? (
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-black text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-1 flex items-center justify-between gap-2 text-[10px] font-semibold text-[var(--text-muted)]">
                    <p className={cn('truncate', hasUnread && 'font-black text-[var(--text)]')}>{getLastMessagePreview(conversation)}</p>
                    <span className={cn('shrink-0', hasUnread && 'font-black text-[var(--text)]')}>{formatConversationTimestamp(getConversationLastMessage(conversation)?.created_at || getConversationLastMessage(conversation)?.createdAt || conversation?.updated_at)}</span>
                  </div>

                  {type === 'group' ? (
                    <p className={cn('mt-1 truncate text-[10px] font-black', hasUnread ? 'text-[var(--text)]' : 'text-[var(--text-muted)]')}>
                      {presence.onlineCount}/{presence.totalCount} Online
                    </p>
                  ) : (
                    <p className={cn('mt-1 truncate text-[10px] font-black', hasUnread ? 'text-[var(--text)]' : presence.isOnline ? 'text-[#15803D]' : 'text-[var(--text-muted)]')}>
                      {presence.isOnline ? 'Online' : `Offline${presence.lastSeenAt ? ` • آخر تواجد ${formatLastSeen(presence.lastSeenAt)}` : ''}`}
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        ) : (
          <div className="relative max-h-[calc(100vh-240px)] overflow-y-auto p-2">
            {filtered.map((conversation) => {
              const id = getConversationId(conversation)
              const active = String(id || '') === String(getConversationId(activeConversation) || '')
              const isDirect = String(conversation?.type || '').toLowerCase() === 'direct'
              const presence = getConversationPresence(conversation)
              return (
                <button
                  key={id || conversation?.name}
                  type="button"
                  onClick={() => setActiveConversationId(id)}
                  onMouseEnter={() => setHoveredConversationId(String(id || ''))}
                  onMouseLeave={() => setHoveredConversationId('')}
                  className={cn(
                    'relative mb-2 inline-flex h-12 w-full items-center justify-center rounded-lg border transition-colors',
                    active ? 'border-[#00C2CB] bg-[var(--brand-accent-soft)]' : 'border-[var(--border)] bg-[var(--surface-2)] hover:border-[#B8EFF2]'
                  )}
                  aria-label={conversation?.display_name || conversation?.name || 'Conversation'}
                  title={conversation?.display_name || conversation?.name || 'Conversation'}
                >
                  {isDirect ? <UserRound size={16} className="text-[var(--text)]" /> : <UsersRound size={16} className="text-[var(--text)]" />}
                  <span className={cn('absolute bottom-1 start-1 h-2.5 w-2.5 rounded-full border border-white', presence.isOnline ? 'bg-[#22C55E]' : 'bg-[#94A3B8]')} />
                  {conversation?.unread_count > 0 ? (
                    <span className="absolute -top-1 -end-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[9px] font-black text-white">
                      {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                    </span>
                  ) : null}
                </button>
              )
            })}

            {hoveredConversation ? (
              <div
                className="pointer-events-none absolute top-2 z-20 w-52 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 shadow-lg"
                style={{ [isRtl ? 'right' : 'left']: 'calc(100% + 8px)' }}
              >
                {(() => {
                  const hoveredPresence = getConversationPresence(hoveredConversation)
                  return (
                    <>
                <p className="truncate text-xs font-black text-[var(--text)]">{hoveredConversation?.display_name || hoveredConversation?.name || 'Conversation'}</p>
                <p className={cn('mt-1 truncate text-[10px] font-black', hoveredPresence.isOnline ? 'text-[#15803D]' : 'text-[var(--text-muted)]')}>
                  {hoveredPresence.isOnline ? 'Online' : `Offline${hoveredPresence.lastSeenAt ? ` • آخر تواجد ${formatLastSeen(hoveredPresence.lastSeenAt)}` : ''}`}
                </p>
                <p className="mt-1 truncate text-[10px] font-semibold text-[var(--text-muted)]">{getLastMessagePreview(hoveredConversation)}</p>
                <p className="mt-1 text-[10px] font-black text-[var(--text-muted)]">{formatConversationTimestamp(getConversationLastMessage(hoveredConversation)?.created_at || getConversationLastMessage(hoveredConversation)?.createdAt || hoveredConversation?.updated_at)}</p>
                    </>
                  )
                })()}
              </div>
            ) : null}
          </div>
        )}
      </section>

      <AppModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t('communication.modules.team-chat.create.form.shortcutTitle')}
        description={t('communication.modules.team-chat.create.form.shortcutDescription')}
        size="lg"
      >
        <InternalChatCreatePanel onCreated={() => setIsCreateModalOpen(false)} />
      </AppModal>

      <section className="flex min-h-[520px] min-w-[320px] flex-col rounded-lg border border-[var(--border)] bg-[var(--surface)] xl:sticky xl:top-16 xl:h-[calc(100vh-5rem)] xl:max-h-[calc(100vh-5rem)] xl:self-start xl:overflow-hidden">
        <ConversationThread
          title={details.name || 'Internal chat'}
          contactText={details.subtitle || 'Team collaboration'}
          avatarUrl={details.avatar || ''}
          contactDetails={{
            name: details.name || 'Internal chat',
            contact: details.subtitle || 'Team collaboration',
            channel: 'Internal Chat',
            conversationId: getConversationId(activeConversation),
            users: activeConversationPresence.members,
            presence: {
              isOnline: activeConversationPresence.isOnline,
              lastSeenAt: activeConversationPresence.lastSeenAt,
            },
            status: activeConversation?.status || '',
          }}
          messages={messages}
          isLoadingMessages={messagesQuery.isLoading}
          error={messagesQuery.error?.message || ''}
          hasMoreMessages={false}
          isSending={messageMutations.sendMessage.isPending}
          onSend={handleSend}
          supportsAttachments
          supportsReply
          showCrmControls={false}
          showConversationStatusControl={false}
          headerActions={<div className="flex items-center gap-2">
            <EntityMentionsButton entityType="chat" entityId={activeId} />
            <button
              type="button"
              onClick={() => setDetailsPanelOpen(!detailsPanelOpen)}
              className="inline-flex h-7 items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 text-[10px] font-black text-[var(--text-muted)] transition hover:bg-[var(--surface-2)]"
              title={detailsPanelOpen ? 'إغلاق تفاصيل المحادثة' : 'فتح تفاصيل المحادثة'}
            >
              <UsersRound size={12} />
              {detailsPanelOpen ? 'إغلاق التفاصيل' : 'التفاصيل'}
            </button>
          </div>}
          channelColor="#0F766E"
          autoFocusKey={getConversationId(activeConversation)}
          composerDisabled={!getConversationId(activeConversation)}
          emptyMessage={getConversationId(activeConversation) ? 'لا توجد رسائل بعد.' : 'اختر محادثة'}
          emptyDescription={getConversationId(activeConversation) ? 'ابدأ أول رسالة داخل الفريق.' : 'اختر محادثة من القائمة.'}
        />
      </section>

      {detailsPanelOpen ? (
        <section className="hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 xl:block xl:sticky xl:top-16 xl:max-h-[calc(100vh-5rem)] xl:overflow-y-auto">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]">
                <UsersRound size={16} />
              </span>
              <h3 className="text-sm font-black text-[var(--text)]">تفاصيل المحادثة</h3>
            </div>
            <button
              type="button"
              onClick={() => setDetailsPanelOpen(false)}
              className="inline-flex h-7 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-[10px] font-black text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)]"
            >
              إغلاق
            </button>
          </div>

          {!activeConversation ? (
            <p className="mt-4 text-xs font-semibold text-[var(--text-muted)]">اختر محادثة لعرض الأعضاء والإعدادات.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {detailsItems.map((item) => (
                <div key={item.key} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                  <div className="text-xs font-bold text-[var(--text-muted)]">{item.label}</div>
                  <div className="mt-1 text-sm font-black text-[var(--text)]">{item.value}</div>
                </div>
              ))}

              {getConversationType(activeConversation) === 'group' ? (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-black text-[var(--text)]">أعضاء الجروب</h4>
                      <p className="text-[10px] font-semibold text-[var(--text-muted)]">
                        {canManageMembers ? 'يمكنك إدارة الأدوار وإضافة أو إزالة الأعضاء.' : 'يمكنك عرض أسماء الأعضاء وأدوارهم.'}
                      </p>
                    </div>
                  </div>

                  {canManageMembers ? (
                    <div className="mb-3 flex items-center gap-2">
                      <select
                        value={selectedUserToAdd}
                        onChange={(event) => setSelectedUserToAdd(event.target.value)}
                        className="h-8 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-xs font-semibold text-[var(--text)] outline-none focus:border-[#00C2CB]"
                      >
                        <option value="">اختر مستخدم للإضافة</option>
                        {candidateUsers.map((user) => (
                          <option key={getMemberId(user) || user?.email || user?.name} value={String(getMemberId(user) || '')}>
                            {user?.name || user?.email || `User #${getMemberId(user)}`}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddMember}
                        disabled={!selectedUserToAdd || memberActionId.startsWith('add-')}
                        className="inline-flex h-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 text-[10px] font-black text-[var(--text)] transition hover:bg-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        إضافة
                      </button>
                    </div>
                  ) : null}

                  {groupMembers.length === 0 ? (
                    <p className="text-xs font-semibold text-[var(--text-muted)]">لا يوجد أعضاء حالياً.</p>
                  ) : (
                    <div className="space-y-2">
                      {groupMembers.map((member) => {
                        const memberId = getMemberId(member)
                        const role = getMemberRole(member)
                        const isOwner = role === 'owner'
                        const isCurrentUser = String(memberId) === currentUserId
                        const canChangeRole = canManageMembers && !isOwner
                        const canRemove = canManageMembers && !isOwner && !isCurrentUser

                        return (
                          <div key={String(memberId || member?.email || member?.name)} className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-xs font-black text-[var(--text)]">{member?.name || member?.email || `User #${memberId}`}</p>
                                <p className="text-[10px] font-semibold text-[var(--text-muted)]">{role === 'owner' ? 'Owner' : role === 'admin' ? 'Admin' : 'Member'}{isCurrentUser ? ' • أنت' : ''}</p>
                                <p className={cn('mt-1 text-[10px] font-black', member?.is_online ? 'text-[#15803D]' : 'text-[var(--text-muted)]')}>
                                  {member?.is_online ? 'Online' : `Offline${member?.last_seen_at ? ` • آخر تواجد ${formatLastSeen(member.last_seen_at)}` : ''}`}
                                </p>
                              </div>

                              {canManageMembers ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleChangeRole(member, role === 'admin' ? 'member' : 'admin')}
                                    disabled={!canChangeRole || memberActionId === `role-${memberId}`}
                                    className="inline-flex h-7 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 text-[10px] font-black text-[var(--text)] transition hover:bg-[var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {isOwner ? 'Owner' : role === 'admin' ? 'جعل عضو' : 'جعل أدمن'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveMember(member)}
                                    disabled={!canRemove || memberActionId === `remove-${memberId}`}
                                    className="inline-flex h-7 items-center justify-center rounded-md border border-[#FECACA] bg-[#FEF2F2] px-2 text-[10px] font-black text-[#B91C1C] transition hover:bg-[#FEE2E2] disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    إزالة
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </section>
      ) : null}
    </div>
  )
}
