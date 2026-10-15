import { LOST_REASONS } from '../constants/dealOptions'

/**
 * Losing a deal lead (`POST /deals/leads/{dealLeadId}/lost`, 2026-10-16). Pure.
 *
 * Body: `{ reason, lost_reason_id? }`.
 * - `reason` is the backend's fixed list: price | competitor | no_budget | no_response | not_interested | timing | other.
 * - `lost_reason_id` is a reason defined by the company (`/definitions/lost-reasons`). It is sent with `reason` set to
 *   the fixed key its code matches (code "PRICE" / "no_budget" → that key), else `other`, so the field the backend
 *   validates is always a valid key.
 */
const keyOf = (value) => String(value ?? '').trim().toLowerCase().replace(/[\s-]+/g, '_')

export function lostEnumFor(definition) {
  if (!definition) return 'other'
  const candidates = [definition.code, definition.raw?.code, definition.name].map(keyOf)
  return candidates.find((key) => LOST_REASONS.includes(key)) || 'other'
}

/** `{ reasonId }` (a defined reason) or `{ reasonKey }` (fixed list, when none are defined) → request body. */
export function buildDealLostPayload({ reasonId = '', reasonKey = '', reasons = [] } = {}) {
  if (reasonId) {
    const definition = reasons.find((reason) => String(reason.id) === String(reasonId))
    const id = Number(reasonId)
    return { reason: lostEnumFor(definition), lost_reason_id: Number.isFinite(id) ? id : reasonId }
  }
  return { reason: LOST_REASONS.includes(reasonKey) ? reasonKey : 'other' }
}

/**
 * Display key of a lost deal lead: the defined reason's name when the backend sends it (`lost_reason_id` + its
 * relation), else the fixed key. `names`: Map of defined reason id → name, used when only the id comes back.
 */
export function lostReasonLabelKey(lead = {}, names = new Map()) {
  if (lead.lostReasonName) return lead.lostReasonName
  if (lead.lostReasonId && names.has(String(lead.lostReasonId))) return names.get(String(lead.lostReasonId))
  return lead.lostReason || ''
}
