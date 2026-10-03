/**
 * Which tasks / calls / meetings belong to one deal. Three kinds of link:
 * - `deal`: the record is linked to the deal itself (taskable `App\Models\Deal`) — internal work such as a
 *   team meeting. Needs backend support for the Deal morph (DEAL_API_STATUS.dealLinkedActivities/Tasks).
 * - `contract`: linked to one of the deal's contracts (the won flow creates these follow-up tasks).
 * - `lead` / `customer`: linked to a lead or customer that is in the deal (customer calls, meetings, tasks).
 */

const morphBase = (value) => String(value ?? '').replace(/["']/g, '').split(/[\\/]+/).filter(Boolean).pop()?.trim().toLowerCase() || ''

export function buildDealLinkIndex({ dealId, leadIndex, contracts = [] }) {
  return {
    dealId: dealId === undefined || dealId === null ? '' : String(dealId),
    leadIds: leadIndex?.leadIds || new Set(),
    customerIds: leadIndex?.customerIds || new Set(),
    contractIds: new Set(contracts.map((contract) => String(contract.id))),
  }
}

function linkKind(type, id, index) {
  const base = morphBase(type)
  const key = id === undefined || id === null ? '' : String(id)
  if (!base || !key) return null
  if (base === 'deal' && key === index.dealId) return 'deal'
  if (base === 'contract' && index.contractIds.has(key)) return 'contract'
  if (base === 'lead' && index.leadIds.has(key)) return 'lead'
  if (base === 'customer' && index.customerIds.has(key)) return 'customer'
  return null
}

/** `deal | contract | lead | customer | null` for a task from `/api/tenant/tasks`. */
export function getTaskDealLink(task, index) {
  if (!task || !index) return null
  return linkKind(task.taskable_type ?? task.taskableType, task.taskable_id ?? task.taskableId ?? task.taskable?.id, index)
}

/**
 * `internal` (linked to the deal itself), `customer` (a lead/customer of the deal) or null, for an activity
 * normalized by features/activities (`raw` holds the API row).
 */
export function getActivityDealLink(activity, index) {
  if (!activity || !index) return null
  const raw = activity.raw || activity
  const direct = linkKind(raw.taskable_type, raw.taskable_id, index)
  if (direct === 'deal') return 'internal'
  if (direct) return 'customer'
  const related = activity.relatedEntity
  if (related?.id !== undefined && related?.id !== null) {
    const key = String(related.id)
    if (related.type === 'customer' ? index.customerIds.has(key) : index.leadIds.has(key)) return 'customer'
  }
  const leadId = raw.lead_id ?? raw.lead?.id
  if (leadId !== undefined && leadId !== null && index.leadIds.has(String(leadId))) return 'customer'
  return null
}
