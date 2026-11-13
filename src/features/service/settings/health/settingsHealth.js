/** Live settings readiness. Never infer missing entity types from a configured-only API. */
export const READINESS_CHECKS = [
  { key: 'assignmentRules', group: 'cases', source: 'assignmentRules', typeField: 'entity_type' },
  { key: 'distributionSettings', group: 'cases', source: 'distributionSettings', typeField: 'entity_type' },
  ...[
    ['caseTypes', 'cases'], ['queues', 'cases'], ['slaPolicies', 'sla'],
    ['businessCalendars', 'sla'], ['escalationRules', 'sla'],
    ['savedReplies', 'communication'], ['kbCategories', 'knowledge'],
    ['recordTypes', 'catalog'], ['pipelines', 'catalog'],
    ['contractTypes', 'contracts'], ['paymentPlans', 'billing'],
    ['schedulingResources', 'scheduling'], ['followUpPrograms', 'followUps'],
    ['qualityChecklists', 'quality'],
  ].map(([key, group]) => ({ key, group, source: 'resource' })),
]

export function listRecords(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.items)) return data.items
  return null
}

const isActive = (record) => record && record.active !== false
const cleanType = (value) => typeof value === 'string' && value.trim() ? value.trim() : null

/** Expected types may come from a future authoritative types endpoint.
 * Until then, use the union of entity types seen across the two live APIs.
 * This is DISCOVERED coverage, not proof that all required types exist.
 */
export function evaluateReadiness(checks, results) {
  const discoveredTypes = new Set()
  checks.forEach((check, index) => {
    if (!check.typeField || !results[index]?.isSuccess) return
    for (const record of listRecords(results[index].data) || []) {
      const type = cleanType(record?.[check.typeField])
      if (type) discoveredTypes.add(type)
    }
  })
  const items = checks.map((check, index) => {
    const result = results[index]
    const records = result?.isSuccess ? listRecords(result.data) : null
    if (!records) return { ...check, status: 'unknown', percentage: null, completed: 0, total: 0, types: [] }
    if (check.typeField) {
      const expected = Array.isArray(check.expectedTypes) && check.expectedTypes.length
        ? [...new Set(check.expectedTypes.map(cleanType).filter(Boolean))]
        : [...discoveredTypes].sort()
      if (!expected.length) return { ...check, status: 'unknown', percentage: null, completed: 0, total: 0, types: [] }
      const types = expected.map((type) => ({
        type, complete: records.some((record) => cleanType(record?.[check.typeField]) === type && isActive(record)),
      }))
      const completed = types.filter((type) => type.complete).length
      return { ...check, status: completed === types.length ? 'complete' : 'missing', percentage: Math.round(completed / types.length * 100), completed, total: types.length, types }
    }
    const completed = records.some(isActive) ? 1 : 0
    return { ...check, status: completed ? 'complete' : 'missing', percentage: completed * 100, completed, total: 1, types: [] }
  })
  const verified = items.filter((item) => item.status !== 'unknown')
  const completed = verified.reduce((sum, item) => sum + item.completed, 0)
  const units = verified.reduce((sum, item) => sum + item.total, 0)
  return {
    items, verified: verified.length, completed, total: items.length, units,
    percentage: units ? Math.round(completed / units * 100) : null,
    discoveredTypes: [...discoveredTypes].sort(),
  }
}
