import { Building2, Flag, Globe2, Home, MapPin, MapPinned } from 'lucide-react'
import { MOCK_GEO_LOCATIONS } from '../../data/mock/metaGeoLocations'
import { locationDisplayName } from '../../domain/geoTargeting'

export const GEO_TYPE_ICONS = {
  country: Flag,
  region: Globe2,
  city: Building2,
  neighborhood: Home,
  zip: MapPinned,
  custom_location: MapPin,
}

const BY_KEY = new Map(MOCK_GEO_LOCATIONS.map((item) => [item.key, item]))
const COUNTRY_BY_CODE = new Map(MOCK_GEO_LOCATIONS.filter((item) => item.type === 'country').map((item) => [item.countryCode, item]))

/** "Alexandria Governorate, Egypt" style context under a location name. */
export function geoContextLabel(location, language) {
  if (location.context) return location.context
  if (location.type === 'custom_location') return `${Number(location.latitude).toFixed(4)}, ${Number(location.longitude).toFixed(4)}`
  const parts = []
  const region = location.regionKey ? BY_KEY.get(location.regionKey) : null
  if (region && location.type !== 'region') parts.push(locationDisplayName(region, language))
  const country = COUNTRY_BY_CODE.get(location.countryCode)
  if (country && location.type !== 'country') parts.push(locationDisplayName(country, language))
  return parts.join(', ')
}

export function mapsUrl(location) {
  if (location.latitude === undefined || location.longitude === undefined) return null
  return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
}
