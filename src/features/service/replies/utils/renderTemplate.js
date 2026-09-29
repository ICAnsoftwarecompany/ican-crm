/**
 * Preview-only variable rendering for saved replies inserted in the composer
 * (the agent can still edit the text). Unknown variables are left as-is; the
 * backend renders the full variable set (spec §40.1) when a template is sent
 * by automation.
 */
export function renderTemplate(body, { caseItem, agentName } = {}) {
  const values = {
    'customer.name': caseItem?.customer?.name,
    'case.number': caseItem?.case_number,
    'agent.name': agentName,
  }
  return String(body || '').replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key) => values[key] || match)
}

/** Replies that apply to a case: no filter = all; otherwise case type / channel must match. */
export function repliesForCase(replies = [], caseItem) {
  return replies.filter(
    (reply) =>
      reply.active !== false &&
      (!reply.case_type_ids?.length || reply.case_type_ids.includes(caseItem?.type?.id)) &&
      (!reply.channels?.length || reply.channels.includes(caseItem?.source_channel))
  )
}
