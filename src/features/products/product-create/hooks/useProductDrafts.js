import { useCallback, useState } from 'react'
import { draftsForKind, removeDraft, upsertDraft } from '../utils/productDrafts'

const KEY = 'ican:catalog:product-drafts'

function readAll() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(list) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    // Storage blocked or full: the draft lives only in this tab.
  }
}

/** Product / service drafts kept in this browser (2026-10-15). See utils/productDrafts.js. */
export function useProductDrafts(kind = 'product') {
  const [all, setAll] = useState(readAll)
  // Written to storage right away (not inside a state updater): "open the full item type page" saves and navigates
  // in the same tick, and the page must find the draft when it comes back.
  const change = useCallback((next) => {
    const value = next(readAll())
    writeAll(value)
    setAll(value)
  }, [])

  return {
    drafts: draftsForKind(all, kind),
    get: useCallback((id) => readAll().find((item) => item.id === id) || null, []),
    save: useCallback((draft) => change((current) => upsertDraft(current, draft)), [change]),
    remove: useCallback((id) => change((current) => removeDraft(current, id)), [change]),
  }
}
