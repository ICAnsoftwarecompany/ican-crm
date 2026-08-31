import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  facebookAdsApi,
  facebookMetaApi,
  messengerMetaApi,
  whatsappMetaApi,
} from '../api/metaIntegrationsApi'
import { QUERY_KEYS } from '../../../shared/constants/queryKeys'
import { extractList } from '../../../shared/utils/apiResponse'

export function useFacebookPages(tenant, params, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.metaIntegrations.facebookPages(tenant, params),
    queryFn: () => facebookMetaApi.getPages(tenant, params),
    enabled: Boolean(tenant) && (options.enabled ?? true),
    select: (data) => extractList(data, ['data', 'pages', 'items']),
    ...options,
  })
}

export function useFacebookAssets(tenant, params, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.metaIntegrations.facebookAssets(tenant, params),
    queryFn: () => facebookMetaApi.getAssets(tenant, params),
    enabled: Boolean(tenant) && (options.enabled ?? true),
    select: (data) => extractList(data, ['data', 'assets', 'items']),
    ...options,
  })
}

export function useWhatsappChats(tenant, params, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.metaIntegrations.whatsappChats(tenant, params),
    queryFn: () => whatsappMetaApi.getMyChats(tenant, params),
    enabled: Boolean(tenant) && (options.enabled ?? true),
    select: (data) => extractList(data, ['data', 'conversations', 'items']),
    ...options,
  })
}

export function useWhatsappConversationMessages(tenant, conversationId, params, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.metaIntegrations.whatsappMessages(tenant, conversationId, params),
    queryFn: () => whatsappMetaApi.getConversationMessages(tenant, conversationId, params),
    enabled: Boolean(tenant && conversationId) && (options.enabled ?? true),
    select: (data) => extractList(data, ['data', 'messages', 'items']),
    ...options,
  })
}

export function useWhatsappTemplates(tenant, params, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.metaIntegrations.whatsappTemplates(tenant, params),
    queryFn: () => whatsappMetaApi.getTemplates(tenant, params),
    enabled: Boolean(tenant) && (options.enabled ?? true),
    select: (data) => extractList(data, ['data', 'templates', 'items']),
    ...options,
  })
}

export function useMessengerConversations(params, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.metaIntegrations.messengerConversations(params),
    queryFn: () => messengerMetaApi.getConversations(params),
    select: (data) => extractList(data, ['data', 'conversations', 'items']),
    ...options,
  })
}

export function useMessengerConversationInfo(conversationId, params, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.metaIntegrations.messengerConversation(conversationId, params),
    queryFn: () => messengerMetaApi.getConversationInfo(conversationId, params),
    enabled: Boolean(conversationId) && (options.enabled ?? true),
    ...options,
  })
}

export function useMessengerConversationMessages(conversationId, params, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.metaIntegrations.messengerMessages(conversationId, params),
    queryFn: () => messengerMetaApi.getConversationMessages(conversationId, params),
    enabled: Boolean(conversationId) && (options.enabled ?? true),
    select: (data) => extractList(data, ['data', 'messages', 'items']),
    ...options,
  })
}

export function useMetaIntegrationMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.metaIntegrations.all })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations.all })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaigns.all })
  }

  return {
    createCampaign: useMutation({
      mutationFn: facebookAdsApi.createCampaign,
      onSuccess: invalidate,
    }),
    createAdSet: useMutation({
      mutationFn: facebookAdsApi.createAdSet,
      onSuccess: invalidate,
    }),
    createAd: useMutation({
      mutationFn: facebookAdsApi.createAd,
      onSuccess: invalidate,
    }),
    createLeadForm: useMutation({
      mutationFn: ({ tenant, payload }) => facebookAdsApi.createLeadForm(tenant, payload),
      onSuccess: invalidate,
    }),
    connectFacebook: useMutation({
      mutationFn: ({ tenant, params }) => facebookMetaApi.connect(tenant, params),
      onSuccess: invalidate,
    }),
    refreshFacebookToken: useMutation({
      mutationFn: ({ tenant, params }) => facebookMetaApi.refreshToken(tenant, params),
      onSuccess: invalidate,
    }),
    sendWhatsappConversationMessage: useMutation({
      mutationFn: ({ tenant, conversationId, payload }) => (
        whatsappMetaApi.sendConversationMessage(tenant, conversationId, payload)
      ),
      onSuccess: invalidate,
    }),
    sendWhatsappMessage: useMutation({
      mutationFn: ({ tenant, payload }) => whatsappMetaApi.sendMessage(tenant, payload),
      onSuccess: invalidate,
    }),
    createWhatsappTemplate: useMutation({
      mutationFn: ({ tenant, payload }) => whatsappMetaApi.createTemplate(tenant, payload),
      onSuccess: invalidate,
    }),
    sendMessengerTestMessage: useMutation({
      mutationFn: messengerMetaApi.sendTestMessage,
      onSuccess: invalidate,
    }),
    sendMessengerMessage: useMutation({
      mutationFn: ({ conversationId, payload }) => messengerMetaApi.sendMessage(conversationId, payload),
      onSuccess: invalidate,
    }),
    assignMessengerUser: useMutation({
      mutationFn: ({ conversationId, payload }) => messengerMetaApi.assignUser(conversationId, payload),
      onSuccess: invalidate,
    }),
    closeMessengerConversation: useMutation({
      mutationFn: messengerMetaApi.closeConversation,
      onSuccess: invalidate,
    }),
    reopenMessengerConversation: useMutation({
      mutationFn: messengerMetaApi.reopenConversation,
      onSuccess: invalidate,
    }),
  }
}
