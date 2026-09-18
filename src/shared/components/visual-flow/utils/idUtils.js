let counter = 0

/** Stable, collision-safe id generator — no backend id is ever assumed to exist yet when a node/edge is created client-side. */
export function generateFlowId(prefix = 'vf') {
  counter += 1
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`
  }
  return `${prefix}_${Date.now().toString(36)}_${counter}`
}
