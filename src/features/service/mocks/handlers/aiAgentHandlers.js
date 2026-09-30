import { serviceEndpoints } from '../../core/api/endpoints'
import { portalEndpoints as P } from '../../core/api/portalEndpoints'
import { getCollection, registerSeed } from '../db'
import { MockHttpError, notFound } from '../errors'
import { mockId } from '../seeds/seedUtils'
import { buildCustomers } from '../seeds/casesSeed'
import { nowIso, paginate } from '../utils'
import { findStatus } from '../state/caseConfig'
import { agentReply, handoffText } from '../state/aiAgent'
import { customerVisible, liveContent, rankArticles } from '../state/kbLive'
import { serializeSchedule, todayIso } from '../state/billingLedger'
import { requirePermission, resolveSession } from '../state/portalAccess'
import { aiSettings, useAiFeature } from './aiHandlers'
import { createCase, findOrAdoptCustomer } from './casesHandlers'
import './billingSchedulesHandlers'
import './recordsHandlers'

// Demo history so the staff monitor is not empty (portal chats made in another tab live in that tab's mock db).
registerSeed('aiConversations', (manifest) => {
  const customers = buildCustomers(manifest)
  const at = (hours) => new Date(Date.now() - hours * 3600 * 1000).toISOString()
  const convo = (index, customer, status, messages, extra = {}) => ({ id: `aic-${index}`, customer_id: customer.id, customer: { id: customer.id, name: customer.name }, channel: index === 2 ? 'whatsapp' : 'portal', status, messages, unsure: 0, case: null, handoff_reason: null, started_at: at(30 - index * 5), updated_at: at(29 - index * 5), ...extra })
  return [
    convo(1, customers[0], 'ai', [{ role: 'customer', text: 'القسط الجاي إمتى؟', at: at(25) }, { role: 'ai', text: 'مفيش أقساط مستحقة عليك حاليًا.', at: at(25), intent: 'next_payment', tools: ['read_schedule'] }]),
    convo(2, customers[1], 'ai', [{ role: 'customer', text: 'Where is my order?', at: at(20) }, { role: 'ai', text: 'I could not find services under your name. Can you send me the reference number?', at: at(20), intent: 'record_status', tools: ['read_records'] }]),
    convo(3, customers[3], 'handed_off', [{ role: 'customer', text: 'عايز استرجع فلوسي', at: at(15) }, { role: 'ai', text: 'حوّلتك لحد من الفريق وهيرد عليك قريب.', at: at(15), intent: 'question', tools: ['handoff_to_human'], handoff: true }], { handoff_reason: 'sensitive_money' }),
  ]
})

const AI = serviceEndpoints.ai
const OPEN = ['open', 'in_progress', 'pending']
const pick = (label, lang) => (label && typeof label === 'object' ? label[lang] || label.en || label.ar : label || '')

/** The only data the agent can reach: this customer's records, schedules, cases and customer-visible KB. */
function toolsFor(customerId, lang) {
  return {
    records: () => getCollection('serviceRecords').filter((record) => record.customer_id === customerId)
      .sort((a, b) => String(b.updated_at || b.created_at).localeCompare(String(a.updated_at || a.created_at)))
      .map((record) => ({ reference: record.reference_no, status: pick(findStatus(record.status_id)?.label, lang), expected_at: record.expected_at ? record.expected_at.slice(0, 10) : null })),
    nextPayment: () => {
      const lines = getCollection('paymentSchedules').filter((schedule) => schedule.customer_id === customerId && schedule.status === 'active')
        .flatMap((schedule) => serializeSchedule(schedule, todayIso()).lines.filter((line) => ['upcoming', 'due', 'overdue', 'partially_paid'].includes(line.status)).map((line) => ({ ...line, currency: schedule.currency })))
        .sort((a, b) => a.due_date.localeCompare(b.due_date))
      const next = lines[0]
      return next ? { amount: `${new Intl.NumberFormat('en').format(next.remaining)} ${next.currency}`, date: next.due_date } : null
    },
    openCases: () => getCollection('cases').filter((item) => item.customer?.id === customerId && OPEN.includes(findStatus(item.status_id)?.category))
      .sort((a, b) => String(b.opened_at).localeCompare(String(a.opened_at)))
      .map((item) => ({ number: item.case_number, status: pick(findStatus(item.status_id)?.label, lang) })),
    searchKb: (query) => {
      const top = rankArticles(getCollection('kbArticles').filter(customerVisible), query, { limit: 1 })[0]
      if (!top) return null
      const content = liveContent(top.article)
      return { id: top.article.id, title: content.title, body: content.body, score: top.score }
    },
  }
}

const CASE_TYPE_FOR = { sensitive_complaint: 'complaint', sensitive_money: 'billing', sensitive_cancellation: 'complaint' }

