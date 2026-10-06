/**
 * Readable message from a failed request: the backend `message`, plus the first validation error of each field
 * (Laravel `errors: { field: ['...'] }`) when the message is the generic one. Added 2026-10-06.
 */
export function formatApiError(error, fallback) {
  const data = error?.response?.data
  const message = data?.message || error?.message || fallback
  const fieldErrors = data?.errors && typeof data.errors === 'object'
    ? Object.values(data.errors).map((value) => (Array.isArray(value) ? value[0] : value)).filter(Boolean)
    : []
  if (!fieldErrors.length) return message
  const extra = fieldErrors.filter((text) => text !== message).slice(0, 3)
  return extra.length ? `${message} — ${extra.join(' · ')}` : message
}
