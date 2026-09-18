import { CURRENT_SCHEMA_VERSION } from '../constants/defaults'
import { normalizeFlowData } from '../adapters/normalizeFlowData'

/**
 * Wraps a flow with its schema version for persistence. Migration is
 * intentionally NOT a complex engine today (see docs "Schema Versioning")
 * — `migrateFlow` is the one seam a future version bump hooks into.
 */
export function serializeFlow(flow) {
  return JSON.stringify({ ...normalizeFlowData(flow), schemaVersion: CURRENT_SCHEMA_VERSION })
}

export function deserializeFlow(raw) {
  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
  return migrateFlow(normalizeFlowData(parsed))
}

/**
 * @param {import('../types').VisualFlowModel} flow
 * @returns {import('../types').VisualFlowModel}
 */
export function migrateFlow(flow) {
  if (flow.schemaVersion === CURRENT_SCHEMA_VERSION) return flow
  // No migrations exist yet — schema version 1 is the only version ever
  // shipped. When version 2 ships, add `if (flow.schemaVersion === 1) { ... }`
  // steps here, one version at a time, and bump CURRENT_SCHEMA_VERSION.
  return { ...flow, schemaVersion: CURRENT_SCHEMA_VERSION }
}
