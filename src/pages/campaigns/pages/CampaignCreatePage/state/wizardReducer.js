import { createInitialWizardState } from './initialWizardState'

export const WIZARD_ACTIONS = {
  SET_OBJECTIVE: 'SET_OBJECTIVE',
  UPDATE_CAMPAIGN: 'UPDATE_CAMPAIGN',
  SET_STAGE: 'SET_STAGE',
  SET_FOCUSED_FIELD: 'SET_FOCUSED_FIELD',
  SET_LAST_SAVED: 'SET_LAST_SAVED',
  LOAD_DRAFT: 'LOAD_DRAFT',
  CLEAR_DRAFT: 'CLEAR_DRAFT',
}

// Only the actions Phase 1's UI actually dispatches are implemented here.
// Ad-set/ad mutation actions (addAdSet, updateAd, ...) belong to Phase 2/3
// once there are step components that call them — no dead cases.
export function wizardReducer(state, action) {
  switch (action.type) {
    case WIZARD_ACTIONS.SET_OBJECTIVE:
      return { ...state, objective: action.objective }

    case WIZARD_ACTIONS.UPDATE_CAMPAIGN:
      return { ...state, campaign: { ...state.campaign, ...action.patch } }

    case WIZARD_ACTIONS.SET_STAGE:
      return { ...state, meta: { ...state.meta, currentStage: action.stage } }

    case WIZARD_ACTIONS.SET_FOCUSED_FIELD:
      return { ...state, meta: { ...state.meta, focusedField: action.fieldId } }

    case WIZARD_ACTIONS.SET_LAST_SAVED:
      return { ...state, meta: { ...state.meta, lastSavedAt: action.timestamp } }

    case WIZARD_ACTIONS.LOAD_DRAFT:
      return action.state

    case WIZARD_ACTIONS.CLEAR_DRAFT:
      return createInitialWizardState()

    default:
      return state
  }
}
