import httpClient from '../../../services/httpClient'

const BASE_PATH = '/api/tenant/proposals'

function normalizeOrderPayload(key, value) {
  if (Array.isArray(value)) return { [key]: value }
  return value
}

export const proposalsApi = {
  getProposals: async (params) => {
    const res = await httpClient.get(BASE_PATH, { params })
    return res.data
  },

  getProposalInfo: async (proposalId, params) => {
    const res = await httpClient.get(`${BASE_PATH}/show/${proposalId}`, { params })
    return res.data
  },

  createProposal: async (payload) => {
    const res = await httpClient.post(`${BASE_PATH}/create`, payload)
    return res.data
  },

  updateProposal: async (proposalId, payload) => {
    const res = await httpClient.put(`${BASE_PATH}/update/${proposalId}`, payload)
    return res.data
  },

  deleteProposal: async (proposalId) => {
    const res = await httpClient.delete(`${BASE_PATH}/delete/${proposalId}`)
    return res.data
  },

  createProposalVersion: async (proposalId, payload) => {
    const res = await httpClient.post(`${BASE_PATH}/create/version/${proposalId}`, payload)
    return res.data
  },

  getProposalVersions: async (proposalId, params) => {
    const res = await httpClient.get(`${BASE_PATH}/version/${proposalId}`, { params })
    return res.data
  },

  getProposalVersionInfo: async (proposalId, versionId, params) => {
    const res = await httpClient.get(`${BASE_PATH}/${proposalId}/version/${versionId}`, { params })
    return res.data
  },

  updateProposalVersion: async (proposalId, versionId, payload) => {
    const res = await httpClient.put(`${BASE_PATH}/${proposalId}/version/${versionId}`, payload)
    return res.data
  },

  deleteProposalVersion: async (proposalId, versionId) => {
    const res = await httpClient.delete(`${BASE_PATH}/${proposalId}/version/${versionId}`)
    return res.data
  },

  setCurrentProposalVersion: async (proposalId, versionId) => {
    const res = await httpClient.post(`${BASE_PATH}/${proposalId}/current/${versionId}`)
    return res.data
  },

  getProposalOptions: async (proposalId, params) => {
    const res = await httpClient.get(`${BASE_PATH}/${proposalId}/options`, { params })
    return res.data
  },

  createProposalOption: async (proposalId, payload) => {
    const res = await httpClient.post(`${BASE_PATH}/${proposalId}/options`, payload)
    return res.data
  },

  reorderProposalOptions: async (proposalId, payload) => {
    const res = await httpClient.post(
      `${BASE_PATH}/${proposalId}/options/reorder`,
      normalizeOrderPayload('options', payload)
    )
    return res.data
  },

  updateProposalOption: async (proposalId, optionId, payload) => {
    const res = await httpClient.put(`${BASE_PATH}/${proposalId}/options/${optionId}`, payload)
    return res.data
  },

  setRecommendedProposalOption: async (proposalId, optionId, payload = {}) => {
    const res = await httpClient.post(`${BASE_PATH}/${proposalId}/options/${optionId}/set-recommended`, payload)
    return res.data
  },

  deleteProposalOption: async (proposalId, optionId) => {
    const res = await httpClient.delete(`${BASE_PATH}/${proposalId}/options/${optionId}`)
    return res.data
  },

  getProposalOptionItems: async (proposalId, optionId, params) => {
    const res = await httpClient.get(`${BASE_PATH}/${proposalId}/options/${optionId}/items`, { params })
    return res.data
  },

  createProposalOptionItem: async (proposalId, optionId, payload) => {
    const res = await httpClient.post(`${BASE_PATH}/${proposalId}/options/${optionId}/items`, payload)
    return res.data
  },

  reorderProposalOptionItems: async (proposalId, optionId, payload) => {
    const res = await httpClient.post(
      `${BASE_PATH}/${proposalId}/options/${optionId}/items/reorder`,
      normalizeOrderPayload('items', payload)
    )
    return res.data
  },

  updateProposalOptionItem: async (proposalId, optionId, itemId, payload) => {
    const res = await httpClient.put(`${BASE_PATH}/${proposalId}/options/${optionId}/items/${itemId}`, payload)
    return res.data
  },

  deleteProposalOptionItem: async (proposalId, optionId, itemId) => {
    const res = await httpClient.delete(`${BASE_PATH}/${proposalId}/options/${optionId}/items/${itemId}`)
    return res.data
  },
}
