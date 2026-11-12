/** Customer Hub readiness is calculated only from verifiable configuration lists.
 * Non-list resources and failed requests are excluded from the denominator.
 * This is configuration presence, not a claim of operational readiness.
 */
export const READINESS_CHECKS = [
  { key: 'caseTypes', group: 'cases' },
  { key: 'queues', group: 'cases' },
  { key: 'slaPolicies', group: 'sla' },
  { key: 'businessCalendars', group: 'sla' },
  { key: 'escalationRules', group: 'sla' },
  { key: 'savedReplies', group: 'communication' },
  { key: 'kbCategories', group: 'knowledge' },
  { key: 'recordTypes', group: 'catalog' },
  { key: 'pipelines', group: 'catalog' },
  { key: 'contractTypes', group: 'contracts' },
  { key: 'paymentPlans', group: 'billing' },
  { key: 'schedulingResources', group: 'scheduling' },
  { key: 'followUpPrograms', group: 'followUps' },
  { key: 'qualityChecklists', group: 'quality' },
]

export function evaluateReadiness(checks, results) {
  const items = checks.map((check, index) => {
    const result = results[index]
    const data = result?.data
    const records = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.items) ? data.items : null
    const known = result?.isSuccess && records !== null
    return { ...check, status: !known ? 'unknown' : records.some((record) => record.active !== false) ? 'complete' : 'missing' }
  })
  const verified = items.filter((item) => item.status !== 'unknown')
  const completed = verified.filter((item) => item.status === 'complete').length
  return { items, verified: verified.length, completed, total: items.length, percentage: verified.length ? Math.round((completed / verified.length) * 100) : null }
}
