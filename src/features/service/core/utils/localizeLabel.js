/**
 * Tenant-defined labels (case types, statuses, queues…) arrive from the
 * backend either as a plain string or as `{ ar, en }`. Resolve them for the
 * active UI language. Never pass these through t() — they are data.
 *
 * @param {string | Record<string, string> | null | undefined} value
 * @param {string} language
 * @param {string} [fallback]
 */
export function localizeLabel(value, language, fallback = '') {
  if (!value) return fallback
  if (typeof value === 'string') return value
  if (typeof value !== 'object') return fallback
  const lang = String(language || '').slice(0, 2)
  return value[lang] || value.en || value.ar || Object.values(value).find((item) => typeof item === 'string') || fallback
}
