export function resolveNodeDefinition(node, nodeRegistry) {
  return nodeRegistry?.get(node?.type) || null
}

/** Merges mode-level capabilities with a specific definition's overrides (e.g. a locked system node stays non-deletable even in edit mode). */
export function getNodeCapabilities(node, nodeRegistry, baseCapabilities) {
  const definition = resolveNodeDefinition(node, nodeRegistry)
  return { ...baseCapabilities, ...(definition?.capabilities || {}) }
}
