import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { CheckCheck, ExternalLink, LayoutTemplate, Search, UserPlus, UserRound, X } from 'lucide-react'
import { toast } from 'sonner'

import { useWhatsappRealtime } from '../../../realtime/hooks/useWhatsappRealtime'
import { playWhatsappNotificationSound } from '../utils/whatsappNotificationSound'
import { useWhatsappConversationInfo, useWhatsappConversationMutations, useWhatsappConversations, useWhatsappMessages } from '../hooks/useWhatsappConversations'
import {
  WHATSAPP_CONVERSATIONS_QUERY_KEY,
  WHATSAPP_CONVERSATION_INFO_QUERY_KEY,
  WHATSAPP_CONVERSATION_MESSAGES_QUERY_KEY,
  extractWhatsappList,
  filterWhatsappConversations,
  getWhatsappContactId,
  getWhatsappConversationContact,
  getWhatsappConversationId,
  getWhatsappConversationSubtitle,
  getWhatsappConversationTitle,
  getWhatsappMessageId,
  normalizeWhatsappMessage,
  sortWhatsappMessagesAscending,
  upsertWhatsappMessage,
} from '../utils/whatsappConversations'
import { DEFAULT_MESSENGER_CONVERSATION_FILTERS, MessengerConversationFilters } from './MessengerConversationFilters'
import { MessengerChatThread } from './MessengerChatThread'
import { MessengerLinkCustomerDialog } from './MessengerLinkCustomerDialog'
import { WhatsappLogoIcon } from './WhatsappNavbarButton'
import { WhatsappTemplatesDialog } from './WhatsappTemplatesDialog'

