/**
 * Built-in case views. The backend owns the filter behind each key
 * (`GET /service/cases?view=<key>`); the frontend only lists and labels them
 * (`service.cases.views.<key>`). Saved/custom views arrive in F2.
 */
export const CASE_VIEWS = [
  'open',
  'mine',
  'unassigned',
  'waiting_customer',
  'waiting_internal',
  'high_priority',
  'resolved',
  'closed',
  'all',
]

export const DEFAULT_CASE_VIEW = 'open'

/** Views shown as counters on the Service Center. */
export const SERVICE_CENTER_VIEWS = ['mine', 'unassigned', 'waiting_customer', 'high_priority']

/** Board columns = status categories (stable even if tenants rename statuses). */
export const CASE_BOARD_CATEGORIES = ['open', 'in_progress', 'pending', 'resolved']

export const CASE_PRIORITIES = ['low', 'normal', 'high', 'urgent']
export const CASE_SEVERITIES = ['minor', 'moderate', 'major', 'critical']
