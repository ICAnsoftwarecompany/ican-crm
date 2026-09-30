import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { createInitialWizardState } from '../state/initialWizardState'
import { WIZARD_ACTIONS, wizardReducer } from '../state/wizardReducer'
import { deleteDraft as removeDraft, duplicateDraft as copyDraft, hasMeaningfulContent, listDrafts, loadDraft, saveDraft } from '../state/wizardDraftsStore'

const AUTOSAVE_DELAY_MS = 900
const DRAFT_PARAM = 'draft'

/**
 * Owns the wizard state and its drafts.
 *
 * - The open draft lives in the URL (`?draft=<id>`) so it survives reloads
 *   and can be bookmarked.
 * - Autosave only runs after a real edit (`meta.dirty`), and never saves an
 *   empty wizard — opening the page and leaving creates no draft.
 */
export function useCampaignWizard({ tenantId, platformId, accountId, copySuffix }) {
  const scope = useMemo(() => ({ tenantId, platformId, accountId }), [tenantId, platformId, accountId])
  const scopeReady = Boolean(tenantId && platformId && accountId)
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedDraftId = searchParams.get(DRAFT_PARAM)
  const [state, dispatch] = useReducer(wizardReducer, undefined, () => createInitialWizardState())
  const [drafts, setDrafts] = useState([])
  const [saveStatus, setSaveStatus] = useState('idle') // idle | saving | saved | failed
  const stateRef = useRef(state)
  stateRef.current = state

  const refreshDrafts = useCallback(() => {
    if (scopeReady) setDrafts(listDrafts(scope))
  }, [scope, scopeReady])

  const persist = useCallback((next) => {
    if (!scopeReady || !hasMeaningfulContent(next)) return false
    const timestamp = new Date().toISOString()
    const ok = saveDraft(scope, { ...next, meta: { ...next.meta, lastSavedAt: timestamp, dirty: false } })
    if (ok) dispatch({ type: WIZARD_ACTIONS.SET_LAST_SAVED, timestamp })
    setSaveStatus(ok ? 'saved' : 'failed')
    refreshDrafts()
    return ok
  }, [scope, scopeReady, refreshDrafts])

  const setDraftParam = useCallback((draftId) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (draftId) next.set(DRAFT_PARAM, draftId)
      else next.delete(DRAFT_PARAM)
      return next
    }, { replace: true })
  }, [setSearchParams])

  // Load the draft named in the URL (or start fresh) whenever it changes.
  useEffect(() => {
    if (!scopeReady) return
    refreshDrafts()
    if (requestedDraftId && requestedDraftId === stateRef.current.draftId) return
    if (requestedDraftId) {
      const draft = loadDraft(scope, requestedDraftId)
      if (draft) {
        dispatch({ type: WIZARD_ACTIONS.LOAD_DRAFT, state: draft })
        return
      }
      setDraftParam(null)
    }
    dispatch({ type: WIZARD_ACTIONS.CLEAR_DRAFT })
  }, [requestedDraftId, scope, scopeReady, refreshDrafts, setDraftParam])

  // Debounced autosave after real edits.
  useEffect(() => {
    if (!state.meta.dirty || !scopeReady || !hasMeaningfulContent(state)) return undefined
    setSaveStatus('saving')
    const timer = setTimeout(() => {
      if (persist(stateRef.current) && requestedDraftId !== stateRef.current.draftId) setDraftParam(stateRef.current.draftId)
    }, AUTOSAVE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [state, scopeReady, persist, requestedDraftId, setDraftParam])

  // Don't lose the last keystrokes when the tab closes.
  useEffect(() => {
    const flush = () => {
      if (stateRef.current.meta.dirty) persist(stateRef.current)
    }
    window.addEventListener('beforeunload', flush)
    return () => {
      window.removeEventListener('beforeunload', flush)
      flush()
    }
  }, [persist])

  const bind = useCallback((type, map) => (...args) => dispatch({ type, ...map(...args) }), [])
  const actions = useMemo(() => ({
    setObjective: bind(WIZARD_ACTIONS.SET_OBJECTIVE, (objective) => ({ objective })),
    applyPreset: bind(WIZARD_ACTIONS.APPLY_PRESET, (presetId) => ({ presetId })),
    updateCampaign: bind(WIZARD_ACTIONS.UPDATE_CAMPAIGN, (patch) => ({ patch })),
    updateAdSet: bind(WIZARD_ACTIONS.UPDATE_AD_SET, (adSetId, patch) => ({ adSetId, patch })),
    addAdSet: bind(WIZARD_ACTIONS.ADD_AD_SET, () => ({})),
    duplicateAdSet: bind(WIZARD_ACTIONS.DUPLICATE_AD_SET, (adSetId) => ({ adSetId })),
    removeAdSet: bind(WIZARD_ACTIONS.REMOVE_AD_SET, (adSetId) => ({ adSetId })),
    setActiveAdSet: bind(WIZARD_ACTIONS.SET_ACTIVE_AD_SET, (adSetId) => ({ adSetId })),
    addAd: bind(WIZARD_ACTIONS.ADD_AD, (adSetId) => ({ adSetId })),
    duplicateAd: bind(WIZARD_ACTIONS.DUPLICATE_AD, (adSetId, adId) => ({ adSetId, adId })),
    removeAd: bind(WIZARD_ACTIONS.REMOVE_AD, (adSetId, adId) => ({ adSetId, adId })),
    updateAd: bind(WIZARD_ACTIONS.UPDATE_AD, (adSetId, adId, patch) => ({ adSetId, adId, patch })),
    setActiveAd: bind(WIZARD_ACTIONS.SET_ACTIVE_AD, (adSetId, adId) => ({ adSetId, adId })),
    updateLeadRouting: bind(WIZARD_ACTIONS.UPDATE_LEAD_ROUTING, (patch) => ({ patch })),
    setStage: bind(WIZARD_ACTIONS.SET_STAGE, (stage) => ({ stage })),
    setFocusedField: bind(WIZARD_ACTIONS.SET_FOCUSED_FIELD, (fieldId) => ({ fieldId })),
    touchField: bind(WIZARD_ACTIONS.TOUCH_FIELD, (path) => ({ path })),
    showAllErrors: bind(WIZARD_ACTIONS.SHOW_ALL_ERRORS, (value = true) => ({ value })),
    updatePublish: bind(WIZARD_ACTIONS.UPDATE_PUBLISH, (patch) => ({ patch })),
    resetPublish: bind(WIZARD_ACTIONS.RESET_PUBLISH, () => ({})),
  }), [bind])

  const saveNow = useCallback(() => {
    const ok = persist(stateRef.current)
    if (ok && requestedDraftId !== stateRef.current.draftId) setDraftParam(stateRef.current.draftId)
    return ok
  }, [persist, requestedDraftId, setDraftParam])

  const openDraft = useCallback((draftId) => {
    if (stateRef.current.meta.dirty) persist(stateRef.current)
    setDraftParam(draftId)
  }, [persist, setDraftParam])

  const newDraft = useCallback(() => {
    if (stateRef.current.meta.dirty) persist(stateRef.current)
    setDraftParam(null)
    dispatch({ type: WIZARD_ACTIONS.CLEAR_DRAFT })
  }, [persist, setDraftParam])

  const deleteDraft = useCallback((draftId) => {
    removeDraft(scope, draftId)
    refreshDrafts()
    if (draftId === stateRef.current.draftId) {
      setDraftParam(null)
      dispatch({ type: WIZARD_ACTIONS.CLEAR_DRAFT })
    }
  }, [scope, refreshDrafts, setDraftParam])

  const duplicateDraft = useCallback((draftId) => {
    if (draftId === stateRef.current.draftId && stateRef.current.meta.dirty) persist(stateRef.current)
    const copy = copyDraft(scope, draftId, { copySuffix })
    refreshDrafts()
    if (copy) setDraftParam(copy.draftId)
  }, [scope, copySuffix, persist, refreshDrafts, setDraftParam])

  return { state, dispatch, actions, drafts, saveStatus, saveNow, persist, openDraft, newDraft, deleteDraft, duplicateDraft, refreshDrafts }
}
