import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { whatsappIntegrationApi } from '../../integrations/whatsapp'
import {
  WHATSAPP_CONVERSATIONS_QUERY_KEY,
  WHATSAPP_CONVERSATION_INFO_QUERY_KEY,
  WHATSAPP_CONVERSATION_MESSAGES_QUERY_KEY,
  extractWhatsappEntity,
  extractWhatsappList,
} from '../utils/whatsappConversations'

export function useWhatsappConversations(params, options = {}) {
  return useQuery({
    queryKey: WHATSAPP_CONVERSATIONS_QUERY_KEY(params),
    queryFn: () => whatsappIntegrationApi.getConversations(params),
    select: extractWhatsappList,
    ...options,
  })
}

export function useWhatsappConversationInfo(conversationId, params, options = {}) {
  return useQuery({
    queryKey: WHATSAPP_CONVERSATION_INFO_QUERY_KEY(conversationId),
    queryFn: () => whatsappIntegrationApi.getConversationInfo(conversationId, params),
    enabled: Boolean(conversationId) && (options.enabled ?? true),
    select: extractWhatsappEntity,
    ...options,
  })
}

export function useWhatsappMessages(conversationId, params, options = {}) {
  return useQuery({
    queryKey: WHATSAPP_CONVERSATION_MESSAGES_QUERY_KEY(conversationId, params),
    queryFn: () => whatsappIntegrationApi.getConversationMessages(conversationId, params),
    enabled: Boolean(conversationId) && (options.enabled ?? true),
    select: extractWhatsappList,
    ...options,
  })
}

export function useWhatsappConversationMutations(conversationId) {
  const queryClient = useQueryClient()

  const invalidateWhatsapp = (targetConversationId = conversationId) => {
    queryClient.invalidateQueries({ queryKey: ['integrations', 'whatsapp'] })
    if (targetConversationId) {
      queryClient.invalidateQueries({ queryKey: WHATSAPP_CONVERSATION_INFO_QUERY_KEY(targetConversationId) })
      queryClient.invalidateQueries({ queryKey: WHATSAPP_CONVERSATION_MESSAGES_QUERY_KEY(targetConversationId) })
    }
  }

  return {
    sendMessage: useMutation({
      mutationFn: (payload) => whatsappIntegrationApi.sendMessage(payload),
      onSuccess: () => invalidateWhatsapp(conversationId),
    }),
    linkCustomer: useMutation({
      mutationFn: ({ conversationId: targetConversationId = conversationId, customerId, customer_id }) => (
        whatsappIntegrationApi.linkCustomerToConversation(targetConversationId, {
          customer_id: customer_id || customerId,
        })
      ),
      onSuccess: (_data, variables = {}) => invalidateWhatsapp(variables.conversationId || conversationId),
    }),
    closeConversation: useMutation({
      mutationFn: (targetConversationId = conversationId) => whatsappIntegrationApi.closeConversation(targetConversationId),
      onSuccess: (_data, targetConversationId = conversationId) => invalidateWhatsapp(targetConversationId),
    }),
    reopenConversation: useMutation({
      mutationFn: (targetConversationId = conversationId) => whatsappIntegrationApi.reopenConversation(targetConversationId),
      onSuccess: (_data, targetConversationId = conversationId) => invalidateWhatsapp(targetConversationId),
    }),
    sendReaction: useMutation({
      mutationFn: (payload) => whatsappIntegrationApi.sendReaction(payload),
      onSuccess: () => invalidateWhatsapp(conversationId),
    }),
  }
}
