import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ExternalLink, Mail, Search, UserPlus, UserRound, X } from 'lucide-react'
import { toast } from 'sonner'

import { useAuthStore } from '../../../store/authStore'
import { resolveHttpClientBaseURL } from '../../../services/apiBaseUrl'
import { resolveTenantId } from '../../../services/tenantResolver'
import { useGmailRealtime } from '../../../realtime/hooks/useGmailRealtime'
import {
  useGmailConversationInfo,
  useGmailConversationMutations,
  useGmailConversations,
  useGmailMailboxes,
  useGmailMessages,
} from '../hooks/useGmailConversations'
import {
  GMAIL_CONVERSATIONS_QUERY_KEY,
  GMAIL_CONVERSATION_INFO_QUERY_KEY,
  GMAIL_CONVERSATION_MESSAGES_QUERY_KEY,
  extractGmailMessages,
  filterGmailConversations,
  getGmailConversationContact,
  getGmailConversationId,
  getGmailConversationSubtitle,
  getGmailConversationTitle,
  getGmailParticipantEmail,
  normalizeGmailMessage,
  sortGmailMessagesAscending,
} from '../utils/gmailConversations'
import { DEFAULT_MESSENGER_CONVERSATION_FILTERS, MessengerConversationFilters } from './MessengerConversationFilters'
import { MessengerChatThread } from './MessengerChatThread'
import { MessengerLinkCustomerDialog } from './MessengerLinkCustomerDialog'
import { GmailBusinessEmailsPanel } from './GmailBusinessEmailsPanel'
import { GmailLogoIcon } from './GmailNavbarButton'

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
  if (!text) return 'G'
  return text.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function upsertGmailMessageIntoCache(current, incomingMessage) {
  const messages = extractGmailMessages(current)
  const incomingId = incomingMessage?.id || incomingMessage?.gmail_message_id || incomingMessage?.message_id
  const nextMessages = incomingId
    ? [
        ...messages.filter((message) => (
          String(message?.id || message?.gmail_message_id || message?.message_id) !== String(incomingId)
        )),
        incomingMessage,
      ]
    : [...messages, incomingMessage]

  if (Array.isArray(current)) return nextMessages
  if (Array.isArray(current?.data?.data)) {
    return {
      ...current,
      data: {
        ...current.data,
        data: nextMessages,
      },
    }
  }
  if (Array.isArray(current?.data)) return { ...current, data: nextMessages }
  if (Array.isArray(current?.messages)) return { ...current, messages: nextMessages }
  return nextMessages
}

