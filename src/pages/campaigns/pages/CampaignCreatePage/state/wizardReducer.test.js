import { describe, expect, it } from 'vitest'
import { createInitialWizardState } from './initialWizardState'
import { WIZARD_ACTIONS, wizardReducer } from './wizardReducer'

describe('wizardReducer', () => {
  it('sets the objective without touching other state', () => {
    const state = createInitialWizardState()
    const next = wizardReducer(state, { type: WIZARD_ACTIONS.SET_OBJECTIVE, objective: 'OUTCOME_SALES' })

    expect(next.objective).toBe('OUTCOME_SALES')
    expect(next.campaign).toBe(state.campaign)
    expect(next.adSets).toBe(state.adSets)
  })

  it('merges a campaign patch without dropping untouched fields', () => {
    const state = createInitialWizardState()
    const next = wizardReducer(state, {
      type: WIZARD_ACTIONS.UPDATE_CAMPAIGN,
      patch: { name: 'My campaign' },
    })

    expect(next.campaign.name).toBe('My campaign')
    expect(next.campaign.budgetLevel).toBe('campaign')
  })

  it('tracks the active stage', () => {
    const state = createInitialWizardState()
    const next = wizardReducer(state, { type: WIZARD_ACTIONS.SET_STAGE, stage: 'review' })

    expect(next.meta.currentStage).toBe('review')
  })

  it('tracks the focused field for the guide panel', () => {
    const state = createInitialWizardState()
    const next = wizardReducer(state, {
      type: WIZARD_ACTIONS.SET_FOCUSED_FIELD,
      fieldId: 'objective.OUTCOME_LEADS',
    })

    expect(next.meta.focusedField).toBe('objective.OUTCOME_LEADS')
  })

  it('records the last-saved timestamp', () => {
    const state = createInitialWizardState()
    const next = wizardReducer(state, { type: WIZARD_ACTIONS.SET_LAST_SAVED, timestamp: '2026-09-21T10:00:00.000Z' })

    expect(next.meta.lastSavedAt).toBe('2026-09-21T10:00:00.000Z')
  })

  it('replaces the whole state when loading a draft', () => {
    const state = createInitialWizardState()
    const draft = { ...createInitialWizardState(), objective: 'OUTCOME_TRAFFIC' }
    const next = wizardReducer(state, { type: WIZARD_ACTIONS.LOAD_DRAFT, state: draft })

    expect(next).toBe(draft)
  })

  it('resets to a fresh default state when clearing the draft', () => {
    const state = wizardReducer(createInitialWizardState(), {
      type: WIZARD_ACTIONS.UPDATE_CAMPAIGN,
      patch: { name: 'Should be cleared' },
    })
    const next = wizardReducer(state, { type: WIZARD_ACTIONS.CLEAR_DRAFT })

    expect(next.campaign.name).toBe('')
    expect(next.objective).toBe('OUTCOME_LEADS')
  })

  it('returns the same state for an unknown action', () => {
    const state = createInitialWizardState()
    const next = wizardReducer(state, { type: 'NOT_A_REAL_ACTION' })

    expect(next).toBe(state)
  })
})
