import { WHATSAPP_INTEGRATION_QUERY_KEYS, whatsappIntegrationApi } from '../../../integrations/whatsapp'
import {
  WHATSAPP_CONVERSATIONS_QUERY_KEY,
  WHATSAPP_CONVERSATION_INFO_QUERY_KEY,
  WHATSAPP_CONVERSATION_MESSAGES_QUERY_KEY,
  extractWhatsappEntity,
  extractWhatsappList,
  filterWhatsappConversations,
  getWhatsappContactId,
  getWhatsappConversationId,
  getWhatsappConversationSubtitle,
  getWhatsappConversationTitle,
  getWhatsappMessageId,
  normalizeWhatsappMessage,
  sortWhatsappMessagesAscending,
} from '../../utils/whatsappConversations'
import { buildConversation } from '../conversationFields'
import {
  isNewIncomingWhatsappMessage,
  resolveWhatsappConversation,
  resolveWhatsappConversationId,
  resolveWhatsappMessage,
} from './realtimeEvents'

const CHANNEL = 'whatsapp'

function normalizeMessage(message = {}, conversationInfo = {}, conversationId = '') {
  return {
    ...normalizeWhatsappMessage(message, conversationInfo),
    channel: CHANNEL,
    conversationId: String(conversationId || message?.conversation_id || getWhatsappConversationId(conversationInfo) || ''),
    source: message,
  }
}

function normalizeConversation(conversation = {}) {
  const id = getWhatsappConversationId(conversation)
  const contact = conversation?.contact || null

  return buildConversation(CHANNEL, conversation, {
    id,
    title: getWhatsappConversationTitle(conversation),
    subtitle: getWhatsappConversationSubtitle(conversation),
    contact: {
      id: String(getWhatsappContactId(conversation) || ''),
      name: getWhatsappConversationTitle(conversation),
      phone: contact?.phone || conversation?.customer?.phone || conversation?.lead?.phone || conversation?.phone || conversation?.to || '',
      email: contact?.email || conversation?.customer?.email || '',
      avatarUrl: contact?.profile_picture || '',
      raw: contact,
    },
    lastMessage: conversation?.last_message ? normalizeMessage(conversation.last_message, conversation, id) : null,
  })
}

export const whatsappAdapter = {
  channel: CHANNEL,

  capabilities: {
    attachments: true,
    reactions: true,
    removeReactions: false,
    replies: true,
    templates: true,
    emailSubject: false,
    mailboxes: false,
    linkCustomer: true,
    closeReopen: true,
    assign: false,
    messagingWindowHours: 24,
  },

  queryKeys: {
    workspace: {
      all: () => WHATSAPP_INTEGRATION_QUERY_KEYS.all,
      conversations: WHATSAPP_CONVERSATIONS_QUERY_KEY,
      conversationInfo: WHATSAPP_CONVERSATION_INFO_QUERY_KEY,
      conversationMessages: WHATSAPP_CONVERSATION_MESSAGES_QUERY_KEY,
    },
    // Customer drawer floating chat (separate cache namespace, see plan F2).
    floating: {
      conversationLookup: (lookupMode, lookupId) => ['whatsapp-chat', lookupMode, lookupId, 'conversation'],
      conversationInfo: (conversationId) => ['whatsapp-chat', 'conversation-info', conversationId],
      conversationMessages: (conversationId) => ['whatsapp-chat', 'conversation-messages', conversationId],
    },
  },

  api: whatsappIntegrationApi,

  getConversationId: getWhatsappConversationId,
  getMessageId: getWhatsappMessageId,
  extractConversations: extractWhatsappList,
  extractMessages: extractWhatsappList,
  extractEntity: extractWhatsappEntity,
  filterConversations: filterWhatsappConversations,
  normalizeConversation,
  normalizeMessage,

  normalizeMessages(messages = [], conversationInfo = {}, conversationId = '') {
    return sortWhatsappMessagesAscending(messages.map((message) => normalizeMessage(message, conversationInfo, conversationId)))
  },

  normalizeRealtimeEvent(payload = {}, eventName = '', { fallbackConversationId = '' } = {}) {
    const message = resolveWhatsappMessage(payload)
    return {
      channel: CHANNEL,
      eventName,
      conversationId: resolveWhatsappConversationId(payload, fallbackConversationId),
      message,
      conversation: resolveWhatsappConversation(payload),
      isNewIncomingMessage: message ? isNewIncomingWhatsappMessage(message, eventName) : false,
    }
  },
}
