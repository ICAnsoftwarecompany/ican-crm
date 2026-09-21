import httpClient from '../../../services/httpClient'

const BASE_PATH = '/api/tenant/whatsapp'

export const whatsappTemplateImagesApi = {
  createTemplateImages: async (payload) => {
    const formData = payload instanceof FormData ? payload : toTemplateImagesFormData(payload)
    const res = await httpClient.post(`${BASE_PATH}/create/template/images`, formData)
    return res.data
  },

  getTemplateImages: async (params) => {
    const res = await httpClient.get(`${BASE_PATH}/template/images`, { params })
    return res.data
  },

  getTemplateImagesData: async (templateId, params) => {
    const res = await httpClient.get(`${BASE_PATH}/template/${templateId}/images`, { params })
    return res.data
  },

  toggleTemplateImageStatus: async (templateId, isActive) => {
    const formData = new FormData()
    formData.append('is_active', isActive ? '1' : '0')
    const res = await httpClient.post(`${BASE_PATH}/change/template/${templateId}/image/status`, formData)
    return res.data
  },
}

function toTemplateImagesFormData(payload = {}) {
  const formData = new FormData()
  const files = Array.isArray(payload.files) ? payload.files : payload.files ? [payload.files] : []

  if (payload.template_id !== undefined && payload.template_id !== null) {
    formData.append('template_id', payload.template_id)
  }

  files.forEach((file) => {
    formData.append('files[]', file)
  })

  return formData
}
