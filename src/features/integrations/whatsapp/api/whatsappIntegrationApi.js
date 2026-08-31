import httpClient from '../../../../services/httpClient'

const BASE_PATH = '/api/tenant/whatsapp'
const CONVERSATIONS_PATH = `${BASE_PATH}/conversations`

function appendFormValue(formData, key, value, options = {}) {
  if (value === undefined || value === null) return
  if (value === '' && !options.keepEmpty) return

  const isFile = typeof File !== 'undefined' && value instanceof File
  const isBlob = typeof Blob !== 'undefined' && value instanceof Blob

  if (isFile || isBlob) {
    formData.append(key, value)
    return
  }

  if (typeof value === 'boolean') {
    formData.append(key, value ? '1' : '0')
    return
  }

  if (typeof value === 'object' && !(value instanceof Date)) {
    formData.append(key, JSON.stringify(value))
    return
  }

  formData.append(key, value instanceof Date ? value.toISOString() : value)
}

function toWhatsappMessageFormData(payload = {}) {
  if (payload instanceof FormData) return payload

  const formData = new FormData()
  const files = Array.isArray(payload.files)
    ? payload.files
    : Array.isArray(payload.attachments)
      ? payload.attachments
      : payload.file
        ? [payload.file]
        : payload.attachment
          ? [payload.attachment]
          : []
  const hasFiles = files.length > 0

  appendFormValue(formData, 'phone_number_id', payload.phone_number_id || payload.phoneNumberId)
  appendFormValue(formData, 'to', payload.to || payload.phone || payload.phone_number)
  appendFormValue(formData, 'message', payload.message ?? payload.body ?? payload.text, { keepEmpty: hasFiles })
  appendFormValue(formData, 'reply_to_message_id', payload.reply_to_message_id || payload.replyToMessageId)

  files.forEach((file) => {
    appendFormValue(formData, 'files[]', file)
  })

  return formData
}

function toWhatsappLinkFormData(payload = {}) {
  if (payload instanceof FormData) return payload

  const formData = new FormData()
  appendFormValue(formData, 'customer_id', payload.customer_id || payload.customerId)
  return formData
}

function toWhatsappMediaFormData(payload = {}) {
  if (payload instanceof FormData) return payload

  const formData = new FormData()
  appendFormValue(formData, 'file', payload.file || payload.attachment || payload.media)
  return formData
}

export const whatsappIntegrationApi = {
  sendMessage: async (payload) => {
    const res = await httpClient.post(`${BASE_PATH}/send`, toWhatsappMessageFormData(payload))
    return res.data
  },

  sendTemplateMessage: async (payload) => {
    const res = await httpClient.post(`${BASE_PATH}/send`, payload)
    return res.data
  },

  getConversations: async (params) => {
    const res = await httpClient.get(CONVERSATIONS_PATH, { params })
    return res.data
  },

  getCustomerConversation: async (customerId, params) => {
    const res = await httpClient.get(`${BASE_PATH}/customers/${customerId}/conversation`, { params })
    return res.data
  },

  getLeadConversation: async (leadId, params) => {
    const res = await httpClient.get(`${BASE_PATH}/leads/${leadId}/conversation`, { params })
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

  closeConversation: async (conversationId) => {
    const res = await httpClient.post(`${CONVERSATIONS_PATH}/${conversationId}/close`)
    return res.data
  },

  reopenConversation: async (conversationId) => {
    const res = await httpClient.post(`${CONVERSATIONS_PATH}/${conversationId}/reopen`)
    return res.data
  },

  linkCustomerToConversation: async (conversationId, payload) => {
    const res = await httpClient.post(`${CONVERSATIONS_PATH}/${conversationId}/link`, toWhatsappLinkFormData(payload))
    return res.data
  },

  sendReaction: async (payload) => {
    const res = await httpClient.post(`${BASE_PATH}/reaction`, payload)
    return res.data
  },

  getTemplates: async (params) => {
    const res = await httpClient.get(`${BASE_PATH}/templats`, { params })
    return res.data
  },

  createTemplate: async (integrationId, payload) => {
    const res = await httpClient.post(`${BASE_PATH}/create/templat/${integrationId}`, payload)
    return res.data
  },

  updateTemplate: async (integrationId, payload) => {
    const res = await httpClient.put(`${BASE_PATH}/create/templat/${integrationId}`, payload)
    return res.data
  },

  uploadTemplateMedia: async (integrationId, payload) => {
    const res = await httpClient.post(
      `${BASE_PATH}/${integrationId}/templates/upload-media`,
      toWhatsappMediaFormData(payload)
    )
    return res.data
  },

  syncTemplateStatus: async (templateId) => {
    const res = await httpClient.post(`${BASE_PATH}/templat/${templateId}/sync-status`)
    return res.data
  },

  toggleTemplateActive: async (templateId, payload) => {
    const res = await httpClient.patch(`${BASE_PATH}/templat/${templateId}/toggle-active`, payload)
    return res.data
  },

  deleteTemplate: async (templateId) => {
    const res = await httpClient.delete(`${BASE_PATH}/templat/${templateId}`)
    return res.data
  },
}
