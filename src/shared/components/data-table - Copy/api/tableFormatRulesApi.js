import httpClient from '../../../../services/httpClient'

const BASE_PATH = '/api/tenant/table-format-rules'

function unwrapData(response) {
  return response.data?.data ?? response.data
}

function normalizeRulesList(payload) {
  const data = payload?.data ?? payload

  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.items)) return data.items

  return []
}

export const tableFormatRulesApi = {
  async list(tableKey) {
    const response = await httpClient.get(BASE_PATH, {
      params: { tableKey },
    })
    return normalizeRulesList(response.data)
  },

  async get(id) {
    const response = await httpClient.get(`${BASE_PATH}/${id}`)
    return unwrapData(response)
  },

  async create(payload) {
    const response = await httpClient.post(BASE_PATH, payload)
    return unwrapData(response)
  },

  async update(id, payload) {
    const response = await httpClient.put(BASE_PATH, {
      rules: [
        {
          id,
          ...payload,
        },
      ],
    })
    return unwrapData(response)
  },

  async toggle(id) {
    const response = await httpClient.patch(`${BASE_PATH}/${id}/toggle`)
    return unwrapData(response)
  },

  async remove(id) {
    const response = await httpClient.delete(`${BASE_PATH}/${id}`)
    return response.data
  },
}
