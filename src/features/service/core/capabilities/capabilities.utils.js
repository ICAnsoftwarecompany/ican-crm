/**
 * Pure helpers over the capabilities manifest. No React, fully unit-tested.
 */

const EMPTY_MANIFEST = Object.freeze({ models: [], features: [], terminology: {}, permissions: [] })

/** @param {unknown} raw */
export function normalizeManifest(raw) {
  if (!raw || typeof raw !== 'object') return EMPTY_MANIFEST
  const value = /** @type {Record<string, unknown>} */ (raw)
  return {
    template: typeof value.template === 'string' ? value.template : undefined,
    models: Array.isArray(value.models) ? value.models : [],
    features: Array.isArray(value.features) ? value.features : [],
    terminology: value.terminology && typeof value.terminology === 'object' ? value.terminology : {},
    permissions: Array.isArray(value.permissions) ? value.permissions : [],
  }
}

/**
 * @param {{ features: string[] }} manifest
 * @param {string} featureKey
 */
export function isFeatureEnabled(manifest, featureKey) {
  return Boolean(manifest?.features?.includes(featureKey))
}

/**
 * Resolve the display name of a tenant-renamed entity.
 *
 * The backend sends either a term key (`'ticket'` → `service.terms.ticket.*`)
 * or a tenant-defined localized label (`{ ar, en }`). Falls back to the
 * default term of the entity.
 *
 * @param {Object} params
 * @param {Record<string, unknown>} params.terminology
 * @param {string} params.entity - customer | case | record | batch
 * @param {'one'|'other'} [params.form]
 * @param {string} params.language
 * @param {(key: string, options?: object) => string} params.t
 */
export function resolveTerm({ terminology, entity, form = 'one', language, t }) {
  const value = terminology?.[entity]

  if (value && typeof value === 'object') {
    const label = value[language] || value.en || value.ar
    if (typeof label === 'string' && label.trim()) return label
  }

  const termKey = typeof value === 'string' && value.trim() ? value : entity
  return t(`service.terms.${termKey}.${form}`, {
    defaultValue: t(`service.terms.${entity}.${form}`),
  })
}
