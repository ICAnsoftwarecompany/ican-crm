/**
 * Pure helpers over the case setup (types → pipeline → statuses/transitions).
 * The backend enforces transitions; these only decide what to OFFER in the UI.
 */

/** Semantic color class per status category (tokens work in light and dark). */
export const STATUS_CATEGORY_TONE = {
  open: 'bg-status-new',
  in_progress: 'bg-status-qualified',
  pending: 'bg-status-contacted',
  resolved: 'bg-status-won',
  closed: 'bg-[var(--text-muted)]',
  cancelled: 'bg-status-lost',
}

export const PRIORITY_TONE = {
  low: 'text-priority-low',
  normal: 'text-priority-normal',
  high: 'text-priority-high',
  urgent: 'text-priority-urgent',
}

export function findCaseType(setup, typeId) {
  return setup?.case_types?.find((type) => type.id === typeId) || null
}

/** Pipeline of a case (its type's pipeline). */
export function getCasePipeline(setup, caseItem) {
  const type = findCaseType(setup, caseItem?.type?.id ?? caseItem?.type_id)
  return type?.pipeline || setup?.case_types?.[0]?.pipeline || null
}

/**
 * Transitions available from the case's current status.
 * @returns {{ status: object, requiredFields: string[] }[]}
 */
export function getAllowedTransitions(setup, caseItem) {
  const pipeline = getCasePipeline(setup, caseItem)
  const currentId = caseItem?.status?.id ?? caseItem?.status_id
  if (!pipeline || !currentId) return []
  return pipeline.transitions
    .filter((transition) => transition.from === currentId)
    .map((transition) => ({
      status: pipeline.statuses.find((status) => status.id === transition.to),
      requiredFields: transition.required_fields || [],
    }))
    .filter((entry) => entry.status)
}

/** First allowed target status in a category (used by the board drop). */
export function findTransitionToCategory(setup, caseItem, category) {
  return getAllowedTransitions(setup, caseItem).find((entry) => entry.status.category === category) || null
}

export function isCaseOpen(caseItem) {
  return ['open', 'in_progress', 'pending'].includes(caseItem?.status?.category)
}
