import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCheck, MessageCircle, RefreshCw, UserPlus, UserRound } from 'lucide-react'
import { toast } from 'sonner'

import { PageToolbar } from '../../shared/components/data/PageToolbar'
import { ResourceState } from '../../shared/components/data/ResourceState'
import {
  useMessengerConversationInfo,
  useMessengerConversationMutations,
  useMessengerConversations,
  useMessengerMessages,
} from '../../features/conversations/hooks/useConversations'
import {
  MESSENGER_CONVERSATIONS_QUERY_KEY,
  MESSENGER_CONVERSATION_INFO_QUERY_KEY,
  MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY,
  applyMessengerMessagePatchToCachedResponse,
  applyMessengerReactionToCachedResponse,
  extractMessengerMessages,
  getMessengerConversationId,
  getMessengerRealtimeConversation,
  getMessengerRealtimeConversationId,
  getMessengerRealtimeMessage,
  getMessengerRealtimeMessagePatch,
  getMessengerRealtimeReaction,
  getMessengerRealtimeReactionMessageId,
  getMessengerConversationSubtitle,
  getMessengerConversationTitle,
  getMessengerContactId,
  getMessengerProfilePicture,
  getMessengerMessageId,
  isOutgoingMessage,
  normalizeMessengerMessage,
  sortMessagesAscending,
  upsertMessengerConversation,
  upsertMessengerMessage,
} from '../../features/conversations/utils/messengerConversations'
import { playMessengerNotificationSound } from '../../features/conversations/utils/messengerNotificationSound'
import { useMessengerNotificationsStore } from '../../features/conversations/store/messengerNotificationsStore'
import { useMessengerRealtime } from '../../realtime/hooks/useMessengerRealtime'
import { useQueryClient } from '@tanstack/react-query'
import { MessengerChatThread } from '../../features/conversations/components/MessengerChatThread'
import { useRealtimeMessageHighlight } from '../../features/conversations/hooks/useRealtimeMessageHighlight'
import { MessengerLinkCustomerDialog } from '../../features/conversations/components/MessengerLinkCustomerDialog'
import { MessengerLogoIcon } from '../../features/conversations/components/MessengerNavbarButton'
import {
  DEFAULT_MESSENGER_CONVERSATION_FILTERS,
  MessengerConversationFilters,
  filterMessengerConversations,
} from '../../features/conversations/components/MessengerConversationFilters'
import { MessengerConversationHoverPreview } from '../../features/conversations/components/MessengerConversationHoverPreview'
import { GmailConversationsWorkspace } from '../../features/conversations/components/GmailConversationsWorkspace'
import { GmailLogoIcon } from '../../features/conversations/components/GmailNavbarButton'
import { WhatsappConversationsWorkspace } from '../../features/conversations/components/WhatsappConversationsWorkspace'
import { WhatsappLogoIcon } from '../../features/conversations/components/WhatsappNavbarButton'
import { useGmailConversations, useGmailMailboxes } from '../../features/conversations/hooks/useGmailConversations'
import { useWhatsappConversations } from '../../features/conversations/hooks/useWhatsappConversations'
import { usePageHeader } from '../../shared/hooks/usePageHeader'

function getUnreadTotal(conversations = []) {
  return conversations.reduce((total, conversation) => total + Number(conversation?.unread_count || 0), 0)
}

