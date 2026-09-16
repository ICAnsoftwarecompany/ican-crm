import { useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLocalStorage } from '../../../shared/components/data-table/hooks/useLocalStorage'

import { DEFAULT_ACTIVITY_FILTERS, filtersToApiParams, normalizeActivityFilters } from '../utils/activityFilters'

export function useActivityFilters(defaultType = 'all', defaultView = DEFAULT_ACTIVITY_FILTERS.view) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [persistedType, setPersistedType] = useLocalStorage('activities-last-type', defaultType || 'all')
  const [persistedView, setPersistedView] = useLocalStorage('activities-last-view', defaultView || DEFAULT_ACTIVITY_FILTERS.view)

  const filters = useMemo(() => {
    const raw = {
      ...DEFAULT_ACTIVITY_FILTERS,
      type: searchParams.get('type') || persistedType || defaultType || 'all',
      view: searchParams.get('view') || persistedView || defaultView || DEFAULT_ACTIVITY_FILTERS.view,
      search: searchParams.get('search') || '',
      status: searchParams.get('status') || 'scheduled',
      priority: searchParams.get('priority') || 'all',
      assigned_to: searchParams.get('assigned_to') || '',
      team_id: searchParams.get('team_id') || '',
      date_from: searchParams.get('date_from') || '',
      date_to: searchParams.get('date_to') || '',
    }

    return normalizeActivityFilters(raw)
  }, [defaultType, defaultView, persistedType, persistedView, searchParams])

  useEffect(() => {
    setPersistedType(filters.type || 'all')
  }, [filters.type, setPersistedType])

  useEffect(() => {
    setPersistedView(filters.view || DEFAULT_ACTIVITY_FILTERS.view)
  }, [filters.view, setPersistedView])

  const updateFilters = useCallback((patch) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      Object.entries(patch).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '' || value === 'all') {
          next.delete(key)
        } else {
          next.set(key, value)
        }
      })
      return next
    })
  }, [setSearchParams])

  const clearFilters = useCallback(() => {
    setSearchParams((current) => {
      const view = current.get('view')
      const type = defaultType && defaultType !== 'all' ? defaultType : current.get('type')
      const next = new URLSearchParams()
      if (view) next.set('view', view)
      if (type && type !== 'all') next.set('type', type)
      return next
    })
  }, [defaultType, setSearchParams])

  return {
    filters,
    apiParams: filtersToApiParams(filters),
    updateFilters,
    clearFilters,
    setType: (type) => updateFilters({ type }),
    setViewMode: (view) => updateFilters({ view }),
  }
}
