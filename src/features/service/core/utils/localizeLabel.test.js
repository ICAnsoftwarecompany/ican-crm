import { describe, expect, it } from 'vitest'
import { localizeLabel } from './localizeLabel'

describe('localizeLabel', () => {
  it('returns strings unchanged', () => {
    expect(localizeLabel('Billing', 'ar')).toBe('Billing')
  })

  it('picks the active language, then en, then ar', () => {
    const label = { ar: 'فواتير', en: 'Billing' }
    expect(localizeLabel(label, 'ar')).toBe('فواتير')
    expect(localizeLabel(label, 'en-US')).toBe('Billing')
    expect(localizeLabel({ ar: 'فواتير' }, 'en')).toBe('فواتير')
  })

  it('falls back for empty values', () => {
    expect(localizeLabel(null, 'en', '-')).toBe('-')
    expect(localizeLabel({}, 'en', '-')).toBe('-')
  })
})
