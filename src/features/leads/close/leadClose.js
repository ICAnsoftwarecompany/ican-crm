/**
 * Closing a lead in the Leads Center (2026-10-04). The tenant defines its lead statuses and marks each one's
 * kind in Statuses settings: `is_deal` = a sale (won), `is_lost` = lost, `is_retarget` = lost for now, try again
 * later. Every entry point (drawer, status changer, board drop, bulk) routes a move to one of those statuses
 * through the close dialog instead of a plain status change; a move OUT of a sale / lost status is a "reopen".
 *
 * Reasons: each closing status can carry its own reason list (`status.reasons`, backend §A4). Until the backend
 * returns it, lost uses LEAD_LOST_REASONS and won / retarget have none.
 *
 * Request: the existing `POST /api/tenant/leads/save/action` (`action: create_activity`, `new_status_id`). The
 * structured close data goes in the existing free `data` object — see docs/backend/BACKEND-REQUESTS.md §A.
 */

/** Kinds that close a lead (moving out of them is a reopen). Retarget is not closed: it waits for a follow-up. */
export const LEAD_CLOSE_KINDS = ['won', 'lost']
export const LEAD_CLOSE_MODES = ['won', 'lost', 'retarget', 'reopen']

/** Default lost reasons, until statuses carry their own. Labels: `customers.leadClose.reasons.<key>`. */
export const LEAD_LOST_REASONS = ['price', 'competitor', 'no_response', 'not_interested', 'not_qualified', 'timing', 'other']

/** Follow-up presets (days from today). `''` = none — not offered for retarget, where a date is required. */
export const LEAD_FOLLOW_UP_PRESETS = ['', '7', '30', '90', 'custom']
export const RETARGET_FOLLOW_UP_PRESETS = ['7', '30', '90', 'custom']

const bit = (value) => Number(value) === 1 || value === true || value === '1'
const present = (value) => value !== undefined && value !== null && value !== ''

/** `won | lost | retarget | null` from a status definition (`is_deal`, `is_lost`, `is_retarget`). */
export function getStatusCloseKind(status) {
  if (!status) return null
  if (bit(status.is_deal) || bit(status.is_won) || bit(status.is_won_stage)) return 'won'
  if (bit(status.is_lost) || bit(status.is_lost_stage)) return 'lost'
  if (bit(status.is_retarget)) return 'retarget'
  return null
}

export const isClosingStatus = (status) => LEAD_CLOSE_KINDS.includes(getStatusCloseKind(status))

/**
 * What moving `from` → `to` means: `won` / `lost` / `retarget` (the target's kind), `reopen` (leaving a sale /
 * lost status for a normal one), or `null` (a plain status change — no dialog).
 */
export function resolveCloseMode(fromStatus, toStatus) {
  const target = getStatusCloseKind(toStatus)
  if (target) return target
  if (isClosingStatus(fromStatus)) return 'reopen'
  return null
}

/** Statuses of one kind (to choose between e.g. two sale statuses). */
export function getStatusesOfKind(statuses = [], kind) {
  return statuses.filter((status) => getStatusCloseKind(status) === kind)
}

/** Does the tenant have at least one sale and one lost status? (Statuses settings warns when not.) */
export function getMissingCloseKinds(statuses = []) {
  return LEAD_CLOSE_KINDS.filter((kind) => !getStatusesOfKind(statuses, kind).length)
}

/**
 * Reasons offered for a status: its own list when the backend sends one (`reasons` / `close_reasons`, active
 * only, `{ id?, key, label }`), else the default lost list for a lost status, else none. Default reasons have
 * `label: null` — the UI translates them by key.
 */
export function getStatusReasons(status) {
  const own = [status?.reasons, status?.close_reasons, status?.status_reasons].find(Array.isArray)
  if (own) {
    return own
      .filter((reason) => reason && (reason.active === undefined || bit(reason.active)))
      .sort((left, right) => Number(left.order ?? 0) - Number(right.order ?? 0))
      .map((reason) => ({ id: reason.id ?? null, key: String(reason.key ?? reason.id ?? reason.label), label: reason.label ?? reason.reason ?? reason.name ?? '' }))
  }
  if (getStatusCloseKind(status) === 'lost') return LEAD_LOST_REASONS.map((key) => ({ id: null, key, label: null }))
  return []
}

/** A reason is required for lost, and for a sale / retarget status that has reasons and `has_resone = 1`. */
export function isReasonRequired(mode, status, reasons = getStatusReasons(status)) {
  if (mode === 'lost') return true
  return (mode === 'won' || mode === 'retarget') && reasons.length > 0 && bit(status?.has_resone)
}

export function createCloseForm(mode, status) {
  return {
    mode,
    target: 'close', // won only: 'close' (record the sale) | 'deal' (add the lead to a deal instead)
    statusId: present(status?.id) ? String(status.id) : '',
    reason: '',
    note: '',
    wonValue: '',
    interestId: '',
    dealId: '',
    followUp: mode === 'retarget' ? '30' : '',
    followUpDate: '',
  }
}

