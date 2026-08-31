import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  CheckCheck,
  ChevronRight,
  ExternalLink,
  Search,
  UserPlus,
  UserRound,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import {
  useMessengerConversationInfo,
  useMessengerConversationMutations,
  useMessengerConversations,
  useMessengerMessages,
} from '../hooks/useConversations'
import {
  MESSENGER_CONVERSATIONS_QUERY_KEY,
  MESSENGER_CONVERSATION_INFO_QUERY_KEY,
  MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY,
  applyMessengerMessagePatchToCachedResponse,
  applyMessengerReactionToCachedResponse,
  extractMessengerMessages,
  getMessengerConversationId,
  getMessengerConversationSubtitle,
  getMessengerConversationTitle,
  getMessengerContactId,
  getMessengerRealtimeConversation,
  getMessengerRealtimeConversationId,
  getMessengerRealtimeMessage,
  getMessengerRealtimeMessagePatch,
  getMessengerRealtimeReaction,
  getMessengerRealtimeReactionMessageId,
  getMessengerProfilePicture,
  getMessengerMessageId,
  isOutgoingMessage,
  normalizeMessengerMessage,
  sortMessagesAscending,
  upsertMessengerConversation,
  upsertMessengerMessage,
} from '../utils/messengerConversations'
import { playMessengerNotificationSound } from '../utils/messengerNotificationSound'
import { useMessengerNotificationsStore } from '../store/messengerNotificationsStore'
import { useMessengerRealtime } from '../../../realtime/hooks/useMessengerRealtime'
import { MessengerChatThread } from './MessengerChatThread'
import { useRealtimeMessageHighlight } from '../hooks/useRealtimeMessageHighlight'
import { MessengerLinkCustomerDialog } from './MessengerLinkCustomerDialog'
import { MessengerLogoIcon } from './MessengerNavbarButton'
import {
  DEFAULT_MESSENGER_CONVERSATION_FILTERS,
  MessengerConversationFilters,
  filterMessengerConversations,
} from './MessengerConversationFilters'
import { MessengerConversationHoverPreview } from './MessengerConversationHoverPreview'

function formatTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] || 'M'
  const second = parts[1]?.[0] || ''
  return `${first}${second}`.toUpperCase()
}

function getConversationContact(conversation) {
  return (
    conversation?.customer?.phone ||
    conversation?.lead?.phone ||
    conversation?.phone ||
    conversation?.customer?.email ||
    conversation?.lead?.email ||
    conversation?.email ||
    'بدون بيانات تواصل'
  )
}

function isOutgoingLastMessage(conversation) {
  const lastMessage = conversation?.last_message || {}
  const direction = String(lastMessage?.direction || '').toLowerCase()
  return direction === 'outbound' || direction === 'outgoing'
}

function LastMessageStatus({ conversation }) {
  if (!isOutgoingLastMessage(conversation)) return null

  const status = String(conversation?.last_message?.status || '').toLowerCase()
  const isRead = status === 'read' || status === 'seen'
  const isDelivered = status === 'delivered'
  if (!isRead && !isDelivered) return null

  return (
    <CheckCheck
      size={14}
      className={isRead ? 'shrink-0 text-[#0A7CFF]' : 'shrink-0 text-[#94A3B8]'}
      aria-label={isRead ? 'seen' : 'delivered'}
    />
  )
}

function upsertMessageIntoCachedResponse(current, message) {
  const messages = upsertMessengerMessage(extractMessengerMessages(current), message)

  if (Array.isArray(current)) return messages
  if (Array.isArray(current?.data)) return { ...current, data: messages }
  if (Array.isArray(current?.messages)) return { ...current, messages }
  if (Array.isArray(current?.data?.data)) {
    return {
      ...current,
      data: {
        ...current.data,
        data: messages,
      },
    }
  }

  return messages
}

function mergeInfoIntoCachedResponse(current, conversation) {
  if (!conversation) return current
  if (!current) return { success: true, data: conversation }
  if (current.data && typeof current.data === 'object' && !Array.isArray(current.data)) {
    return {
      ...current,
      data: {
        ...current.data,
        ...conversation,
      },
    }
  }

  return { ...current, ...conversation }
}

