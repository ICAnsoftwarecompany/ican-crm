// FROZEN verbatim copies of the per-channel sort/upsert/filter implementations as
// they were before Phase 4b delegated them to utils/conversationHelpers.js.
// Tests compare the helpers AND the rewired functions against these, so the
// equivalence check does not become circular. Do not edit.

import { DEFAULT_MESSENGER_CONVERSATION_FILTERS } from '../../components/MessengerConversationFilters'
import { getMessengerMessageId } from '../messengerConversations'
import {
  getWhatsappConversationContact,
  getWhatsappConversationSubtitle,
  getWhatsappConversationTitle,
  getWhatsappMessageId,
} from '../whatsappConversations'

function normalizeText(value = '') {
  return String(value || '').trim().toLowerCase()
}

export function referenceSortWhatsappMessagesAscending(messages = []) {
  return [...messages].sort((first, second) => {
    const firstTime = new Date(first.createdAt || first.raw?.sent_at || first.raw?.created_at).getTime()
    const secondTime = new Date(second.createdAt || second.raw?.sent_at || second.raw?.created_at).getTime()
    return (Number.isNaN(firstTime) ? 0 : firstTime) - (Number.isNaN(secondTime) ? 0 : secondTime)
  })
}

export function referenceUpsertWhatsappMessage(messages = [], message) {
  const messageId = getWhatsappMessageId(message)
  const exists = messages.some((item) => String(getWhatsappMessageId(item)) === String(messageId))
  if (exists) {
    return messages.map((item) => (
      String(getWhatsappMessageId(item)) === String(messageId) ? { ...item, ...message } : item
    ))
  }
  return [...messages, message]
}

export function referenceFilterWhatsappConversations(conversations = [], query = '', filters = {}) {
  const normalizedQuery = normalizeText(query)

  return conversations.filter((conversation) => {
    if (filters.unreadOnly && Number(conversation.unread_count || 0) <= 0) return false
    if (filters.unlinkedOnly && (conversation.customer || conversation.customer_id || conversation.customerId)) return false
    if (filters.closedOnly && normalizeText(conversation.status) !== 'closed') return false

    if (filters.assignedUserId && filters.assignedUserId !== 'all') {
      const assignedId = String(conversation.assigned_user?.id || conversation.assigned_user_id || '')
      const assignedName = String(conversation.assigned_user?.name || '')
      if (filters.assignedUserId !== assignedId && filters.assignedUserId !== assignedName) return false
    }

    if (!normalizedQuery) return true

    const haystack = [
      getWhatsappConversationTitle(conversation),
      getWhatsappConversationContact(conversation),
      getWhatsappConversationSubtitle(conversation),
      conversation.assigned_user?.name,
    ].filter(Boolean).join(' ').toLowerCase()

    return haystack.includes(normalizedQuery)
  })
}

export function referenceSortMessengerMessagesAscending(messages) {
  return [...messages].sort((first, second) => {
    const firstTime = new Date(first.createdAt || first.raw?.sent_at || first.raw?.created_at).getTime()
    const secondTime = new Date(second.createdAt || second.raw?.sent_at || second.raw?.created_at).getTime()
    return (Number.isNaN(firstTime) ? 0 : firstTime) - (Number.isNaN(secondTime) ? 0 : secondTime)
  })
}

export function referenceUpsertMessengerMessage(messages = [], message) {
  const messageId = getMessengerMessageId(message)
  const exists = messages.some((item) => String(getMessengerMessageId(item)) === String(messageId))

  if (exists) {
    return messages.map((item) => (
      String(getMessengerMessageId(item)) === String(messageId) ? { ...item, ...message } : item
    ))
  }

  return [...messages, message]
}

export function referenceSortGmailMessagesAscending(messages = []) {
  return [...messages].sort((first, second) => {
    const firstTime = new Date(first.createdAt || first.raw?.received_at || first.raw?.created_at).getTime()
    const secondTime = new Date(second.createdAt || second.raw?.received_at || second.raw?.created_at).getTime()
    return (Number.isNaN(firstTime) ? 0 : firstTime) - (Number.isNaN(secondTime) ? 0 : secondTime)
  })
}

export function referenceFilterGmailConversations(conversations = [], query = '', filters = {}) {
  const normalizedQuery = String(query || '').trim().toLowerCase()

  return conversations.filter((conversation) => {
    if (filters.unreadOnly && Number(conversation.unread_count || 0) <= 0) return false
    if (filters.unlinkedOnly && (conversation.customer || conversation.customer_id || conversation.customerId)) return false
    if (filters.closedOnly && String(conversation.status || '').toLowerCase() !== 'closed') return false

    if (filters.assignedUserId && filters.assignedUserId !== 'all') {
      const assignedId = String(conversation.assigned_user?.id || conversation.assigned_user_id || '')
      const assignedName = String(conversation.assigned_user?.name || '')
      if (filters.assignedUserId !== assignedId && filters.assignedUserId !== assignedName) return false
    }

    if (!normalizedQuery) return true

    const haystack = [
      conversation.subject,
      conversation.mailbox_email,
      conversation.participant_email,
      conversation.participant_name,
      conversation.customer?.name,
      conversation.customer?.email,
      conversation.assigned_user?.name,
      conversation.last_message?.snippet,
    ].filter(Boolean).join(' ').toLowerCase()

    return haystack.includes(normalizedQuery)
  })
}

function normalizeSearch(value = '') {
  return String(value || '').trim().toLowerCase()
}

function getAssignedUserId(conversation = {}) {
  return String(
    conversation.assigned_user?.id ||
    conversation.assignedUser?.id ||
    conversation.assigned_user_id ||
    ''
  )
}

function getAssignedUserName(conversation = {}) {
  return (
    conversation.assigned_user?.name ||
    conversation.assignedUser?.name ||
    conversation.assigned_user_name ||
    ''
  )
}

function isConversationClosed(conversation = {}) {
  return String(conversation.status || '').toLowerCase() === 'closed'
}

function hasLinkedCustomer(conversation = {}) {
  return Boolean(conversation.customer || conversation.customer_id || conversation.customerId)
}

export function referenceFilterMessengerConversations(conversations = [], query = '', filters = DEFAULT_MESSENGER_CONVERSATION_FILTERS) {
  const normalizedQuery = normalizeSearch(query)

  return conversations.filter((conversation) => {
    if (filters.unreadOnly && Number(conversation.unread_count || 0) <= 0) return false
    if (filters.unlinkedOnly && hasLinkedCustomer(conversation)) return false
    if (filters.closedOnly && !isConversationClosed(conversation)) return false

    if (filters.assignedUserId && filters.assignedUserId !== 'all') {
      const assignedId = getAssignedUserId(conversation)
      const assignedName = getAssignedUserName(conversation)
      if (filters.assignedUserId !== assignedId && filters.assignedUserId !== assignedName) return false
    }

    if (!normalizedQuery) return true

    const title = normalizeSearch(
      conversation.contact?.name ||
      conversation.customer?.name ||
      conversation.name ||
      conversation.contact?.phone ||
      conversation.customer?.phone
    )
    const subtitle = normalizeSearch(
      conversation.last_message?.body ||
      conversation.last_message?.text ||
      conversation.contact?.email ||
      conversation.customer?.email ||
      conversation.assigned_user?.name
    )

    return title.includes(normalizedQuery) || subtitle.includes(normalizedQuery)
  })
}
