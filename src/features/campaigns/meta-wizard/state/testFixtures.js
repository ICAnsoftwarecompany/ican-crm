import { createInitialWizardState } from './initialWizardState'
import { WIZARD_ACTIONS, wizardReducer } from './wizardReducer'

export const fakeT = (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key)

export const context = {
  accountId: 'act_1',
  currency: 'EGP',
  timezone: 'Africa/Cairo',
  t: fakeT,
  language: 'en',
  pages: [{ page_id: 'page_1', name: 'Page' }],
}

export function run(state, ...actions) {
  return actions.reduce((current, action) => wizardReducer(current, action), state)
}

/** A complete "Leads via Instant Form" wizard, valid except for ads when the ads API is off. */
export function buildValidLeadsState() {
  let state = run(
    createInitialWizardState(),
    { type: WIZARD_ACTIONS.APPLY_PRESET, presetId: 'leads_instant_form' },
    { type: WIZARD_ACTIONS.UPDATE_CAMPAIGN, patch: { name: 'Autumn leads', pageId: 'page_1', budgetAmount: '500' } },
  )
  const adSet = state.adSets[0]
  const ad = adSet.ads[0]
  state = run(state, {
    type: WIZARD_ACTIONS.UPDATE_AD,
    adSetId: adSet.id,
    adId: ad.id,
    patch: {
      media: { id: 'img-1', type: 'image', name: 'a.jpg' },
      primaryTexts: ['Book a free consultation'],
      headlines: ['Free consultation'],
      leadForm: { ...ad.leadForm, mode: 'existing', formId: 'form-1' },
    },
  })
  return state
}
