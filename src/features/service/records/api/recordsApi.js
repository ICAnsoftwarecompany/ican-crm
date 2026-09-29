import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceEndpoints } from '../../core/api/endpoints'

const api = createServiceApi('records')
const unwrap = (response) => response.data?.data ?? response.data
const R = serviceEndpoints.records
const B = serviceEndpoints.batches

/**
 * Service records API (spec §33, §51). A record: { id, reference_no, record_type {id,key,label,icon},
 * customer {id,name,phone}, status {id,key,label,category}, batch {id,reference_no,name}|null,
 * assigned_user {id,name}|null, starts_at, ends_at, expected_at, source_type, data {}, counts
 * { participants, components, components_pending, documents_missing }, version, participants[] (detail) }.
 * Sections (participants, components, entries, documents, timeline) are nested endpoints.
 */
export const recordsApi = {
  setup: async (type) => unwrap(await api.get(`${R}/setup`, { params: { type } })),
  list: async (params) => (await api.get(R, { params })).data,
  summary: async (params) => unwrap(await api.get(`${R}/summary`, { params })),
  get: async (id) => unwrap(await api.get(`${R}/${id}`)),
  create: async (payload) => unwrap(await api.post(R, payload)),
  update: async (id, payload) => unwrap(await api.patch(`${R}/${id}`, payload)),
  transition: async (id, payload) => unwrap(await api.post(`${R}/${id}/transition`, payload)),
  section: async (id, section) => unwrap(await api.get(`${R}/${id}/${section}`)) || [],
  createIn: async (id, section, payload) => unwrap(await api.post(`${R}/${id}/${section}`, payload)),
  updateIn: async (id, section, itemId, payload) => unwrap(await api.patch(`${R}/${id}/${section}/${itemId}`, payload)),
  removeIn: async (id, section, itemId) => {
    await api.delete(`${R}/${id}/${section}/${itemId}`)
    return itemId
  },
  /** action: upload | verify | reject */
  documentAction: async (id, docId, action, payload) => unwrap(await api.post(`${R}/${id}/documents/${docId}/${action}`, payload)),
  postUpdate: async (id, payload) => unwrap(await api.post(`${R}/${id}/updates`, payload)),
  batches: async (params) => unwrap(await api.get(B, { params })) || [],
  batch: async (id) => unwrap(await api.get(`${B}/${id}`)),
  createBatch: async (payload) => unwrap(await api.post(B, payload)),
  bulkStatus: async (id, payload) => unwrap(await api.post(`${B}/${id}/bulk-status`, payload)),
}
