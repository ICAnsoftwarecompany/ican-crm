import httpClient from '../../../services/httpClient'

const BASE_PATH = '/api/tenant/proposal/template'

export const proposalTemplatesApi = {
  getTemplates: async (params) => {
    const res = await httpClient.get(BASE_PATH, { params })
    return res.data
  },

  getTemplateInfo: async (templateId, params) => {
    const res = await httpClient.get(`${BASE_PATH}/show/${templateId}`, { params })
    return res.data
  },

  createTemplate: async (payload) => {
    const res = await httpClient.post(`${BASE_PATH}/save`, payload)
    return res.data
  },

  updateTemplate: async (templateId, payload) => {
    const res = await httpClient.put(`${BASE_PATH}/update/${templateId}`, payload)
    return res.data
  },

  deleteTemplate: async (templateId) => {
    const res = await httpClient.delete(`${BASE_PATH}/delete/${templateId}`)
    return res.data
  },

  duplicateTemplate: async (templateId) => {
    const res = await httpClient.post(`${BASE_PATH}/duplicate/${templateId}`)
    return res.data
  },

  activateTemplate: async (templateId) => {
    const res = await httpClient.post(`${BASE_PATH}/activate/${templateId}`)
    return res.data
  },

  deactivateTemplate: async (templateId) => {
    const res = await httpClient.post(`${BASE_PATH}/deactivate/${templateId}`)
    return res.data
  },

  createTemplateVersion: async (templateId, payload) => {
    const res = await httpClient.post(`${BASE_PATH}/${templateId}/versions`, payload)
    return res.data
  },

  updateVersionBuilder: async (versionId, payload) => {
    const res = await httpClient.put(`${BASE_PATH}/versions/${versionId}/builder`, payload)
    return res.data
  },

  setCurrentVersion: async (versionId) => {
    const res = await httpClient.post(`${BASE_PATH}/versions/${versionId}/current`)
    return res.data
  },

  duplicateVersion: async (versionId) => {
    const res = await httpClient.post(`${BASE_PATH}/versions/${versionId}/duplicate`)
    return res.data
  },

  createVersionSection: async (versionId, payload) => {
    const res = await httpClient.post(`${BASE_PATH}/versions/${versionId}/sections`, payload)
    return res.data
  },

  reorderVersionSections: async (versionId, sectionIds) => {
    const payload = Array.isArray(sectionIds) ? { section_ids: sectionIds } : sectionIds
    const res = await httpClient.post(`${BASE_PATH}/versions/${versionId}/sections/reorder`, payload)
    return res.data
  },

  updateSection: async (sectionId, payload) => {
    const res = await httpClient.put(`${BASE_PATH}/sections/${sectionId}`, payload)
    return res.data
  },

  deleteSection: async (sectionId) => {
    const res = await httpClient.delete(`${BASE_PATH}/sections/${sectionId}`)
    return res.data
  },

  toggleSectionVisibility: async (sectionId) => {
    const res = await httpClient.post(`${BASE_PATH}/sections/${sectionId}/toggle-visibility`)
    return res.data
  },

  createSectionBlock: async (sectionId, payload) => {
    const res = await httpClient.post(`${BASE_PATH}/sections/${sectionId}/blocks`, payload)
    return res.data
  },

  reorderSectionBlocks: async (sectionId, blockIds) => {
    const payload = Array.isArray(blockIds) ? { block_ids: blockIds } : blockIds
    const res = await httpClient.post(`${BASE_PATH}/sections/${sectionId}/blocks/reorder`, payload)
    return res.data
  },

  updateBlock: async (blockId, payload) => {
    const res = await httpClient.put(`${BASE_PATH}/blocks/${blockId}`, payload)
    return res.data
  },

  deleteBlock: async (blockId) => {
    const res = await httpClient.delete(`${BASE_PATH}/blocks/${blockId}`)
    return res.data
  },

  toggleBlockVisibility: async (blockId) => {
    const res = await httpClient.post(`${BASE_PATH}/blocks/${blockId}/toggle-visibility`)
    return res.data
  },
}
