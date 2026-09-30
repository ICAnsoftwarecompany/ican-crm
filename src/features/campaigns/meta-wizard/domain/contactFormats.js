// Phone and URL helpers shared by validation, payloads and the UI.

/** Egyptian local numbers (01xxxxxxxxx) become +201xxxxxxxxx; others must be international. */
export function normalizePhoneNumber(value) {
  const digits = String(value || '').replace(/[\s\-().]/g, '')
  if (!digits) return ''
  if (/^01[0125]\d{8}$/.test(digits)) return `+2${digits}`
  if (/^00\d+$/.test(digits)) return `+${digits.slice(2)}`
  if (/^\d+$/.test(digits) && digits.startsWith('20') && digits.length === 12) return `+${digits}`
  return digits
}

export function isValidInternationalPhone(value) {
  return /^\+[1-9]\d{7,14}$/.test(normalizePhoneNumber(value))
}

export function isValidHttpUrl(value) {
  try {
    const url = new URL(String(value || '').trim())
    return ['http:', 'https:'].includes(url.protocol) && url.hostname.includes('.')
  } catch {
    return false
  }
}

/** Merges `utm_*` parameters into a destination URL. */
export function withUrlParameters(url, parameters) {
  if (!parameters || !isValidHttpUrl(url)) return url
  try {
    const target = new URL(url)
    new URLSearchParams(parameters.replace(/^\?/, '')).forEach((value, key) => target.searchParams.set(key, value))
    return target.toString()
  } catch {
    return url
  }
}
