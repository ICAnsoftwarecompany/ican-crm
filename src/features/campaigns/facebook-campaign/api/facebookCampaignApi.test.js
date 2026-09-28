import { describe, expect, it } from 'vitest'
import { normalizeFacebookAdAccountId } from './facebookCampaignApi'

describe('normalizeFacebookAdAccountId', () => {
  it('adds the Meta act_ prefix to a numeric account id', () => {
    expect(normalizeFacebookAdAccountId('968599310891700')).toBe('act_968599310891700')
  })

  it('does not duplicate an existing act_ prefix', () => {
    expect(normalizeFacebookAdAccountId('act_968599310891700')).toBe('act_968599310891700')
  })

  it('trims the account id before normalizing it', () => {
    expect(normalizeFacebookAdAccountId(' 968599310891700 ')).toBe('act_968599310891700')
  })
})
