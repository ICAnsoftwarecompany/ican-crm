import httpClient from '../../../services/httpClient'

const BASE_PATH = '/api/tenant/meetings'

function appendFormValue(formData, key, value) {
  if (value === undefined || value === null) return

  const isFile = typeof File !== 'undefined' && value instanceof File
  const isBlob = typeof Blob !== 'undefined' && value instanceof Blob

  if (isFile || isBlob) {
    formData.append(key, value)
    return
  }

  if (typeof value === 'boolean') {
    formData.append(key, value ? '1' : '0')
    return
  }

  formData.append(key, value)
}

function toMeetingFormData(payload = {}) {
  if (payload instanceof FormData) return payload

  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return

    if (key === 'users' && Array.isArray(value)) {
      value.forEach((userId, index) => appendFormValue(formData, `users[${index}]`, userId))
      return
    }

    if (key === 'attachments' && Array.isArray(value)) {
      value.forEach((attachment, index) => appendFormValue(formData, `attachments[${index}]`, attachment))
      return
    }

    if (Array.isArray(value) || (typeof value === 'object' && !(value instanceof Date))) {
      formData.append(key, JSON.stringify(value))
      return
    }

    appendFormValue(formData, key, value instanceof Date ? value.toISOString() : value)
  })

  return formData
}


export const meetingsApi = {
  createMeetingOrCall: async (payload) => {
    const res = await httpClient.post(BASE_PATH, toMeetingFormData(payload))
    return res.data
  },

  updateMeetingOrCall: async (meetingId, payload) => {
    const res = await httpClient.put(`${BASE_PATH}/${meetingId}`, toMeetingFormData(payload))
    return res.data
  },

  getMeetings: async (params) => {
    const res = await httpClient.get(BASE_PATH, { params })
    return res.data
  },

  getLeadCallsMeetings: async (leadId, params) => {
    const res = await httpClient.get(`${BASE_PATH}/leads/${leadId}/calls-meetings`, { params })
    return res.data
  },

  getMeetingInfo: async (meetingId, params) => {
    const res = await httpClient.get(`${BASE_PATH}/${meetingId}`, { params })
    return res.data
  },

  deleteMeetingOrCall: async (meetingId) => {
    const res = await httpClient.delete(`${BASE_PATH}/${meetingId}`)
    return res.data
  },

  createReport: async (meetingId, payload) => {
    const res = await httpClient.post(`${BASE_PATH}/${meetingId}/reports`, toMeetingFormData(payload))
    return res.data
  },

  getReports: async (meetingId, params) => {
    const res = await httpClient.get(`${BASE_PATH}/${meetingId}/reports`, { params })
    return res.data
  },

  deleteReport: async (meetingId, reportId) => {
    const res = await httpClient.delete(`${BASE_PATH}/${meetingId}/reports/${reportId}`)
    return res.data
  },

  addNote: async (meetingId, payload) => {
    const res = await httpClient.post(`${BASE_PATH}/${meetingId}/notes`, toMeetingFormData(payload))
    return res.data
  },

  updateNote: async (meetingId, noteId, payload) => {
    const res = await httpClient.put(`${BASE_PATH}/${meetingId}/notes/${noteId}`, payload)
    return res.data
  },

  deleteNote: async (meetingId, noteId) => {
    const res = await httpClient.delete(`${BASE_PATH}/${meetingId}/notes/${noteId}`)
    return res.data
  },

  uploadAttachments: async (meetingId, payload) => {
    const formData = payload instanceof FormData
      ? payload
      : toMeetingFormData({ attachments: payload?.attachments || payload })
    const res = await httpClient.post(`${BASE_PATH}/${meetingId}/attachments`, formData)
    return res.data
  },

  deleteAttachment: async (meetingId, attachmentId) => {
    const res = await httpClient.delete(`${BASE_PATH}/${meetingId}/attachments/${attachmentId}`)
    return res.data
  },

  assignParticipants: async (meetingId, payload) => {
    const res = await httpClient.post(`${BASE_PATH}/${meetingId}/participants`, payload)
    return res.data
  },

  removeParticipant: async (meetingId, userId) => {
    const res = await httpClient.delete(`${BASE_PATH}/${meetingId}/participants/${userId}`)
    return res.data
  },

  getReportsSummary: async (params) => {
    const res = await httpClient.get(`${BASE_PATH}/reports/summary`, { params })
    return res.data
  },

  changeStatus: async (meetingId, payload) => {
    const res = await httpClient.patch(`${BASE_PATH}/${meetingId}/status`, payload)
    return res.data
  },

  changeParticipantStatus: async (meetingId, userId, payload) => {
    const res = await httpClient.patch(`${BASE_PATH}/${meetingId}/participants/${userId}/status`, payload)
    return res.data
  },
}
