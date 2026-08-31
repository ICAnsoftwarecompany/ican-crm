import httpClient from '../../../services/httpClient'

const BASE_PATH = '/api/tenant/tasks'

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

function taskPayloadToFormData(payload = {}) {
  if (payload instanceof FormData) return payload

  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return

    if (key === 'users' && Array.isArray(value)) {
      value.forEach((userId, index) => appendFormValue(formData, `users[${index}]`, userId))
      return
    }

    if (key === 'teams' && Array.isArray(value)) {
      value.forEach((teamId, index) => appendFormValue(formData, `teams[${index}]`, teamId))
      return
    }

    if (key === 'attachments' && Array.isArray(value)) {
      value.forEach((attachment) => appendFormValue(formData, 'attachments[]', attachment))
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

export const tasksApi = {
  createTask: async (payload) => {
    const res = await httpClient.post(BASE_PATH, taskPayloadToFormData(payload))
    return res.data
  },

  updateTask: async (taskId, payload) => {
    const res = await httpClient.put(`${BASE_PATH}/${taskId}`, taskPayloadToFormData(payload))
    return res.data
  },

  getTasks: async (params) => {
    const res = await httpClient.get(BASE_PATH, { params })
    return res.data
  },

  getTaskInfo: async (taskId, params) => {
    const res = await httpClient.get(`${BASE_PATH}/${taskId}`, { params })
    return res.data
  },

  deleteTask: async (taskId) => {
    const res = await httpClient.delete(`${BASE_PATH}/${taskId}`)
    return res.data
  },

  assignUsers: async (taskId, payload) => {
    const res = await httpClient.post(`${BASE_PATH}/${taskId}/assign-users`, payload)
    return res.data
  },

  assignTeams: async (taskId, payload) => {
    const res = await httpClient.post(`${BASE_PATH}/${taskId}/assign-teams`, payload)
    return res.data
  },

  addNote: async (taskId, payload) => {
    const res = await httpClient.post(`${BASE_PATH}/${taskId}/notes`, payload)
    return res.data
  },

  updateNote: async (taskId, noteId, payload) => {
    const res = await httpClient.put(`${BASE_PATH}/${taskId}/notes/${noteId}`, payload)
    return res.data
  },

  deleteNote: async (taskId, noteId) => {
    const res = await httpClient.delete(`${BASE_PATH}/${taskId}/notes/${noteId}`)
    return res.data
  },

  addAttachments: async (taskId, payload) => {
    const formData = payload instanceof FormData
      ? payload
      : taskPayloadToFormData({ attachments: payload?.attachments || payload })
    const res = await httpClient.post(`${BASE_PATH}/${taskId}/attachments`, formData)
    return res.data
  },

  deleteAttachment: async (taskId, attachmentId) => {
    const res = await httpClient.delete(`${BASE_PATH}/${taskId}/attachments/${attachmentId}`)
    return res.data
  },

  markAsRead: async (taskId) => {
    const res = await httpClient.patch(`${BASE_PATH}/${taskId}/read`)
    return res.data
  },

  changeStatus: async (taskId, payload) => {
    const res = await httpClient.patch(`${BASE_PATH}/${taskId}/status`, payload)
    return res.data
  },

  detachUser: async (taskId, userId) => {
    const res = await httpClient.delete(`${BASE_PATH}/${taskId}/users/${userId}`)
    return res.data
  },

  detachTeam: async (taskId, teamId) => {
    const res = await httpClient.delete(`${BASE_PATH}/${taskId}/teams/${teamId}`)
    return res.data
  },
}
