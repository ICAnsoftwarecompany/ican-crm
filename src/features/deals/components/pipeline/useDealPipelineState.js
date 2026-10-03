import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLocalStorage } from '../../../../shared/components/data-table/hooks/useLocalStorage'

export const DEAL_VIEW_MODES = ['kanban', 'table']

/**
 * Pipeline page state kept in the URL (shareable, back button works): `view`, `status`, `owner`, `q`,
 * `filter` (unassigned | stale), `lanes` (team), `add` (opens the add-leads dialog). The view also has a
 * remembered default per browser (`deal-workspace:view-mode`, same key as before the 2026-10-03 rebuild).
 */
export function useDealPipelineState() {
  const [params, setParams] = useSearchParams()
  const [preferredView, setPreferredView] = useLocalStorage('deal-workspace:view-mode', 'kanban')

  const state = useMemo(() => {
    const view = params.get('view')
    return {
      view: DEAL_VIEW_MODES.includes(view) ? view : (DEAL_VIEW_MODES.includes(preferredView) ? preferredView : 'kanban'),
      status: params.get('status') || 'open',
      ownerId: params.get('owner') || '',
      search: params.get('q') || '',
      filter: params.get('filter') || '',
      lanes: params.get('lanes') === 'team',
      addOpen: params.get('add') === '1',
    }
  }, [params, preferredView])

  const setParam = useCallback((key, value) => {
    setParams((current) => {
      const next = new URLSearchParams(current)
      if (value === '' || value === null || value === undefined || value === false) next.delete(key)
      else next.set(key, value === true ? '1' : String(value))
      return next
    }, { replace: true })
  }, [setParams])

  const setView = useCallback((view) => {
    setPreferredView(view)
    setParam('view', view)
  }, [setParam, setPreferredView])

  return { ...state, setParam, setView }
}
