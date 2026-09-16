import { ACTIVITY_STATUSES } from '../constants/activityConstants'
import { getDerivedActivityState, isOverdueActivity, isToday } from './activityDateHelpers'

export function getActivityStatusMeta(status) {
  return ACTIVITY_STATUSES[status] || ACTIVITY_STATUSES.scheduled
}

export function canStartActivity(activity) {
  return activity?.status === 'scheduled'
}

export function canFinishActivity(activity) {
  return activity?.status === 'in_progress'
}

export function canCancelActivity(activity) {
  return activity?.status === 'scheduled'
}

export { getDerivedActivityState, isOverdueActivity, isToday }
