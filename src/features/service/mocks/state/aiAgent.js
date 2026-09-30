/**
 * Demo AI agent for WhatsApp / portal (spec §45.3). It may only use the tools it is given — scoped to ONE customer —
 * and hands over to a person on request, on sensitive topics, on blocked words, or when it is not sure. Replies are
 * facts from tools, never invented. The live agent is a model with the same tools and rules.
 */
import { signals } from './aiEngine'

const has = (text, list) => list.some((word) => text.includes(word))
const INTENTS = [
  ['human', ['موظف', 'حد يكلمني', 'كلم حد', 'خدمة العملاء', 'انسان', 'إنسان', 'human', 'agent', 'person', 'representative']],
  ['record_status', ['شحنتي', 'شحنة', 'طلبي فين', 'حجزي', 'الحجز', 'الرحلة', 'الباص', 'where is', 'shipment', 'order', 'booking', 'tracking', 'status']],
  ['next_payment', ['القسط', 'الدفعة', 'قسط', 'المستحق', 'installment', 'payment', 'due', 'pay']],
  ['open_cases', ['طلباتي', 'الشكوى بتاعتي', 'my request', 'my ticket', 'my complaint', 'case']],
]
export const detectIntent = (text) => INTENTS.find(([, words]) => has(text, words))?.[0] || 'question'

const T = {
  ar: {
    handoff: 'حوّلتك لحد من الفريق وهيرد عليك قريب. رقم طلبك {{number}}.',
    handoffNoCase: 'حوّلتك لحد من الفريق وهيرد عليك قريب.',
    record: 'آخر حالة لـ {{reference}}: {{status}}{{eta}}.',
    eta: '، الموعد المتوقع {{date}}',
    noRecord: 'مش لاقي خدمات مسجلة باسمك. ممكن تبعتلي الرقم المرجعي؟',
    payment: 'القسط الجاي {{amount}} بتاريخ {{date}}.',
    noPayment: 'مفيش أقساط مستحقة عليك حاليًا.',
    cases: 'عندك {{count}} طلب مفتوح. آخرهم {{number}}: {{status}}.',
    noCases: 'مفيش طلبات مفتوحة باسمك.',
    kb: '{{answer}}',
    unsure: 'مش متأكد إني فهمت. تحب أحوّلك لحد من الفريق؟',
    blocked: 'الموضوع ده محتاج حد من الفريق. حوّلتك ليه.',
  },
  en: {
    handoff: 'I passed you to our team and someone will reply soon. Your request number is {{number}}.',
    handoffNoCase: 'I passed you to our team and someone will reply soon.',
    record: 'Latest status for {{reference}}: {{status}}{{eta}}.',
    eta: ', expected {{date}}',
    noRecord: 'I could not find services under your name. Can you send me the reference number?',
    payment: 'Your next installment is {{amount}} on {{date}}.',
    noPayment: 'You have no installments due right now.',
    cases: 'You have {{count}} open requests. The latest, {{number}}: {{status}}.',
    noCases: 'You have no open requests.',
    kb: '{{answer}}',
    unsure: 'I am not sure I understood. Would you like me to pass you to our team?',
    blocked: 'This needs a person from our team. I passed you to them.',
  },
}
export const fill = (template, values = {}) => template.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? '')

/**
 * @param {{ message: string, language?: 'ar'|'en', settings: object, tools: {
 *   records: () => object[], nextPayment: () => object|null, openCases: () => object[], searchKb: (q:string) => {title:string, body:string, score:number}|null } , unsureCount?: number }} input
 * @returns {{ intent, text?, template?, values?, confidence, tools_used: string[], handoff: boolean, handoff_reason?: string }}
 */
export function agentReply({ message, language, settings, tools, unsureCount = 0 }) {
  const text = ` ${String(message || '').toLowerCase()} `
  const lang = language || (/[؀-ۿ]/.test(message) ? 'ar' : 'en')
  const say = (key, values) => fill(T[lang][key], values)
  const blocked = (settings.blocked_topics || []).find((word) => word && text.includes(word.toLowerCase()))
  if (blocked) return { intent: 'blocked', text: say('blocked'), confidence: 1, tools_used: ['handoff_to_human'], handoff: true, handoff_reason: 'blocked_topic' }
  const intent = detectIntent(text)
  if (intent === 'human') return { intent, text: null, confidence: 1, tools_used: ['handoff_to_human'], handoff: true, handoff_reason: 'customer_asked', language: lang }
  const sensitive = signals(message).topics.find((topic) => (settings.handoff_topics || []).includes(topic))
  if (sensitive) return { intent, text: null, confidence: 1, tools_used: ['handoff_to_human'], handoff: true, handoff_reason: `sensitive_${sensitive}`, language: lang }
  if (intent === 'record_status') {
    const record = tools.records()[0]
    return record
      ? { intent, text: say('record', { reference: record.reference, status: record.status, eta: record.expected_at ? say('eta', { date: record.expected_at }) : '' }), confidence: 0.9, tools_used: ['read_records'], handoff: false }
      : { intent, text: say('noRecord'), confidence: 0.7, tools_used: ['read_records'], handoff: false }
  }
  if (intent === 'next_payment') {
    const due = tools.nextPayment()
    return { intent, text: due ? say('payment', due) : say('noPayment'), confidence: 0.9, tools_used: ['read_schedule'], handoff: false }
  }
  if (intent === 'open_cases') {
    const cases = tools.openCases()
    return { intent, text: cases.length ? say('cases', { count: cases.length, number: cases[0].number, status: cases[0].status }) : say('noCases'), confidence: 0.85, tools_used: ['read_cases'], handoff: false }
  }
  const answer = tools.searchKb(message)
  if (answer && answer.score >= 3) return { intent: 'question', text: say('kb', { answer: `${answer.title}\n${answer.body}` }), confidence: Math.min(0.95, 0.5 + answer.score * 0.08), tools_used: ['search_kb'], handoff: false, source: answer.id }
  // Low confidence: offer once, hand over the second time.
  if (unsureCount >= 1) return { intent: 'question', text: null, confidence: 0.2, tools_used: ['search_kb', 'handoff_to_human'], handoff: true, handoff_reason: 'low_confidence', language: lang }
  return { intent: 'question', text: say('unsure'), confidence: 0.3, tools_used: ['search_kb'], handoff: false, unsure: true }
}

export const handoffText = (lang, number) => fill(T[lang === 'en' ? 'en' : 'ar'][number ? 'handoff' : 'handoffNoCase'], { number })
