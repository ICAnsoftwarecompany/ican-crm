import { describe, expect, it, vi } from 'vitest'
import { buildAdPayload, buildAdSetPayload, buildCampaignPayload } from './buildMetaPayloads'
import { buildPublishPlan, runPublishPlan } from '../publish/publishPlan'
import { WIZARD_ACTIONS } from '../state/wizardReducer'
import { buildValidLeadsState, context, run } from '../state/testFixtures'

describe('Meta payloads', () => {
  it('builds a paused campaign with the account-currency budget and idempotency key', () => {
    const state = buildValidLeadsState()
    const payload = buildCampaignPayload(state, context)
    expect(payload).toMatchObject({
      client_request_id: state.draftId,
      campaign_name: 'Autumn leads',
      objective: 'OUTCOME_LEADS',
      status: 'PAUSED',
      budget_type: 'daily',
      budget_amount: 50000,
      daily_budget: 50000,
      bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
      special_ad_categories: [],
    })
  })

  it('sends the scheduled start and end with the account timezone offset', () => {
    const state = run(buildValidLeadsState(), { type: WIZARD_ACTIONS.UPDATE_CAMPAIGN, patch: { budgetType: 'lifetime', schedule: { startType: 'scheduled', startTime: '2031-01-10T10:00', endType: 'scheduled', endTime: '2031-01-20T10:00' } } })
    const payload = buildCampaignPayload(state, context)
    expect(payload.start_time).toBe('2031-01-10T10:00:00+02:00')
    expect(payload.stop_time).toBe('2031-01-20T10:00:00+02:00')
    expect(payload.lifetime_budget).toBe(50000)
    // Ad sets inherit the campaign schedule.
    expect(buildAdSetPayload(state, state.adSets[0], { ...context, campaignRemoteId: 'c1' }).start_time).toBe('2031-01-10T10:00:00+02:00')
  })

  it('builds an ad set with the full targeting spec and legacy fields', () => {
    const state = buildValidLeadsState()
    const payload = buildAdSetPayload(state, state.adSets[0], { ...context, campaignRemoteId: 'c1' })
    expect(payload).toMatchObject({
      campaign_id: 'c1',
      destination_type: 'ON_AD',
      optimization_goal: 'LEAD_GENERATION',
      countries: ['EG'],
      age_min: 18,
      promoted_object: { page_id: 'page_1' },
      targeting: { geo_locations: { countries: ['EG'], location_types: ['home', 'recent'] }, targeting_automation: { advantage_audience: 1 } },
    })
    expect(payload.daily_budget).toBeUndefined()
  })

  it('builds an ad with the lead form in the call to action', () => {
    const state = buildValidLeadsState()
    const adSet = state.adSets[0]
    const payload = buildAdPayload(state, adSet, adSet.ads[0], { ...context, adSetRemoteId: 's1' })
    expect(payload.creative).toMatchObject({ page_id: 'page_1', call_to_action: { type: 'SIGN_UP', lead_gen_form_id: 'form-1' }, primary_texts: ['Book a free consultation'] })
  })
})

describe('publish plan', () => {
  const api = () => ({
    createCampaign: vi.fn().mockResolvedValue({ data: { campaign_id: 'c1' } }),
    createAdSet: vi.fn().mockResolvedValue({ data: { id: 's1' } }),
    createAd: vi.fn().mockResolvedValue({ data: { id: 'ad1' } }),
    createLeadForm: vi.fn().mockResolvedValue({ data: { id: 'f1' } }),
  })

  it('keeps ads pending while the ads API is disabled', async () => {
    const state = buildValidLeadsState()
    const client = api()
    const result = await runPublishPlan({ state, api: client, context, capabilities: { createAds: false } })
    expect(result).toMatchObject({ status: 'partial', campaignRemoteId: 'c1', adSetRemoteIds: { [state.adSets[0].id]: 's1' }, pendingAdIds: [state.adSets[0].ads[0].id] })
    expect(client.createAd).not.toHaveBeenCalled()
  })

  it('resumes after a failure without re-creating the campaign', async () => {
    const state = buildValidLeadsState()
    const client = api()
    client.createAdSet.mockRejectedValueOnce({ response: { status: 422, data: { message: 'Invalid targeting' } } })
    const failed = await runPublishPlan({ state, api: client, context, capabilities: { createAds: true } })
    expect(failed).toMatchObject({ status: 'failed', failedStepId: `adset:${state.adSets[0].id}`, campaignRemoteId: 'c1', lastError: { message: 'Invalid targeting', status: 422 } })

    const retried = await runPublishPlan({ state: { ...state, publish: failed }, api: client, context, capabilities: { createAds: true } })
    expect(retried.status).toBe('done')
    expect(client.createCampaign).toHaveBeenCalledTimes(1)
    expect(client.createAd).toHaveBeenCalledTimes(1)
    expect(buildPublishPlan({ ...state, publish: retried }, { createAds: true }).every((step) => step.done)).toBe(true)
  })

  it('creates a new lead form before the ad that uses it', async () => {
    const state = buildValidLeadsState()
    const adSet = state.adSets[0]
    const ad = adSet.ads[0]
    const withNewForm = run(state, { type: WIZARD_ACTIONS.UPDATE_AD, adSetId: adSet.id, adId: ad.id, patch: { leadForm: { ...ad.leadForm, mode: 'new', draft: { ...ad.leadForm.draft, name: 'Form', privacyPolicyUrl: 'https://example.com/privacy' } } } })
    const client = api()
    await runPublishPlan({ state: withNewForm, api: client, context, capabilities: { createAds: true, createLeadForms: true } })
    expect(client.createLeadForm).toHaveBeenCalledTimes(1)
    expect(client.createAd.mock.calls[0][0].creative.call_to_action.lead_gen_form_id).toBe('f1')
  })
})
