import httpClient from '../../../services/httpClient'

const BASE_PATH = '/api/tenant/meta/messenger'
const CONVERSATIONS_PATH = `${BASE_PATH}/conversations`

function appendMessengerValue(formData, key, value, options = {}) {
  if (value === undefined || value === null) return
  if (value === '' && !options.keepEmpty) return

  const isFile = typeof File !== 'undefined' && value instanceof File
  const isBlob = typeof Blob !== 'undefined' && value instanceof Blob

  if (isFile || isBlob) {
    formData.append(key, value)
    return
  }

  formData.append(key, value)
}

function toMessengerMessageFormData(payload = {}) {
  if (payload instanceof FormData) return payload

  const formData = new FormData()
  const message = payload.message ?? payload.messege ?? payload.text
  const hasAttachment = Boolean(payload.attachment)

  if (import.meta.env.DEV && hasAttachment) {
    console.info('[messengerApi] sending attachment', {
      name: payload.attachment?.name,
      type: payload.attachment?.type,
      size: payload.attachment?.size,
    })
  }

  appendMessengerValue(formData, 'message', hasAttachment ? (message ?? '') : message, { keepEmpty: hasAttachment })
  appendMessengerValue(formData, 'messege', hasAttachment ? (message ?? '') : message, { keepEmpty: hasAttachment })
  appendMessengerValue(formData, 'attachment', payload.attachment)
  appendMessengerValue(formData, 'reply_to_message_id', payload.reply_to_message_id)

  return formData
}

export const messengerApi = {
  sendTestMessage: async (payload) => {
    const res = await httpClient.post('/api/messenger/test-send', payload)
    return res.data
  },

  getConversations: async (params) => {
    const res = await httpClient.get(CONVERSATIONS_PATH, { params })
    return res.data
  },

  getConversationInfo: async (conversationId, params) => {
    const res = await httpClient.get(`${CONVERSATIONS_PATH}/${conversationId}`, { params })
    return res.data
  },

  getConversationMessages: async (conversationId, params) => {
    const res = await httpClient.get(`${CONVERSATIONS_PATH}/${conversationId}/messages`, { params })
    return res.data
  },

  getLeadConversation: async (leadId, params) => {
    const res = await httpClient.get(`${BASE_PATH}/leads/${leadId}/conversation`, { params })
    return res.data
  },

  getCustomerConversation: async (customerId, params) => {
    const res = await httpClient.get(`${BASE_PATH}/customers/${customerId}/conversation`, { params })
    return res.data
  },

  sendMessage: async (conversationId, payload) => {
    const res = await httpClient.post(`${CONVERSATIONS_PATH}/${conversationId}/messages`, toMessengerMessageFormData(payload))
    return res.data
  },

  sendConversationMessage: async (conversationId, payload) => {
    const res = await httpClient.post(`${CONVERSATIONS_PATH}/${conversationId}/messages`, toMessengerMessageFormData(payload))
    return res.data
  },

  reactToMessage: async (conversationId, messageId, payload) => {
    const res = await httpClient.post(`${CONVERSATIONS_PATH}/${conversationId}/messages/${messageId}/reaction`, payload)
    return res.data
  },

  deleteReaction: async (conversationId, messageId) => {
    const res = await httpClient.delete(`${CONVERSATIONS_PATH}/${conversationId}/messages/${messageId}/reaction`)
    return res.data
  },

  removeReaction: async (conversationId, messageId) => messengerApi.deleteReaction(conversationId, messageId),

  assignUser: async (conversationId, payload) => {
    const res = await httpClient.post(`${CONVERSATIONS_PATH}/${conversationId}/assign`, payload)
    return res.data
  },

  closeConversation: async (conversationId) => {
    const res = await httpClient.post(`${CONVERSATIONS_PATH}/${conversationId}/close`)
    return res.data
  },

  reopenConversation: async (conversationId) => {
    const res = await httpClient.post(`${CONVERSATIONS_PATH}/${conversationId}/reopen`)
    return res.data
  },

  linkCustomerToChat: async (contactId, payload) => {
    const res = await httpClient.post(`${BASE_PATH}/contacts/${contactId}/link`, payload)
    return res.data
  },

  linkContactToCustomer: async (contactId, payload) => {
    const res = await httpClient.post(`${BASE_PATH}/contacts/${contactId}/link`, payload)
    return res.data
  },
}
