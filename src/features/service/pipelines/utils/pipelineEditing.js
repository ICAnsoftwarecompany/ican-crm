/**
 * Pure pipeline editing helpers (tested). New statuses get a temporary id
 * `tmp-*`; the server assigns the real id and remaps transitions on save.
 */
export const STATUS_CATEGORIES = ['open', 'in_progress', 'pending', 'resolved', 'closed', 'cancelled']

let counter = 0
export const tempStatusId = () => `tmp-${Date.now().toString(36)}-${(counter += 1)}`

export function addStatus(statuses = []) {
  return [...statuses, { id: tempStatusId(), key: '', label: { ar: '', en: '' }, category: 'open', is_initial: statuses.length === 0 }]
}

/** Removes a status and every transition touching it. */
export function removeStatus(pipeline, statusId) {
  return {
    statuses: pipeline.statuses.filter((status) => status.id !== statusId),
    transitions: (pipeline.transitions || []).filter((transition) => transition.from !== statusId && transition.to !== statusId),
  }
}

export function moveStatus(statuses, index, delta) {
  const target = index + delta
  if (target < 0 || target >= statuses.length) return statuses
  const next = [...statuses]
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}

/** Exactly one initial status. */
export const setInitial = (statuses, statusId) => statuses.map((status) => ({ ...status, is_initial: status.id === statusId }))

export const hasTransition = (transitions = [], from, to) => transitions.some((transition) => transition.from === from && transition.to === to)

/** Toggle keeps `required_fields` of an existing transition when re-enabled in the same session is not needed. */
export function toggleTransition(transitions = [], from, to, enabled) {
  if (!enabled) return transitions.filter((transition) => !(transition.from === from && transition.to === to))
  return hasTransition(transitions, from, to) ? transitions : [...transitions, { from, to, required_fields: [] }]
}

/** Client-side checks mirroring the server (it re-validates). Returns i18n codes. */
export function pipelineProblems(pipeline) {
  const problems = []
  const statuses = pipeline.statuses || []
  if (!statuses.length) problems.push('noStatuses')
  if (statuses.filter((status) => status.is_initial).length !== 1) problems.push('oneInitial')
  const keys = statuses.map((status) => status.key.trim()).filter(Boolean)
  if (keys.length !== statuses.length) problems.push('missingKey')
  if (new Set(keys).size !== keys.length) problems.push('duplicateKey')
  const reachable = new Set(statuses.filter((status) => status.is_initial).map((status) => status.id))
  let grew = true
  while (grew) {
    grew = false
    ;(pipeline.transitions || []).forEach((transition) => {
      if (reachable.has(transition.from) && !reachable.has(transition.to)) {
        reachable.add(transition.to)
        grew = true
      }
    })
  }
  if (statuses.some((status) => !reachable.has(status.id))) problems.push('unreachable')
  return problems
}
