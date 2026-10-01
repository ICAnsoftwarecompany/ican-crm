// Location targeting — mirrors Ads Manager's "Locations" section:
// include/exclude, countries/regions/cities/neighbourhoods/pins, a radius
// around cities and pins, and the "people living in / recently in" selector.

export const LOCATION_TYPES = Object.freeze(['home_or_recent', 'home', 'recent', 'travel_in'])

export const LOCATION_TYPE_TO_META = Object.freeze({
  home_or_recent: ['home', 'recent'],
  home: ['home'],
  recent: ['recent'],
  travel_in: ['travel_in'],
})

// Meta: cities 10–50 mi (≈17–80 km); pins 1–50 mi (≈1–80 km).
export const RADIUS_LIMITS_KM = Object.freeze({
  city: { min: 17, max: 80, default: 40 },
  custom_location: { min: 1, max: 80, default: 10 },
})

const TYPE_RANK = { country: 0, region: 1, city: 2, neighborhood: 3, custom_location: 4 }

export function normalizeSearchText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[ً-ٰٟ]/g, '') // Arabic diacritics
    .replace(/[̀-ͯ]/g, '') // Latin accents
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/^(محافظه|مدينه|منطقه|اماره)\s+/, '')
    .replace(/^ال/, '')
}

function searchableNames(location) {
  return [location.name?.en, location.name?.ar, ...(location.aliases || [])].map(normalizeSearchText).filter(Boolean)
}

/**
 * Rank catalog entries for a free-text query the way Meta's typeahead
 * does: exact → prefix → word-prefix → contains, broader types first.
 */
export function searchLocationCatalog(catalog, query, options = {}) {
  return scoreLocationCatalog(catalog, query, options).map((entry) => entry.location)
}

function scoreLocationCatalog(catalog, query, { types, limit = 12, countryCodes } = {}) {
  const needle = normalizeSearchText(query)
  if (!needle) return []
  const scored = []
  for (const location of catalog) {
    if (types?.length && !types.includes(location.type)) continue
    if (countryCodes?.length && !countryCodes.includes(location.countryCode)) continue
    let best = Infinity
    for (const name of searchableNames(location)) {
      if (name === needle) best = Math.min(best, 0)
      else if (name.startsWith(needle)) best = Math.min(best, 1)
      else if (name.split(' ').some((word) => word.startsWith(needle))) best = Math.min(best, 2)
      else if (name.includes(needle)) best = Math.min(best, 3)
    }
    if (best !== Infinity) scored.push({ location, match: best, score: best * 10 + (TYPE_RANK[location.type] ?? 9) })
  }
  return scored.sort((a, b) => a.score - b.score).slice(0, limit)
}

// A pasted list is usually a list of cities: on an equally good match,
// prefer the city over the governorate that shares its name.
const BULK_TYPE_PREFERENCE = ['city', 'region', 'country', 'neighborhood']

/** Matches one pasted line per location (Ads Manager's "Add locations in bulk"). */
export function matchBulkLocations(catalog, text) {
  const lines = String(text || '').split(/[\n,\u061B;]+/).map((line) => line.trim()).filter(Boolean)
  const matched = []
  const unmatched = []
  for (const line of lines) {
    const candidates = scoreLocationCatalog(catalog, line, { limit: 8 })
    const bestMatch = candidates[0]?.match
    const first = candidates
      .filter((entry) => entry.match === bestMatch)
      .sort((a, b) => BULK_TYPE_PREFERENCE.indexOf(a.location.type) - BULK_TYPE_PREFERENCE.indexOf(b.location.type))[0]?.location
    if (first && !matched.some((item) => item.key === first.key)) matched.push(first)
    else if (!first) unmatched.push(line)
  }
  return { matched, unmatched }
}

/** Turns a catalog/API entry into the shape saved on the ad set. */
export function toTargetedLocation(location, { mode = 'include' } = {}) {
  const radiusConfig = RADIUS_LIMITS_KM[location.type]
  return {
    key: location.key,
    type: location.type,
    name: location.name,
    countryCode: location.countryCode,
    regionKey: location.regionKey,
    latitude: location.latitude,
    longitude: location.longitude,
    radius: radiusConfig && location.supportsRadius !== false ? radiusConfig.default : undefined,
    distanceUnit: 'kilometer',
    mode,
  }
}

export function createPinLocation({ latitude, longitude, label, radius }) {
  const lat = Number(latitude)
  const lng = Number(longitude)
  return {
    key: `pin:${lat.toFixed(5)},${lng.toFixed(5)}`,
    type: 'custom_location',
    name: { en: label || `${lat.toFixed(4)}, ${lng.toFixed(4)}`, ar: label || `${lat.toFixed(4)}, ${lng.toFixed(4)}` },
    latitude: lat,
    longitude: lng,
    radius: radius ?? RADIUS_LIMITS_KM.custom_location.default,
    distanceUnit: 'kilometer',
    mode: 'include',
  }
}

