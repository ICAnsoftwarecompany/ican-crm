/**
 * Reasons of one lead status (Statuses settings, 2026-10-04). Each sale / lost / retarget status can carry its
 * own list; the close dialog offers it (features/leads/close). Sent with create/update status as `reasons`
 * (JSON in the same FormData): `[{ id?, key, label, active, order }]` — see docs/backend/BACKEND-REQUESTS.md §A4.
 */

/** Stable key from a label (Latin → snake_case; other scripts → `reason_<n>`). Keys never change once saved. */
export function toReasonKey(label, taken = new Set()) {
  const base = String(label || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'reason'
  let key = base
  let index = 2
  while (taken.has(key) || key === 'reason') {
    key = `${base}_${index}`
    index += 1
    if (base !== 'reason' && !taken.has(key)) break
  }
  return key
}

/** A status's reasons (any of the accepted field names) → editor rows. */
export function readStatusReasons(status) {
  const list = [status?.reasons, status?.close_reasons, status?.status_reasons].find(Array.isArray) || []
  return list
    .map((reason, index) => ({
      id: reason.id ?? null,
      key: String(reason.key ?? reason.id ?? `reason_${index + 1}`),
      label: String(reason.label ?? reason.reason ?? reason.name ?? ''),
      active: reason.active === undefined ? true : Number(reason.active) === 1 || reason.active === true,
      order: Number(reason.order ?? index + 1),
    }))
    .sort((left, right) => left.order - right.order)
}

/** Add a reason row (new key from its label, unique among the existing keys). */
export function addReason(rows, label) {
  const text = String(label || '').trim()
  if (!text) return rows
  const key = toReasonKey(text, new Set(rows.map((row) => row.key)))
  return [...rows, { id: null, key, label: text, active: true, order: rows.length + 1 }]
}

/** Editor rows → request value (order = position; empty labels dropped). */
export function buildReasonsPayload(rows = []) {
  return rows
    .filter((row) => String(row.label || '').trim())
    .map((row, index) => ({
      ...(row.id !== null && row.id !== undefined ? { id: row.id } : {}),
      key: row.key,
      label: String(row.label).trim(),
      active: row.active ? 1 : 0,
      order: index + 1,
    }))
}

/** Same label twice? (case-insensitive) */
export function hasDuplicateReason(rows = []) {
  const seen = new Set()
  return rows.some((row) => {
    const label = String(row.label || '').trim().toLowerCase()
    if (!label) return false
    if (seen.has(label)) return true
    seen.add(label)
    return false
  })
}
