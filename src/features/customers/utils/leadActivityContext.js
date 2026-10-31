import { extractList } from '../../../shared/utils/apiResponse'

export function leadActivityContext(response) {
  const envelope = response?.linked_to_deal !== undefined || response?.lead_activities !== undefined
    ? response : response?.data
  const scoped = Array.isArray(envelope?.lead_activities)
  const deal = envelope?.deal || null
  const decorate = (rows, scope, audit = false) => (Array.isArray(rows) ? rows : []).map((row) => ({
    ...row,
    ...(audit ? { title: row.title || row.description || row.action, data: row.properties || row.data } : {}),
    activityScope: scope,
    contextDeal: scope === 'deal' ? deal : null,
  }))
  return {
    linked: envelope?.linked_to_deal === true || envelope?.linked_to_deal === 1 ? true
      : envelope?.linked_to_deal === false || envelope?.linked_to_deal === 0 ? false : null,
    deal,
    logs: [
      ...decorate(scoped ? envelope.lead_activities : extractList(response, ['logs', 'lead_log', 'activities']), scoped ? 'lead' : null),
      ...decorate(envelope?.deal_activities?.lead_actions, 'deal'),
      ...decorate(envelope?.deal_activities?.deal_actions, 'deal', true),
    ],
  }
}
