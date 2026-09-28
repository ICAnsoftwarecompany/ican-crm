import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
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
  getMessengerConversationId,
  getMessengerConversationTitle,
  getMessengerContactId,
  getMessengerProfilePicture,
  normalizeMessengerMessage,
  sortMessagesAscending,
} from '../utils/messengerConversations'
import { useMessengerNotificationsStore } from '../store/messengerNotificationsStore'
import { useMessengerRealtime } from '../../../realtime/hooks/useMessengerRealtime'
import { useRealtimeMessageHighlight } from '../hooks/useRealtimeMessageHighlight'
import { useMessengerRealtimeMessageHandler } from '../hooks/useMessengerRealtimeMessageHandler'
import { MessengerChatThread } from './MessengerChatThread'
import { MessengerLinkCustomerDialog } from './MessengerLinkCustomerDialog'
import { DEFAULT_MESSENGER_CONVERSATION_FILTERS, filterMessengerConversations } from './MessengerConversationFilters'
import { MessengerConversationListPanel } from './MessengerConversationListPanel'

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

export function MessengerConversationsWorkspace() {
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

  const handleRealtimeMessage = useMessengerRealtimeMessageHandler({ selectedId, highlightMessage })

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
        <MessengerConversationListPanel
          conversations={conversations}
          filteredConversations={filteredConversations}
          conversationsQuery={conversationsQuery}
          filters={conversationFilters}
          onFiltersChange={setConversationFilters}
          selectedId={selectedId}
          onSelect={selectConversation}
          onConvertToLead={handleConvertToLead}
          onToggleStatus={handleToggleConversationStatus}
        />

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
