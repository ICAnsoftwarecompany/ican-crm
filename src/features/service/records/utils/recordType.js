/** Pure helpers over the records setup (tested). */
export const findRecordType = (setup, keyOrId) =>
  setup?.record_types?.find((type) => type.key === keyOrId || type.id === keyOrId) || null

/** Statuses the record can move to from its current status (server re-validates). */
export function allowedRecordTransitions(type, statusId) {
  const pipeline = type?.pipeline
  if (!pipeline) return []
  return pipeline.transitions
    .filter((transition) => transition.from === statusId)
    .map((transition) => pipeline.statuses.find((status) => status.id === transition.to))
    .filter(Boolean)
}

/** Which detail tabs a record type needs (driven by configuration, never by industry). */
export function recordTabs(type, { hasDocuments = false } = {}) {
  return [
    'overview',
    type?.participant_roles?.length && 'participants',
    type?.component_types?.length && 'components',
    type?.entry_types?.length && 'entries',
    hasDocuments && 'documents',
    'timeline',
  ].filter(Boolean)
}

/** Margin = sell − cost (display only; cost fields are permission-sensitive on the server). */
export const componentMargin = (component) =>
  component?.sell_amount != null && component?.cost_amount != null ? Number(component.sell_amount) - Number(component.cost_amount) : null
