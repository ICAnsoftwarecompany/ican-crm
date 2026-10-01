import { describe, expect, it } from 'vitest'
import { blockingIssues, stageStatus, validateWizard } from './validateWizard'
import { createInitialWizardState } from '../state/initialWizardState'
import { WIZARD_ACTIONS } from '../state/wizardReducer'
import { buildValidLeadsState, context, run } from '../state/testFixtures'

const codes = (issues) => issues.map((issue) => issue.code)

describe('validateWizard', () => {
  it('blocks an empty wizard on the objective and page', () => {
    const issues = validateWizard(createInitialWizardState(), context)
    expect(codes(blockingIssues(issues))).toEqual(expect.arrayContaining(['objectiveRequired', 'pageRequired', 'budgetRequired']))
  })

  it('accepts a complete leads campaign', () => {
    const issues = validateWizard(buildValidLeadsState(), { ...context, capabilities: { createAds: true } })
    expect(blockingIssues(issues)).toEqual([])
    expect(stageStatus(issues, 'ads')).toBe('complete')
  })

  it('downgrades ad problems to warnings while the ads API is not connected', () => {
    const state = buildValidLeadsState()
    const adSet = state.adSets[0]
    const broken = run(state, { type: WIZARD_ACTIONS.UPDATE_AD, adSetId: adSet.id, adId: adSet.ads[0].id, patch: { media: null } })
    const issue = validateWizard(broken, { ...context, capabilities: { createAds: false } }).find((item) => item.code === 'mediaRequired')
    expect(issue.severity).toBe('warning')
    const strict = validateWizard(broken, { ...context, capabilities: { createAds: true } }).find((item) => item.code === 'mediaRequired')
    expect(strict.severity).toBe('error')
  })

  it('requires a bid amount for cost cap and an end date for lifetime budgets', () => {
    const state = run(buildValidLeadsState(), { type: WIZARD_ACTIONS.UPDATE_CAMPAIGN, patch: { bidStrategy: 'cost_cap', budgetType: 'lifetime' } })
    expect(codes(validateWizard(state, context))).toEqual(expect.arrayContaining(['bidAmountRequired', 'lifetimeEndRequired']))
  })

  it('rejects a start date in the past and an end before the start', () => {
    const base = buildValidLeadsState()
    const state = run(base, { type: WIZARD_ACTIONS.UPDATE_CAMPAIGN, patch: { schedule: { startType: 'scheduled', startTime: '2031-01-10T10:00', endType: 'scheduled', endTime: '2031-01-09T10:00' } } })
    expect(codes(validateWizard(state, context))).toContain('endBeforeStart')
    const past = run(base, { type: WIZARD_ACTIONS.UPDATE_CAMPAIGN, patch: { schedule: { startType: 'scheduled', startTime: '2020-01-10T10:00', endType: 'never', endTime: '' } } })
    expect(codes(validateWizard(past, context))).toContain('startInPast')
  })

  it('needs a WhatsApp number in international format', () => {
    let state = run(buildValidLeadsState(), { type: WIZARD_ACTIONS.APPLY_PRESET, presetId: 'whatsapp_messages' })
    expect(codes(validateWizard(state, context))).toContain('whatsappRequired')
    state = run(state, { type: WIZARD_ACTIONS.UPDATE_AD_SET, adSetId: state.adSets[0].id, patch: { whatsappPhoneNumber: '12' } })
    expect(codes(validateWizard(state, context))).toContain('phoneInvalid')
    state = run(state, { type: WIZARD_ACTIONS.UPDATE_AD_SET, adSetId: state.adSets[0].id, patch: { whatsappPhoneNumber: '01001234567' } })
    expect(codes(validateWizard(state, context))).not.toContain('phoneInvalid')
  })

  it('requires a Pixel and event for website conversions', () => {
    const state = run(buildValidLeadsState(), { type: WIZARD_ACTIONS.APPLY_PRESET, presetId: 'website_sales' })
    const state2 = run(state, { type: WIZARD_ACTIONS.UPDATE_AD_SET, adSetId: state.adSets[0].id, patch: { customEventType: '' } })
    expect(codes(validateWizard(state2, context))).toEqual(expect.arrayContaining(['pixelRequired', 'eventRequired']))
  })

  it('requires at least one included location', () => {
    const state = buildValidLeadsState()
    const adSet = state.adSets[0]
    const next = run(state, { type: WIZARD_ACTIONS.UPDATE_AD_SET, adSetId: adSet.id, patch: { audience: { ...adSet.audience, geo: { ...adSet.audience.geo, locations: [] } } } })
    expect(codes(validateWizard(next, context))).toContain('geoNoLocation')
  })

  it('requires special-category countries', () => {
    const state = run(buildValidLeadsState(), { type: WIZARD_ACTIONS.UPDATE_CAMPAIGN, patch: { specialAdCategories: ['EMPLOYMENT'] } })
    expect(codes(validateWizard(state, context))).toContain('specialCountriesRequired')
  })

  it('validates a new lead form', () => {
    const state = buildValidLeadsState()
    const adSet = state.adSets[0]
    const ad = adSet.ads[0]
    const next = run(state, { type: WIZARD_ACTIONS.UPDATE_AD, adSetId: adSet.id, adId: ad.id, patch: { leadForm: { ...ad.leadForm, mode: 'new' } } })
    expect(codes(validateWizard(next, context))).toEqual(expect.arrayContaining(['leadFormNameRequired', 'leadFormPrivacyRequired']))
  })
})
