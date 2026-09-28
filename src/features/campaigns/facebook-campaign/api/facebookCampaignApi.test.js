import { describe, expect, it, vi } from 'vitest'
import { normalizeFacebookAdAccountId } from './facebookCampaignApi'

// httpClient resolves the tenant API URL and api password at import time;
// these pure-function tests make no requests, so stub it out.
vi.mock('../../../../services/httpClient', () => ({ default: {} }))

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
