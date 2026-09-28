import { gmailApi } from '../../api/gmailApi'
import {
  GMAIL_BUSINESS_EMAILS_QUERY_KEY,
  GMAIL_CONVERSATIONS_QUERY_KEY,
  GMAIL_CONVERSATION_INFO_QUERY_KEY,
  GMAIL_CONVERSATION_MESSAGES_QUERY_KEY,
  GMAIL_CUSTOMER_CONVERSATION_QUERY_KEY,
  GMAIL_LEAD_CONVERSATION_QUERY_KEY,
  GMAIL_MAILBOXES_QUERY_KEY,
  extractGmailConversations,
  extractGmailEntity,
  extractGmailMessages,
  filterGmailConversations,
  getGmailConversationId,
  getGmailConversationSubtitle,
  getGmailConversationTitle,
  getGmailParticipantEmail,
  normalizeGmailMessage,
  sortGmailMessagesAscending,
} from '../../utils/gmailConversations'
import { buildConversation } from '../conversationFields'
import { resolveGmailConversationId, resolveGmailMessage } from './realtimeEvents'

const CHANNEL = 'gmail'

function normalizeMessage(message = {}, conversationInfo = {}, conversationId = '') {
  return {
    ...normalizeGmailMessage(message, conversationInfo),
    channel: CHANNEL,
    conversationId: String(conversationId || message?.conversation_id || getGmailConversationId(conversationInfo) || ''),
    subject: message?.subject || '',
    source: message,
  }
}

// gmailConversations.js has no message-id getter; reuse the id normalizeGmailMessage computes.
function getMessageId(message = {}) {
  return normalizeGmailMessage(message).id
}

function normalizeConversation(conversation = {}) {
  const id = getGmailConversationId(conversation)

  return buildConversation(CHANNEL, conversation, {
    id,
    title: getGmailConversationTitle(conversation),
    subtitle: getGmailConversationSubtitle(conversation),
    contact: {
      id: String(conversation?.customer?.id || conversation?.lead?.id || ''),
      name: conversation?.participant_name || conversation?.customer?.name || conversation?.lead?.name || '',
      phone: conversation?.customer?.phone || '',
      email: getGmailParticipantEmail(conversation),
      avatarUrl: '',
      raw: conversation?.customer || conversation?.lead || null,
    },
    lastMessage: conversation?.last_message ? normalizeMessage(conversation.last_message, conversation, id) : null,
  })
}

export const gmailAdapter = {
  channel: CHANNEL,

  capabilities: {
    attachments: true,
    reactions: false,
    removeReactions: false,
    replies: false,
    templates: false,
    emailSubject: true,
    mailboxes: true,
    linkCustomer: true,
    closeReopen: true,
    assign: false,
    messagingWindowHours: null,
  },

  queryKeys: {
    workspace: {
      all: () => ['gmail'],
      conversations: GMAIL_CONVERSATIONS_QUERY_KEY,
      conversationInfo: GMAIL_CONVERSATION_INFO_QUERY_KEY,
      conversationMessages: GMAIL_CONVERSATION_MESSAGES_QUERY_KEY,
      customerConversation: GMAIL_CUSTOMER_CONVERSATION_QUERY_KEY,
      leadConversation: GMAIL_LEAD_CONVERSATION_QUERY_KEY,
      mailboxes: GMAIL_MAILBOXES_QUERY_KEY,
      businessEmails: GMAIL_BUSINESS_EMAILS_QUERY_KEY,
    },
    // No floating Gmail chat: the drawer "mail" chat is a local draft (plan F4).
    floating: {},
  },

  api: gmailApi,

  getConversationId: getGmailConversationId,
  getMessageId,
  extractConversations: extractGmailConversations,
  extractMessages: extractGmailMessages,
  extractEntity: extractGmailEntity,
  filterConversations: filterGmailConversations,
  normalizeConversation,
  normalizeMessage,

  normalizeMessages(messages = [], conversationInfo = {}, conversationId = '') {
    return sortGmailMessagesAscending(messages.map((message) => normalizeMessage(message, conversationInfo, conversationId)))
  },

  normalizeRealtimeEvent(payload = {}, eventName = '', { fallbackConversationId = '' } = {}) {
    return {
      channel: CHANNEL,
      eventName,
      conversationId: resolveGmailConversationId(payload, fallbackConversationId),
      message: resolveGmailMessage(payload),
      conversation: payload.conversation || null,
    }
  },
}
