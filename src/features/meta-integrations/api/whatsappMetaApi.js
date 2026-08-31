import httpClient from '../../../services/httpClient'

export const whatsappMetaApi = {
  getMyChats: async (tenant, params) => {
    const res = await httpClient.get(`/my/conversations/${tenant}`, { params })
    return res.data
  },

  getConversationMessages: async (tenant, conversationId, params) => {
    const res = await httpClient.get(`/api/whatsapp/conversations/${tenant}/${conversationId}`, { params })
    return res.data
  },

  sendConversationMessage: async (tenant, conversationId, payload) => {
    const res = await httpClient.get(`/api/whatsapp/conversations/${tenant}/${conversationId}/send`, {
      params: payload,
    })
    return res.data
  },

  sendMessage: async (tenant, payload) => {
    const res = await httpClient.post(`/api/whatsapp/send/${tenant}`, payload)
    return res.data
  },

  getTemplates: async (tenant, params) => {
    const res = await httpClient.get(`/api/whatsapp/templates/${tenant}`, { params })
    return res.data
  },

  createTemplate: async (tenant, payload) => {
    const res = await httpClient.post(`/api/whatsapp/template/create/${tenant}`, payload)
    return res.data
  },
}
