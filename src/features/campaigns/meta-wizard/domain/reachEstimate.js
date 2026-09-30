// Offline reach approximation used while the reach-estimate endpoint is
// in demo mode. It only needs to react sensibly to the user's choices
// (wider geo → bigger, narrower age → smaller); it is always badged as an
// estimate in the UI.

const MONTHLY_USERS = { EG: 46_000_000, SA: 25_000_000, AE: 9_500_000, KW: 3_800_000, QA: 2_700_000, BH: 1_400_000, OM: 3_200_000, JO: 6_500_000, LB: 4_000_000, IQ: 24_000_000, MA: 21_000_000, DZ: 23_000_000, TN: 7_500_000, TR: 57_000_000, US: 240_000_000, GB: 45_000_000 }
const DEFAULT_COUNTRY_USERS = 5_000_000

function locationSize(location) {
  const base = MONTHLY_USERS[location.countryCode] || DEFAULT_COUNTRY_USERS
  if (location.type === 'country') return base
  if (location.type === 'region') return base * 0.07
  if (location.type === 'city') return base * 0.03 * Math.max(0.5, (location.radius || 40) / 40)
  if (location.type === 'neighborhood') return base * 0.004
  if (location.type === 'custom_location') return Math.min(base * 0.02, 12_000 * Math.PI * (location.radius || 10) ** 2 / 100)
  return 0
}

export function estimateReachLocally(adSet, specialAdCategories = []) {
  const locations = adSet?.audience?.geo?.locations || []
  const included = locations.filter((item) => item.mode !== 'exclude').reduce((sum, item) => sum + locationSize(item), 0)
  const excluded = locations.filter((item) => item.mode === 'exclude').reduce((sum, item) => sum + locationSize(item), 0)
  let size = Math.max(0, included - excluded)

  const audience = adSet?.audience || {}
  if (!audience.advantageAudience || specialAdCategories.length) {
    const ageMin = Number(audience.ageMin) || 18
    const ageMax = Number(audience.ageMax) || 65
    size *= Math.max(0.05, Math.min(1, (ageMax - ageMin + 1) / 48))
    if (audience.genders && audience.genders !== 'all') size *= 0.5
    if (audience.detailedTargeting?.length) size *= Math.min(0.6, 0.12 * audience.detailedTargeting.length + 0.08)
    if (audience.languages?.length) size *= 0.85
  }
  if (audience.customAudienceIds?.length && !audience.advantageAudience) size = Math.min(size, 60_000 * audience.customAudienceIds.length)

  const rounded = Math.round(size / 1000) * 1000
  return { lower: Math.round(rounded * 0.85), upper: Math.round(rounded * 1.15) }
}