/** Field errors (keys: `customers.leadClose.errors.<value>`). `context` = `{ bulk, status, reasons, openDeal }`. */
export function validateCloseForm(form, { bulk = false, status = null, reasons, openDeal = null } = {}) {
  const errors = {}
  if (form.mode === 'won' && form.target === 'deal') {
    if (!form.dealId) errors.dealId = 'dealRequired'
    return errors
  }
  if (!form.statusId) errors.statusId = 'statusRequired'
  const list = reasons ?? getStatusReasons(status)
  if (isReasonRequired(form.mode, status, list) && !form.reason) errors.reason = 'reasonRequired'
  if (form.reason === 'other' && !String(form.note).trim()) errors.note = 'noteRequiredForOther'
  if (form.mode === 'retarget' && !form.followUp) errors.followUp = 'followUpRequired'
  if ((form.mode === 'lost' || form.mode === 'retarget') && form.followUp === 'custom' && !form.followUpDate) errors.followUpDate = 'dateRequired'
  if (form.mode === 'won') {
    if (bulk) errors.mode = 'wonSingleOnly'
    else if (openDeal) errors.mode = 'inOpenDeal'
    if (form.wonValue !== '' && !(Number(form.wonValue) >= 0)) errors.wonValue = 'negative'
  }
  if (form.mode === 'reopen' && !String(form.note).trim()) errors.note = 'reopenNoteRequired'
  return errors
}

const pad = (value) => String(value).padStart(2, '0')
const toDateInput = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

/** `YYYY-MM-DD` of the follow-up (lost / retarget), or '' when none. */
export function resolveFollowUpDate(form, now = new Date()) {
  if ((form.mode !== 'lost' && form.mode !== 'retarget') || !form.followUp) return ''
  if (form.followUp === 'custom') return form.followUpDate || ''
  const date = new Date(now)
  date.setDate(date.getDate() + Number(form.followUp))
  return toDateInput(date)
}

/**
 * The saveAction body for one lead. `labels` are already translated (`title`, `description`, `reasonLabel`).
 * Same top-level shape as every other status change; close data inside `data`:
 * `close_type`, `reason_key` (+ `reason_id` when the reason came from the backend list, + `lost_reason_key` on
 * lost), `follow_up_at`, `won_value`, `interest_id`.
 */
export function buildLeadClosePayload({ leadId, form, status, oldStatus, labels = {}, reasons, activityAt, source = 'lead_close', now }) {
  const statusTitle = status?.status || status?.name || ''
  const note = String(form.note || '').trim()
  const followUpAt = resolveFollowUpDate(form, now)
  const text = [labels.reasonLabel, note].filter(Boolean).join(' — ')
  const data = { source, close_type: form.mode }
  if (form.reason) {
    const reason = (reasons ?? getStatusReasons(status)).find((entry) => entry.key === form.reason)
    data.reason_key = form.reason
    if (present(reason?.id)) data.reason_id = Number(reason.id) || reason.id
    if (form.mode === 'lost') data.lost_reason_key = form.reason
  }
  if (followUpAt) data.follow_up_at = followUpAt
  if (form.mode === 'won') {
    if (form.wonValue !== '') data.won_value = Number(form.wonValue)
    if (form.interestId) data.interest_id = Number(form.interestId) || form.interestId
  }
  return {
    lead_id: leadId,
    action: 'create_activity',
    type: form.mode === 'won' && !text ? 'status_change' : 'note-to-lead',
    title: labels.title || statusTitle,
    description: text || labels.description || '',
    note: text,
    data,
    new_status_id: status?.id,
    new_status_title: statusTitle,
    old_status_title: oldStatus?.status || oldStatus?.name || '',
    activity_at: activityAt,
  }
}

/** Current status id of a Leads Center row (lead row or customer row with a nested lead). */
export function getRowStatusId(row) {
  const id = row?.lead?.status_type_id ?? row?.status_type_id ?? row?.lead?.status?.id
  return present(id) ? String(id) : ''
}

/** `row → status` from a `Map<id, status>` (the pages already build one). */
export const statusLookup = (statusById) => (row) => statusById?.get?.(getRowStatusId(row)) || null

/** Interests of a lead row (customer + lead `interesteds`, deduplicated) for the sale path. */
export function getLeadInterests(customer) {
  const lead = customer?.lead || {}
  const rows = [
    ...(Array.isArray(customer?.interesteds) ? customer.interesteds : []),
    ...(Array.isArray(lead.interesteds) ? lead.interesteds : []),
  ]
  const seen = new Set()
  return rows
    .filter((row) => present(row?.id) && !seen.has(String(row.id)) && seen.add(String(row.id)))
    .map((row) => ({ id: String(row.id), name: row.product?.name || row.product_name || row.name || `#${row.id}`, isLost: bit(row.is_lost) }))
}

/**
 * The open deal a lead is in, when the row says so (backend §A5: `deals[]` on the lead), else null. A lead in an
 * open deal is won from the deal (contract + payment plan), never from the Leads Center.
 */
export function getLeadOpenDeal(row) {
  const lists = [row?.deals, row?.lead?.deals, row?.deal_leads, row?.lead?.deal_leads].filter(Array.isArray)
  for (const list of lists) {
    const entry = list.find((item) => String(item?.status ?? 'open').toLowerCase() === 'open')
    if (entry) {
      const dealId = entry.deal_id ?? entry.deal?.id ?? entry.id
      return { dealId: String(dealId), dealName: entry.deal_name ?? entry.deal?.name ?? entry.name ?? `#${dealId}` }
    }
  }
  return null
}
