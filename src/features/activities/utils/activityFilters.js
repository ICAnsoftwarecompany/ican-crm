import { ACTIVITY_VIEW_MODES } from '../constants/activityConstants'

export const DEFAULT_ACTIVITY_FILTERS = {
  type: 'all',
  view: ACTIVITY_VIEW_MODES.list,
  search: '',
  status: 'all',
  priority: 'all',
  assigned_to: '',
  team_id: '',
  date_from: '',
  date_to: '',
}

export function normalizeActivityFilters(filters = {}) {
  return {
    ...DEFAULT_ACTIVITY_FILTERS,
    ...filters,
  }
}

export function filtersToApiParams(filters = {}) {
  const normalized = normalizeActivityFilters(filters)
  const params = {}

  Object.entries(normalized).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'all') return
    if (key === 'view') return
    params[key] = value
  })

  return params
}
