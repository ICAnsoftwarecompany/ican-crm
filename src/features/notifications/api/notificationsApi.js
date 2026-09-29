import httpClient from '../../../services/httpClient'

const BASE_PATH = '/api/tenant/notifications/center'

export const notificationsApi = {
  getUnread: async () => {
    const response = await httpClient.get(`${BASE_PATH}/unread`)
    return response.data
  },
  getHistory: async () => {
    const response = await httpClient.get(`${BASE_PATH}/history`)
    return response.data
  },
  markRead: async (notificationId) => {
    const response = await httpClient.get(`${BASE_PATH}/read/${notificationId}`)
    return response.data
  },
  markManyRead: async (ids) => {
    const response = await httpClient.post(`${BASE_PATH}/read/many`, { ids })
    return response.data
  },
}
