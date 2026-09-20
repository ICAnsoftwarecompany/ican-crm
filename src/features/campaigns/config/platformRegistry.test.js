import { describe, expect, it } from 'vitest'
import { CAMPAIGN_CAPABILITIES } from './campaignCapabilities'
import { getCampaignPlatform, getVisibleCampaignPlatforms, platformHasCapability, userHasCampaignPermission } from './platformRegistry'

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
