import { STALE_LEAD_DAYS } from '../constants/dealOptions'

const first = (...values) => values.find((value) => value !== undefined && value !== null && value !== '')

/**
 * One deal lead (pivot `deal_leads`) flattened for the UI. `id` is ALWAYS the deal-lead id (what
 * change-stage / won / lost / products expect); `leadId` is the CRM lead and `customerId` its customer.
 */
export function normalizeDealLead(item = {}) {
  const lead = item.lead || {}
  const customer = item.customer || lead.customer || {}
  const owner = item.owner || item.user || null
  return {
    ...item,
    id: item.id,
    leadId: first(item.lead_id, lead.id),
    customerId: first(item.customer_id, lead.customer_id, customer.id),
    name: first(lead.name, customer.name, item.name, ''),
    phone: first(lead.phone, customer.phone, item.phone, ''),
    email: first(lead.email, customer.email, item.email, ''),
    company: first(lead.company, customer.company, item.company, ''),
    source: first(item.source, lead.source, customer.source, ''),
    stageId: first(item.stage_id, item.deal_stage_id, item.stage?.id),
    stage_id: first(item.stage_id, item.deal_stage_id, item.stage?.id),
    status: getDealLeadStatus(item),
    ownerId: first(item.owner_id, owner?.id),
    ownerName: first(owner?.name, item.owner_name, ''),
    estimatedValue: Number(first(item.estimated_value, item.value, 0)) || 0,
    lastActivityAt: first(item.last_activity_at, item.updated_at, item.created_at, null),
    createdAt: first(item.created_at, null),
    lostReason: first(item.lost_reason, ''),
    closedAt: first(item.won_at, item.lost_at, item.closed_at, null),
  }
}

/** `open | won | lost`. The status decides if a lead is closed, never its stage. */
export function getDealLeadStatus(item = {}) {
  const raw = String(item.status ?? '').trim().toLowerCase()
  if (raw === 'won' || raw === 'lost' || raw === 'open') return raw
  if (item.won_at) return 'won'
  if (item.lost_at) return 'lost'
  return 'open'
}

export function isDealLeadOpen(lead) {
  return getDealLeadStatus(lead) === 'open'
}

export function isDealLeadStale(lead, now = new Date(), days = STALE_LEAD_DAYS) {
  if (!isDealLeadOpen(lead)) return false
  const last = lead?.lastActivityAt ? new Date(lead.lastActivityAt) : null
  if (!last || Number.isNaN(last.getTime())) return false
  return now.getTime() - last.getTime() > days * 24 * 60 * 60 * 1000
}

/**
 * Client-side filter for the board and the table (the list endpoint also accepts `stage_id`, `owner_id`,
 * `status`, but filtering locally keeps one cached list per deal).
 */
export function filterDealLeads(leads = [], { status = 'all', ownerId = '', stageId = '', search = '', unassigned = false } = {}) {
  const needle = String(search).trim().toLowerCase()
  return leads.filter((lead) => {
    if (status !== 'all' && lead.status !== status) return false
    if (unassigned && lead.ownerId) return false
    if (ownerId && String(lead.ownerId) !== String(ownerId)) return false
    if (stageId && String(lead.stageId) !== String(stageId)) return false
    if (!needle) return true
    return [lead.name, lead.phone, lead.email, lead.company, lead.source]
      .some((value) => String(value || '').toLowerCase().includes(needle))
  })
}

/** Id sets used to tell which tasks / calls / meetings belong to this deal. */
export function buildDealLeadIndex(leads = []) {
  const leadIds = new Set()
  const customerIds = new Set()
  leads.forEach((lead) => {
    if (lead.leadId !== undefined && lead.leadId !== null) leadIds.add(String(lead.leadId))
    if (lead.customerId !== undefined && lead.customerId !== null) customerIds.add(String(lead.customerId))
  })
  return { leadIds, customerIds }
}

/** Counts per status + the pipeline value of open leads + revenue of won leads. */
export function summarizeDealLeads(leads = []) {
  return leads.reduce((summary, lead) => {
    summary.total += 1
    summary[lead.status] += 1
    if (lead.status === 'open') summary.pipelineValue += lead.estimatedValue
    if (lead.status === 'won') summary.wonValue += lead.estimatedValue
    if (lead.status === 'open' && !lead.ownerId) summary.unassigned += 1
    return summary
  }, { total: 0, open: 0, won: 0, lost: 0, unassigned: 0, pipelineValue: 0, wonValue: 0 })
}
