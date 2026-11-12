import httpClient from '../../../../services/httpClient'

// Live tenant endpoints from the supplied Postman collection. The shared HTTP
// client supplies authentication and api_password; never hardcode credentials.
const root = '/api/tenant/service'
const data = (response) => response.data?.data ?? response.data
export const assignmentApi = {
  rules: {
    list: async () => data(await httpClient.get(`${root}/assignment-rules`)),
    create: async (payload) => data(await httpClient.post(`${root}/assignment-rules`, payload)),
    update: async (id, payload) => data(await httpClient.post(`${root}/assignment-rules/${encodeURIComponent(id)}`, payload)),
    remove: async (id) => data(await httpClient.delete(`${root}/assignment-rules/${encodeURIComponent(id)}`)),
  },
  distribution: {
    list: async () => data(await httpClient.get(`${root}/distribution-settings`)),
    create: async (payload) => data(await httpClient.post(`${root}/distribution-settings`, payload)),
    remove: async (id) => data(await httpClient.delete(`${root}/distribution-settings/${encodeURIComponent(id)}`)),
  },
  owners: {
    list: async (customerId) => data(await httpClient.get(`${root}/customers/${encodeURIComponent(customerId)}/owners`)),
    create: async (payload) => data(await httpClient.post(`${root}/account-owners`, payload)),
    remove: async (payload) => data(await httpClient.delete(`${root}/account-owners`, { data: payload })),
  },
  assign: async (payload) => data(await httpClient.post(`${root}/assign`, payload)),
  logs: async () => data(await httpClient.get(`${root}/assignments/log`)),
}
