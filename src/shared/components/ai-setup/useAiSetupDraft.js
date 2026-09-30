import { useCallback, useState } from 'react'
import { getAiSetupStorageKey, normalizeAiSetup } from './aiSetupModel'

function readDraft(scopeKey, capabilityIds) {
  try {
    const raw = window.localStorage.getItem(getAiSetupStorageKey(scopeKey))
    return normalizeAiSetup(raw ? JSON.parse(raw) : {}, capabilityIds)
  } catch {
    return normalizeAiSetup({}, capabilityIds)
  }
}

/**
 * Browser-only persistence used while no AI settings API exists. Once `features/ai` ships an API,
 * pages pass `onSave` to AiSetupPage and this hook is no longer used for them.
 */
export function useAiSetupDraft(scopeKey, capabilityIds = []) {
  const [savedValues, setSavedValues] = useState(() => readDraft(scopeKey, capabilityIds))

  const saveDraft = useCallback((values) => {
    const normalized = normalizeAiSetup(values, capabilityIds)
    try {
      window.localStorage.setItem(getAiSetupStorageKey(scopeKey), JSON.stringify(normalized))
    } catch {
      // Storage can be blocked (private mode); keep the in-memory copy.
    }
    setSavedValues(normalized)
    return normalized
  }, [capabilityIds, scopeKey])

  return { savedValues, saveDraft }
}
