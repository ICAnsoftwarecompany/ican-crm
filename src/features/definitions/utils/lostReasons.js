/**
 * Lead lost reasons (2026-10-15). Pure, tested. They are tenant definitions (`/definitions/lost-reasons`), managed
 * from the "lost" status in Statuses settings and offered when a lead is lost.
 */
const asBool = (value) => value === true || value === 1 || value === '1' || value === 'true'

export function normalizeLostReason(raw = {}) {
  return {
    id: raw.id,
    name: raw.name || raw.title || raw.code || '',
    code: raw.code || '',
    description: raw.description || '',
    active: raw.is_active === undefined && raw.active === undefined ? true : asBool(raw.is_active ?? raw.active),
    sortOrder: Number(raw.sort_order ?? raw.sortOrder ?? 0) || 0,
    raw,
  }
}

export function sortLostReasons(reasons = []) {
  return [...reasons].sort((a, b) => a.sortOrder - b.sortOrder || String(a.name).localeCompare(String(b.name)))
}

/** A short code from the name ("High cost" → "HIGH_COST"); Arabic-only names get "R" + a time-based suffix. */
export function suggestReasonCode(name = '', now = Date.now()) {
  const latin = String(name).toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 20)
  return latin || `R${now.toString(36).toUpperCase().slice(-6)}`
}

/** Form → request body. */
export function buildLostReasonPayload(form = {}, { nextOrder = 1 } = {}) {
  const name = String(form.name || '').trim()
  return {
    name,
    code: String(form.code || '').trim() || suggestReasonCode(name),
    description: String(form.description || '').trim() || name,
    is_active: form.active !== false,
    sort_order: Number(form.sortOrder) || nextOrder,
  }
}

export function nextSortOrder(reasons = []) {
  return reasons.reduce((max, reason) => Math.max(max, reason.sortOrder || 0), 0) + 1
}
