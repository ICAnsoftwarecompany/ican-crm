import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceEndpoints } from '../../core/api/endpoints'

const api = createServiceApi('cases')
const unwrap = (response) => response.data?.data ?? response.data

/**
 * Cases API — contract in docs/customer-service/SERVICE-MASTER-SPEC.md §36 and §51.
 *
 * Case shape (response): { id, case_number, subject, description, customer: {id,name,phone},
 * type: {id,key,label,icon}, status: {id,key,label,category}, priority, severity,
 * queue: {id,label}|null, assignee: {id,name}|null, source_channel, conversation_id,
 * opened_at, first_response_at, resolved_at, closed_at, updated_at,
 * resolution_code, resolution_summary, reopened_count, version,
 * sla: see features/service/sla/README.md }
 *
 * Tenant labels (type/status/queue) are `{ ar, en }` → render with localizeLabel().
 */
export const casesApi = {
  /** @param {{ view?: string, search?: string, queue_id?: string, type_id?: string, priority?: string, customer_id?: string, page?: number, per_page?: number }} params */
  list: async (params) => (await api.get(serviceEndpoints.cases, { params })).data,
  summary: async () => unwrap(await api.get(serviceEndpoints.caseSummary)),
  setup: async () => unwrap(await api.get(serviceEndpoints.caseSetup)),
  get: async (caseId) => unwrap(await api.get(serviceEndpoints.case(caseId))),
  create: async (payload) => unwrap(await api.post(serviceEndpoints.cases, payload)),
  /** Links the conversation; the backend copies recent messages as context (spec §36.8). */
  createFromConversation: async ({ conversation_id: conversationId, ...payload }) =>
    unwrap(await api.post(serviceEndpoints.caseFromConversation(conversationId), payload)),
  update: async (caseId, payload) => unwrap(await api.patch(serviceEndpoints.case(caseId), payload)),
  transition: async (caseId, payload) => unwrap(await api.post(serviceEndpoints.caseTransition(caseId), payload)),
  assign: async (caseId, payload) => unwrap(await api.post(serviceEndpoints.caseAssign(caseId), payload)),
  activities: async (caseId) => unwrap(await api.get(serviceEndpoints.caseActivities(caseId))),
  reply: async (caseId, payload) => unwrap(await api.post(serviceEndpoints.caseReply(caseId), payload)),
  addNote: async (caseId, payload) => unwrap(await api.post(serviceEndpoints.caseNotes(caseId), payload)),
  /** @param {{ macro_id: string, version: number, language?: string }} payload → updated case */
  applyMacro: async (caseId, payload) => unwrap(await api.post(serviceEndpoints.caseApplyMacro(caseId), payload)),
  lookupCustomers: async (search) => unwrap(await api.get(serviceEndpoints.customerLookup, { params: { search } })),
}
