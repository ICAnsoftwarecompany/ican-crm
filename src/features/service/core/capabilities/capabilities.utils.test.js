import { describe, expect, it } from 'vitest'
import { isFeatureEnabled, normalizeManifest, resolveTerm } from './capabilities.utils'

const t = (key, options) => {
  const dictionary = {
    'service.terms.ticket.one': 'Ticket',
    'service.terms.case.one': 'Case',
    'service.terms.customer.one': 'Customer',
  }
  return dictionary[key] ?? options?.defaultValue ?? key
}

describe('normalizeManifest', () => {
  it('returns an empty manifest for invalid input', () => {
    expect(normalizeManifest(null)).toEqual({ models: [], features: [], terminology: {}, permissions: [] })
  })

  it('keeps valid fields and drops malformed ones', () => {
    const manifest = normalizeManifest({ models: ['B'], features: 'x', terminology: { case: 'ticket' } })
    expect(manifest.models).toEqual(['B'])
    expect(manifest.features).toEqual([])
    expect(manifest.terminology).toEqual({ case: 'ticket' })
  })
})

describe('isFeatureEnabled', () => {
  it('checks the features list', () => {
    expect(isFeatureEnabled({ features: ['cases'] }, 'cases')).toBe(true)
    expect(isFeatureEnabled({ features: ['cases'] }, 'assets')).toBe(false)
    expect(isFeatureEnabled(undefined, 'cases')).toBe(false)
  })
})

describe('resolveTerm', () => {
  it('uses a localized tenant label for the active language', () => {
    const terminology = { record: { ar: 'حجز', en: 'Booking' } }
    expect(resolveTerm({ terminology, entity: 'record', language: 'en', t })).toBe('Booking')
    expect(resolveTerm({ terminology, entity: 'record', language: 'ar', t })).toBe('حجز')
  })

  it('translates a term key', () => {
    expect(resolveTerm({ terminology: { case: 'ticket' }, entity: 'case', language: 'en', t })).toBe('Ticket')
  })

  it('falls back to the entity default', () => {
    expect(resolveTerm({ terminology: {}, entity: 'customer', language: 'en', t })).toBe('Customer')
    expect(resolveTerm({ terminology: { case: 'unknownTerm' }, entity: 'case', language: 'en', t })).toBe('Case')
  })
})
