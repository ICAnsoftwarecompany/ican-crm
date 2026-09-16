import { useEffect, useMemo, useState } from 'react'
import { MessagesSquare, Search, UsersRound } from 'lucide-react'
import { toast } from 'sonner'

import { MessengerChatThread } from '../../conversations/components/MessengerChatThread'
import { useChatConversationMutations, useChatConversations } from '../hooks/useChatConversations'
import { useChatMessageMutations, useChatMessages } from '../hooks/useChatMessages'
import { useChatRealtime } from '../hooks/useChatRealtime'
import { useInternalChatUiStore } from '../store/internalChatUiStore'
import { getConversationDisplayInfo, getConversationId, getLastMessagePreview } from '../utils/conversationHelpers'

function mapMessage(message) {
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

export function InternalChatWorkspace() {
  const [query, setQuery] = useState('')
  const activeConversationId = useInternalChatUiStore((state) => state.activeConversationId)
  const setActiveConversationId = useInternalChatUiStore((state) => state.setActiveConversationId)

  const conversationsQuery = useChatConversations({ per_page: 50 })
  const conversations = Array.isArray(conversationsQuery.data) ? conversationsQuery.data : []

  useEffect(() => {
    if (activeConversationId) return
    const firstId = getConversationId(conversations[0])
    if (firstId) setActiveConversationId(firstId)
  }, [activeConversationId, conversations, setActiveConversationId])

  const filtered = useMemo(() => {
    const value = String(query || '').trim().toLowerCase()
    if (!value) return conversations
    return conversations.filter((conversation) => {
      const text = [conversation?.display_name, conversation?.name, getLastMessagePreview(conversation)].filter(Boolean).join(' ').toLowerCase()
      return text.includes(value)
    })
  }, [conversations, query])

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

  useChatRealtime({ activeConversationId: getConversationId(activeConversation), enabled: true })

  useEffect(() => {
    const id = getConversationId(activeConversation)
    if (!id) return
    conversationMutations.markAsRead.mutate(id)
  }, [activeConversation, conversationMutations.markAsRead])

  const messages = useMemo(() => {
    const list = Array.isArray(messagesQuery.data) ? messagesQuery.data : []
    return list.map(mapMessage)
  }, [messagesQuery.data])

  const details = getConversationDisplayInfo(activeConversation || {}, null)

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

  return (
    <div className="grid min-h-[calc(100vh-170px)] grid-cols-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)_320px] xl:items-start">
      <section className="min-h-[360px] rounded-lg border border-[var(--border)] bg-[var(--surface)] xl:sticky xl:top-16 xl:max-h-[calc(100vh-5rem)] xl:self-start xl:overflow-hidden">
        <header className="border-b border-[var(--border)] p-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#00878D]">
              <MessagesSquare size={18} />
            </span>
            <div>
              <h2 className="text-sm font-black text-[var(--text)]">محادثات الفريق</h2>
              <p className="text-xs font-semibold text-[var(--text-muted)]">{conversations.length} محادثة</p>
            </div>
          </div>

          <label className="relative mt-3 block">
            <Search size={14} className="pointer-events-none absolute start-2.5 top-2.5 text-[#94A3B8]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث في المحادثات..."
              className="h-9 w-full rounded-lg border border-[#D7EEF0] bg-white ps-8 pe-3 text-xs font-semibold text-[#0F172A] outline-none focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]"
            />
          </label>
        </header>

        <div className="max-h-[calc(100vh-240px)] overflow-y-auto p-2">
          {filtered.map((conversation) => {
            const id = getConversationId(conversation)
            const active = String(id || '') === String(getConversationId(activeConversation) || '')
            return (
              <button
                key={id || conversation?.name}
                type="button"
                onClick={() => setActiveConversationId(id)}
                className={[
                  'mb-2 w-full rounded-xl border p-3 text-start transition-colors',
                  active ? 'border-[#00C2CB] bg-[#E8F9FA]' : 'border-[var(--border)] bg-[var(--surface-2)] hover:border-[#B8EFF2]',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-black text-[var(--text)]">{conversation?.display_name || conversation?.name || 'Conversation'}</span>
                  {conversation?.unread_count > 0 ? (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-black text-white">
                      {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 truncate text-xs font-semibold text-[var(--text-muted)]">{getLastMessagePreview(conversation)}</p>
              </button>
            )
          })}
        </div>
      </section>

      <section className="flex min-h-[520px] flex-col rounded-lg border border-[var(--border)] bg-[var(--surface)] xl:sticky xl:top-16 xl:h-[calc(100vh-5rem)] xl:max-h-[calc(100vh-5rem)] xl:self-start xl:overflow-hidden">
        <MessengerChatThread
          title={details.name || 'Internal chat'}
          contactText={details.subtitle || 'Team collaboration'}
          avatarUrl={details.avatar || ''}
          contactDetails={{
            name: details.name || 'Internal chat',
            contact: details.subtitle || 'Team collaboration',
            channel: 'Internal Chat',
            conversationId: getConversationId(activeConversation),
            users: activeConversation?.users || [],
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
          channelColor="#0F766E"
          autoFocusKey={getConversationId(activeConversation)}
          composerDisabled={!getConversationId(activeConversation)}
          emptyMessage={getConversationId(activeConversation) ? 'لا توجد رسائل بعد.' : 'اختر محادثة'}
          emptyDescription={getConversationId(activeConversation) ? 'ابدأ أول رسالة داخل الفريق.' : 'اختر محادثة من القائمة.'}
        />
      </section>

      <section className="hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 xl:block xl:sticky xl:top-16 xl:max-h-[calc(100vh-5rem)] xl:overflow-y-auto">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#007A80]">
            <UsersRound size={16} />
          </span>
          <h3 className="text-sm font-black text-[var(--text)]">تفاصيل المحادثة</h3>
        </div>

        {!activeConversation ? (
          <p className="mt-4 text-xs font-semibold text-[var(--text-muted)]">اختر محادثة لعرض الأعضاء والإعدادات.</p>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="rounded-lg border border-[#E5EEF0] bg-[#F8FEFF] p-3">
              <div className="text-xs font-bold text-[#64748B]">الاسم</div>
              <div className="mt-1 text-sm font-black text-[#0F172A]">{details.name || 'Internal chat'}</div>
            </div>

            <div className="rounded-lg border border-[#E5EEF0] bg-white p-3">
              <div className="text-xs font-bold text-[#64748B]">نوع المحادثة</div>
              <div className="mt-1 text-sm font-black text-[#0F172A]">{activeConversation?.type || 'group'}</div>
            </div>

            <div className="rounded-lg border border-[#E5EEF0] bg-white p-3">
              <div className="text-xs font-bold text-[#64748B]">الأعضاء</div>
              <div className="mt-1 text-sm font-black text-[#0F172A]">{activeConversation?.users_count || activeConversation?.users?.length || 0}</div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