const TEXT = {
  whatsappChats: '\u0645\u062d\u0627\u062f\u062b\u0627\u062a WhatsApp',
  allConversations: '\u0643\u0644 \u0645\u062d\u0627\u062f\u062b\u0627\u062a WhatsApp',
  conversation: '\u0645\u062d\u0627\u062f\u062b\u0629',
  search: '\u0628\u062d\u062b \u0641\u064a WhatsApp...',
  open: '\u0641\u062a\u062d',
  back: '\u0631\u062c\u0648\u0639',
  noMatches: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u062d\u0627\u062f\u062b\u0627\u062a WhatsApp \u0645\u0637\u0627\u0628\u0642\u0629.',
  noMessages: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0631\u0633\u0627\u0626\u0644 WhatsApp \u0628\u0639\u062f.',
  chooseConversation: '\u0627\u062e\u062a\u0631 \u0645\u062d\u0627\u062f\u062b\u0629 WhatsApp',
  chooseConversationDescription: '\u0627\u062e\u062a\u0631 \u0645\u062d\u0627\u062f\u062b\u0629 \u0645\u0646 \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0644\u0639\u0631\u0636 \u0627\u0644\u0631\u0633\u0627\u0626\u0644.',
  convertLead: '\u062a\u062d\u0648\u064a\u0644 \u0639\u0645\u064a\u0644 \u0645\u062d\u062a\u0645\u0644',
  responsible: '\u0627\u0644\u0645\u0633\u0624\u0648\u0644',
  closed: '\u0645\u0646\u062a\u0647\u064a\u0629',
  reopen: '\u0641\u062a\u062d \u0645\u0631\u0629 \u0623\u062e\u0631\u0649',
  sendFailed: '\u062a\u0639\u0630\u0631 \u0625\u0631\u0633\u0627\u0644 \u0631\u0633\u0627\u0644\u0629 WhatsApp',
  reactionFailed: '\u062a\u0639\u0630\u0631 \u062d\u0641\u0638 \u0627\u0644\u062a\u0641\u0627\u0639\u0644',
  missingPhone: '\u0644\u0627 \u064a\u0648\u062c\u062f \u0631\u0642\u0645 \u0645\u0633\u062a\u0644\u0645 \u0648\u0627\u0636\u062d \u0644\u0647\u0630\u0647 \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0629.',
  missingPhoneNumberId: '\u0636\u0639 VITE_WHATSAPP_PHONE_NUMBER_ID \u0641\u064a .env \u0623\u0648 \u0623\u0631\u062c\u0639 phone_number_id \u0645\u0639 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0629.',
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

function getInitials(value = '') {
  const text = String(value || '').trim()
  if (!text) return 'W'
  return text.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function isOutgoingLastMessage(conversation) {
  const direction = String(conversation?.last_message?.direction || '').toLowerCase()
  return direction === 'outbound' || direction === 'outgoing' || direction === 'sent'
}

function LastMessageStatus({ conversation }) {
  if (!isOutgoingLastMessage(conversation)) return null

  const status = String(conversation?.last_message?.status || '').toLowerCase()
  const isRead = status === 'read' || status === 'seen'
  const isDelivered = status === 'delivered'
  if (!isRead && !isDelivered) return null

  return <CheckCheck size={14} className={isRead ? 'shrink-0 text-[#0A7CFF]' : 'shrink-0 text-[#94A3B8]'} />
}

function WhatsappConversationAvatar({ title, unreadCount = 0, active = false }) {
  return (
    <span
      className={[
        'relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-black shadow-sm',
        active ? 'bg-[#25D366] text-white ring-4 ring-[#E9FFF2]' : 'bg-[#E9FFF2] text-[#087D3E]',
      ].join(' ')}
    >
      {getInitials(title)}
      {unreadCount > 0 ? (
        <span className="absolute -top-1 -end-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-black text-white ring-2 ring-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      ) : null}
    </span>
  )
}

function getWhatsappPhoneNumberId(conversationInfo, selectedConversation) {
  return (
    conversationInfo?.phone_number_id ||
    conversationInfo?.phoneNumberId ||
    conversationInfo?.phone_number?.id ||
    selectedConversation?.phone_number_id ||
    selectedConversation?.phoneNumberId ||
    selectedConversation?.phone_number?.id ||
    import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID ||
    ''
  )
}

function getWhatsappRecipient(conversationInfo, selectedConversation) {
  return (
    conversationInfo?.contact?.phone ||
    conversationInfo?.contact?.wa_id ||
    conversationInfo?.customer?.phone ||
    conversationInfo?.lead?.phone ||
    selectedConversation?.contact?.phone ||
    selectedConversation?.contact?.wa_id ||
    selectedConversation?.customer?.phone ||
    selectedConversation?.lead?.phone ||
    selectedConversation?.phone ||
    selectedConversation?.to ||
    ''
  )
}

function upsertWhatsappMessageIntoCache(current, incomingMessage) {
  const messages = extractWhatsappList(current)
  const nextMessages = upsertWhatsappMessage(messages, incomingMessage)

  if (Array.isArray(current)) return nextMessages
  if (Array.isArray(current?.data?.data)) {
    return { ...current, data: { ...current.data, data: nextMessages } }
  }
  if (Array.isArray(current?.data)) return { ...current, data: nextMessages }
  if (Array.isArray(current?.messages)) return { ...current, messages: nextMessages }
  return nextMessages
}

export function WhatsappConversationsWorkspace({
  panel = false,
  open = true,
  onClose,
  initialTarget = {},
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedConversationId = searchParams.get('whatsappConversation') || (
    searchParams.get('channel') === 'whatsapp' ? searchParams.get('conversation') : ''
  ) || ''
  const conversationsParams = useMemo(() => ({ per_page: 30 }), [])
  const messagesParams = useMemo(() => ({ per_page: 50 }), [])
  const conversationsQuery = useWhatsappConversations(conversationsParams, {
    enabled: open,
    refetchInterval: panel ? 60000 : false,
  })
  const conversations = conversationsQuery.data || []
  const [selectedId, setSelectedId] = useState('')
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState(panel ? 'list' : 'chat')
  const [filters, setFilters] = useState(DEFAULT_MESSENGER_CONVERSATION_FILTERS)
  const [linkDialogConversation, setLinkDialogConversation] = useState(null)
  const [templatesDialogOpen, setTemplatesDialogOpen] = useState(false)

  const selectedConversation = useMemo(() => (
    conversations.find((conversation) => String(getWhatsappConversationId(conversation)) === String(selectedId)) || null
  ), [conversations, selectedId])

  const conversationInfoQuery = useWhatsappConversationInfo(selectedId, undefined, { enabled: open && Boolean(selectedId) })
  const conversationInfo = conversationInfoQuery.data || selectedConversation
  const messagesQuery = useWhatsappMessages(selectedId, messagesParams, { enabled: open && Boolean(selectedId) })
  const mutations = useWhatsappConversationMutations(selectedId)

  const messages = useMemo(() => (
    sortWhatsappMessagesAscending((messagesQuery.data || []).map((message) => normalizeWhatsappMessage(message, conversationInfo)))
  ), [conversationInfo, messagesQuery.data])

  const filteredConversations = useMemo(() => (
    filterWhatsappConversations(conversations, query, filters)
  ), [conversations, filters, query])

  useEffect(() => {
    if (!open) return
    if (requestedConversationId && String(selectedId) !== String(requestedConversationId)) {
      setSelectedId(String(requestedConversationId))
      if (panel) setMode('chat')
      return
    }

    const targetId = String(initialTarget?.whatsappConversationId || initialTarget?.conversationId || '')
    if (targetId && String(selectedId) !== targetId) {
      setSelectedId(targetId)
      if (panel) setMode('chat')
      return
    }

    if (!selectedId && conversations.length) {
      setSelectedId(String(getWhatsappConversationId(conversations[0])))
    }
  }, [conversations, initialTarget, open, panel, requestedConversationId, selectedId])

  const selectedTitle = getWhatsappConversationTitle(conversationInfo || selectedConversation)
  const selectedContact = getWhatsappConversationContact(conversationInfo || selectedConversation)
  const selectedStatus = String(conversationInfo?.status || selectedConversation?.status || '').toLowerCase()
  const selectedClosed = selectedStatus === 'closed'

  const handleWhatsappRealtimeMessage = useCallback(({ message, conversation, conversationId }) => {
    const eventConversationId = conversationId || selectedId

    if (conversation) {
      queryClient.invalidateQueries({ queryKey: WHATSAPP_CONVERSATIONS_QUERY_KEY(conversationsParams) })
      queryClient.invalidateQueries({ queryKey: WHATSAPP_CONVERSATION_INFO_QUERY_KEY(eventConversationId) })
    }

    if (!eventConversationId) return

    if (message) {
      queryClient.setQueryData(
        WHATSAPP_CONVERSATION_MESSAGES_QUERY_KEY(eventConversationId, messagesParams),
        (current) => upsertWhatsappMessageIntoCache(current, message)
      )

      if (String(eventConversationId) === String(selectedId) && String(message.direction || '').toLowerCase() !== 'outbound') {
        playWhatsappNotificationSound(getWhatsappMessageId(message))
      }
    } else {
      queryClient.invalidateQueries({ queryKey: WHATSAPP_CONVERSATION_MESSAGES_QUERY_KEY(eventConversationId, messagesParams) })
    }

    queryClient.invalidateQueries({ queryKey: WHATSAPP_CONVERSATIONS_QUERY_KEY(conversationsParams) })
    queryClient.invalidateQueries({ queryKey: WHATSAPP_CONVERSATION_INFO_QUERY_KEY(eventConversationId) })
  }, [conversationsParams, messagesParams, queryClient, selectedId])

  useWhatsappRealtime({
    conversationId: selectedId,
    enabled: open && Boolean(selectedId),
    onMessageReceived: handleWhatsappRealtimeMessage,
  })

  const selectConversation = (conversationId) => {
    const nextId = String(conversationId || '')
    if (!nextId) return
    setSelectedId(nextId)
    if (panel) {
      setMode('chat')
      return
    }

    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.set('channel', 'whatsapp')
      next.set('whatsappConversation', nextId)
      next.delete('gmailConversation')
      return next
    })
  }

  const handleSend = async ({ text, attachment, replyToMessageId }) => {
    const value = String(text || '').trim()
    if ((!value && !attachment) || !selectedId) return

    const phoneNumberId = getWhatsappPhoneNumberId(conversationInfo, selectedConversation)
    const to = getWhatsappRecipient(conversationInfo, selectedConversation)

    if (!to) {
      toast.error(TEXT.missingPhone)
      return
    }

    if (!phoneNumberId) {
      toast.error(TEXT.missingPhoneNumberId)
      return
    }

    try {
      await mutations.sendMessage.mutateAsync({
        phone_number_id: phoneNumberId,
        to,
        message: value,
        files: attachment ? [attachment] : [],
        reply_to_message_id: replyToMessageId,
      })
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || TEXT.sendFailed)
    }
  }

  const handleReact = async ({ messageId, reaction }) => {
    if (!messageId || !reaction || !selectedId) return

    const phoneNumberId = getWhatsappPhoneNumberId(conversationInfo, selectedConversation)
    const to = getWhatsappRecipient(conversationInfo, selectedConversation)

    try {
      await mutations.sendReaction.mutateAsync({
        phone_number_id: phoneNumberId,
        to,
        message_id: messageId,
        emoji: reaction,
      })
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || TEXT.reactionFailed)
    }
  }

  const handleToggleConversationStatus = async (conversation) => {
    const conversationId = getWhatsappConversationId(conversation) || conversation?.conversationId || selectedId
    if (!conversationId) return
    const isClosed = String(conversation?.status || conversationInfo?.status || '').toLowerCase() === 'closed'

    try {
      if (isClosed) {
        await mutations.reopenConversation.mutateAsync(conversationId)
        toast.success('\u062a\u0645 \u0625\u0639\u0627\u062f\u0629 \u0641\u062a\u062d \u0645\u062d\u0627\u062f\u062b\u0629 WhatsApp')
      } else {
        const confirmed = window.confirm('\u0647\u0644 \u062a\u0631\u064a\u062f \u0625\u0646\u0647\u0627\u0621 \u0645\u062d\u0627\u062f\u062b\u0629 WhatsApp\u061f \u0644\u0646 \u064a\u0645\u0643\u0646 \u0625\u0631\u0633\u0627\u0644 \u0631\u0633\u0627\u0626\u0644 \u062c\u062f\u064a\u062f\u0629 \u0625\u0644\u0627 \u0628\u0639\u062f \u0641\u062a\u062d\u0647\u0627.')
        if (!confirmed) return
        await mutations.closeConversation.mutateAsync(conversationId)
        toast.success('\u062a\u0645 \u0625\u0646\u0647\u0627\u0621 \u0645\u062d\u0627\u062f\u062b\u0629 WhatsApp')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || '\u062a\u0639\u0630\u0631 \u062a\u062d\u062f\u064a\u062b \u062d\u0627\u0644\u0629 \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0629')
    }
  }

  const handleConvertToLead = (conversation) => {
    setLinkDialogConversation({
      ...(conversation || {}),
      id: getWhatsappConversationId(conversation) || conversation?.conversationId || selectedId,
      contactId: getWhatsappContactId(conversation),
    })
  }

  const handleCustomerLinked = () => {
    queryClient.invalidateQueries({ queryKey: ['integrations', 'whatsapp'] })
    if (selectedId) {
      queryClient.invalidateQueries({ queryKey: WHATSAPP_CONVERSATION_INFO_QUERY_KEY(selectedId) })
    }
  }

  const handleOpenPage = () => {
    const queryString = selectedId
      ? `?channel=whatsapp&whatsappConversation=${encodeURIComponent(selectedId)}`
      : '?channel=whatsapp'
    navigate(`/conversations${queryString}`)
    onClose?.()
  }

  const list = (
    <section className={`${panel ? 'h-full' : 'min-h-[360px] xl:sticky xl:top-16 xl:max-h-[calc(100vh-5rem)]'} overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]`}>
      <header className="flex items-center justify-between gap-3 border-b border-[var(--border)] p-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#E9FFF2] text-[#087D3E]">
            <WhatsappLogoIcon size={22} />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-black text-[var(--text)]">{TEXT.allConversations}</h2>
            <p className="text-xs font-semibold text-[var(--text-muted)]">{conversations.length} {TEXT.conversation}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTemplatesDialogOpen(true)}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#BDEFD1] bg-white px-2 text-xs font-black text-[#087D3E]"
          >
            <LayoutTemplate size={13} />
            القوالب
          </button>
          {panel ? (
            <>
            <button type="button" onClick={handleOpenPage} className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#BDEFD1] bg-white px-2 text-xs font-black text-[#087D3E]">
              <ExternalLink size={13} />
              {TEXT.open}
            </button>
            <button type="button" onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#64748B]">
              <X size={15} />
            </button>
            </>
          ) : null}
        </div>
      </header>

      <div className="border-b border-[#EEF2F4] bg-white p-3">
        <label className="flex h-10 items-center gap-2 rounded-lg border border-[#D8E7EA] bg-[#FBFEFF] px-3">
          <Search size={15} className="shrink-0 text-[#64748B]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-xs font-bold text-[#111827] outline-none placeholder:text-[#94A3B8]"
            placeholder={TEXT.search}
          />
        </label>
      </div>

      <MessengerConversationFilters
        conversations={conversations}
        filters={filters}
        onChange={setFilters}
        resultCount={filteredConversations.length}
      />

      <div className={`${panel ? 'max-h-[calc(100vh-17rem)]' : 'max-h-[calc(100vh-345px)] xl:max-h-[calc(100vh-16rem)]'} overflow-y-auto bg-[#F8FAFC] p-2`}>
        {conversationsQuery.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-xl bg-white" />
            ))}
          </div>
        ) : null}

        {!conversationsQuery.isLoading && filteredConversations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#BDEFD1] bg-white px-4 py-6 text-center text-sm font-bold text-[#64748B]">
            {TEXT.noMatches}
          </div>
        ) : null}

        {filteredConversations.map((conversation) => {
          const id = getWhatsappConversationId(conversation)
          const title = getWhatsappConversationTitle(conversation)
          const isActive = String(selectedId) === String(id)
          const unreadCount = Number(conversation.unread_count || 0)
          const isClosed = String(conversation.status || '').toLowerCase() === 'closed'
          const assignedUserName = conversation?.assigned_user?.name || ''

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
                'mb-2 w-full rounded-lg border p-3 text-start transition-colors',
                isActive ? 'border-[#25D366] bg-[#E9FFF2]' : 'border-[var(--border)] bg-white hover:border-[#BDEFD1]',
              ].join(' ')}
            >
              <div className="flex items-start gap-3">
                <WhatsappConversationAvatar title={title} unreadCount={unreadCount} active={isActive} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-black text-[var(--text)]">{title}</span>
                    {isClosed ? <span className="rounded-full bg-[#FEF2F2] px-2 py-0.5 text-[10px] font-black text-[#B91C1C]">{TEXT.closed}</span> : null}
                    <span className="shrink-0 text-[10px] font-semibold text-[var(--text-muted)]">{formatTime(conversation.last_message_at)}</span>
                  </span>
                  <span className="mt-1 flex min-w-0 items-center gap-1 text-xs font-semibold text-[var(--text-muted)]">
                    <LastMessageStatus conversation={conversation} />
                    <span className="min-w-0 truncate">{getWhatsappConversationSubtitle(conversation) || getWhatsappConversationContact(conversation) || '-'}</span>
                  </span>
                  {assignedUserName ? (
                    <span className="mt-1 inline-flex max-w-full items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-black text-[#475569]">
                      <UserRound size={11} />
                      <span className="truncate">{TEXT.responsible}: {assignedUserName}</span>
                    </span>
                  ) : null}
                </span>
              </div>
              {!conversation.customer ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    handleConvertToLead(conversation)
                  }}
                  className="mt-2 inline-flex h-8 items-center gap-1 rounded-lg border border-[#BDEFD1] bg-white px-2 text-[11px] font-black text-[#087D3E] transition hover:bg-[#F0FFF7]"
                >
                  <UserPlus size={13} />
                  {TEXT.convertLead}
                </button>
              ) : null}
              {isClosed ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    handleToggleConversationStatus(conversation)
                  }}
                  className="mt-2 ms-2 inline-flex h-8 items-center gap-1 rounded-lg border border-[#BDEFD1] bg-white px-2 text-[11px] font-black text-[#087D3E] transition hover:bg-[#F0FFF7]"
                >
                  {TEXT.reopen}
                </button>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )

  const chat = (
    <section className={`${panel ? 'h-full' : 'min-h-[520px] xl:sticky xl:top-16 xl:h-[calc(100vh-5rem)] xl:max-h-[calc(100vh-5rem)]'} flex flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]`}>
      {panel && mode === 'chat' ? (
        <div className="border-b border-[#EEF2F4] bg-white px-3 py-2">
          <button type="button" onClick={() => setMode('list')} className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#BDEFD1] bg-white px-2 text-xs font-black text-[#087D3E]">
            {TEXT.back}
          </button>
        </div>
      ) : null}

      <MessengerChatThread
        title={selectedId ? selectedTitle || 'WhatsApp' : ''}
        contactText={selectedId ? selectedContact || 'WhatsApp' : TEXT.chooseConversation}
        contactDetails={{
          name: selectedTitle || 'WhatsApp',
          contact: selectedContact || '',
          phone: selectedContact || '',
          channel: 'WhatsApp',
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
        isSending={mutations.sendMessage.isPending}
        onSend={handleSend}
        onReact={handleReact}
        onConvertToLead={(conversation) => handleConvertToLead(conversationInfo || selectedConversation || conversation)}
        onToggleConversationStatus={handleToggleConversationStatus}
        isTogglingConversationStatus={mutations.closeConversation.isPending || mutations.reopenConversation.isPending}
        supportsAttachments
        supportsReply
        supportsReactions
        channelColor="#25D366"
        autoFocusKey={`${panel ? 'panel' : 'page'}-${selectedId}`}
        composerDisabled={!selectedId || selectedClosed}
        emptyMessage={selectedId ? TEXT.noMessages : TEXT.chooseConversation}
        emptyDescription={selectedId ? '' : TEXT.chooseConversationDescription}
      />
    </section>
  )

  return (
    <>
      {panel ? (
        <div className="h-full overflow-hidden bg-white">
          {mode === 'list' ? list : chat}
        </div>
      ) : (
        <div className="grid min-h-[calc(100vh-170px)] grid-cols-1 gap-4 xl:grid-cols-[360px_minmax(0,1fr)] xl:items-start">
          {list}
          {chat}
        </div>
      )}

      <MessengerLinkCustomerDialog
        open={Boolean(linkDialogConversation)}
        conversation={linkDialogConversation}
        conversationId={getWhatsappConversationId(linkDialogConversation) || selectedId}
        contactId={getWhatsappContactId(linkDialogConversation) || linkDialogConversation?.contactId}
        source="whatsapp"
        linkCustomerMutationFn={({ conversationId, customerId }) => mutations.linkCustomer.mutateAsync({ conversationId, customerId })}
        onClose={() => setLinkDialogConversation(null)}
        onLinked={handleCustomerLinked}
      />

      <WhatsappTemplatesDialog
        open={templatesDialogOpen}
        onClose={() => setTemplatesDialogOpen(false)}
        defaultPhoneNumberId={getWhatsappPhoneNumberId(conversationInfo, selectedConversation)}
        defaultTo={getWhatsappRecipient(conversationInfo, selectedConversation)}
      />
    </>
  )
}
