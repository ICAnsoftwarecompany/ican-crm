import httpClient from '../../../services/httpClient'

const GOOGLE_BASE_PATH = '/api/google'
const GMAIL_BASE_PATH = '/api/tenant/gmail'
const GMAIL_CONVERSATIONS_PATH = `${GMAIL_BASE_PATH}/conversations`

function appendGmailValue(formData, key, value, options = {}) {
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

function toGmailMessageFormData(payload = {}) {
  if (payload instanceof FormData) return payload

  const formData = new FormData()

  appendGmailValue(formData, 'mailbox_email', payload.mailbox_email || payload.mailboxEmail)
  appendGmailValue(formData, 'to_email', payload.to_email || payload.toEmail)
  appendGmailValue(formData, 'subject', payload.subject)
  appendGmailValue(formData, 'message', payload.message ?? payload.body ?? payload.text)

  const attachments = Array.isArray(payload.attachments)
    ? payload.attachments
    : payload.attachment
      ? [payload.attachment]
      : []

  attachments.forEach((attachment, index) => {
    appendGmailValue(formData, `attachments[${index}]`, attachment)
  })

  return formData
}

function toGmailLinkFormData(payload = {}) {
  if (payload instanceof FormData) return payload

  const formData = new FormData()
  appendGmailValue(formData, 'customer_id', payload.customer_id || payload.customerId)
  return formData
}

export const gmailApi = {
  redirectToGoogleAuth: async (tenant) => {
    const res = await httpClient.get(`${GOOGLE_BASE_PATH}/redirect/${tenant}`)
    return res.data
  },

  refreshGoogleToken: async (tenant, mailboxId) => {
    const res = await httpClient.post(`${GOOGLE_BASE_PATH}/${tenant}/${mailboxId}/refresh-token`)
    return res.data
  },

  sendMessage: async (payload) => {
    const res = await httpClient.post(`${GMAIL_BASE_PATH}/send/messages`, toGmailMessageFormData(payload))
    return res.data
  },

  getConversations: async (params) => {
    const res = await httpClient.get(GMAIL_CONVERSATIONS_PATH, { params })
    return res.data
  },

  getConversationInfo: async (conversationId, params) => {
    const res = await httpClient.get(`${GMAIL_CONVERSATIONS_PATH}/${conversationId}`, { params })
    return res.data
  },

  getConversationMessages: async (conversationId, params) => {
    const res = await httpClient.get(`${GMAIL_CONVERSATIONS_PATH}/${conversationId}/messages`, { params })
    return res.data
  },

  linkCustomerToConversation: async (conversationId, payload) => {
    const res = await httpClient.post(`${GMAIL_CONVERSATIONS_PATH}/${conversationId}/link`, toGmailLinkFormData(payload))
    return res.data
  },

  closeConversation: async (conversationId) => {
    const res = await httpClient.post(`${GMAIL_CONVERSATIONS_PATH}/${conversationId}/close`)
    return res.data
  },

  reopenConversation: async (conversationId) => {
    const res = await httpClient.post(`${GMAIL_CONVERSATIONS_PATH}/${conversationId}/reopen`)
    return res.data
  },

  getCustomerConversation: async (customerId, params) => {
    const res = await httpClient.get(`${GMAIL_BASE_PATH}/customers/${customerId}/conversation`, { params })
    return res.data
  },

  getLeadConversation: async (leadId, params) => {
    const res = await httpClient.get(`${GMAIL_BASE_PATH}/leads/${leadId}/conversation`, { params })
    return res.data
  },

  getMyMailboxes: async (params) => {
    const res = await httpClient.get(`${GMAIL_BASE_PATH}/my-mailboxes`, { params })
    return res.data
  },

  getBusinessEmails: async (params) => {
    const res = await httpClient.get(`${GMAIL_BASE_PATH}/business/emails`, { params })
    return res.data
  },

  saveBusinessEmails: async (payload) => {
    const res = await httpClient.post(`${GMAIL_BASE_PATH}/business/emails/save`, payload)
    return res.data
  },
}
