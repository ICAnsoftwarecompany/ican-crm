/**
 * Demo stand-in for the AI layer (spec §45). The real server calls a model; this mock is deterministic keyword logic
 * so screens and tests behave the same every time. Rule from the spec: AI gives signals, suggestions, classifications
 * and summaries — **rules and people decide**. Nothing here changes a case by itself.
 */
import { words } from './kbLive'

const has = (text, list) => list.filter((word) => text.includes(word))
const NEGATIVE = ['سيء', 'وحش', 'زهقت', 'مش راضي', 'غضبان', 'متضايق', 'مفيش فايدة', 'للأسف', 'اتأخر', 'متأخر', 'تالف', 'مكسور', 'بايظ', 'عطل', 'شكوى', 'نصب', 'terrible', 'bad', 'angry', 'worst', 'broken', 'late', 'delay', 'never', 'disappointed', 'complaint', 'damaged', 'not working']
const POSITIVE = ['شكرا', 'شكرًا', 'ممتاز', 'تمام', 'جميل', 'thanks', 'thank you', 'great', 'excellent', 'perfect', 'good']
const URGENT = ['ضروري', 'حالا', 'حالًا', 'فورا', 'فورًا', 'بسرعة', 'مستعجل', 'عاجل', 'النهارده', 'urgent', 'asap', 'immediately', 'emergency', 'today', 'now']
/** Sensitive topics always go to a human (spec §45.3): money, complaints, cancellation. */
export const SENSITIVE = {
  money: ['فلوس', 'استرداد', 'استرجاع', 'تعويض', 'قسط', 'فاتورة', 'دفع', 'refund', 'money', 'payment', 'invoice', 'compensation', 'charge'],
  complaint: ['شكوى', 'مدير', 'مسؤول', 'complaint', 'manager', 'lawyer', 'محامي'],
  cancellation: ['الغاء', 'إلغاء', 'الغي', 'ألغي', 'cancel', 'terminate', 'unsubscribe'],
}
const TYPE_WORDS = {
  maintenance: ['عطل', 'صيانة', 'بايظ', 'مش شغال', 'بيسرب', 'repair', 'broken', 'maintenance', 'not working', 'leak'],
  warranty_claim: ['ضمان', 'warranty'],
  installation: ['تركيب', 'install', 'installation'],
  billing: ['فاتورة', 'قسط', 'دفع', 'حساب', 'invoice', 'bill', 'payment', 'installment'],
  complaint: ['شكوى', 'سيء', 'مش راضي', 'complaint', 'terrible', 'worst'],
  booking_change: ['تعديل الحجز', 'تغيير الموعد', 'تأجيل', 'reschedule', 'change booking', 'change date'],
  documents: ['مستند', 'مستندات', 'تأشيرة', 'باسبور', 'جواز', 'visa', 'passport', 'document'],
  refund: ['استرداد', 'استرجاع', 'refund', 'money back'],
  inquiry: ['استفسار', 'سؤال', 'عايز اعرف', 'ازاي', 'إزاي', 'question', 'how', 'inquiry'],
  absence: ['غياب', 'غايب', 'مش هيحضر', 'absent', 'absence', 'sick'],
  fees: ['مصروفات', 'رسوم', 'fees', 'tuition'],
  transport: ['باص', 'الباص', 'bus', 'transport'],
  certificate: ['شهادة', 'certificate'],
  delivery_issue: ['توصيل', 'الشحنة', 'اتأخر', 'متأخر', 'مندوب', 'delivery', 'courier', 'late', 'where is'],
  damaged: ['تالف', 'مكسور', 'اتكسر', 'damaged', 'broken box'],
  cod_dispute: ['تحصيل', 'التحصيل', 'cod', 'collection'],
  pickup: ['استلام', 'بيك اب', 'pickup', 'pick up'],
}

const normalize = (value) => ` ${String(value || '').toLowerCase().replace(/[ً-ْ]/g, '')} `

/** { sentiment: negative|neutral|positive, urgency: low|normal|high, topics[] } — "ai_signals" on a case. */
export function signals(text) {
  const value = normalize(text)
  const negative = has(value, NEGATIVE).length
  const positive = has(value, POSITIVE).length
  const urgent = has(value, URGENT).length
  const topics = Object.entries(SENSITIVE).filter(([, list]) => has(value, list).length).map(([topic]) => topic)
  const sentiment = negative > positive ? 'negative' : positive > negative ? 'positive' : 'neutral'
  const urgency = urgent >= 1 || (sentiment === 'negative' && negative >= 2) ? 'high' : urgent === 0 && sentiment === 'positive' ? 'low' : 'normal'
  return { sentiment, urgency, topics }
}

const PRIORITY_BY_SIGNALS = (sig, fallback) => (sig.urgency === 'high' && sig.sentiment === 'negative' ? 'urgent' : sig.urgency === 'high' ? 'high' : sig.sentiment === 'negative' ? 'high' : fallback || 'normal')

/** Suggested type + priority with a confidence (0–1) and the words that led to it. */
export function triage(text, caseTypes = []) {
  const value = normalize(text)
  const scored = caseTypes
    .map((type) => ({ type, hits: has(value, TYPE_WORDS[type.key] || []) }))
    .filter((entry) => entry.hits.length)
    .sort((a, b) => b.hits.length - a.hits.length)
  const sig = signals(text)
  const best = scored[0]
  if (!best) return { type_id: null, priority: PRIORITY_BY_SIGNALS(sig), confidence: 0, reasons: [], signals: sig }
  const margin = best.hits.length - (scored[1]?.hits.length || 0)
  const confidence = Math.min(0.95, 0.45 + best.hits.length * 0.15 + margin * 0.1)
  return { type_id: best.type.id, priority: PRIORITY_BY_SIGNALS(sig, best.type.default_priority), confidence: Math.round(confidence * 100) / 100, reasons: best.hits.map((hit) => hit.trim()), signals: sig }
}