function ChannelUnreadBadge({ count, active, color = 'messenger' }) {
  if (!count) return null

  const activeClassName = color === 'gmail'
    ? 'bg-[#D93025] text-white'
    : color === 'whatsapp'
      ? 'bg-[#25D366] text-white'
      : 'bg-[#00A8B0] text-white'

  return (
    <span
      className={[
        'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-black leading-none shadow-sm',
        active ? activeClassName : 'bg-[#EF4444] text-white',
      ].join(' ')}
      title={`${count} unread`}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

function ConversationChannelTabs({ activeChannel, onChange, unreadCounts = {} }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-[#E5EEF0] bg-white p-2 shadow-sm">
      <button
        type="button"
        onClick={() => onChange('messenger')}
        className={[
          'inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-black transition',
          activeChannel === 'messenger'
            ? 'border-[#00C2CB] bg-[#E8F9FA] text-[#007A80]'
            : 'border-[#E5EEF0] bg-white text-[#64748B] hover:bg-[#F8FEFF]',
        ].join(' ')}
      >
        <MessengerLogoIcon size={20} />
        <ChannelUnreadBadge count={unreadCounts.messenger} active={activeChannel === 'messenger'} />
        ماسنجر
      </button>
      <button
        type="button"
        onClick={() => onChange('gmail')}
        className={[
          'inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-black transition',
          activeChannel === 'gmail'
            ? 'border-[#D93025] bg-[#FCE8E6] text-[#B3261E]'
            : 'border-[#E5EEF0] bg-white text-[#64748B] hover:bg-[#FFFBFA]',
        ].join(' ')}
      >
        <GmailLogoIcon size={20} />
        Gmail
        <ChannelUnreadBadge count={unreadCounts.gmail} active={activeChannel === 'gmail'} color="gmail" />
      </button>
      <button
        type="button"
        onClick={() => onChange('whatsapp')}
        className={[
          'inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-black transition',
          activeChannel === 'whatsapp'
            ? 'border-[#25D366] bg-[#E9FFF2] text-[#087D3E]'
            : 'border-[#E5EEF0] bg-white text-[#64748B] hover:bg-[#F0FFF7]',
        ].join(' ')}
      >
        <WhatsappLogoIcon size={20} />
        WhatsApp
        <ChannelUnreadBadge count={unreadCounts.whatsapp} active={activeChannel === 'whatsapp'} color="whatsapp" />
      </button>
    </div>
  )
}

function formatTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleString('ar-EG', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
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

function MessengerConversationAvatar({ conversation, className = 'h-10 w-10 rounded-lg' }) {
  const [imageFailed, setImageFailed] = useState(false)
  const imageUrl = getMessengerProfilePicture(conversation)
  const title = getMessengerConversationTitle(conversation)

  if (imageUrl && !imageFailed) {
    return (
      <img
        src={imageUrl}
        alt={title}
        className={`${className} shrink-0 object-cover shadow-sm`}
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
      />
    )
  }

  return (
    <span className={`${className} inline-flex shrink-0 items-center justify-center bg-white text-[#00878D] shadow-sm`}>
      <UserRound size={18} />
    </span>
  )
}

function MessengerConversationsPage() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const { highlightedMessageId, highlightMessage } = useRealtimeMessageHighlight()
  const markAllRead = useMessengerNotificationsStore((state) => state.markAllRead)
  const conversationsQuery = useMessengerConversations({ per_page: 30 })
  const conversations = conversationsQuery.data || []
  const [selectedId, setSelectedId] = useState('')
  const [linkDialogConversation, setLinkDialogConversation] = useState(null)
  const [conversationFilters, setConversationFilters] = useState(DEFAULT_MESSENGER_CONVERSATION_FILTERS)
  const requestedConversationId = searchParams.get('conversation') || ''

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

  const filteredConversations = useMemo(() => (
    filterMessengerConversations(conversations, '', conversationFilters)
  ), [conversationFilters, conversations])

  useEffect(() => {
    if (requestedConversationId && String(selectedId) !== String(requestedConversationId)) {
      setSelectedId(String(requestedConversationId))
      return
    }

    if (!requestedConversationId && !selectedId && conversations.length) {
      setSelectedId(String(getMessengerConversationId(conversations[0])))
    }
  }, [conversations, requestedConversationId, selectedId])

  useEffect(() => {
    markAllRead()
  }, [markAllRead])

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
    if (String(eventConversationId) === String(selectedId)) {
      highlightMessage(messageIdentity)
    }

    if (!isOutgoingMessage(incomingMessage) && (incomingMessage.status === 'received' || !incomingMessage.sent_by_user_id)) {
      playMessengerNotificationSound(messageIdentity)
    }

    queryClient.setQueryData(
      MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY(eventConversationId),
      (current) => upsertMessageIntoCachedResponse(current, incomingMessage)
    )
  }, [highlightMessage, queryClient, selectedId])

  const handleRealtimeNotification = useCallback((payload = {}) => {
    const data = payload.data || payload.notification?.data || {}
    const notificationConversationId = (
      payload.conversation_id ||
      data.conversation_id ||
      data.conversation?.id ||
      payload.conversation?.id ||
      ''
    )

    queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATIONS_QUERY_KEY })

    if (!notificationConversationId) {
      if (selectedId) {
        queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATION_INFO_QUERY_KEY(selectedId) })
        queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY(selectedId) })
      }
      return
    }

    if (String(notificationConversationId) === String(selectedId)) {
      queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATION_INFO_QUERY_KEY(notificationConversationId) })
      queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY(notificationConversationId) })
    }
  }, [queryClient, selectedId])

  useMessengerRealtime({
    conversationId: selectedId,
    enabled: Boolean(selectedId),
    onNotification: handleRealtimeNotification,
    onMessageReceived: handleRealtimeMessage,
  })

  const handleSend = async ({ text, attachment, replyToMessageId }) => {
    const value = text.trim()
    if ((!value && !attachment) || !selectedId) return

    try {
      await mutations.sendMessage.mutateAsync({
        message: value,
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

  const selectConversation = (conversationId) => {
    const nextId = String(conversationId || '')
    if (!nextId) return
    setSelectedId(nextId)
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.set('conversation', nextId)
      return next
    })
  }

  return (
    <div className="space-y-4">
      

      <div className="grid min-h-[calc(100vh-170px)] grid-cols-1 gap-4 xl:grid-cols-[360px_minmax(0,1fr)] xl:items-start">
        <section className="min-h-[360px] rounded-lg border border-[var(--border)] bg-[var(--surface)] xl:sticky xl:top-16 xl:max-h-[calc(100vh-5rem)] xl:self-start xl:overflow-hidden">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--border)] p-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#00878D]">
                <MessengerLogoIcon size={22} />
              </span>
              <div>
                <h2 className="text-sm font-black text-[var(--text)]">كل المحادثات</h2>
                <p className="text-xs font-semibold text-[var(--text-muted)]">{conversations.length} محادثة</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => conversationsQuery.refetch()}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:bg-[#F8FAFC] hover:text-[var(--text)]"
              title="تحديث المحادثات"
            >
              <RefreshCw size={15} />
            </button>
          </header>

          <MessengerConversationFilters
            conversations={conversations}
            filters={conversationFilters}
            onChange={setConversationFilters}
            resultCount={filteredConversations.length}
          />

          <ResourceState
            isLoading={conversationsQuery.isLoading}
            error={conversationsQuery.error}
            empty={conversations.length === 0}
            emptyIcon={<MessageCircle size={24} />}
            emptyTitle="لا توجد محادثات ماسنجر"
            emptyDescription="\u0639\u0646\u062f \u0648\u0635\u0648\u0644 \u0623\u0648\u0644 \u0645\u062d\u0627\u062f\u062b\u0629 \u0633\u062a\u0638\u0647\u0631 \u0647\u0646\u0627 \u062a\u0644\u0642\u0627\u0626\u064a\u064b\u0627."
            onRetry={conversationsQuery.refetch}
          >
            <div className="max-h-[calc(100vh-345px)] overflow-y-auto p-2 xl:max-h-[calc(100vh-16rem)]">
              {!conversationsQuery.isLoading && filteredConversations.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#CFE8EB] bg-[#FAFDFE] px-4 py-6 text-center text-sm font-bold text-[#64748B]">
                  لا توجد محادثات مطابقة للفلاتر الحالية.
                </div>
              ) : null}

              {filteredConversations.map((conversation) => {
                const id = getMessengerConversationId(conversation)
                const isActive = String(selectedId) === String(id)
                const unreadCount = Number(conversation.unread_count || 0)
                const hasLinkedCustomer = Boolean(conversation?.customer)
                const assignedUserName = conversation?.assigned_user?.name || ''
                const isClosed = String(conversation?.status || '').toLowerCase() === 'closed'

                return (
                  <div
                    key={id}
                    role="button"
                    tabIndex={0}
                    onClick={() => selectConversation(id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        selectConversation(id)
                      }
                    }}
                    className={[
                      'group relative mb-2 w-full rounded-lg border p-3 text-start transition-colors',
                      isActive
                        ? 'border-[#00C2CB] bg-[#E8F9FA]'
                        : 'border-[var(--border)] bg-[var(--surface-2)] hover:border-[#B8EFF2]',
                    ].join(' ')}
                  >
                    <div className="flex items-start gap-3">
                      <MessengerConversationAvatar conversation={conversation} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-black text-[var(--text)]">
                            {getMessengerConversationTitle(conversation)}
                          </span>
                          {isClosed ? (
                            <span className="shrink-0 rounded-full bg-[#FEF2F2] px-2 py-0.5 text-[10px] font-black text-[#B91C1C]">
                              {'\u0645\u0646\u062a\u0647\u064a\u0629'}
                            </span>
                          ) : null}
                          <span className="shrink-0 text-[10px] font-semibold text-[var(--text-muted)]">
                            {formatTime(conversation.last_message_at)}
                          </span>
                        </span>
                        <span className="mt-1 flex min-w-0 items-center gap-1 text-xs font-semibold text-[var(--text-muted)]">
                          <LastMessageStatus conversation={conversation} />
                          <span className="min-w-0 truncate">
                            {getMessengerConversationSubtitle(conversation) || 'لا توجد معاينة للرسالة'}
                          </span>
                        </span>
                        {assignedUserName ? (
                          <span className="mt-1 inline-flex max-w-full items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-black text-[#475569]">
                            <UserRound size={11} />
                            <span className="truncate">المسؤول: {assignedUserName}</span>
                          </span>
                        ) : null}
                      </span>
                      {unreadCount > 0 && (
                        <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-black text-white">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                    {!hasLinkedCustomer ? (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleConvertToLead(conversation)
                        }}
                        className="mt-2 inline-flex h-8 items-center gap-1 rounded-lg border border-[#BEEFF2] bg-white px-2 text-[11px] font-black text-[#007A80] transition hover:border-[#00C2CB] hover:bg-[#E8F9FA]"
                      >
                        <UserPlus size={13} />
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
                        className="mt-2 ms-2 inline-flex h-8 items-center gap-1 rounded-lg border border-[#BEEFF2] bg-white px-2 text-[11px] font-black text-[#007A80] transition hover:border-[#00C2CB] hover:bg-[#E8F9FA]"
                      >
                        {'\u0641\u062a\u062d \u0645\u0631\u0629 \u0623\u062e\u0631\u0649'}
                      </button>
                    ) : null}
                    <MessengerConversationHoverPreview conversation={conversation} />
                  </div>
                )
              })}
            </div>
          </ResourceState>
        </section>

        <section className="flex min-h-[520px] flex-col rounded-lg border border-[var(--border)] bg-[var(--surface)] xl:sticky xl:top-16 xl:h-[calc(100vh-5rem)] xl:max-h-[calc(100vh-5rem)] xl:self-start xl:overflow-hidden">
          <MessengerChatThread
            title={selectedId ? selectedTitle || 'عميل' : ''}
            contactText={selectedId ? getConversationContact(conversationInfo || selectedConversation) : 'اختر محادثة لعرض الرسائل'}
            avatarUrl={selectedImage}
            contactDetails={{
              name: selectedId ? selectedTitle || 'عميل' : '',
              contact: selectedId ? getConversationContact(conversationInfo || selectedConversation) : '',
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
            autoFocusKey={selectedId}
            highlightedMessageId={highlightedMessageId}
            composerDisabled={!selectedId}
            emptyMessage={selectedId ? 'لا توجد رسائل بعد.' : 'اختر محادثة'}
            emptyDescription={selectedId ? '\u0623\u064a \u0631\u0633\u0627\u0644\u0629 \u062c\u062f\u064a\u062f\u0629 \u0633\u062a\u0638\u0647\u0631 \u0647\u0646\u0627 \u0645\u0628\u0627\u0634\u0631\u0629.' : '\u0627\u062e\u062a\u0631 \u0645\u062d\u0627\u062f\u062b\u0629 \u0645\u0646 \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0644\u0639\u0631\u0636 \u0627\u0644\u0631\u0633\u0627\u0626\u0644.'}
          />
        </section>
      </div>

      <MessengerLinkCustomerDialog
        open={Boolean(linkDialogConversation)}
        conversation={linkDialogConversation}
        conversationId={getMessengerConversationId(linkDialogConversation)}
        contactId={getMessengerContactId(linkDialogConversation) || linkDialogConversation?.contactId}
        onClose={() => setLinkDialogConversation(null)}
        onLinked={handleCustomerLinked}
      />
    </div>
  )
}

