// Pure color math for the brand token system. No CSS/DOM/React here — see
// store/themeStore.js#applyBrandTokens for the runtime wiring, and
// docs/APPEARANCE_SETTINGS.md for the formulas explained in prose.

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function hexToHsl(hex) {
  const normalized = hex.replace('#', '')
  const r = parseInt(normalized.slice(0, 2), 16) / 255
  const g = parseInt(normalized.slice(2, 4), 16) / 255
  const b = parseInt(normalized.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  const l = (max + min) / 2

  let h = 0
  let s = 0
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1))
    switch (max) {
      case r:
        h = ((g - b) / delta) % 6
        break
      case g:
        h = (b - r) / delta + 2
        break
      default:
        h = (r - g) / delta + 4
    }
    h *= 60
    if (h < 0) h += 360
  }

  return { h, s: s * 100, l: l * 100 }
}

function hslToHex({ h, s, l }) {
  const sat = clamp(s, 0, 100) / 100
  const lig = clamp(l, 0, 100) / 100
  const c = (1 - Math.abs(2 * lig - 1)) * sat
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lig - c / 2

  let [r, g, b] = [0, 0, 0]
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]

  const toHex = (channel) =>
    Math.round(clamp((channel + m) * 255, 0, 255)).toString(16).padStart(2, '0')

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

// Lightness (percentage points) that -l/-soft/-border variants sit at,
// relative to the picked hue+saturation. See docs/APPEARANCE_SETTINGS.md for
// how these were picked against the shipped src/index.css defaults.
const PRIMARY_LIGHTEN_DELTA = 12
const ACCENT_SOFT_LIGHTNESS = { light: 92, dark: 15 }
const AI_BORDER_LIGHTNESS = 70

/**
 * Derives every dependent brand token from the two tenant-picked hexes.
 * Pure function: same inputs always produce the same outputs, no I/O.
 *
 * @param {string} primaryHex - e.g. '#162847'
 * @param {string} accentHex - e.g. '#00C2CB'
 * @param {'light'|'dark'} theme
 */
export function deriveBrandTokens(primaryHex, accentHex, theme = 'light') {
  const primaryHsl = hexToHsl(primaryHex)
  const accentHsl = hexToHsl(accentHex)

  const brandPrimaryL = hslToHex({
    h: primaryHsl.h,
    s: primaryHsl.s,
    l: clamp(primaryHsl.l + PRIMARY_LIGHTEN_DELTA, 0, 100),
  })

  const brandAccentSoft = hslToHex({
    h: accentHsl.h,
    s: accentHsl.s,
    l: ACCENT_SOFT_LIGHTNESS[theme] ?? ACCENT_SOFT_LIGHTNESS.light,
  })

  const aiBorder = hslToHex({
    h: accentHsl.h,
    s: accentHsl.s,
    l: AI_BORDER_LIGHTNESS,
  })

  return {
    brandPrimaryL,
    brandAccentSoft,
    aiColor: accentHex,
    aiBg: brandAccentSoft,
    aiBorder,
  }
}
