import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { extractList } from '../../../../shared/utils/apiResponse'
import { whatsappIntegrationApi } from '../api/whatsappIntegrationApi'

export const WHATSAPP_INTEGRATION_QUERY_KEYS = {
  all: ['integrations', 'whatsapp'],
  templates: (params) => [...WHATSAPP_INTEGRATION_QUERY_KEYS.all, 'templates', params],
  conversations: (params) => [...WHATSAPP_INTEGRATION_QUERY_KEYS.all, 'conversations', params],
  conversationInfo: (conversationId) => [...WHATSAPP_INTEGRATION_QUERY_KEYS.all, 'conversations', String(conversationId || ''), 'info'],
  conversationMessages: (conversationId, params) => [
    ...WHATSAPP_INTEGRATION_QUERY_KEYS.all,
    'conversations',
    String(conversationId || ''),
    'messages',
    params,
  ],
  customerConversation: (customerId, params) => [
    ...WHATSAPP_INTEGRATION_QUERY_KEYS.all,
    'customers',
    String(customerId || ''),
    'conversation',
    params,
  ],
  leadConversation: (leadId, params) => [
    ...WHATSAPP_INTEGRATION_QUERY_KEYS.all,
    'leads',
    String(leadId || ''),
    'conversation',
    params,
  ],
}

function extractEntity(response) {
  return response?.data ?? response
}

function extractConversationLookup(response) {
  return response?.conversation ?? response?.data?.conversation ?? response?.data ?? response
}

function extractMessages(response) {
  return extractList(response, ['messages'])
}

function invalidateWhatsapp(queryClient, conversationId) {
  queryClient.invalidateQueries({ queryKey: WHATSAPP_INTEGRATION_QUERY_KEYS.all })

  if (conversationId) {
    queryClient.invalidateQueries({
      queryKey: WHATSAPP_INTEGRATION_QUERY_KEYS.conversationInfo(conversationId),
    })
    queryClient.invalidateQueries({
      queryKey: WHATSAPP_INTEGRATION_QUERY_KEYS.conversationMessages(conversationId),
    })
  }
}

export function useWhatsappConversations(params, options = {}) {
  return useQuery({
    queryKey: WHATSAPP_INTEGRATION_QUERY_KEYS.conversations(params),
    queryFn: () => whatsappIntegrationApi.getConversations(params),
    select: extractList,
    ...options,
  })
}

export function useWhatsappConversationInfo(conversationId, params, options = {}) {
  return useQuery({
    queryKey: WHATSAPP_INTEGRATION_QUERY_KEYS.conversationInfo(conversationId),
    queryFn: () => whatsappIntegrationApi.getConversationInfo(conversationId, params),
    enabled: Boolean(conversationId) && (options.enabled ?? true),
    select: extractEntity,
    ...options,
  })
}

export function useWhatsappConversationMessages(conversationId, params, options = {}) {
  return useQuery({
    queryKey: WHATSAPP_INTEGRATION_QUERY_KEYS.conversationMessages(conversationId, params),
    queryFn: () => whatsappIntegrationApi.getConversationMessages(conversationId, params),
    enabled: Boolean(conversationId) && (options.enabled ?? true),
    select: extractMessages,
    ...options,
  })
}

export function useWhatsappCustomerConversation(customerId, params, options = {}) {
  return useQuery({
    queryKey: WHATSAPP_INTEGRATION_QUERY_KEYS.customerConversation(customerId, params),
    queryFn: () => whatsappIntegrationApi.getCustomerConversation(customerId, params),
    enabled: Boolean(customerId) && (options.enabled ?? true),
    select: extractConversationLookup,
    ...options,
  })
}

export function useWhatsappLeadConversation(leadId, params, options = {}) {
  return useQuery({
    queryKey: WHATSAPP_INTEGRATION_QUERY_KEYS.leadConversation(leadId, params),
    queryFn: () => whatsappIntegrationApi.getLeadConversation(leadId, params),
    enabled: Boolean(leadId) && (options.enabled ?? true),
    select: extractConversationLookup,
    ...options,
  })
}

export function useWhatsappTemplates(params, options = {}) {
  return useQuery({
    queryKey: WHATSAPP_INTEGRATION_QUERY_KEYS.templates(params),
    queryFn: () => whatsappIntegrationApi.getTemplates(params),
    select: (response) => extractList(response, ['data', 'templates', 'items']),
    ...options,
  })
}

export function useWhatsappIntegrationMutations(conversationId) {
  const queryClient = useQueryClient()

  const invalidateTemplates = () => {
    queryClient.invalidateQueries({ queryKey: WHATSAPP_INTEGRATION_QUERY_KEYS.templates() })
    queryClient.invalidateQueries({ queryKey: WHATSAPP_INTEGRATION_QUERY_KEYS.all })
  }

  return {
    sendMessage: useMutation({
      mutationFn: (payload) => whatsappIntegrationApi.sendMessage(payload),
      onSuccess: () => invalidateWhatsapp(queryClient, conversationId),
    }),
    linkCustomer: useMutation({
      mutationFn: ({ conversationId: targetConversationId = conversationId, customerId, customer_id }) => (
        whatsappIntegrationApi.linkCustomerToConversation(targetConversationId, {
          customer_id: customer_id || customerId,
        })
      ),
      onSuccess: (_data, variables = {}) => invalidateWhatsapp(queryClient, variables.conversationId || conversationId),
    }),
    closeConversation: useMutation({
      mutationFn: (targetConversationId = conversationId) => whatsappIntegrationApi.closeConversation(targetConversationId),
      onSuccess: (_data, targetConversationId = conversationId) => invalidateWhatsapp(queryClient, targetConversationId),
    }),
    reopenConversation: useMutation({
      mutationFn: (targetConversationId = conversationId) => whatsappIntegrationApi.reopenConversation(targetConversationId),
      onSuccess: (_data, targetConversationId = conversationId) => invalidateWhatsapp(queryClient, targetConversationId),
    }),
    sendReaction: useMutation({
      mutationFn: (payload) => whatsappIntegrationApi.sendReaction(payload),
      onSuccess: () => invalidateWhatsapp(queryClient, conversationId),
    }),
    sendTemplateMessage: useMutation({
      mutationFn: (payload) => whatsappIntegrationApi.sendTemplateMessage(payload),
      onSuccess: () => invalidateWhatsapp(queryClient, conversationId),
    }),
    createTemplate: useMutation({
      mutationFn: ({ integrationId, payload }) => whatsappIntegrationApi.createTemplate(integrationId, payload),
      onSuccess: invalidateTemplates,
    }),
    updateTemplate: useMutation({
      mutationFn: ({ integrationId, payload }) => whatsappIntegrationApi.updateTemplate(integrationId, payload),
      onSuccess: invalidateTemplates,
    }),
    uploadTemplateMedia: useMutation({
      mutationFn: ({ integrationId, file, payload }) => whatsappIntegrationApi.uploadTemplateMedia(integrationId, payload || { file }),
    }),
    syncTemplateStatus: useMutation({
      mutationFn: whatsappIntegrationApi.syncTemplateStatus,
      onSuccess: invalidateTemplates,
    }),
    toggleTemplateActive: useMutation({
      mutationFn: ({ templateId, is_active, payload }) => (
        whatsappIntegrationApi.toggleTemplateActive(templateId, payload || { is_active })
      ),
      onSuccess: invalidateTemplates,
    }),
    deleteTemplate: useMutation({
      mutationFn: whatsappIntegrationApi.deleteTemplate,
      onSuccess: invalidateTemplates,
    }),
  }
}