/** One turn: store the customer message, answer or hand over (hand over = a case with the transcript, actor ai). */
function converse({ customerId, message, conversationId, channel, language }) {
  if (!aiSettings().features.agent) throw new MockHttpError(403, 'FEATURE_DISABLED', 'AI agent is off')
  if (!String(message || '').trim()) throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', { message: ['required'] })
  const list = getCollection('aiConversations')
  let conversation = conversationId ? list.find((entry) => entry.id === conversationId && entry.customer_id === customerId) : null
  if (conversationId && !conversation) throw notFound('Conversation')
  if (!conversation) {
    const customer = findOrAdoptCustomer(customerId)
    conversation = { id: mockId('aic'), customer_id: customerId, customer: { id: customer.id, name: customer.name }, channel, status: 'ai', messages: [], unsure: 0, case: null, handoff_reason: null, started_at: nowIso(), updated_at: nowIso() }
    list.unshift(conversation)
  }
  conversation.messages.push({ role: 'customer', text: message, at: nowIso() })
  if (conversation.status !== 'ai') {
    conversation.updated_at = nowIso()
    return conversation
  }
  useAiFeature('agent')
  const lang = language || (/[؀-ۿ]/.test(message) ? 'ar' : 'en')
  const result = agentReply({ message, language: lang, settings: aiSettings(), tools: toolsFor(customerId, lang), unsureCount: conversation.unsure })
  if (result.unsure) conversation.unsure += 1
  if (result.handoff) {
    const types = getCollection('caseTypes')
    const type = types.find((entry) => entry.key === CASE_TYPE_FOR[result.handoff_reason]) || types.find((entry) => entry.key === 'inquiry') || types[0]
    const transcript = conversation.messages.map((entry) => `${entry.role === 'customer' ? '>' : '<'} ${entry.text}`).join('\n')
    const created = channel === 'test' ? null : createCase({ type_id: type.id, customer_id: customerId, subject: message.slice(0, 80), description: transcript, source_channel: channel === 'whatsapp' ? 'whatsapp' : 'portal', priority: result.handoff_reason.startsWith('sensitive') ? 'high' : undefined })
    if (created) getCollection('caseActivities').push({ id: mockId('act'), case_id: created.id, type: 'internal_note', visibility: 'internal', author: { type: 'ai', id: 'ai-agent', name: 'AI' }, body: `handoff_to_human: ${result.handoff_reason}`, metadata: { ai: true, conversation_id: conversation.id }, occurred_at: nowIso() })
    Object.assign(conversation, { status: 'handed_off', handoff_reason: result.handoff_reason, case: created ? { id: created.id, case_number: created.case_number } : null })
    conversation.messages.push({ role: 'ai', text: result.text || handoffText(lang, created?.case_number), at: nowIso(), intent: result.intent, tools: result.tools_used, handoff: true })
  } else {
    conversation.messages.push({ role: 'ai', text: result.text, at: nowIso(), intent: result.intent, tools: result.tools_used, confidence: result.confidence, source: result.source || null })
  }
  conversation.updated_at = nowIso()
  return conversation
}

const summary = ({ messages, unsure: _unsure, ...rest }) => ({ ...rest, messages_count: messages.length, last_message: messages.at(-1) || null })

/** @type {import('../router').MockRoute[]} */
export const aiAgentHandlers = [
  {
    method: 'POST',
    path: P.assistant,
    handler: ({ headers, body = {} }) => {
      const ctx = resolveSession(headers)
      requirePermission(ctx, 'case')
      return { data: converse({ customerId: ctx.membership.customer_id, message: body.message, conversationId: body.conversation_id, channel: 'portal', language: body.language }) }
    },
  },
  {
    method: 'POST',
    path: AI.agentTest,
    handler: ({ body = {} }) => {
      if (!body.customer_id) throw new MockHttpError(422, 'VALIDATION_FAILED', 'Validation failed', { customer_id: ['required'] })
      return { data: converse({ customerId: body.customer_id, message: body.message, conversationId: body.conversation_id, channel: 'test', language: body.language }) }
    },
  },
  {
    method: 'GET',
    path: AI.agentConversations,
    handler: ({ query }) => {
      const items = getCollection('aiConversations').filter((entry) => entry.channel !== 'test').filter((entry) => !query.status || entry.status === query.status)
      const all = getCollection('aiConversations').filter((entry) => entry.channel !== 'test')
      return { ...paginate(items.map(summary), { per_page: 50, ...query }), summary: { total: all.length, resolved_by_ai: all.filter((entry) => entry.status === 'ai').length, handed_off: all.filter((entry) => entry.status === 'handed_off').length } }
    },
  },
  {
    method: 'GET',
    path: `${AI.agentConversations}/:id`,
    handler: ({ params }) => {
      const conversation = getCollection('aiConversations').find((entry) => entry.id === params.id)
      if (!conversation) throw notFound('Conversation')
      return { data: conversation }
    },
  },
]
