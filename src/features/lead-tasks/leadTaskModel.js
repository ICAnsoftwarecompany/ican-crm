import { buildTaskPayload } from '../tasks'

export function leadTaskTargets(records = [], dealId) {
  const targets = new Map()
  records.forEach((record) => {
    if (!record) return
    const id = dealId ? record.leadId : record.lead_id ?? record.lead?.id
    if (id == null || id === '' || !Number.isInteger(Number(id)) || Number(id) <= 0) return
    const key = String(id)
    if (!targets.has(key)) targets.set(key, { id: key, name: record.name || record.lead?.name || key,
      dealId, dealLeadId: dealId ? record.id : null })
  })
  return [...targets.values()]
}

export function buildLeadTaskPayload(form, target, currentUserId) {
  const checklist = (form.items || []).filter((item) => item.text.trim()).map((item) => `- [${item.done ? 'x' : ' '}] ${item.text.trim()}`)
  const context = target.dealId && target.dealLeadId
    ? `/deals/${encodeURIComponent(target.dealId)}/leads/${encodeURIComponent(target.dealLeadId)}` : ''
  return buildTaskPayload({
    ...form, type: 'follow_up', taskable_type: 'lead', taskable_id: target.id,
    description: [form.description?.trim(), checklist.join('\n'), context].filter(Boolean).join('\n\n'),
    users: currentUserId ? [currentUserId] : [], visibility: 'shared',
    reminder_before: form.reminder && form.due_date && form.due_time ? form.reminder_before : '',
  }, { currentUserId })
}

export async function createLeadTaskCopies(targets, completed, create, makePayload, onCompleted) {
  for (const target of targets) {
    if (completed.has(target.id)) continue
    await create(makePayload(target))
    completed.add(target.id)
    onCompleted?.(completed.size)
  }
}