const firstSentence = (text) => String(text || '').split(/[\n.!?؟]/).map((part) => part.trim()).find(Boolean) || ''

/**
 * Case summary: what the customer wants, what happened, where it stands, what is next. Returned as keyed facts so the
 * UI renders it in the viewer's language (the real model returns text in the tenant's language).
 */
export function summarize(item, activities = []) {
  const inbound = activities.filter((entry) => entry.type === 'inbound')
  const replies = activities.filter((entry) => entry.type === 'reply')
  const notes = activities.filter((entry) => entry.type === 'internal_note')
  const last = [...activities].sort((a, b) => String(b.occurred_at).localeCompare(String(a.occurred_at)))[0]
  const waitingOnUs = last ? last.type === 'inbound' : true
  return {
    ask: firstSentence(item.description) || item.subject,
    customer_messages: inbound.length,
    replies: replies.length,
    notes: notes.length,
    last_customer_message: firstSentence(inbound.at(-1)?.body),
    last_reply: firstSentence(replies.at(-1)?.body),
    waiting_on: waitingOnUs ? 'team' : 'customer',
    signals: signals(`${item.subject} ${item.description || ''} ${inbound.map((entry) => entry.body).join(' ')}`),
  }
}

const jaccard = (a, b) => {
  const left = new Set(words(a))
  const right = new Set(words(b))
  if (!left.size || !right.size) return 0
  const shared = [...left].filter((word) => right.has(word)).length
  return shared / (left.size + right.size - shared)
}

/** Open cases that look like the same issue: same customer + similar text, or very similar text. */
export function duplicates(item, cases, { isOpen = () => true, limit = 5 } = {}) {
  return cases
    .filter((other) => other.id !== item.id && isOpen(other))
    .map((other) => {
      const similarity = jaccard(`${item.subject} ${item.description || ''}`, `${other.subject} ${other.description || ''}`)
      const sameCustomer = other.customer?.id && other.customer.id === item.customer?.id
      const sameType = other.type_id === item.type_id
      const score = similarity + (sameCustomer ? 0.35 : 0) + (sameType ? 0.1 : 0)
      return { case: other, score: Math.min(1, Math.round(score * 100) / 100), reasons: [sameCustomer && 'same_customer', sameType && 'same_type', similarity >= 0.2 && 'similar_text'].filter(Boolean) }
    })
    .filter((entry) => entry.score >= 0.45 && (entry.reasons.includes('similar_text') || (entry.reasons.includes('same_customer') && entry.reasons.includes('same_type'))))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/** Agents ranked by: portfolio owner, queue membership, open load. */
export function assignmentSuggestions(item, { agents, openLoad, queueAgentIds = [], portfolioOwnerId = null, limit = 3 }) {
  return agents
    .map((agent) => {
      const load = openLoad[agent.id] || 0
      const reasons = []
      let score = 1 / (1 + load)
      if (portfolioOwnerId === agent.id) { score += 1; reasons.push('portfolio_owner') }
      if (queueAgentIds.includes(agent.id)) { score += 0.5; reasons.push('in_queue') }
      reasons.push('load')
      return { agent, load, score: Math.round(score * 100) / 100, reasons }
    })
    .filter((entry) => entry.agent.id !== item.assignee_id)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

const GREETING = {
  ar: { friendly: (name) => `أهلًا ${name}، شكرًا إنك تواصلت معانا.`, formal: (name) => `السيد/السيدة ${name}، نشكركم على تواصلكم.`, concise: (name) => `أهلًا ${name}،` },
  en: { friendly: (name) => `Hi ${name}, thanks for reaching out.`, formal: (name) => `Dear ${name}, thank you for contacting us.`, concise: (name) => `Hi ${name},` },
}
const ACK = {
  ar: { negative: 'آسفين جدًا على اللي حصل، وهنتابع معاك لحد ما يتحل.', neutral: 'استلمنا طلبك وبنراجعه دلوقتي.', positive: 'مبسوطين إننا نساعدك.' },
  en: { negative: 'We are very sorry about this, and we will stay on it until it is fixed.', neutral: 'We received your request and are looking into it now.', positive: 'Happy to help.' },
}
const CLOSE = { ar: 'هنبعتلك تحديث أول ما يكون فيه جديد.', en: 'We will update you as soon as there is news.' }

/** Draft reply: greeting (tone) + acknowledgement (sentiment) + steps from the best published article + closing. */
export function draftReply(item, { article = null, tone = 'friendly', language = 'ar' } = {}) {
  const lang = language === 'en' ? 'en' : 'ar'
  const sig = signals(`${item.subject} ${item.description || ''}`)
  const name = item.customer?.name?.split(' ')[0] || ''
  const steps = article ? article.body.split('\n').map((line) => line.replace(/^[-•]\s*/, '').trim()).filter(Boolean).slice(0, 3) : []
  const lines = [GREETING[lang][tone]?.(name) || GREETING[lang].friendly(name), ACK[lang][sig.sentiment]]
  if (steps.length) lines.push('', ...steps.map((step) => `- ${step}`))
  lines.push('', CLOSE[lang])
  return { body: lines.join('\n'), confidence: article ? 0.8 : 0.55, signals: sig }
}
