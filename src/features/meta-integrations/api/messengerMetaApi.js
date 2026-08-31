// import httpClient from '../../../services/httpClient'

// const BASE_PATH = '/api/tenant/meta/messenger/conversations'

// export const messengerMetaApi = {
//   sendTestMessage: async (payload) => {
//     const res = await httpClient.post('/api/messenger/test-send', payload)
//     return res.data
//   },

//   getConversations: async (params) => {
//     const res = await httpClient.get(BASE_PATH, { params })
//     return res.data
//   },
  

//   getConversationInfo: async (conversationId, params) => {
//     const res = await httpClient.get(`${BASE_PATH}/${conversationId}`, { params })
//     return res.data
//   },

//   getConversationMessages: async (conversationId, params) => {
//     const res = await httpClient.get(`${BASE_PATH}/${conversationId}/messages`, { params })
//     return res.data
//   },

//   sendMessage: async (conversationId, payload) => {
//     const res = await httpClient.post(`${BASE_PATH}/${conversationId}/messages`, payload)
//     return res.data
//   },

//   assignUser: async (conversationId, payload) => {
//     const res = await httpClient.post(`${BASE_PATH}/${conversationId}/assign`, payload)
//     return res.data
//   },

//   closeConversation: async (conversationId) => {
//     const res = await httpClient.post(`${BASE_PATH}/${conversationId}/close`)
//     return res.data
//   },

//   reopenConversation: async (conversationId) => {
//     const res = await httpClient.post(`${BASE_PATH}/${conversationId}/reopen`)
//     return res.data
//   },
// }
