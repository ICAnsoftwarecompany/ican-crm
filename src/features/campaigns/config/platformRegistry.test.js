import { describe, expect, it, vi } from 'vitest'
import { CAMPAIGN_CAPABILITIES } from './campaignCapabilities'
import { getCampaignPlatform, getVisibleCampaignPlatforms, platformHasCapability, userHasCampaignPermission } from './platformRegistry'

// The registry pulls in campaign providers -> httpClient, which resolves the
// tenant API URL and api password at import time; these tests make no requests.
vi.mock('../../../services/httpClient', () => ({ default: {} }))

describe('campaign platform registry', () => {
  it('does not invent package restrictions when modules are unavailable', () => {
    expect(getVisibleCampaignPlatforms(undefined).map((platform) => platform.id)).toEqual(['meta', 'google', 'tiktok', 'snapchat'])
  })

  it('filters platforms when the backend supplies package modules', () => {
    expect(getVisibleCampaignPlatforms(['campaigns.meta', 'tiktok-ads']).map((platform) => platform.id)).toEqual(['meta', 'tiktok'])
  })

  it('resolves capabilities and permissions independently', () => {
    const meta = getCampaignPlatform('meta')
    expect(platformHasCapability(meta, CAMPAIGN_CAPABILITIES.AD_SETS)).toBe(true)
    expect(userHasCampaignPermission('campaign.create', undefined)).toBe(true)
    expect(userHasCampaignPermission('campaign.create', ['campaign.view'])).toBe(false)
  })
})