function ConversationAvatar({ title, imageUrl = '', active = false, unreadCount = 0, size = 'md' }) {
  const [imageFailed, setImageFailed] = useState(false)
  const dimensions = size === 'lg' ? 'h-12 w-12 text-sm' : 'h-10 w-10 text-xs'
  const canShowImage = Boolean(imageUrl && !imageFailed)

  return (
    <span
      className={[
        'relative inline-flex shrink-0 items-center justify-center rounded-2xl font-black shadow-sm',
        dimensions,
        active
          ? 'bg-[#00A7B0] text-white ring-4 ring-[#DFF7F8]'
          : 'bg-[#E8F9FA] text-[#007A80]',
      ].join(' ')}
    >
      {canShowImage ? (
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full rounded-2xl object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : (
        getInitials(title)
      )}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -end-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-black text-white ring-2 ring-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </span>
  )
}

function HeaderActions({ onOpenPage, onClose }) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        onClick={onOpenPage}
        className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-[#D8E7EA] bg-white px-2 text-xs font-black text-[#00878D] transition-colors hover:bg-[#E8F9FA]"
        title="فتح صفحة المحادثات"
      >
        <ExternalLink size={13} />
        فتح
      </button>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#111827]"
        title="إغلاق"
      >
        <X size={15} />
      </button>
    </div>
  )
}

