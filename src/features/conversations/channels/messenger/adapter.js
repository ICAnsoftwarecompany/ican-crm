import { messengerApi } from '../../api/messengerApi'
import { filterMessengerConversations } from '../../components/MessengerConversationFilters'
import {
  MESSENGER_CONVERSATIONS_QUERY_KEY,
  MESSENGER_CONVERSATION_INFO_QUERY_KEY,
  MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY,
  extractMessengerConversations,
  extractMessengerMessages,
  getMessengerContactId,
  getMessengerConversationId,
  getMessengerConversationSubtitle,
  getMessengerConversationTitle,
  getMessengerMessageId,
  getMessengerProfilePicture,
  getMessengerRealtimeConversation,
  getMessengerRealtimeConversationId,
  getMessengerRealtimeMessage,
  getMessengerRealtimeMessagePatch,
  getMessengerRealtimeReaction,
  getMessengerRealtimeReactionMessageId,
  isMessengerReactionRemovalEvent,
  normalizeMessengerMessage,
  sortMessagesAscending,
} from '../../utils/messengerConversations'
import { buildConversation } from '../conversationFields'

const CHANNEL = 'messenger'

function extractEntity(response) {
  return response?.data?.data || response?.data || response || null
}

function normalizeMessage(message = {}, conversationInfo = {}, conversationId = '') {
  return {
    ...normalizeMessengerMessage(message, conversationInfo),
    channel: CHANNEL,
    conversationId: String(conversationId || message?.conversation_id || getMessengerConversationId(conversationInfo) || ''),
    source: message,
  }
}

function normalizeConversation(conversation = {}) {
  const id = getMessengerConversationId(conversation)
  const contact = conversation?.contact || null

  return buildConversation(CHANNEL, conversation, {
    id,
    title: getMessengerConversationTitle(conversation),
    subtitle: getMessengerConversationSubtitle(conversation),
    contact: {
      id: String(getMessengerContactId(conversation) || ''),
      name: getMessengerConversationTitle(conversation),
      phone: contact?.phone || conversation?.customer?.phone || conversation?.phone || '',
      email: contact?.email || conversation?.customer?.email || '',
      avatarUrl: getMessengerProfilePicture(conversation),
      raw: contact,
    },
    lastMessage: conversation?.last_message ? normalizeMessage(conversation.last_message, conversation, id) : null,
  })
}

export const messengerAdapter = {
  channel: CHANNEL,

  capabilities: {
    attachments: true,
    reactions: true,
    removeReactions: true,
    replies: true,
    templates: false,
    emailSubject: false,
    mailboxes: false,
    linkCustomer: true,
    closeReopen: true,
    // messengerApi.assignUser exists but no UI calls it today.
    assign: false,
    messagingWindowHours: 24,
  },

  queryKeys: {
    workspace: {
      // Legacy constant is an array, exposed through a function for a uniform interface.
      conversations: () => MESSENGER_CONVERSATIONS_QUERY_KEY,
      conversationInfo: MESSENGER_CONVERSATION_INFO_QUERY_KEY,
      conversationMessages: MESSENGER_CONVERSATION_MESSAGES_QUERY_KEY,
    },
    // Customer drawer floating chat (separate cache namespace, see plan F2).
    floating: {
      leadConversation: (leadId) => ['messenger-chat', 'lead-conversation', leadId],
      conversationInfo: (conversationId) => ['messenger-chat', 'conversation-info', conversationId],
      conversationMessages: (conversationId) => ['messenger-chat', 'conversation-messages', conversationId],
    },
  },

  api: messengerApi,

  getConversationId: getMessengerConversationId,
  getMessageId: getMessengerMessageId,
  extractConversations: extractMessengerConversations,
  extractMessages: extractMessengerMessages,
  extractEntity,
  filterConversations: filterMessengerConversations,
  normalizeConversation,
  normalizeMessage,

  normalizeMessages(messages = [], conversationInfo = {}, conversationId = '') {
    return sortMessagesAscending(messages.map((message) => normalizeMessage(message, conversationInfo, conversationId)))
  },

  normalizeRealtimeEvent(payload = {}, eventName = '', { fallbackConversationId = '' } = {}) {
    return {
      channel: CHANNEL,
      eventName,
      conversationId: getMessengerRealtimeConversationId(payload) || fallbackConversationId || '',
      message: getMessengerRealtimeMessage(payload),
      conversation: getMessengerRealtimeConversation(payload),
      reaction: getMessengerRealtimeReaction(payload),
      reactionMessageId: getMessengerRealtimeReactionMessageId(payload),
      isReactionRemoval: isMessengerReactionRemovalEvent(eventName, payload),
      messagePatch: getMessengerRealtimeMessagePatch(payload),
    }
  },
}