function GmailConversationAvatar({ title, unreadCount = 0, active = false }) {
  return (
    <span
      className={[
        'relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-black shadow-sm',
        active ? 'bg-[#D93025] text-white ring-4 ring-[#FCE8E6]' : 'bg-[#FCE8E6] text-[#B3261E]',
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

function GmailLoginRequired({ tenantId, compact = false }) {
  const connectUrl = useMemo(() => {
    try {
      const baseUrl = resolveHttpClientBaseURL().replace(/\/+$/, '')
      return tenantId ? `${baseUrl}/api/google/redirect/${tenantId}` : ''
    } catch {
      return ''
    }
  }, [tenantId])

  return (
    <div
      className="flex items-center justify-center rounded-xl border border-dashed border-[#F4C7C3] bg-[#FFFBFA] p-5 text-center"
      style={{ minHeight: compact ? 260 : 420 }}
    >
      <div className="max-w-sm">
        <span className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FCE8E6] text-[#D93025]">
          <Mail size={22} />
        </span>
        <h3 className="text-base font-black text-[#111827]">اربط حساب Gmail أولا</h3>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#64748B]">
          لا يمكن عرض محادثات Gmail أو إرسال رسائل قبل تسجيل الدخول بحساب Google الخاص بالمستخدم.
        </p>
        <button
          type="button"
          disabled={!connectUrl}
          onClick={() => {
            if (connectUrl) window.location.href = connectUrl
          }}
          className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#D93025] px-4 text-sm font-black text-white shadow-sm transition hover:bg-[#B3261E] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <GmailLogoIcon size={20} />
          تسجيل الدخول بـ Gmail
        </button>
      </div>
    </div>
  )
}

export function GmailConversationsWorkspace({
  panel = false,
  open = true,
  onClose,
  initialTarget = {},
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const tenantId = resolveTenantId(user)
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedConversationId = searchParams.get('gmailConversation') || searchParams.get('conversation') || ''
  const mailboxesQuery = useGmailMailboxes(undefined, { enabled: open })
  const mailboxes = mailboxesQuery.data || []
  const hasMailbox = mailboxes.length > 0
  const conversationsQuery = useGmailConversations({ per_page: 30 }, {
    enabled: open && hasMailbox,
    refetchInterval: panel ? 60000 : false,
  })
  const conversations = conversationsQuery.data || []
  const [selectedId, setSelectedId] = useState('')
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState(panel ? 'list' : 'chat')
  const [filters, setFilters] = useState(DEFAULT_MESSENGER_CONVERSATION_FILTERS)
  const [linkDialogConversation, setLinkDialogConversation] = useState(null)

  const selectedConversation = useMemo(() => (
    conversations.find((conversation) => String(getGmailConversationId(conversation)) === String(selectedId)) || null
  ), [conversations, selectedId])

  const conversationInfoQuery = useGmailConversationInfo(selectedId, undefined, { enabled: open && Boolean(selectedId) })
  const conversationInfo = conversationInfoQuery.data || selectedConversation
  const messagesQuery = useGmailMessages(selectedId, { per_page: 50 }, { enabled: open && Boolean(selectedId) })
  const mutations = useGmailConversationMutations(selectedId)

  const messages = useMemo(() => (
    sortGmailMessagesAscending((messagesQuery.data || []).map((message) => normalizeGmailMessage(message, conversationInfo)))
  ), [conversationInfo, messagesQuery.data])

  const selectedTitle = getGmailConversationTitle(conversationInfo || selectedConversation)
  const selectedContact = getGmailConversationContact(conversationInfo || selectedConversation)
  const participantEmail = getGmailParticipantEmail(conversationInfo || selectedConversation, messagesQuery.data || [])

  const filteredConversations = useMemo(() => (
    filterGmailConversations(conversations, query, filters)
  ), [conversations, filters, query])

  const handleGmailRealtimeMessage = useCallback(
    ({ message, conversationId }) => {
      if (!message || String(conversationId || selectedId) !== String(selectedId)) return

      queryClient.setQueryData(
        GMAIL_CONVERSATION_MESSAGES_QUERY_KEY(selectedId, { per_page: 50 }),
        (current) => upsertGmailMessageIntoCache(current, message)
      )
      queryClient.invalidateQueries({ queryKey: GMAIL_CONVERSATIONS_QUERY_KEY({ per_page: 30 }) })
      queryClient.invalidateQueries({ queryKey: GMAIL_CONVERSATION_INFO_QUERY_KEY(selectedId) })
    },
    [queryClient, selectedId]
  )

  useGmailRealtime({
    conversationId: selectedId,
    enabled: open && Boolean(selectedId),
    onMessageReceived: handleGmailRealtimeMessage,
  })

  useEffect(() => {
    if (!open || !hasMailbox) return
    if (requestedConversationId && String(selectedId) !== String(requestedConversationId)) {
      setSelectedId(String(requestedConversationId))
      if (panel) setMode('chat')
      return
    }

    const targetId = String(initialTarget?.gmailConversationId || initialTarget?.conversationId || '')
    if (targetId && String(selectedId) !== targetId) {
      setSelectedId(targetId)
      if (panel) setMode('chat')
      return
    }

    if (!selectedId && conversations.length) {
      setSelectedId(String(getGmailConversationId(conversations[0])))
    }
  }, [conversations, hasMailbox, initialTarget, open, panel, requestedConversationId, selectedId])

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
      next.set('channel', 'gmail')
      next.set('gmailConversation', nextId)
      return next
    })
  }

  const handleSend = async ({ text, attachment }) => {
    const value = String(text || '').trim()
    if ((!value && !attachment) || !selectedId) return
    if (!participantEmail) {
      toast.error('لا يوجد بريد مستلم واضح لهذه المحادثة.')
      return
    }

    try {
      await mutations.sendMessage.mutateAsync({
        mailbox_email: conversationInfo?.mailbox_email || selectedConversation?.mailbox_email || mailboxes[0],
        to_email: participantEmail,
        subject: conversationInfo?.subject || selectedConversation?.subject || selectedConversation?.last_message?.subject || 'CRM message',
        message: value,
        attachments: attachment ? [attachment] : [],
      })
      queryClient.invalidateQueries({ queryKey: GMAIL_CONVERSATIONS_QUERY_KEY({ per_page: 30 }) })
      queryClient.invalidateQueries({ queryKey: GMAIL_CONVERSATION_MESSAGES_QUERY_KEY(selectedId, { per_page: 50 }) })
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'تعذر إرسال رسالة Gmail')
    }
  }

  const handleToggleConversationStatus = async (conversation) => {
    const conversationId = getGmailConversationId(conversation) || selectedId
    if (!conversationId) return
    const isClosed = String(conversation?.status || '').toLowerCase() === 'closed'

    try {
      if (isClosed) {
        await mutations.reopenConversation.mutateAsync(conversationId)
        toast.success('تم إعادة فتح محادثة Gmail')
      } else {
        const confirmed = window.confirm('هل تريد إنهاء محادثة Gmail؟ لن يمكن إرسال رسائل جديدة قبل إعادة فتحها.')
        if (!confirmed) return
        await mutations.closeConversation.mutateAsync(conversationId)
        toast.success('تم إنهاء محادثة Gmail')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'تعذر تحديث حالة محادثة Gmail')
    }
  }

  const handleCustomerLinked = () => {
    queryClient.invalidateQueries({ queryKey: ['gmail'] })
    if (selectedId) {
      queryClient.invalidateQueries({ queryKey: GMAIL_CONVERSATION_INFO_QUERY_KEY(selectedId) })
    }
  }

  const handleOpenPage = () => {
    const queryString = selectedId
      ? `?channel=gmail&gmailConversation=${encodeURIComponent(selectedId)}`
      : '?channel=gmail'
    navigate(`/conversations${queryString}`)
    onClose?.()
  }

  if (!hasMailbox && !mailboxesQuery.isLoading) {
    return <GmailLoginRequired tenantId={tenantId} compact={panel} />
  }

  const list = (
    <section className={`${panel ? 'h-full' : 'min-h-[360px] xl:sticky xl:top-16 xl:max-h-[calc(100vh-5rem)]'} overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]`}>
      <header className="flex items-center justify-between gap-3 border-b border-[var(--border)] p-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#FCE8E6] text-[#D93025]">
            <GmailLogoIcon size={22} />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-black text-[var(--text)]">محادثات Gmail</h2>
            <p className="text-xs font-semibold text-[var(--text-muted)]">{conversations.length} محادثة</p>
          </div>
        </div>
        {panel ? (
          <div className="flex items-center gap-1">
            <button type="button" onClick={handleOpenPage} className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#D8E7EA] bg-white px-2 text-xs font-black text-[#D93025]">
              <ExternalLink size={13} />
              فتح
            </button>
            <button type="button" onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#64748B]">
              <X size={15} />
            </button>
          </div>
        ) : null}
      </header>

      <GmailBusinessEmailsPanel enabled={open && hasMailbox} compact={panel} />

      <div className="border-b border-[#EEF2F4] bg-white p-3">
        <label className="flex h-10 items-center gap-2 rounded-lg border border-[#D8E7EA] bg-[#FBFEFF] px-3">
          <Search size={15} className="shrink-0 text-[#64748B]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-xs font-bold text-[#111827] outline-none placeholder:text-[#94A3B8]"
            placeholder="بحث في Gmail..."
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
        {conversationsQuery.isLoading || mailboxesQuery.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-xl bg-white" />
            ))}
          </div>
        ) : null}

        {!conversationsQuery.isLoading && filteredConversations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#F4C7C3] bg-white px-4 py-6 text-center text-sm font-bold text-[#64748B]">
            لا توجد محادثات Gmail مطابقة.
          </div>
        ) : null}

        {filteredConversations.map((conversation) => {
          const id = getGmailConversationId(conversation)
          const title = getGmailConversationTitle(conversation)
          const isActive = String(selectedId) === String(id)
          const unreadCount = Number(conversation.unread_count || 0)
          const isClosed = String(conversation.status || '').toLowerCase() === 'closed'

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
                isActive ? 'border-[#D93025] bg-[#FCE8E6]' : 'border-[var(--border)] bg-white hover:border-[#F4C7C3]',
              ].join(' ')}
            >
              <div className="flex items-start gap-3">
                <GmailConversationAvatar title={title} unreadCount={unreadCount} active={isActive} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-black text-[var(--text)]">{title}</span>
                    {isClosed ? <span className="rounded-full bg-[#FEF2F2] px-2 py-0.5 text-[10px] font-black text-[#B91C1C]">منتهية</span> : null}
                    <span className="shrink-0 text-[10px] font-semibold text-[var(--text-muted)]">{formatTime(conversation.last_message_at)}</span>
                  </span>
                  <span className="mt-1 block truncate text-xs font-semibold text-[var(--text-muted)]">
                    {getGmailConversationSubtitle(conversation) || conversation.mailbox_email}
                  </span>
                  {conversation.assigned_user?.name ? (
                    <span className="mt-1 inline-flex max-w-full items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-black text-[#475569]">
                      <UserRound size={11} />
                      <span className="truncate">المسؤول: {conversation.assigned_user.name}</span>
                    </span>
                  ) : null}
                </span>
              </div>
              {!conversation.customer ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    setLinkDialogConversation(conversation)
                  }}
                  className="mt-2 inline-flex h-8 items-center gap-1 rounded-lg border border-[#F4C7C3] bg-white px-2 text-[11px] font-black text-[#B3261E] transition hover:bg-[#FFF4F2]"
                >
                  <UserPlus size={13} />
                  تحويل عميل محتمل
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
          <button type="button" onClick={() => setMode('list')} className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#D8E7EA] bg-white px-2 text-xs font-black text-[#D93025]">
            رجوع
          </button>
        </div>
      ) : null}

      <MessengerChatThread
        title={selectedId ? selectedTitle || 'Gmail' : ''}
        contactText={selectedId ? selectedContact || participantEmail || 'Gmail' : 'اختر محادثة Gmail'}
        contactDetails={{
          name: selectedTitle || 'Gmail',
          contact: selectedContact || participantEmail || '',
          email: participantEmail,
          channel: 'Gmail',
          conversationId: selectedId,
          status: conversationInfo?.status ?? selectedConversation?.status ?? '',
          customer: conversationInfo?.customer ?? selectedConversation?.customer ?? null,
          assignedUser: conversationInfo?.assigned_user ?? selectedConversation?.assigned_user ?? null,
          users: [],
        }}
        messages={messages}
        isLoadingMessages={messagesQuery.isLoading || conversationInfoQuery.isLoading}
        error={messagesQuery.error?.message || conversationInfoQuery.error?.message || ''}
        hasMoreMessages={false}
        isSending={mutations.sendMessage.isPending}
        onSend={handleSend}
        onConvertToLead={(conversation) => setLinkDialogConversation(conversationInfo || selectedConversation || conversation)}
        onToggleConversationStatus={handleToggleConversationStatus}
        isTogglingConversationStatus={mutations.closeConversation.isPending || mutations.reopenConversation.isPending}
        supportsAttachments
        supportsReply={false}
        supportsReactions={false}
        channelColor="#D93025"
        autoFocusKey={`${panel ? 'panel' : 'page'}-${selectedId}`}
        composerDisabled={!selectedId || String(conversationInfo?.status || selectedConversation?.status || '').toLowerCase() === 'closed'}
        emptyMessage={selectedId ? 'لا توجد رسائل Gmail بعد.' : 'اختر محادثة Gmail'}
        emptyDescription={selectedId ? '' : 'اختر محادثة من القائمة لعرض الرسائل.'}
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
        conversationId={getGmailConversationId(linkDialogConversation) || selectedId}
        source="gmail"
        linkCustomerMutationFn={({ conversationId, customerId }) => mutations.linkCustomer.mutateAsync({ conversationId, customerId })}
        onClose={() => setLinkDialogConversation(null)}
        onLinked={handleCustomerLinked}
      />
    </>
  )
}
