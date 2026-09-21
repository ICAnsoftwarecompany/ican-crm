// Persistence for tenant brand colors. Today this is localStorage-only (see
// docs/APPEARANCE_SETTINGS.md for the exact limitation and the proposed
// backend contract). When a real endpoint exists, this file is the only
// place that should need to change — callers only ever see
// load/save/clearBrandTokens.
const STORAGE_KEY = 'ican-crm:brand-tokens'

export const DEFAULT_BRAND_TOKENS = {
  brandPrimary: '#162847',
  brandAccent: '#00C2CB',
}

function isValidTokens(value) {
  return typeof value?.brandPrimary === 'string' && typeof value?.brandAccent === 'string'
}

/** Returns the saved tenant tokens, or null if nothing was ever saved. */
export function loadBrandTokens() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!isValidTokens(parsed)) return null
    return { brandPrimary: parsed.brandPrimary, brandAccent: parsed.brandAccent }
  } catch {
    return null
  }
}

export function saveBrandTokens(tokens) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ brandPrimary: tokens.brandPrimary, brandAccent: tokens.brandAccent })
  )
}

export function clearBrandTokens() {
  window.localStorage.removeItem(STORAGE_KEY)
}
