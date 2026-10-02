/**
 * Filters for the /tasks page (smart view + status + kind + linked-to + search). Pure — tested in
 * taskFilters.test.js.
 */
import { isSameDay } from '../../../shared/utils/dateTime'
import { getTaskTaskable } from '../constants/taskableTypes'
import { getTaskDateTime, isTaskOverdue, taskMatchesQuery } from './taskMeta'

export const SMART_VIEWS = ['all', 'today', 'overdue', 'in_progress']

export function matchesSmartView(task, view, now = new Date()) {
  const status = String(task?.status || '').toLowerCase()
  if (view === 'today') {
    const due = getTaskDateTime(task)
    return Boolean(due) && isSameDay(due, now)
  }
  if (view === 'overdue') return isTaskOverdue(task, now)
  if (view === 'in_progress') return status === 'in_progress'
  return true
}

/** `link`: 'all' | 'personal' | a taskable alias. */
export function filterTasks(tasks = [], { view = 'all', status = 'all', type = 'all', link = 'all', search = '' } = {}, now = new Date()) {
  return (Array.isArray(tasks) ? tasks : []).filter((task) => {
    if (!taskMatchesQuery(task, search)) return false
    if (status !== 'all' && String(task?.status || '').toLowerCase() !== status) return false
    if (type !== 'all' && String(task?.type || '').toLowerCase() !== type) return false
    if (link !== 'all') {
      const taskLink = getTaskTaskable(task)
      if (link === 'personal' ? taskLink : taskLink?.type !== link) return false
    }
    return matchesSmartView(task, view, now)
  })
}

/** Counts for the sidebar smart views. */
export function countSmartViews(tasks = [], now = new Date()) {
  const list = Array.isArray(tasks) ? tasks : []
  return {
    total: list.length,
    today: list.filter((task) => matchesSmartView(task, 'today', now)).length,
    overdue: list.filter((task) => matchesSmartView(task, 'overdue', now)).length,
    inProgress: list.filter((task) => matchesSmartView(task, 'in_progress', now)).length,
  }
}
