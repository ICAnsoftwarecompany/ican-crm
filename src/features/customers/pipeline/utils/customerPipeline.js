import { PIPELINE_ITEM_ID_FIELD, PIPELINE_STAGE_FIELD, UNSTAGED_PIPELINE_STAGE_ID } from '../constants'

const DEFAULT_STAGE_COLOR = 'var(--text-muted)'

function isPresent(value) {
  return value !== null && value !== undefined && value !== ''
}

function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase()
}

function normalizeDigits(value) {
  return String(value ?? '').replace(/\D+/g, '')
}

export function getPipelineLead(customer) {
  return customer?.lead || {}
}

export function getPipelineLeadId(customer) {
  const lead = getPipelineLead(customer)
  return lead.id ?? customer?.lead_id ?? null
}

export function getPipelineCustomerKey(customer) {
  const key = customer?.id ?? customer?.customer_id ?? getPipelineLeadId(customer)
  return isPresent(key) ? String(key) : ''
}

// Same precedence as pages/customers/utils/customerStatus#getCustomerLeadStatusTypeId,
// kept local because features must not import from pages.
export function getCustomerStatusId(customer) {
  const lead = getPipelineLead(customer)
  const value = [
    lead.status_type_id,
    lead.status?.id,
    lead.status?.status_type_id,
    customer?.status_type_id,
    customer?.status?.id,
    customer?.status?.status_type_id,
  ].find(isPresent)
  return isPresent(value) ? String(value) : ''
}

export function getStatusLabel(status) {
  return status?.status || status?.name || status?.title || ''
}

export function statusRequiresReason(status) {
  return Number(status?.has_resone) === 1
}

/**
 * Board columns = active lead statuses in their configured order, plus a leading
 * "unstaged" column only when some lead has no (active) status.
 */
export function buildPipelineStages(statuses = [], items = [], { unstagedLabel = '', selectedStatusId = null } = {}) {
  const stages = statuses.map((status) => ({
    id: String(status.id),
    name: getStatusLabel(status),
    color: status.color || DEFAULT_STAGE_COLOR,
    status,
  }))

  if (isPresent(selectedStatusId)) {
    return stages.filter((stage) => stage.id === String(selectedStatusId))
  }

  const hasUnstaged = items.some((item) => item[PIPELINE_STAGE_FIELD] === UNSTAGED_PIPELINE_STAGE_ID)
  if (!hasUnstaged) return stages

  return [
    { id: UNSTAGED_PIPELINE_STAGE_ID, name: unstagedLabel, color: DEFAULT_STAGE_COLOR, status: null, isUnstaged: true },
    ...stages,
  ]
}

/** Annotates rows with the board keys PipelineBoard groups by. Rows are not mutated. */
export function toPipelineItems(rows = [], statuses = []) {
  const knownStatusIds = new Set(statuses.map((status) => String(status.id)))

  return rows
    .map((row) => {
      const statusId = getCustomerStatusId(row)
      return {
        ...row,
        [PIPELINE_ITEM_ID_FIELD]: getPipelineCustomerKey(row),
        [PIPELINE_STAGE_FIELD]: knownStatusIds.has(statusId) ? statusId : UNSTAGED_PIPELINE_STAGE_ID,
      }
    })
    .filter((row) => row[PIPELINE_ITEM_ID_FIELD])
}

export function filterCustomersBySearch(rows = [], search = '') {
  const term = normalizeText(search)
  if (!term) return rows
  const digits = normalizeDigits(term)

  return rows.filter((row) => {
    const lead = getPipelineLead(row)
    const texts = [lead.name, row?.name, lead.email, row?.email, row?.company, row?.customer_code, getPipelineLeadId(row)]
    if (texts.some((value) => normalizeText(value).includes(term))) return true
    if (!digits) return false
    return [lead.phone, row?.phone].some((phone) => normalizeDigits(phone).includes(digits))
  })
}

export function hasCustomerChannel(customer, channel) {
  const lead = getPipelineLead(customer)
  return [customer, lead].some((source) => Boolean(source?.[`has_${channel}`] || source?.[`${channel}_enabled`]))
}

/** Earliest still-scheduled call/meeting on the lead (lead.meetings, else last_meeting/last_call). */
export function getNextScheduledActivity(customer) {
  const lead = getPipelineLead(customer)
  const meetings = Array.isArray(lead.meetings) ? lead.meetings : []
  const candidates = meetings.length
    ? meetings
    : [customer?.last_meeting, lead.last_meeting, customer?.last_call, lead.last_call].filter((item) => item && typeof item === 'object')

  return candidates
    .filter((activity) => normalizeText(activity?.status) === 'scheduled' && isPresent(activity?.start_at))
    .map((activity) => ({ activity, time: new Date(String(activity.start_at).replace(' ', 'T')).getTime() }))
    .filter(({ time }) => !Number.isNaN(time))
    .sort((first, second) => first.time - second.time)[0]?.activity || null
}

export function countCustomersByStage(items = []) {
  return items.reduce((counts, item) => {
    const key = item[PIPELINE_STAGE_FIELD]
    counts[key] = (counts[key] || 0) + 1
    return counts
  }, {})
}

/**
 * Same request shape the bulk-actions status change and the drawer status changer send
 * (leadsApi.saveAction / create_activity). Titles are passed in already translated.
 */
export function buildStatusChangePayload({ leadId, status, oldStatus, reason = '', title, description, activityAt }) {
  const needsReason = statusRequiresReason(status)
  return {
    lead_id: leadId,
    action: 'create_activity',
    type: needsReason ? 'note-to-lead' : 'status_change',
    title,
    description: needsReason ? reason : description,
    note: needsReason ? reason : '',
    data: { source: 'customers_pipeline' },
    new_status_id: status.id,
    new_status_title: getStatusLabel(status),
    old_status_title: getStatusLabel(oldStatus),
    activity_at: activityAt,
  }
}

function withStatus(customer, status) {
  const lead = getPipelineLead(customer)
  return {
    ...customer,
    status_type_id: isPresent(customer?.status_type_id) ? status.id : customer?.status_type_id,
    lead: { ...lead, status_type_id: status.id, status: lead.status && typeof lead.status === 'object' ? { ...lead.status, ...status } : lead.status },
  }
}

/** Optimistic update for the customers infinite-list cache (`['customers','list', filters]`). */
export function applyStatusToCustomersPages(data, customerKey, status) {
  if (!data?.pages || !customerKey) return data
  let changed = false
  const pages = data.pages.map((page) => {
    if (!Array.isArray(page?.data)) return page
    const rows = page.data.map((row) => {
      if (getPipelineCustomerKey(row) !== customerKey) return row
      changed = true
      return withStatus(row, status)
    })
    return { ...page, data: rows }
  })
  return changed ? { ...data, pages } : data
}
