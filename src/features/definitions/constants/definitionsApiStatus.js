/**
 * Definitions capabilities the frontend may use (2026-10-04). `planned` = proposed in
 * docs/backend/BACKEND-REQUESTS.md and not in the backend yet: the UI exists but is disabled with a note.
 * When the backend ships it, flip the value to `live` — nothing else changes.
 */
export const DEFINITIONS_API_STATUS = {
  // Reasons per lead status (§A4): `reasons` sent with create/update status and returned in the status list.
  statusReasons: 'planned',
}

export const isDefinitionsApiLive = (key) => DEFINITIONS_API_STATUS[key] === 'live'
