import { describe, expect, it } from 'vitest'
import { formatDate, normalizeCampaignDate } from './campaignFormatters'

describe('campaign date formatting', () => {
  it('converts a Unix timestamp in seconds to milliseconds', () => {
    expect(normalizeCampaignDate('1789948800')).toBe(1789948800000)
  })

  it('keeps a Unix timestamp already expressed in milliseconds', () => {
    expect(normalizeCampaignDate(1789948800000)).toBe(1789948800000)
  })

  it('does not display zero or an epoch placeholder as a real campaign date', () => {
    expect(formatDate(0, 'ar')).toBe('—')
    expect(formatDate('1970-01-01T00:00:00Z', 'ar')).toBe('—')
  })
})
