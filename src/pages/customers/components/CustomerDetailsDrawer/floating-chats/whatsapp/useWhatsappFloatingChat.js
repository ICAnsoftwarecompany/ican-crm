import { useCallback, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { whatsappIntegrationApi } from '../../../../../../features/integrations/whatsapp'
import { playWhatsappNotificationSound } from '../../../../../../features/conversations/utils/whatsappNotificationSound'
import { useRealtimeMessageHighlight } from '../../../../../../features/conversations/hooks/useRealtimeMessageHighlight'
import { useWhatsappRealtime } from '../../../../../../realtime/hooks/useWhatsappRealtime'
import {
  extractWhatsappEntity,
  extractWhatsappList,
  getWhatsappConversationId,
  getWhatsappMessageId,
  normalizeWhatsappMessage,
  sortWhatsappMessagesAscending,
  upsertWhatsappMessage,
} from '../../../../../../features/conversations/utils/whatsappConversations'

function getLeadId(customer) {
  return customer?.lead?.id || customer?.lead_id || ''
}

function getCustomerId(customer) {
  return customer?.customer_id || customer?.id || ''
}

function getConversationFromResponse(response) {
  const data = response?.data ?? response
  return data?.conversation || data?.data?.conversation || data || null
}

function getWhatsappPhoneNumberId(conversationInfo, customer) {
  return (
    conversationInfo?.phone_number_id ||
    conversationInfo?.phoneNumberId ||
    conversationInfo?.phone_number?.id ||
    customer?.phone_number_id ||
    import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID ||
    ''
  )
}

function getWhatsappRecipient(conversationInfo, customer) {
  return (
    conversationInfo?.contact?.phone ||
    conversationInfo?.contact?.wa_id ||
    conversationInfo?.customer?.phone ||
    conversationInfo?.lead?.phone ||
    customer?.phone ||
    customer?.lead?.phone ||
    ''
  )
}

function isIncomingMessage(message = {}) {
  const direction = String(message.direction || '').toLowerCase()
  return direction === 'inbound' || direction === 'incoming' || direction === 'received' || !direction
}

function upsertMessageIntoCachedResponse(current, message) {
  const messages = extractWhatsappList(current)
  const nextMessages = upsertWhatsappMessage(messages, message)

  if (Array.isArray(current)) return nextMessages
  if (Array.isArray(current?.data?.data)) return { ...current, data: { ...current.data, data: nextMessages } }
  if (Array.isArray(current?.data)) return { ...current, data: nextMessages }
  if (Array.isArray(current?.messages)) return { ...current, messages: nextMessages }
  return nextMessages
}

export function useWhatsappFloatingChat(customer, open) {
  const queryClient = useQueryClient()
  const { highlightedMessageId, highlightMessage } = useRealtimeMessageHighlight()
  const leadId = getLeadId(customer)
  const customerId = getCustomerId(customer)
  const lookupMode = leadId ? 'lead' : 'customer'
  const lookupId = leadId || customerId
  const lookupKey = ['whatsapp-chat', lookupMode, lookupId, 'conversation']

  const conversationQuery = useQuery({
    queryKey: lookupKey,
    queryFn: () => (
      leadId
        ? whatsappIntegrationApi.getLeadConversation(leadId)
        : whatsappIntegrationApi.getCustomerConversation(customerId)
    ),
    enabled: Boolean(open && lookupId),
    select: getConversationFromResponse,
  })

  const conversation = conversationQuery.data
  const conversationId = getWhatsappConversationId(conversation)
  const infoKey = ['whatsapp-chat', 'conversation-info', conversationId]
  const messagesKey = ['whatsapp-chat', 'conversation-messages', conversationId]

  const conversationInfoQuery = useQuery({
    queryKey: infoKey,
    queryFn: () => whatsappIntegrationApi.getConversationInfo(conversationId),
    enabled: Boolean(open && conversationId),
    select: extractWhatsappEntity,
  })

  const messagesQuery = useQuery({
    queryKey: messagesKey,
    queryFn: () => whatsappIntegrationApi.getConversationMessages(conversationId, { per_page: 50 }),
    enabled: Boolean(open && conversationId),
    select: extractWhatsappList,
  })

  const conversationInfo = conversationInfoQuery.data || conversation
  const messages = useMemo(() => (
    sortWhatsappMessagesAscending((messagesQuery.data || []).map((message) => (
      normalizeWhatsappMessage(message, conversationInfo)
    )))
  ), [conversationInfo, messagesQuery.data])
  const phoneNumberId = getWhatsappPhoneNumberId(conversationInfo, customer)
  const recipient = getWhatsappRecipient(conversationInfo, customer)

  const sendMutation = useMutation({
    mutationFn: ({ text, attachment, replyToMessageId }) => whatsappIntegrationApi.sendMessage({
      phone_number_id: phoneNumberId,
      to: recipient,
      message: text,
      files: attachment ? [attachment] : [],
      reply_to_message_id: replyToMessageId,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: infoKey })
      queryClient.invalidateQueries({ queryKey: messagesKey })
    },
  })

  const reactionMutation = useMutation({
    mutationFn: ({ messageId, reaction }) => whatsappIntegrationApi.sendReaction({
      phone_number_id: phoneNumberId,
      to: recipient,
      message_id: messageId,
      emoji: reaction,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagesKey })
    },
  })

  const refreshConversation = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: lookupKey })
    if (conversationId) {
      queryClient.invalidateQueries({ queryKey: infoKey })
      queryClient.invalidateQueries({ queryKey: messagesKey })
    }
  }, [conversationId, infoKey, lookupKey, messagesKey, queryClient])

  const handleRealtimeMessage = useCallback(({ message, conversation: conversationPatch, conversationId: eventConversationId }) => {
    if (conversationPatch && conversationId) {
      queryClient.invalidateQueries({ queryKey: lookupKey })
      queryClient.invalidateQueries({ queryKey: infoKey })
    }

    if (!message || String(eventConversationId || conversationId) !== String(conversationId)) {
      refreshConversation()
      return
    }

    const messageId = getWhatsappMessageId(message)
    highlightMessage(messageId)

    if (isIncomingMessage(message)) {
      playWhatsappNotificationSound(messageId)
    }

    queryClient.setQueryData(messagesKey, (current) => upsertMessageIntoCachedResponse(current, message))
  }, [conversationId, highlightMessage, infoKey, lookupKey, messagesKey, queryClient, refreshConversation])

  useWhatsappRealtime({
    conversationId,
    enabled: Boolean(open && conversationId),
    onMessageReceived: handleRealtimeMessage,
  })

  const isLoading = conversationQuery.isLoading || conversationInfoQuery.isLoading || messagesQuery.isLoading
  const error = conversationQuery.error || conversationInfoQuery.error || messagesQuery.error || sendMutation.error
  const foundConversation = Boolean(conversationId)

  return {
    conversation,
    conversationInfo,
    messages,
    foundConversation,
    isLoadingMessages: isLoading,
    isSending: sendMutation.isPending,
    isReacting: reactionMutation.isPending,
    phoneNumberId,
    recipient,
    canSend: Boolean(foundConversation && phoneNumberId && recipient),
    error: error?.response?.data?.message || error?.message || (!conversationQuery.isLoading && open && lookupId && !foundConversation ? '\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u062d\u0627\u062f\u062b\u0629 WhatsApp \u0645\u0631\u062a\u0628\u0637\u0629 \u0628\u0647\u0630\u0627 \u0627\u0644\u0639\u0645\u064a\u0644.' : ''),
    hasMoreMessages: false,
    highlightedMessageId,
    loadMore: undefined,
    sendMessage: sendMutation.mutateAsync,
    reactToMessage: reactionMutation.mutateAsync,
  }
}
