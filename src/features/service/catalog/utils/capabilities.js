/** Pure helpers for capability selection (tested). */

/** Registry entries that fit an item kind (`both` fits everything; bundles take all). */
export function capabilitiesForKind(registry = [], kind) {
  if (!kind || kind === 'bundle') return registry
  const side = kind === 'plan' ? 'service' : kind
  return registry.filter((entry) => entry.applies_to === 'both' || entry.applies_to === side)
}

export const defaultConfig = (entry) => Object.fromEntries((entry?.config_fields || []).map((field) => [field.key, field.default ?? null]))

/** Toggle a capability on/off; enabling also enables its `depends_on` chain. */
export function toggleCapability(selected = [], registry = [], code, enabled) {
  if (!enabled) return selected.filter((entry) => entry.code !== code)
  const next = [...selected]
  const add = (target) => {
    if (next.some((entry) => entry.code === target)) return
    const entry = registry.find((candidate) => candidate.code === target)
    if (!entry) return
    ;(entry.depends_on || []).forEach(add)
    next.push({ code: target, version: entry.version, config: defaultConfig(entry) })
  }
  add(code)
  return next
}

/** Apply a service model preset: keep configs already set for capabilities that stay. */
export function applyPreset(selected = [], registry = [], preset) {
  if (!preset) return selected
  return preset.capabilities.reduce((next, code) => {
    const existing = selected.find((entry) => entry.code === code)
    return existing ? [...next.filter((entry) => entry.code !== code), existing] : toggleCapability(next, registry, code, true)
  }, [])
}

/** Codes that other selected capabilities depend on (cannot be switched off alone). */
export function requiredByOthers(selected = [], registry = []) {
  const codes = new Set(selected.map((entry) => entry.code))
  return new Set(
    registry.filter((entry) => codes.has(entry.code)).flatMap((entry) => entry.depends_on || [])
  )
}
