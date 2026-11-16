import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { whatsappApi } from '../api/whatsappApi'
import { messengerApi } from '../api/messengerApi'
import { QUERY_KEYS } from '../../../shared/constants/queryKeys'
import { extractList } from '../../../shared/utils/apiResponse'
import { prioritizeQuery, queryPolicyOptions } from '../../../shared/query/queryPolicy'
import { useAuthStore } from '../../../store/authStore'
import { requireTenantId, resolveTenantId } from '../../../services/tenantResolver'
import {
  MESSENGER_CONVERSATIONS_QUERY_KEY,
  MESSENGER_CONVERSATION_INFO_QUERY_KEY,
  MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY,
  extractMessengerConversations,
  extractMessengerMessages,
} from '../utils/messengerConversations'

export function useConversations() {
  const user = useAuthStore((state) => state.user)
  const tenant = resolveTenantId(user)

  return useQuery({
    queryKey: QUERY_KEYS.conversations.list(tenant),
    queryFn: () => whatsappApi.getConversations(requireTenantId(tenant)),
    enabled: Boolean(tenant),
    select: (data) => extractList(data, ['conversations', 'chats']),
  })
}

export function useMessages(conversationId) {
  const user = useAuthStore((state) => state.user)
  const tenant = resolveTenantId(user)

  return useQuery({
    queryKey: QUERY_KEYS.conversations.messages(tenant, conversationId),
    queryFn: () => whatsappApi.getConversationMessages(requireTenantId(tenant), conversationId),
    enabled: Boolean(tenant && conversationId),
    select: (data) => extractList(data, ['messages']),
  })
}

export function useConversationMutations() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const tenant = resolveTenantId(user)

  return {
    sendWhatsapp: useMutation({
      mutationFn: (payload) => whatsappApi.sendMessage(requireTenantId(tenant), payload),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations.all }),
    }),
    sendMessengerTest: useMutation({ mutationFn: messengerApi.sendTestMessage }),
  }
}

export function useMessengerConversations(params, options = {}) {
  const { priority = 'page', ...queryOptions } = options
  return useQuery({
    ...queryPolicyOptions(priority, queryOptions),
    queryKey: MESSENGER_CONVERSATIONS_QUERY_KEY,
    queryFn: prioritizeQuery(() => messengerApi.getConversations(params), priority),
    select: extractMessengerConversations,
  })
}

export function useMessengerConversationInfo(conversationId, params, options = {}) {
  const { priority = 'page', ...queryOptions } = options
  return useQuery({
    queryKey: MESSENGER_CONVERSATION_INFO_QUERY_KEY(conversationId),
    queryFn: prioritizeQuery(() => messengerApi.getConversationInfo(conversationId, params), priority),
    select: (response) => response?.data?.data || response?.data || response || null,
    ...queryPolicyOptions(priority, queryOptions),
    enabled: Boolean(conversationId) && (queryOptions.enabled ?? true),
  })
}

export function useMessengerMessages(conversationId, params, options = {}) {
  const { priority = 'page', ...queryOptions } = options
  return useQuery({
    queryKey: MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY(conversationId),
    queryFn: prioritizeQuery(() => messengerApi.getConversationMessages(conversationId, params), priority),
    select: extractMessengerMessages,
    ...queryPolicyOptions(priority, queryOptions),
    enabled: Boolean(conversationId) && (queryOptions.enabled ?? true),
  })
}

export function useMessengerConversationMutations(conversationId) {
  const queryClient = useQueryClient()

  return {
    sendMessage: useMutation({
      mutationFn: (payload) => {
        const messagePayload = typeof payload === 'string' ? { message: payload } : payload
        return messengerApi.sendMessage(conversationId, messagePayload)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATIONS_QUERY_KEY })
        queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATION_INFO_QUERY_KEY(conversationId) })
        queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY(conversationId) })
      },
    }),
    reactToMessage: useMutation({
      mutationFn: ({ messageId, reaction }) => messengerApi.reactToMessage(conversationId, messageId, { reaction }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATIONS_QUERY_KEY })
        queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATION_INFO_QUERY_KEY(conversationId) })
        queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY(conversationId) })
      },
    }),
    removeReaction: useMutation({
      mutationFn: ({ messageId }) => messengerApi.deleteReaction(conversationId, messageId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATIONS_QUERY_KEY })
        queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATION_INFO_QUERY_KEY(conversationId) })
        queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY(conversationId) })
      },
    }),
    closeConversation: useMutation({
      mutationFn: (targetConversationId = conversationId) => messengerApi.closeConversation(targetConversationId),
      onSuccess: (_data, targetConversationId = conversationId) => {
        queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATIONS_QUERY_KEY })
        queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATION_INFO_QUERY_KEY(targetConversationId) })
        queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY(targetConversationId) })
      },
    }),
    reopenConversation: useMutation({
      mutationFn: (targetConversationId = conversationId) => messengerApi.reopenConversation(targetConversationId),
      onSuccess: (_data, targetConversationId = conversationId) => {
        queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATIONS_QUERY_KEY })
        queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATION_INFO_QUERY_KEY(targetConversationId) })
        queryClient.invalidateQueries({ queryKey: MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY(targetConversationId) })
      },
    }),
  }
}

export {
  useGmailConversations,
  useGmailConversationInfo,
  useGmailMessages,
  useGmailCustomerConversation,
  useGmailLeadConversation,
  useGmailMailboxes,
  useGmailConversationMutations,
} from './useGmailConversations'

export {
  useWhatsappConversations,
  useWhatsappConversationInfo,
  useWhatsappMessages,
  useWhatsappConversationMutations,
} from './useWhatsappConversations'