export function MessengerSidebarPanel({ open, onClose, initialTarget = {} }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { highlightedMessageId, highlightMessage } = useRealtimeMessageHighlight()
  const isRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl'
  const markAllRead = useMessengerNotificationsStore((state) => state.markAllRead)
  const conversationsQuery = useMessengerConversations({ per_page: 30 })
  const conversations = conversationsQuery.data || []
  const [selectedId, setSelectedId] = useState('')
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState('list')
  const [linkDialogConversation, setLinkDialogConversation] = useState(null)
  const [conversationFilters, setConversationFilters] = useState(DEFAULT_MESSENGER_CONVERSATION_FILTERS)

  useEffect(() => {
    if (open) markAllRead()
  }, [markAllRead, open])

  const resolveTargetConversationId = useCallback((target = {}) => {
    const normalizeText = (value) => String(value || '').trim().toLowerCase()
    const normalizePhone = (value) => String(value || '').replace(/\D+/g, '')

    const directId = String(target?.conversationId || '')
    if (directId) return directId

    const targetLeadId = String(target?.leadId || '')
    const targetCustomerId = String(target?.customerId || '')
    const targetPhone = normalizePhone(target?.phone)
    const targetEmail = normalizeText(target?.email)

    const matched = conversations.find((conversation) => {
      const candidateLeadId = String(conversation?.lead_id || conversation?.lead?.id || conversation?.customer?.lead_id || '')
      const candidateCustomerId = String(conversation?.customer_id || conversation?.customer?.id || '')
      const candidatePhone = normalizePhone(conversation?.phone || conversation?.contact?.phone || conversation?.customer?.phone)
      const candidateEmail = normalizeText(conversation?.email || conversation?.contact?.email || conversation?.customer?.email)

      if (targetLeadId && candidateLeadId && targetLeadId === candidateLeadId) return true
      if (targetCustomerId && candidateCustomerId && targetCustomerId === candidateCustomerId) return true
      if (targetPhone && candidatePhone && targetPhone === candidatePhone) return true
      if (targetEmail && candidateEmail && targetEmail === candidateEmail) return true
      return false
    })

    return matched ? String(getMessengerConversationId(matched)) : ''
  }, [conversations])

  useEffect(() => {
    if (!open) {
      setMode('list')
      return
    }

    const resolvedTargetConversationId = resolveTargetConversationId(initialTarget)
    if (resolvedTargetConversationId) {
      setSelectedId(String(resolvedTargetConversationId))
      setMode('chat')
      return
    }

    if (!selectedId && conversations.length) {
      setSelectedId(String(getMessengerConversationId(conversations[0])))
    }
  }, [conversations, initialTarget, open, resolveTargetConversationId, selectedId])

  const filteredConversations = useMemo(() => {
    return filterMessengerConversations(conversations, query, conversationFilters)
  }, [conversationFilters, conversations, query])

  const storyConversations = useMemo(() => (
    conversations.filter((conversation) => Number(conversation.unread_count || 0) > 0).concat(
      conversations.filter((conversation) => Number(conversation.unread_count || 0) === 0)
    ).slice(0, 12)
  ), [conversations])

  const selectedConversation = useMemo(() => (
    conversations.find((conversation) => (
      String(getMessengerConversationId(conversation)) === String(selectedId)
    )) || null
  ), [conversations, selectedId])

  const conversationInfoQuery = useMessengerConversationInfo(selectedId)
  const conversationInfo = conversationInfoQuery.data || selectedConversation
  const selectedTitle = getMessengerConversationTitle(conversationInfo || selectedConversation)
  const selectedImage = getMessengerProfilePicture(conversationInfo || selectedConversation)
  const messagesQuery = useMessengerMessages(selectedId)
  const mutations = useMessengerConversationMutations(selectedId)

  const messages = useMemo(() => (
    sortMessagesAscending(
      (messagesQuery.data || []).map((item) => normalizeMessengerMessage(item, conversationInfo))
    )
  ), [conversationInfo, messagesQuery.data])

  const openConversation = (conversationId) => {
    setSelectedId(String(conversationId))
    setMode('chat')
  }

  const handleRealtimeMessage = useCallback((payload = {}, eventName = '') => {
    const incomingMessage = getMessengerRealtimeMessage(payload)
    const conversationPatch = getMessengerRealtimeConversation(payload)
    const eventConversationId = getMessengerRealtimeConversationId(payload) || conversationPatch?.id || selectedId

    if (conversationPatch) {
      queryClient.setQueryData(
        MESSENGER_CONVERSATIONS_QUERY_KEY,
        (current = []) => upsertMessengerConversation(current, conversationPatch)
      )
      queryClient.setQueryData(
        MESSENGER_CONVERSATION_INFO_QUERY_KEY(eventConversationId),
        (current) => mergeInfoIntoCachedResponse(current, conversationPatch)
      )
    }

    if (!eventConversationId) return

    if (!incomingMessage) {
      const messagePatch = getMessengerRealtimeMessagePatch(payload)
      const reaction = getMessengerRealtimeReaction(payload)
      const reactionMessageId = getMessengerRealtimeReactionMessageId(payload)
      if (messagePatch) {
        queryClient.setQueryData(
          MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY(eventConversationId),
          (current) => applyMessengerMessagePatchToCachedResponse(current, messagePatch)
        )
      }

      if (reaction || reactionMessageId) {
        queryClient.setQueryData(
          MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY(eventConversationId),
          (current) => applyMessengerReactionToCachedResponse(current, payload, eventName)
        )
      }

      queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATION_INFO_QUERY_KEY(eventConversationId) })
      return
    }

    const messageIdentity = getMessengerMessageId(incomingMessage)
    if (String(eventConversationId) === String(selectedId) && open && mode === 'chat') {
      highlightMessage(messageIdentity)
    }

    if (!isOutgoingMessage(incomingMessage) && (incomingMessage.status === 'received' || !incomingMessage.sent_by_user_id)) {
      playMessengerNotificationSound(messageIdentity)
    }

    queryClient.setQueryData(
      MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY(eventConversationId),
      (current) => upsertMessageIntoCachedResponse(current, incomingMessage)
    )
  }, [highlightMessage, mode, open, queryClient, selectedId])

  useMessengerRealtime({
    conversationId: selectedId,
    enabled: Boolean(open && selectedId),
    onMessageReceived: handleRealtimeMessage,
  })

  const handleSend = async ({ text, attachment, replyToMessageId }) => {
    const textValue = text.trim()
    if ((!textValue && !attachment) || !selectedId) return

    try {
      await mutations.sendMessage.mutateAsync({
        message: textValue,
        attachment,
        reply_to_message_id: replyToMessageId,
      })
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'تعذر إرسال الرسالة')
    }
  }

  const handleReact = async ({ messageId, reaction }) => {
    if (!messageId || !reaction || !selectedId) return

    try {
      await mutations.reactToMessage.mutateAsync({ messageId, reaction })
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || '\u062a\u0639\u0630\u0631 \u062d\u0641\u0638 \u0627\u0644\u062a\u0641\u0627\u0639\u0644')
    }
  }

  const handleRemoveReaction = async ({ messageId }) => {
    if (!messageId || !selectedId) return

    try {
      await mutations.removeReaction.mutateAsync({ messageId })
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'تعذر إزالة التفاعل')
    }
  }

  const handleConvertToLead = (conversation) => {
    setLinkDialogConversation({
      ...(conversation || {}),
      id: getMessengerConversationId(conversation) || conversation?.conversationId || selectedId,
      contactId: getMessengerContactId(conversation),
    })
  }

  const handleCustomerLinked = () => {
    queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATIONS_QUERY_KEY })
    if (selectedId) {
      queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATION_INFO_QUERY_KEY(selectedId) })
    }
  }

  const handleToggleConversationStatus = async (conversation) => {
    const conversationId = getMessengerConversationId(conversation) || conversation?.conversationId || selectedId
    if (!conversationId) return

    const status = String(conversation?.status || '').toLowerCase()
    const shouldReopen = status === 'closed'

    try {
      if (shouldReopen) {
        await mutations.reopenConversation.mutateAsync(conversationId)
        	toast.success('\u062a\u0645 \u0625\u0639\u0627\u062f\u0629 \u0641\u062a\u062d \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0629')
      } else {
        const confirmed = window.confirm('\u0647\u0644 \u062a\u0631\u064a\u062f \u0625\u0646\u0647\u0627\u0621 \u0647\u0630\u0647 \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0629\u061f \u0644\u0646 \u064a\u0645\u0643\u0646 \u0625\u0631\u0633\u0627\u0644 \u0631\u0633\u0627\u0626\u0644 \u062c\u062f\u064a\u062f\u0629 \u0625\u0644\u0627 \u0628\u0639\u062f \u0641\u062a\u062d\u0647\u0627 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.')
        if (!confirmed) return
        await mutations.closeConversation.mutateAsync(conversationId)
        toast.success('تم إنهاء المحادثة')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'تعذر تحديث حالة المحادثة')
    }
  }

  const handleOpenPage = () => {
    const conversationId = selectedId ? `?conversation=${encodeURIComponent(selectedId)}` : ''
    navigate(`/conversations${conversationId}`)
    onClose?.()
  }

  return (
    <>
      <aside
      className="fixed end-0 top-12 bottom-0 z-30 w-[min(390px,calc(100vw-72px))] border-s border-[#DDECEF] bg-white shadow-[-14px_0_30px_rgba(15,23,42,0.08)] transition-transform duration-300"
      style={{
        transform: open ? 'translateX(0)' : `translateX(${isRtl ? '-100%' : '100%'})`,
      }}
      aria-hidden={!open}
    >
      <div className="flex h-full flex-col overflow-hidden">
        {mode === 'list' ? (
          <>
            <header className="border-b border-[#E5EEF0] bg-[#F8FEFF] p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#00878D]">
                    <MessengerLogoIcon size={22} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-black text-[#111827]">محادثات ماسنجر</h2>
                  </div>
                </div>
                <HeaderActions onOpenPage={handleOpenPage} onClose={onClose} />
              </div>
            </header>

            <div className="border-b border-[#EEF2F4] bg-white p-3">
              <label className="flex h-10 items-center gap-2 rounded-lg border border-[#D8E7EA] bg-[#FBFEFF] px-3">
                <Search size={15} className="shrink-0 text-[#64748B]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-xs font-bold text-[#111827] outline-none placeholder:text-[#94A3B8]"
                  placeholder="بحث في المحادثات..."
                />
              </label>
            </div>

            <MessengerConversationFilters
              conversations={conversations}
              filters={conversationFilters}
              onChange={setConversationFilters}
              resultCount={filteredConversations.length}
            />

            <section className="min-h-0 flex-1 overflow-y-auto bg-[#F8FAFC] p-2">
              {conversationsQuery.isLoading && (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="h-16 animate-pulse rounded-xl bg-white" />
                  ))}
                </div>
              )}

              {!conversationsQuery.isLoading && filteredConversations.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#CFE8EB] bg-white p-4 text-center text-xs font-bold text-[#64748B]">
                  {'\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u062d\u0627\u062f\u062b\u0627\u062a \u0645\u0637\u0627\u0628\u0642\u0629.'}
                </div>
              )}

              {filteredConversations.map((conversation) => {
                const id = getMessengerConversationId(conversation)
                const title = getMessengerConversationTitle(conversation)
                const unreadCount = Number(conversation.unread_count || 0)
                const imageUrl = getMessengerProfilePicture(conversation)
                const hasLinkedCustomer = Boolean(conversation?.customer)
                const assignedUserName = conversation?.assigned_user?.name || ''
                const isClosed = String(conversation?.status || '').toLowerCase() === 'closed'

                return (
                  <div
                    key={id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openConversation(id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        openConversation(id)
                      }
                    }}
                    className="group relative mb-2 flex w-full items-center gap-3 rounded-xl border border-[#E5EEF0] bg-white p-3 text-start shadow-sm transition-colors hover:border-[#B8EFF2] hover:bg-[#F9FEFF]"
                  >
                    <ConversationAvatar title={title} imageUrl={imageUrl} unreadCount={unreadCount} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-black text-[#111827]">{title}</span>
                        {isClosed ? (
                          <span className="shrink-0 rounded-full bg-[#FEF2F2] px-2 py-0.5 text-[10px] font-black text-[#B91C1C]">
                            {'\u0645\u0646\u062a\u0647\u064a\u0629'}
                          </span>
                        ) : null}
                        <span className="shrink-0 text-[10px] font-bold text-[#94A3B8]">
                          {formatTime(conversation.last_message_at)}
                        </span>
                      </span>
                      <span className="mt-1 flex min-w-0 items-center gap-1 text-xs font-semibold text-[#64748B]">
                        <LastMessageStatus conversation={conversation} />
                        <span className="min-w-0 truncate">
                          {getMessengerConversationSubtitle(conversation) || 'Messenger'}
                        </span>
                      </span>
                      {assignedUserName ? (
                        <span className="mt-1 inline-flex max-w-full items-center gap-1 rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-black text-[#475569]">
                          <UserRound size={11} />
                          <span className="truncate">المسؤول: {assignedUserName}</span>
                        </span>
                      ) : null}
                      {!hasLinkedCustomer ? (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleConvertToLead(conversation)
                          }}
                          className="mt-2 inline-flex h-7 items-center gap-1 rounded-lg border border-[#BEEFF2] bg-white px-2 text-[10px] font-black text-[#007A80] transition hover:border-[#00C2CB] hover:bg-[#E8F9FA]"
                        >
                          <UserPlus size={12} />
                          تحويل عميل محتمل
                        </button>
                      ) : null}
                      {isClosed ? (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleToggleConversationStatus(conversation)
                          }}
                          className="mt-2 ms-2 inline-flex h-7 items-center gap-1 rounded-lg border border-[#BEEFF2] bg-white px-2 text-[10px] font-black text-[#007A80] transition hover:border-[#00C2CB] hover:bg-[#E8F9FA]"
                        >
                          {'\u0641\u062a\u062d \u0645\u0631\u0629 \u0623\u062e\u0631\u0649'}
                        </button>
                      ) : null}
                    </span>
                    <MessengerConversationHoverPreview conversation={conversation} />
                  </div>
                )
              })}
            </section>
          </>
        ) : (
          <>
            <div className="border-b border-[#EEF2F4] bg-white px-3 py-2">
              <div className="flex gap-3 overflow-x-auto pb-1">
                {conversationsQuery.isLoading && (
                  <div className="h-16 min-w-14 animate-pulse rounded-2xl bg-[#F1F5F9]" />
                )}
                {storyConversations.map((conversation) => {
                  const id = getMessengerConversationId(conversation)
                  const title = getMessengerConversationTitle(conversation)
                  const active = String(id) === String(selectedId)
                  const imageUrl = getMessengerProfilePicture(conversation)

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => openConversation(id)}
                      className="min-w-14 max-w-16 text-center"
                      title={title}
                    >
                      <ConversationAvatar
                        title={title}
                        imageUrl={imageUrl}
                        active={active}
                        unreadCount={Number(conversation.unread_count || 0)}
                        size="lg"
                      />
                      <span className="mt-1 block truncate text-[10px] font-bold text-[#64748B]">
                        {title}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <MessengerChatThread
              title={selectedTitle}
              contactText={getConversationContact(conversationInfo || selectedConversation)}
              avatarUrl={selectedImage}
              headerActions={(
                <>
                  <button
                    type="button"
                    onClick={() => setMode('list')}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#D7E8EB] bg-white text-[#64748B] transition hover:border-[#B9E5E9] hover:text-[#0F172A]"
                    title="الرجوع للمحادثات"
                  >
                    <ChevronRight size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenPage}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#D7E8EB] bg-white text-[#64748B] transition hover:border-[#B9E5E9] hover:text-[#0F172A]"
                    title="فتح صفحة المحادثات"
                  >
                    <ExternalLink size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#D7E8EB] bg-white text-[#64748B] transition hover:border-[#B9E5E9] hover:text-[#0F172A]"
                    title="إغلاق"
                  >
                    <X size={13} />
                  </button>
                </>
              )}
              contactDetails={{
                name: selectedTitle,
                contact: getConversationContact(conversationInfo || selectedConversation),
                contactId: getMessengerContactId(conversationInfo || selectedConversation),
                phone: conversationInfo?.contact?.phone || selectedConversation?.contact?.phone || selectedConversation?.customer?.phone || '',
                email: conversationInfo?.contact?.email || selectedConversation?.contact?.email || selectedConversation?.customer?.email || '',
                channel: 'Messenger',
                conversationId: selectedId,
                status: conversationInfo?.status ?? selectedConversation?.status ?? '',
                customer: conversationInfo?.customer ?? selectedConversation?.customer ?? null,
                assignedUser: conversationInfo?.assigned_user ?? selectedConversation?.assigned_user ?? null,
                users: conversationInfo?.users ?? selectedConversation?.users ?? [],
              }}
              messages={messages}
              isLoadingMessages={messagesQuery.isLoading || conversationInfoQuery.isLoading}
              error={messagesQuery.error?.message || conversationInfoQuery.error?.message || ''}
              hasMoreMessages={false}
              onLoadMore={undefined}
              isSending={mutations.sendMessage.isPending}
              onSend={handleSend}
              onReact={handleReact}
              onRemoveReaction={handleRemoveReaction}
              onConvertToLead={handleConvertToLead}
              onToggleConversationStatus={handleToggleConversationStatus}
              isTogglingConversationStatus={mutations.closeConversation.isPending || mutations.reopenConversation.isPending}
              supportsAttachments
              supportsReply
              supportsReactions
              channelColor="#0A7CFF"
              autoFocusKey={`${open ? 'open' : 'closed'}-${mode}-${selectedId}`}
              highlightedMessageId={highlightedMessageId}
              composerDisabled={!selectedId}
              emptyMessage={selectedId ? 'لا توجد رسائل في هذه المحادثة بعد.' : 'اختر محادثة'}
              emptyDescription={selectedId ? '' : 'اختر محادثة من القائمة لعرض الرسائل.'}
            />
          </>
        )}
      </div>
      </aside>

      <MessengerLinkCustomerDialog
        open={Boolean(linkDialogConversation)}
        conversation={linkDialogConversation}
        conversationId={getMessengerConversationId(linkDialogConversation)}
        contactId={getMessengerContactId(linkDialogConversation) || linkDialogConversation?.contactId}
        onClose={() => setLinkDialogConversation(null)}
        onLinked={handleCustomerLinked}
      />

    </>
  )
}
