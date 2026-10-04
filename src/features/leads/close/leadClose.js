/**
 * Closing a lead in the Leads Center (2026-10-04). A lead is closed by moving it to a status whose kind
 * (Statuses settings) is "deal" (= won / converted) or "lost". Every entry point (drawer, status changer,
 * board drop, bulk) routes those moves through the close dialog instead of a plain status change, and a move
 * OUT of a closed status is a "reopen" that needs a note.
 *
 * Request: the existing `POST /api/tenant/leads/save/action` (`action: create_activity`, `new_status_id`).
 * The structured close data goes in the existing free `data` object (no new top-level fields) until the
 * backend ships the close contract — see docs/backend/BACKEND-REQUESTS.md §A and LEAD_CLOSE_API_STATUS.
 */

export const LEAD_CLOSE_KINDS = ['won', 'lost']

/**
 * Default lost reasons (used until the tenant list endpoint exists). Labels: `customers.leadClose.reasons.<key>`.
 * Keys are sent as `lost_reason_key`, so reports can group them.
 */
export const LEAD_LOST_REASONS = ['price', 'competitor', 'no_response', 'not_interested', 'not_qualified', 'timing', 'other']

/** Follow-up presets after a lost close (days from today). `''` = no follow-up. */
export const LEAD_FOLLOW_UP_PRESETS = ['', '7', '30', '90', 'custom']

const bit = (value) => Number(value) === 1 || value === true || value === '1'

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
 * What moving `from` → `to` means: `won` / `lost` (a close), `reopen` (leaving a closed status for an open
 * one), or `null` (a plain status change — no dialog).
 */
export function resolveCloseMode(fromStatus, toStatus) {
  const target = getStatusCloseKind(toStatus)
  if (target === 'won' || target === 'lost') return target
  if (isClosingStatus(fromStatus)) return 'reopen'
  return null
}

/** Statuses of one close kind (to choose between e.g. two "won" statuses). */
export function getStatusesOfKind(statuses = [], kind) {
  return statuses.filter((status) => getStatusCloseKind(status) === kind)
}

export function createCloseForm(mode, status) {
  return {
    mode,
    statusId: status?.id !== undefined && status?.id !== null ? String(status.id) : '',
    lostReason: '',
    note: '',
    wonValue: '',
    interestId: '',
    followUp: '',
    followUpDate: '',
  }
}

/** Field errors (keys: `customers.leadClose.errors.<value>`). */
export function validateCloseForm(form, { bulk = false } = {}) {
  const errors = {}
  if (!form.statusId) errors.statusId = 'statusRequired'
  if (form.mode === 'lost') {
    if (!form.lostReason) errors.lostReason = 'reasonRequired'
    if (form.lostReason === 'other' && !String(form.note).trim()) errors.note = 'noteRequiredForOther'
    if (form.followUp === 'custom' && !form.followUpDate) errors.followUpDate = 'dateRequired'
  }
  if (form.mode === 'won') {
    if (bulk) errors.mode = 'wonSingleOnly'
    if (form.wonValue !== '' && !(Number(form.wonValue) >= 0)) errors.wonValue = 'negative'
  }
  if (form.mode === 'reopen' && !String(form.note).trim()) errors.note = 'reopenNoteRequired'
  return errors
}

const pad = (value) => String(value).padStart(2, '0')
const toDateInput = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

/** `YYYY-MM-DD` of the follow-up, or '' when none. */
export function resolveFollowUpDate(form, now = new Date()) {
  if (form.mode !== 'lost' || !form.followUp) return ''
  if (form.followUp === 'custom') return form.followUpDate || ''
  const date = new Date(now)
  date.setDate(date.getDate() + Number(form.followUp))
  return toDateInput(date)
}

/**
 * The saveAction body for one lead. `labels` are already translated (`title`, `description`, `reasonLabel`).
 * Same top-level shape as every other status change; close data inside `data`.
 */
export function buildLeadClosePayload({ leadId, form, status, oldStatus, labels = {}, activityAt, source = 'lead_close', now }) {
  const statusTitle = status?.status || status?.name || ''
  const note = String(form.note || '').trim()
  const followUpAt = resolveFollowUpDate(form, now)
  const text = [labels.reasonLabel, note].filter(Boolean).join(' — ')
  const data = { source, close_type: form.mode }
  if (form.mode === 'lost') {
    data.lost_reason_key = form.lostReason
    if (followUpAt) data.follow_up_at = followUpAt
  }
  if (form.mode === 'won') {
    if (form.wonValue !== '') data.won_value = Number(form.wonValue)
    if (form.interestId) data.interest_id = Number(form.interestId) || form.interestId
  }
  return {
    lead_id: leadId,
    action: 'create_activity',
    type: form.mode === 'won' ? 'status_change' : 'note-to-lead',
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
  return id === undefined || id === null ? '' : String(id)
}

/** `row → status` from a `Map<id, status>` (the pages already build one). */
export const statusLookup = (statusById) => (row) => statusById?.get?.(getRowStatusId(row)) || null

/** Interests of a lead row (customer + lead `interesteds`, deduplicated) for the won path. */
export function getLeadInterests(customer) {
  const lead = customer?.lead || {}
  const rows = [
    ...(Array.isArray(customer?.interesteds) ? customer.interesteds : []),
    ...(Array.isArray(lead.interesteds) ? lead.interesteds : []),
  ]
  const seen = new Set()
  return rows
    .filter((row) => row?.id !== undefined && row?.id !== null && !seen.has(String(row.id)) && seen.add(String(row.id)))
    .map((row) => ({ id: String(row.id), name: row.product?.name || row.product_name || row.name || `#${row.id}`, isLost: bit(row.is_lost) }))
}
