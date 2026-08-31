import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { gmailApi } from '../api/gmailApi'
import {
  GMAIL_CONVERSATIONS_QUERY_KEY,
  GMAIL_BUSINESS_EMAILS_QUERY_KEY,
  GMAIL_CONVERSATION_INFO_QUERY_KEY,
  GMAIL_CONVERSATION_MESSAGES_QUERY_KEY,
  GMAIL_CUSTOMER_CONVERSATION_QUERY_KEY,
  GMAIL_LEAD_CONVERSATION_QUERY_KEY,
  GMAIL_MAILBOXES_QUERY_KEY,
  extractGmailBusinessEmails,
  extractGmailConversations,
  extractGmailEntity,
  extractGmailMailboxes,
  extractGmailMessages,
} from '../utils/gmailConversations'

export function useGmailConversations(params, options = {}) {
  return useQuery({
    queryKey: GMAIL_CONVERSATIONS_QUERY_KEY(params),
    queryFn: () => gmailApi.getConversations(params),
    select: extractGmailConversations,
    ...options,
  })
}

export function useGmailConversationInfo(conversationId, params, options = {}) {
  return useQuery({
    queryKey: GMAIL_CONVERSATION_INFO_QUERY_KEY(conversationId),
    queryFn: () => gmailApi.getConversationInfo(conversationId, params),
    enabled: Boolean(conversationId) && (options.enabled ?? true),
    select: extractGmailEntity,
    ...options,
  })
}

export function useGmailMessages(conversationId, params, options = {}) {
  return useQuery({
    queryKey: GMAIL_CONVERSATION_MESSAGES_QUERY_KEY(conversationId, params),
    queryFn: () => gmailApi.getConversationMessages(conversationId, params),
    enabled: Boolean(conversationId) && (options.enabled ?? true),
    select: extractGmailMessages,
    ...options,
  })
}

export function useGmailCustomerConversation(customerId, params, options = {}) {
  return useQuery({
    queryKey: GMAIL_CUSTOMER_CONVERSATION_QUERY_KEY(customerId, params),
    queryFn: () => gmailApi.getCustomerConversation(customerId, params),
    enabled: Boolean(customerId) && (options.enabled ?? true),
    select: extractGmailEntity,
    ...options,
  })
}

export function useGmailLeadConversation(leadId, params, options = {}) {
  return useQuery({
    queryKey: GMAIL_LEAD_CONVERSATION_QUERY_KEY(leadId, params),
    queryFn: () => gmailApi.getLeadConversation(leadId, params),
    enabled: Boolean(leadId) && (options.enabled ?? true),
    select: extractGmailEntity,
    ...options,
  })
}

export function useGmailMailboxes(params, options = {}) {
  return useQuery({
    queryKey: GMAIL_MAILBOXES_QUERY_KEY(params),
    queryFn: () => gmailApi.getMyMailboxes(params),
    select: extractGmailMailboxes,
    ...options,
  })
}

export function useGmailBusinessEmails(params, options = {}) {
  return useQuery({
    queryKey: GMAIL_BUSINESS_EMAILS_QUERY_KEY(params),
    queryFn: () => gmailApi.getBusinessEmails(params),
    select: extractGmailBusinessEmails,
    ...options,
  })
}

export function useGmailBusinessEmailMutations() {
  const queryClient = useQueryClient()

  const invalidateBusinessEmails = () => {
    queryClient.invalidateQueries({ queryKey: ['gmail', 'business-emails'] })
    queryClient.invalidateQueries({ queryKey: ['gmail', 'mailboxes'] })
  }

  return {
    saveBusinessEmails: useMutation({
      mutationFn: (payload) => gmailApi.saveBusinessEmails(payload),
      onSuccess: invalidateBusinessEmails,
    }),
  }
}

export function useGmailConversationMutations(conversationId) {
  const queryClient = useQueryClient()

  const invalidateGmail = (targetConversationId = conversationId) => {
    queryClient.invalidateQueries({ queryKey: ['gmail'] })

    if (targetConversationId) {
      queryClient.invalidateQueries({ queryKey: GMAIL_CONVERSATION_INFO_QUERY_KEY(targetConversationId) })
      queryClient.invalidateQueries({ queryKey: GMAIL_CONVERSATION_MESSAGES_QUERY_KEY(targetConversationId) })
    }
  }

  return {
    sendMessage: useMutation({
      mutationFn: (payload) => gmailApi.sendMessage(payload),
      onSuccess: () => invalidateGmail(conversationId),
    }),
    linkCustomer: useMutation({
      mutationFn: ({ conversationId: targetConversationId = conversationId, customerId, customer_id }) => (
        gmailApi.linkCustomerToConversation(targetConversationId, {
          customer_id: customer_id || customerId,
        })
      ),
      onSuccess: (_data, variables = {}) => invalidateGmail(variables.conversationId || conversationId),
    }),
    closeConversation: useMutation({
      mutationFn: (targetConversationId = conversationId) => gmailApi.closeConversation(targetConversationId),
      onSuccess: (_data, targetConversationId = conversationId) => invalidateGmail(targetConversationId),
    }),
    reopenConversation: useMutation({
      mutationFn: (targetConversationId = conversationId) => gmailApi.reopenConversation(targetConversationId),
      onSuccess: (_data, targetConversationId = conversationId) => invalidateGmail(targetConversationId),
    }),
    refreshGoogleToken: useMutation({
      mutationFn: ({ tenant, mailboxId }) => gmailApi.refreshGoogleToken(tenant, mailboxId),
      onSuccess: () => invalidateGmail(conversationId),
    }),
    redirectToGoogleAuth: useMutation({
      mutationFn: (tenant) => gmailApi.redirectToGoogleAuth(tenant),
    }),
  }
}
