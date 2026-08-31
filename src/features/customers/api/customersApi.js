import httpClient from '../../../services/httpClient'

export const customersApi = {
  createCustomers: async (payload) => {
    const res = await httpClient.post('/api/tenant/customers/create', payload)
    console.log('[customersApi] createCustomers response:', res.data)
    return res.data
  },

  updateCustomer: async (id, payload) => {
    const res = await httpClient.post(`/api/tenant/customers/update/${id}`, payload)
    console.log('[customersApi] updateCustomer response:', res.data)
    return res.data
  },

  getCustomerInfo: async (id, params) => {
    const res = await httpClient.get(`/api/tenant/customers/info/${id}`, { params })
    console.log('[customersApi] getCustomerInfo response:', res.data)
    return res.data
  },

  getCustomers: async (params) => {
    const res = await httpClient.get('/api/tenant/customers/data', { params })
    console.log('[customersApi] getCustomers raw response:', res.data)
    return res.data
  },

  deleteCustomers: async (payload) => {
    const res = await httpClient.post('/api/tenant/customers/delete', payload)
    console.log('[customersApi] deleteCustomers response:', res.data)
    return res.data
  },

  getDeletedCustomers: async (params) => {
    const res = await httpClient.get('/api/tenant/customers/deleted/data', { params })
    console.log('[customersApi] getDeletedCustomers raw response:', res.data)
    return res.data
  },

  restoreDeletedCustomers: async (payload) => {
    const res = await httpClient.post('/api/tenant/customers/restore/deleted', payload)
    console.log('[customersApi] restoreDeletedCustomers response:', res.data)
    return res.data
  },

  forceDeleteCustomers: async (payload) => {
    const res = await httpClient.post('/api/tenant/customers/force/delete', payload)
    console.log('[customersApi] forceDeleteCustomers response:', res.data)
    return res.data
  },
}
