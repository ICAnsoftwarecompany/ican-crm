// Special ad categories and the targeting restrictions Meta enforces for
// them. FINANCIAL_PRODUCTS_SERVICES replaced the old CREDIT category in
// 2025; drafts saved with CREDIT are migrated on load.
export const SPECIAL_AD_CATEGORIES = Object.freeze([
  'HOUSING',
  'EMPLOYMENT',
  'FINANCIAL_PRODUCTS_SERVICES',
  'ISSUES_ELECTIONS_POLITICS',
])

const RESTRICTED = new Set(['HOUSING', 'EMPLOYMENT', 'FINANCIAL_PRODUCTS_SERVICES'])

export const RESTRICTED_TARGETING = Object.freeze({
  ageMin: 18,
  ageMax: 65,
  // Meta: 15-mile (≈25 km) minimum radius around cities/pins.
  minRadiusKm: 25,
})

export function normalizeSpecialAdCategories(categories = []) {
  return [...new Set(categories.map((value) => (value === 'CREDIT' ? 'FINANCIAL_PRODUCTS_SERVICES' : value)))]
    .filter((value) => SPECIAL_AD_CATEGORIES.includes(value))
}

export function hasRestrictedTargeting(categories = []) {
  return categories.some((value) => RESTRICTED.has(value))
}

export function requiresPoliticalAuthorization(categories = []) {
  return categories.includes('ISSUES_ELECTIONS_POLITICS')
}
