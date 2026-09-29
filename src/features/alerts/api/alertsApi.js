import httpClient from '../../../services/httpClient'

const BASE_PATH = '/api/tenant/alerts'

export const alertsApi = {
  getActive: async () => (await httpClient.get(BASE_PATH)).data,
  acknowledge: async (alertId) => (await httpClient.post(`${BASE_PATH}/${alertId}/acknowledge`)).data,
}
