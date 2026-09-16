import httpClient from '../../../services/httpClient'

const CHAT_BASE = '/api/tenant/chat'

export const internalChatApi = {
  getConversations: async (params = {}) => {
    const res = await httpClient.get(CHAT_BASE, { params })
    return res.data
  },

  createConversation: async (payload) => {
    const res = await httpClient.post(CHAT_BASE, payload)
    return res.data
  },

  getMessages: async (conversationId, params = {}) => {
    const res = await httpClient.get(`${CHAT_BASE}/${conversationId}/messages`, { params })
    return res.data
  },

  markAsRead: async (conversationId) => {
    const res = await httpClient.post(`${CHAT_BASE}/${conversationId}/read`)
    return res.data
  },

  addMembers: async (conversationId, userIds = []) => {
    const res = await httpClient.post(`${CHAT_BASE}/${conversationId}/members`, { user_ids: userIds })
    return res.data
  },

  removeMember: async (conversationId, userId) => {
    const res = await httpClient.delete(`${CHAT_BASE}/${conversationId}/members/${userId}`)
    return res.data
  },

  updateMemberRole: async (conversationId, userId, role) => {
    const res = await httpClient.patch(`${CHAT_BASE}/${conversationId}/members/${userId}/role`, { role })
    return res.data
  },

  muteConversation: async (conversationId, until) => {
    const res = await httpClient.post(`${CHAT_BASE}/${conversationId}/mute`, { until })
    return res.data
  },

  unmuteConversation: async (conversationId) => {
    const res = await httpClient.post(`${CHAT_BASE}/${conversationId}/unmute`)
    return res.data
  },

  sendMessage: async (conversationId, payload = {}) => {
    const formData = new FormData()
    if (payload.body) formData.append('body', payload.body)
    if (payload.reply_to_message_id) formData.append('reply_to_message_id', String(payload.reply_to_message_id))

    const attachments = Array.isArray(payload.attachments) ? payload.attachments : []
    attachments.forEach((file) => {
      if (file) formData.append('attachments[]', file)
    })

    const res = await httpClient.post(`${CHAT_BASE}/send/messages/${conversationId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  // Future-compatible placeholders. These endpoints may not be available yet.
  editMessage: async (messageId, body) => {
    const res = await httpClient.patch(`${CHAT_BASE}/messages/${messageId}`, { body })
    return res.data
  },

  deleteMessage: async (messageId) => {
    const res = await httpClient.delete(`${CHAT_BASE}/messages/${messageId}`)
    return res.data
  },

  reactToMessage: async (messageId, emoji) => {
    const res = await httpClient.post(`${CHAT_BASE}/messages/${messageId}/reactions`, { emoji })
    return res.data
  },

  removeReaction: async (messageId, emoji) => {
    const res = await httpClient.delete(`${CHAT_BASE}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`)
    return res.data
  },
}