export function isValidCoordinate(latitude, longitude) {
  const lat = Number(latitude)
  const lng = Number(longitude)
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
    && String(latitude).trim() !== '' && String(longitude).trim() !== ''
}

/** Parses "30.0444, 31.2357" or a Google Maps URL with @lat,lng. */
export function parseCoordinates(text) {
  const match = String(text || '').match(/(-?\d{1,2}(?:\.\d+)?)\s*[, ]\s*(-?\d{1,3}(?:\.\d+)?)/)
  if (!match) return null
  return isValidCoordinate(match[1], match[2]) ? { latitude: Number(match[1]), longitude: Number(match[2]) } : null
}

export function locationDisplayName(location, language) {
  return (language === 'ar' ? location?.name?.ar : location?.name?.en) || location?.name?.en || location?.name?.ar || location?.key
}

/**
 * Structural problems in the selection: nothing included, the same place
 * both included and excluded, an exclusion that doesn't sit inside any
 * included location, radii out of range.
 */
export function analyzeGeoSelection(geo, { minRadiusKm } = {}) {
  const included = (geo?.locations || []).filter((item) => item.mode !== 'exclude')
  const excluded = (geo?.locations || []).filter((item) => item.mode === 'exclude')
  const problems = []
  if (!included.length) problems.push({ code: 'noIncludedLocation' })

  const includedKeys = new Set(included.map((item) => item.key))
  for (const item of excluded) {
    if (includedKeys.has(item.key)) problems.push({ code: 'includedAndExcluded', key: item.key })
    const covered = included.some((parent) => parent.type === 'country' && parent.countryCode === item.countryCode)
      || included.some((parent) => parent.type === 'region' && parent.key === item.regionKey)
    if (!covered && item.type !== 'custom_location' && included.length) problems.push({ code: 'exclusionOutsideInclusion', key: item.key })
  }

  for (const item of included) {
    const broaderCountry = included.some((parent) => parent !== item && parent.type === 'country' && item.type !== 'country' && parent.countryCode === item.countryCode)
    const broaderRegion = included.some((parent) => parent !== item && parent.type === 'region' && parent.key === item.regionKey)
    if (broaderCountry || broaderRegion) problems.push({ code: 'redundantLocation', key: item.key, severity: 'warning' })
  }

  for (const item of geo?.locations || []) {
    const limits = RADIUS_LIMITS_KM[item.type]
    if (!limits || item.radius === undefined) continue
    const min = Math.max(limits.min, minRadiusKm || 0)
    if (item.radius < min || item.radius > limits.max) problems.push({ code: 'radiusOutOfRange', key: item.key, min, max: limits.max })
  }
  return problems
}

function toGeoSpec(items) {
  const spec = {}
  const push = (key, value) => { spec[key] = [...(spec[key] || []), value] }
  for (const item of items) {
    if (item.type === 'country') push('countries', item.countryCode)
    else if (item.type === 'region') push('regions', { key: item.key })
    else if (item.type === 'city') push('cities', compact({ key: item.key, radius: item.radius, distance_unit: item.radius ? item.distanceUnit : undefined }))
    else if (item.type === 'neighborhood') push('neighborhoods', { key: item.key })
    else if (item.type === 'zip') push('zips', { key: item.key })
    else if (item.type === 'custom_location') push('custom_locations', { latitude: item.latitude, longitude: item.longitude, radius: item.radius, distance_unit: item.distanceUnit, name: item.name?.en })
  }
  return spec
}

/** Meta targeting spec: `geo_locations` + `excluded_geo_locations`. */
export function toMetaGeoTargeting(geo) {
  const locations = geo?.locations || []
  const included = toGeoSpec(locations.filter((item) => item.mode !== 'exclude'))
  const excluded = toGeoSpec(locations.filter((item) => item.mode === 'exclude'))
  const result = {
    geo_locations: { ...included, location_types: LOCATION_TYPE_TO_META[geo?.locationType] || LOCATION_TYPE_TO_META.home_or_recent },
  }
  if (Object.keys(excluded).length) result.excluded_geo_locations = excluded
  return result
}

/** Legacy `countries` field still accepted by the current backend contract. */
export function getTargetedCountryCodes(geo) {
  const codes = (geo?.locations || []).filter((item) => item.mode !== 'exclude').map((item) => item.countryCode).filter(Boolean)
  return [...new Set(codes)]
}

function compact(object) {
  return Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined))
}