export function ConversationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const channelParam = searchParams.get('channel')
  const activeChannel = channelParam === 'gmail' || channelParam === 'whatsapp' ? channelParam : 'messenger'
  const messengerUnreadQuery = useMessengerConversations({ per_page: 30 })
  const gmailMailboxesQuery = useGmailMailboxes(undefined, { staleTime: 60 * 1000 })
  const gmailMailboxes = gmailMailboxesQuery.data || []
  const gmailUnreadQuery = useGmailConversations({ per_page: 30 }, {
    enabled: gmailMailboxes.length > 0,
    staleTime: 30 * 1000,
  })
  const whatsappUnreadQuery = useWhatsappConversations({ per_page: 30 }, { staleTime: 30 * 1000 })
  const unreadCounts = useMemo(() => ({
    messenger: getUnreadTotal(messengerUnreadQuery.data || []),
    gmail: getUnreadTotal(gmailUnreadQuery.data || []),
    whatsapp: getUnreadTotal(whatsappUnreadQuery.data || []),
  }), [gmailUnreadQuery.data, messengerUnreadQuery.data, whatsappUnreadQuery.data])
  const HeaderChannelIcon = activeChannel === 'gmail'
    ? GmailLogoIcon
    : activeChannel === 'whatsapp'
      ? WhatsappLogoIcon
      : MessengerLogoIcon
  const pageTitle = activeChannel === 'gmail'
    ? '\u0645\u062d\u0627\u062f\u062b\u0627\u062a Gmail'
    : activeChannel === 'whatsapp'
      ? '\u0645\u062d\u0627\u062f\u062b\u0627\u062a WhatsApp'
      : '\u0645\u062d\u0627\u062f\u062b\u0627\u062a \u0645\u0627\u0633\u0646\u062c\u0631'

  usePageHeader({
    title: pageTitle,
    icon: HeaderChannelIcon,
  })

  const setChannel = (channel) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (channel === 'gmail') {
        next.set('channel', 'gmail')
        next.delete('conversation')
        next.delete('whatsappConversation')
      } else if (channel === 'whatsapp') {
        next.set('channel', 'whatsapp')
        next.delete('conversation')
        next.delete('gmailConversation')
      } else {
        next.delete('channel')
        next.delete('gmailConversation')
        next.delete('whatsappConversation')
      }
      return next
    })
  }

  return (
    <div className="space-y-4">
      <ConversationChannelTabs activeChannel={activeChannel} onChange={setChannel} unreadCounts={unreadCounts} />
      {activeChannel === 'gmail'
        ? <GmailConversationsWorkspace />
        : activeChannel === 'whatsapp'
          ? <WhatsappConversationsWorkspace />
          : <MessengerConversationsPage />}
    </div>
  )
}
