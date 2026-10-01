import { describe, expect, it } from 'vitest'
import { MOCK_GEO_LOCATIONS } from '../data/mock/metaGeoLocations'
import { analyzeGeoSelection, createPinLocation, matchBulkLocations, parseCoordinates, searchLocationCatalog, toMetaGeoTargeting, toTargetedLocation } from './geoTargeting'

const find = (key) => MOCK_GEO_LOCATIONS.find((item) => item.key === key)

describe('location search', () => {
  it('finds Arabic names regardless of hamza, taa marbuta and the article', () => {
    const results = searchLocationCatalog(MOCK_GEO_LOCATIONS, 'اسكندريه')
    expect(results.map((item) => item.key)).toContain('mock-city-EG-alexandria')
  })

  it('finds English names and aliases', () => {
    expect(searchLocationCatalog(MOCK_GEO_LOCATIONS, 'alex')[0].countryCode).toBe('EG')
    expect(searchLocationCatalog(MOCK_GEO_LOCATIONS, 'التجمع').map((item) => item.key)).toContain('mock-city-EG-new-cairo')
  })

  it('ranks the country above cities for an exact country name', () => {
    expect(searchLocationCatalog(MOCK_GEO_LOCATIONS, 'Egypt')[0].type).toBe('country')
  })

  it('matches pasted lists and reports unknown lines', () => {
    const { matched, unmatched } = matchBulkLocations(MOCK_GEO_LOCATIONS, 'القاهرة\nMansoura\nAtlantis')
    expect(matched.map((item) => item.name.en)).toEqual(expect.arrayContaining(['Cairo', 'Mansoura']))
    expect(unmatched).toEqual(['Atlantis'])
  })

  it('parses coordinates and map links', () => {
    expect(parseCoordinates('30.0444, 31.2357')).toEqual({ latitude: 30.0444, longitude: 31.2357 })
    expect(parseCoordinates('https://maps.example.com/@31.2001,29.9187,12z')).toEqual({ latitude: 31.2001, longitude: 29.9187 })
    expect(parseCoordinates('hello')).toBeNull()
  })
})

describe('geo selection analysis', () => {
  it('requires at least one included location', () => {
    expect(analyzeGeoSelection({ locations: [] }).map((problem) => problem.code)).toContain('noIncludedLocation')
  })

  it('flags an exclusion that is not inside any inclusion', () => {
    const geo = { locations: [toTargetedLocation(find('SA')), toTargetedLocation(find('mock-city-EG-cairo'), { mode: 'exclude' })] }
    expect(analyzeGeoSelection(geo).map((problem) => problem.code)).toContain('exclusionOutsideInclusion')
  })

  it('accepts a country with an excluded city inside it', () => {
    const geo = { locations: [toTargetedLocation(find('EG')), toTargetedLocation(find('mock-city-EG-cairo'), { mode: 'exclude' })] }
    expect(analyzeGeoSelection(geo)).toEqual([])
  })

  it('enforces the special-category minimum radius', () => {
    const city = { ...toTargetedLocation(find('mock-city-EG-mansoura')), radius: 17 }
    expect(analyzeGeoSelection({ locations: [city] }, { minRadiusKm: 25 })[0]).toMatchObject({ code: 'radiusOutOfRange', min: 25 })
  })
})

describe('Meta geo spec', () => {
  it('builds geo_locations and excluded_geo_locations', () => {
    const geo = {
      locationType: 'home',
      locations: [
        toTargetedLocation(find('EG')),
        toTargetedLocation(find('mock-city-EG-alexandria')),
        toTargetedLocation(find('mock-region-EG-giza'), { mode: 'exclude' }),
        createPinLocation({ latitude: 30.05, longitude: 31.24, radius: 5 }),
      ],
    }
    expect(toMetaGeoTargeting(geo)).toEqual({
      geo_locations: {
        countries: ['EG'],
        cities: [{ key: 'mock-city-EG-alexandria', radius: 40, distance_unit: 'kilometer' }],
        custom_locations: [{ latitude: 30.05, longitude: 31.24, radius: 5, distance_unit: 'kilometer', name: '30.0500, 31.2400' }],
        location_types: ['home'],
      },
      excluded_geo_locations: { regions: [{ key: 'mock-region-EG-giza' }] },
    })
  })
})
