import { describe, expect, it } from 'vitest'
import { createInitialWizardState } from './initialWizardState'
import { WIZARD_ACTIONS, wizardReducer } from './wizardReducer'
import { run } from './testFixtures'

describe('wizardReducer', () => {
  it('applies a preset: objective, destination, goal and a valid CTA', () => {
    const state = run(createInitialWizardState(), { type: WIZARD_ACTIONS.APPLY_PRESET, presetId: 'whatsapp_messages' })
    expect(state.objective).toBe('OUTCOME_ENGAGEMENT')
    expect(state.adSets[0]).toMatchObject({ conversionLocation: 'whatsapp', performanceGoal: 'CONVERSATIONS' })
    expect(state.adSets[0].ads[0].callToAction).toBe('WHATSAPP_MESSAGE')
    expect(state.meta.dirty).toBe(true)
  })

  it('resets destinations that the new objective does not support', () => {
    const leads = run(createInitialWizardState(), { type: WIZARD_ACTIONS.APPLY_PRESET, presetId: 'leads_instant_form' })
    const traffic = run(leads, { type: WIZARD_ACTIONS.SET_OBJECTIVE, objective: 'OUTCOME_TRAFFIC' })
    expect(traffic.adSets[0].conversionLocation).toBe('')
    expect(traffic.presetId).toBe('')
  })

  it('selects the automatic awareness destination', () => {
    const state = run(createInitialWizardState(), { type: WIZARD_ACTIONS.SET_OBJECTIVE, objective: 'OUTCOME_AWARENESS' })
    expect(state.adSets[0]).toMatchObject({ conversionLocation: 'default', performanceGoal: 'REACH' })
  })

  it('forces an end date for lifetime budgets and clears stale end dates', () => {
    let state = run(createInitialWizardState(), { type: WIZARD_ACTIONS.UPDATE_CAMPAIGN, patch: { budgetType: 'lifetime' } })
    expect(state.campaign.schedule.endType).toBe('scheduled')
    state = run(state,
      { type: WIZARD_ACTIONS.UPDATE_CAMPAIGN, patch: { budgetType: 'daily', schedule: { ...state.campaign.schedule, endTime: '2030-01-01T10:00' } } },
      { type: WIZARD_ACTIONS.UPDATE_CAMPAIGN, patch: { schedule: { ...state.campaign.schedule, endType: 'never', endTime: '2030-01-01T10:00' } } },
    )
    expect(state.campaign.schedule.endTime).toBe('')
  })

  it('drops the bid amount when switching back to highest volume', () => {
    const state = run(createInitialWizardState(),
      { type: WIZARD_ACTIONS.UPDATE_CAMPAIGN, patch: { bidStrategy: 'cost_cap', bidAmount: '20' } },
      { type: WIZARD_ACTIONS.UPDATE_CAMPAIGN, patch: { bidStrategy: 'highest_volume' } },
    )
    expect(state.campaign.bidAmount).toBe('')
  })

  it('locks age and gender for restricted special ad categories', () => {
    const state = run(createInitialWizardState(),
      { type: WIZARD_ACTIONS.UPDATE_AD_SET, adSetId: createInitialWizardState().adSets[0].id, patch: {} },
    )
    const adSetId = state.adSets[0].id
    const next = run(state,
      { type: WIZARD_ACTIONS.UPDATE_AD_SET, adSetId, patch: { audience: { ...state.adSets[0].audience, ageMin: 25, genders: 'female' } } },
      { type: WIZARD_ACTIONS.UPDATE_CAMPAIGN, patch: { specialAdCategories: ['HOUSING'] } },
    )
    expect(next.adSets[0].audience).toMatchObject({ ageMin: 18, ageMax: 65, genders: 'all' })
  })

  it('adds, duplicates and removes ad sets and ads', () => {
    let state = run(createInitialWizardState(), { type: WIZARD_ACTIONS.APPLY_PRESET, presetId: 'leads_instant_form' })
    const first = state.adSets[0]
    state = run(state, { type: WIZARD_ACTIONS.DUPLICATE_AD_SET, adSetId: first.id })
    expect(state.adSets).toHaveLength(2)
    expect(state.adSets[1].id).not.toBe(first.id)
    expect(state.adSets[1].ads[0].id).not.toBe(first.ads[0].id)
    expect(state.meta.activeAdSetId).toBe(state.adSets[1].id)

    state = run(state, { type: WIZARD_ACTIONS.ADD_AD, adSetId: first.id })
    expect(state.adSets[0].ads).toHaveLength(2)
    state = run(state, { type: WIZARD_ACTIONS.REMOVE_AD, adSetId: first.id, adId: state.adSets[0].ads[1].id })
    expect(state.adSets[0].ads).toHaveLength(1)

    state = run(state, { type: WIZARD_ACTIONS.REMOVE_AD_SET, adSetId: state.adSets[1].id })
    expect(state.adSets).toHaveLength(1)
    // The last ad set / ad can't be removed.
    expect(run(state, { type: WIZARD_ACTIONS.REMOVE_AD_SET, adSetId: first.id }).adSets).toHaveLength(1)
  })

  it('does not mark UI-only actions as unsaved changes', () => {
    const state = run(createInitialWizardState(), { type: WIZARD_ACTIONS.SET_STAGE, stage: 'review' }, { type: WIZARD_ACTIONS.SET_FOCUSED_FIELD, fieldId: 'x' })
    expect(state.meta.dirty).toBe(false)
    expect(state.meta.visitedStages).toContain('review')
  })

  it('clears the dirty flag when saved', () => {
    const state = run(createInitialWizardState(), { type: WIZARD_ACTIONS.UPDATE_CAMPAIGN, patch: { name: 'x' } }, { type: WIZARD_ACTIONS.SET_LAST_SAVED, timestamp: '2026-10-01T00:00:00.000Z' })
    expect(state.meta).toMatchObject({ dirty: false, lastSavedAt: '2026-10-01T00:00:00.000Z' })
  })

  it('returns the same state for an unknown action', () => {
    const state = createInitialWizardState()
    expect(wizardReducer(state, { type: 'NOPE' })).toBe(state)
  })
})
