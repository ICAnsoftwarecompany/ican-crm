import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { createInitialWizardState } from './initialWizardState'
import { WIZARD_ACTIONS, wizardReducer } from './wizardReducer'
import { clearWizardDraft, loadWizardDraft, saveWizardDraft } from './wizardLocalStorage'

const AUTOSAVE_DELAY_MS = 800

/**
 * Owns the wizard's local state (useReducer, not useState+shallow-merge —
 * the shape has real nesting once Phase 2/3 add adSets[].ads[], which a
 * shallow merge can't safely target). Step components never see `dispatch`;
 * they get a flat object of bound actions instead, matching this app's
 * existing "receive slice + onChange" convention.
 */
export function useCampaignWizardState({ tenantId, platformId, accountId }) {
  const [state, dispatch] = useReducer(wizardReducer, undefined, createInitialWizardState)

  const [draftState, setDraftState] = useState(null)
  const [draftPromptOpen, setDraftPromptOpen] = useState(false)
  const draftCheckedRef = useRef(false)
  const autosaveTimeoutRef = useRef(null)

  // Check for an existing draft exactly once, as soon as the scope
  // (tenant/platform/account) is actually resolved.
  useEffect(() => {
    if (draftCheckedRef.current) return
    if (!tenantId || !platformId || !accountId) return
    draftCheckedRef.current = true
    const existing = loadWizardDraft({ tenantId, platformId, accountId })
    if (existing) {
      setDraftState(existing)
      setDraftPromptOpen(true)
    }
  }, [tenantId, platformId, accountId])

  // Debounced autosave — paused while a not-yet-resolved resume/start-fresh
  // prompt is open, so a fresh session never silently overwrites a draft
  // the user hasn't decided about yet.
  useEffect(() => {
    if (draftPromptOpen) return undefined
    if (!tenantId || !platformId || !accountId) return undefined

    if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current)
    autosaveTimeoutRef.current = setTimeout(() => {
      saveWizardDraft({ tenantId, platformId, accountId }, state)
      dispatch({ type: WIZARD_ACTIONS.SET_LAST_SAVED, timestamp: new Date().toISOString() })
    }, AUTOSAVE_DELAY_MS)

    return () => clearTimeout(autosaveTimeoutRef.current)
  }, [state, tenantId, platformId, accountId, draftPromptOpen])

  const setObjective = useCallback(
    (objective) => dispatch({ type: WIZARD_ACTIONS.SET_OBJECTIVE, objective }),
    []
  )
  const updateCampaign = useCallback(
    (patch) => dispatch({ type: WIZARD_ACTIONS.UPDATE_CAMPAIGN, patch }),
    []
  )
  const setStage = useCallback((stage) => dispatch({ type: WIZARD_ACTIONS.SET_STAGE, stage }), [])
  const setFocusedField = useCallback(
    (fieldId) => dispatch({ type: WIZARD_ACTIONS.SET_FOCUSED_FIELD, fieldId }),
    []
  )

  const saveDraftNow = useCallback(() => {
    if (!tenantId || !platformId || !accountId) return
    saveWizardDraft({ tenantId, platformId, accountId }, state)
    dispatch({ type: WIZARD_ACTIONS.SET_LAST_SAVED, timestamp: new Date().toISOString() })
  }, [state, tenantId, platformId, accountId])

  const resumeDraft = useCallback(() => {
    if (draftState) dispatch({ type: WIZARD_ACTIONS.LOAD_DRAFT, state: draftState })
    setDraftPromptOpen(false)
  }, [draftState])

  const discardDraft = useCallback(() => {
    clearWizardDraft({ tenantId, platformId, accountId })
    dispatch({ type: WIZARD_ACTIONS.CLEAR_DRAFT })
    setDraftPromptOpen(false)
  }, [tenantId, platformId, accountId])

  return {
    state,
    setObjective,
    updateCampaign,
    setStage,
    setFocusedField,
    saveDraftNow,
    draftPromptOpen,
    draftSavedAt: draftState?.meta?.lastSavedAt ?? null,
    resumeDraft,
    discardDraft,
  }
}
