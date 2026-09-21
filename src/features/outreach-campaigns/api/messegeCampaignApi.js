import httpClient from '../../../services/httpClient'

const BASE_PATH = '/api/tenant/campaigns'

export const messegeCampaignApi = {
  createCampaign: async (payload) => {
    const res = await httpClient.post(`${BASE_PATH}/create`, payload)
    return res.data
  },

  updateCampaign: async (campaignId, payload) => {
    const res = await httpClient.post(`${BASE_PATH}/${campaignId}/edite`, payload)
    return res.data
  },

  getCampaigns: async (params) => {
    const res = await httpClient.get(BASE_PATH, { params })
    return res.data
  },

  getCampaignInfo: async (campaignId, params) => {
    const res = await httpClient.get(`${BASE_PATH}/show/${campaignId}`, { params })
    return res.data
  },

  deleteCampaign: async (campaignId) => {
    const res = await httpClient.get(`${BASE_PATH}/${campaignId}/destroy`)
    return res.data
  },

  cancelCampaign: async (campaignId) => {
    const res = await httpClient.get(`${BASE_PATH}/${campaignId}/cancel`)
    return res.data
  },

  getScheduledCampaigns: async (params) => {
    const res = await httpClient.get(`${BASE_PATH}/scheduled`, { params })
    return res.data
  },

  getMyCampaigns: async (params) => {
    const res = await httpClient.get(`${BASE_PATH}/my`, { params })
    return res.data
  },

  getMyScheduledCampaigns: async (params) => {
    const res = await httpClient.get(`${BASE_PATH}/my/scheduled`, { params })
    return res.data
  },

  addCampaignImages: async (campaignId, payload) => {
    const formData = payload instanceof FormData ? payload : toCampaignImagesFormData(payload)
    const res = await httpClient.post(`${BASE_PATH}/${campaignId}/add/images`, formData)
    return res.data
  },

  removeCampaignImages: async (campaignId, attachmentIds) => {
    const res = await httpClient.post(`${BASE_PATH}/${campaignId}/remove/images`, {
      attachment_ids: attachmentIds,
    })
    return res.data
  },

  addCampaignCustomers: async (campaignId, customerIds) => {
    const res = await httpClient.post(`${BASE_PATH}/${campaignId}/add/customers`, {
      customer_ids: customerIds,
    })
    return res.data
  },

  removeCampaignCustomers: async (campaignId, customerIds) => {
    const res = await httpClient.post(`${BASE_PATH}/${campaignId}/remove/customers`, {
      customer_ids: customerIds,
    })
    return res.data
  },

  addCampaignUsers: async (campaignId, userIds) => {
    const res = await httpClient.post(`${BASE_PATH}/${campaignId}/add/users`, {
      users: userIds,
    })
    return res.data
  },

  removeCampaignUsers: async (campaignId, userIds) => {
    const res = await httpClient.post(`${BASE_PATH}/${campaignId}/remove/users`, {
      users: userIds,
    })
    return res.data
  },
}

function toCampaignImagesFormData(payload = {}) {
  const formData = new FormData()
  const files = Array.isArray(payload.files) ? payload.files : payload.files ? [payload.files] : []

  files.forEach((file) => {
    formData.append('files[]', file)
  })

  return formData
}
