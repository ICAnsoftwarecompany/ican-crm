import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, MessagesSquare, Search, UserRound, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useChatConversationMutations, useChatConversations } from '../hooks/useChatConversations'
import { useChatMessageMutations, useChatMessages } from '../hooks/useChatMessages'
import { useInternalChatUiStore } from '../store/internalChatUiStore'
import { getConversationDisplayInfo, getConversationId, getLastMessagePreview } from '../utils/conversationHelpers'
import { MessengerChatThread } from '../../conversations/components/MessengerChatThread'

function HeaderActions({ onOpenPage, onClose }) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        onClick={onOpenPage}
        className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-[#D8E7EA] bg-white px-2 text-xs font-black text-[#00878D] transition-colors hover:bg-[#E8F9FA]"
      >
        <ExternalLink size={13} />
        فتح
      </button>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#111827]"
      >
        <X size={15} />
      </button>
    </div>
  )
}

function toComposerMessage(message) {
  return {
    ...message,
    text: message?.text || message?.body || message?.message || '',
    createdAt: message?.createdAt || message?.created_at || '',
    raw: {
      ...message?.raw,
      id: message?.id,
      created_at: message?.createdAt || message?.created_at || '',
      sent_by: message?.sender || message?.raw?.sent_by,
      body: message?.text || message?.body || message?.message || '',
    },
  }
}

export function InternalChatSidebarPanel({ open, onClose }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const selectedConversationId = useInternalChatUiStore((state) => state.activeConversationId)
  const setSelectedConversationId = useInternalChatUiStore((state) => state.setActiveConversationId)

  const conversationsQuery = useChatConversations({ per_page: 30 }, { enabled: open })
  const conversations = Array.isArray(conversationsQuery.data) ? conversationsQuery.data : []

  useEffect(() => {
    if (!open) return
    if (selectedConversationId) return
    const firstId = getConversationId(conversations[0])
    if (firstId) setSelectedConversationId(firstId)
  }, [conversations, open, selectedConversationId, setSelectedConversationId])

  const filteredConversations = useMemo(() => {
    const value = String(query || '').trim().toLowerCase()
    if (!value) return conversations

    return conversations.filter((conversation) => {
      const text = [conversation?.display_name, conversation?.name, getLastMessagePreview(conversation)].filter(Boolean).join(' ').toLowerCase()
      return text.includes(value)
    })
  }, [conversations, query])

  const selectedConversation = useMemo(() => (
    filteredConversations.find((item) => String(getConversationId(item)) === String(selectedConversationId || ''))
      || conversations.find((item) => String(getConversationId(item)) === String(selectedConversationId || ''))
      || null
  ), [conversations, filteredConversations, selectedConversationId])

  const conversationMutations = useChatConversationMutations()
  const messagesQuery = useChatMessages(getConversationId(selectedConversation), { page: 1 }, {
    enabled: open && Boolean(getConversationId(selectedConversation)),
  })
  const messageMutations = useChatMessageMutations(getConversationId(selectedConversation), { page: 1 })

  const messages = useMemo(() => {
    const list = Array.isArray(messagesQuery.data) ? messagesQuery.data : []
    return list.map(toComposerMessage)
  }, [messagesQuery.data])

  useEffect(() => {
    if (!open) return
    const currentConversationId = getConversationId(selectedConversation)
    if (!currentConversationId) return
    conversationMutations.markAsRead.mutate(currentConversationId)
  }, [conversationMutations.markAsRead, open, selectedConversation])

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

  return (
    <aside
      className="fixed end-0 top-12 bottom-0 z-30 w-[min(520px,calc(100vw-72px))] border-s border-[#DDECEF] bg-white shadow-[-14px_0_30px_rgba(15,23,42,0.08)] transition-transform duration-300"
      style={{ transform: open ? 'translateX(0)' : `translateX(${isRtl ? '-100%' : '100%'})` }}
      aria-hidden={!open}
    >
      <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="min-h-0 border-b border-[#E5EEF0] md:border-b-0 md:border-e">
          <header className="border-b border-[#E5EEF0] bg-[#F8FEFF] p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#00878D]">
                  <MessagesSquare size={18} />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-black text-[#111827]">الشات الداخلي</h2>
                  <p className="truncate text-xs font-semibold text-[#64748B]">{conversations.length} محادثة</p>
                </div>
              </div>
              <HeaderActions onOpenPage={() => { navigate('/team-chat'); onClose?.() }} onClose={onClose} />
            </div>

            <label className="relative mt-3 block">
              <Search size={14} className="pointer-events-none absolute start-2.5 top-2.5 text-[#94A3B8]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ابحث..."
                className="h-9 w-full rounded-lg border border-[#D7EEF0] bg-white ps-8 pe-3 text-xs font-semibold text-[#0F172A] outline-none focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]"
              />
            </label>
          </header>

          <div className="min-h-0 overflow-y-auto p-2">
            {filteredConversations.map((conversation) => {
              const id = getConversationId(conversation)
              const isActive = String(id || '') === String(getConversationId(selectedConversation) || '')
              return (
                <button
                  key={id || conversation?.name}
                  type="button"
                  onClick={() => setSelectedConversationId(id)}
                  className={[
                    'mb-2 w-full rounded-xl border p-2 text-start transition-colors',
                    isActive ? 'border-[#7FDDE1] bg-[#F3FDFF]' : 'border-[#E5EEF0] bg-white hover:bg-[#F8FEFF]',
                  ].join(' ')}
                >
                  <div className="flex items-start gap-2">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8F9FA] text-[#007A80]">
                      <UserRound size={14} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs font-black text-[#0F172A]">{conversation?.display_name || conversation?.name || 'Conversation'}</span>
                        {conversation?.unread_count > 0 ? (
                          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-black text-white">
                            {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-1 block truncate text-[10px] font-semibold text-[#64748B]">{getLastMessagePreview(conversation)}</span>
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="min-h-0">
          <MessengerChatThread
            title={details.name || 'Internal chat'}
            contactText={details.subtitle || 'Team discussion'}
            avatarUrl={details.avatar || ''}
            contactDetails={{
              name: details.name || 'Internal chat',
              contact: details.subtitle || 'Team discussion',
              channel: 'Internal Chat',
              conversationId: getConversationId(selectedConversation),
              users: selectedConversation?.users || [],
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
            channelColor="#0F766E"
            autoFocusKey={getConversationId(selectedConversation)}
            composerDisabled={!getConversationId(selectedConversation)}
            emptyMessage={getConversationId(selectedConversation) ? 'لا توجد رسائل بعد.' : 'اختر محادثة'}
            emptyDescription={getConversationId(selectedConversation) ? 'ابدأ المحادثة مع الفريق.' : 'اختر محادثة من القائمة.'}
          />
        </div>
      </div>
    </aside>
  )
}
