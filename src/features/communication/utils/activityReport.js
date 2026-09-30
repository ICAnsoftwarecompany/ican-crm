/**
 * Client-side report aggregation for calls/meetings. The backend has `GET meetings/reports/summary`
 * but its response shape is not confirmed, so the reports pages aggregate the list endpoint until
 * it is (see features/communication/README.md → Known gaps).
 */

const UNASSIGNED_KEY = '__unassigned__'

/**
 * @param {object[]} activities - normalized activities (features/activities normalizeActivity)
 * @param {(activity: object) => boolean} isOverdue
 * @returns {{ key: string, name: string|null, total: number, completed: number, overdue: number, cancelled: number, completionRate: number }[]}
 *   sorted by total desc; `name: null` means unassigned (the caller translates it).
 */
export function buildAssigneeBreakdown(activities = [], isOverdue = () => false) {
  const rows = new Map()

  activities.forEach((activity) => {
    const user = activity?.assignedUser
    const key = user?.id != null && user.id !== '' ? String(user.id) : user?.name || UNASSIGNED_KEY
    const row = rows.get(key) || { key, name: key === UNASSIGNED_KEY ? null : user?.name || null, total: 0, completed: 0, overdue: 0, cancelled: 0 }
    row.total += 1
    if (activity.status === 'completed') row.completed += 1
    if (activity.status === 'cancelled') row.cancelled += 1
    if (isOverdue(activity)) row.overdue += 1
    rows.set(key, row)
  })

  return [...rows.values()]
    .map((row) => ({ ...row, completionRate: row.total ? Math.round((row.completed / row.total) * 100) : 0 }))
    .sort((left, right) => right.total - left.total)
}

/** Counts by a string field (priority, outcome, ...). Empty values are grouped under `null`. */
export function countBy(activities = [], getValue) {
  const counts = new Map()
  activities.forEach((activity) => {
    const raw = getValue(activity)
    const key = raw === undefined || raw === null || raw === '' ? null : String(raw)
    counts.set(key, (counts.get(key) || 0) + 1)
  })
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((left, right) => right.count - left.count)
}
