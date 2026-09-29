import { serviceEndpoints } from '../../core/api/endpoints'
import { getCollection } from '../db'
import { findStatus } from '../state/caseConfig'
import { getMockCurrentUser, hoursAgo } from '../seeds/seedUtils'

/**
 * GET /api/tenant/my-work — the "work_items" read model (spec §20.2).
 * Aggregates everything assigned to the current user across sources. The
 * backend builds it from events; the mock derives it from the mock cases.
 */
const OPEN_CATEGORIES = ['open', 'in_progress', 'pending']
const PRIORITY_RANK = { urgent: 0, high: 1, normal: 2, low: 3 }

function mockTasks() {
  return [
    { id: 'wi-task-1', title: 'اتصال متابعة بعد التركيب', due_at: hoursAgo(-3), priority: 'normal' },
    { id: 'wi-task-2', title: 'مراجعة شكوى العميل مع المشرف', due_at: hoursAgo(-26), priority: 'high' },
  ]
}

export const myWorkHandlers = [
  {
    method: 'GET',
    path: serviceEndpoints.myWork,
    handler: () => {
      const me = getMockCurrentUser()
      const caseItems = getCollection('cases')
        .filter((item) => item.assignee_id === me.id)
        .map((item) => ({ item, status: findStatus(item.status_id) }))
        .filter(({ status }) => OPEN_CATEGORIES.includes(status?.category))
        .map(({ item, status }) => ({
          id: `wi-${item.id}`,
          source_type: 'case',
          source_id: item.id,
          title: item.subject,
          reference: item.case_number,
          customer: { id: item.customer.id, name: item.customer.name },
          priority: item.priority,
          status: { key: status.key, label: status.label, category: status.category },
          due_at: null,
          updated_at: item.updated_at,
        }))
      const tasks = mockTasks().map((task) => ({
        ...task,
        source_type: 'task',
        source_id: task.id,
        reference: null,
        customer: null,
        status: null,
        updated_at: hoursAgo(2),
      }))
      const data = [...caseItems, ...tasks].sort(
        (a, b) => (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9) || String(b.updated_at).localeCompare(String(a.updated_at))
      )
      return { data, meta: { user: { id: me.id, name: me.name } } }
    },
  },
]
