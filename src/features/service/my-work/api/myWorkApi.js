import { useQuery } from '@tanstack/react-query'
import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'

const api = createServiceApi('myWork')

/**
 * @typedef {Object} WorkItem
 * @property {string} id
 * @property {'case'|'task'|'work_order'|'approval'|'document_requirement'|'follow_up_step'} source_type
 * @property {string} source_id
 * @property {string} title
 * @property {string|null} reference
 * @property {{ id: string, name: string }|null} customer
 * @property {string|null} priority
 * @property {{ key: string, label: object, category: string }|null} status
 * @property {string|null} due_at
 * @property {string} updated_at
 */

export const myWorkApi = {
  /** @returns {Promise<WorkItem[]>} */
  list: async () => {
    const { data } = await api.get(serviceEndpoints.myWork)
    return data?.data ?? []
  },
}

export function useMyWork() {
  return useQuery({ queryKey: serviceKeys.myWork(), queryFn: myWorkApi.list, staleTime: 30 * 1000 })
}

/** Where each work item opens. New source types add one line. */
export const WORK_ITEM_LINKS = {
  case: (item) => `/service/cases/${item.source_id}`,
  task: () => '/tasks',
}

export function getWorkItemLink(item) {
  return WORK_ITEM_LINKS[item.source_type]?.(item) ?? null
}
