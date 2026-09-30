import { buildCases, buildCustomers } from './casesSeed'
import { createRandom, hoursAgo } from './seedUtils'
import { weightedScore } from '../state/qualityScore'

const L = (ar, en) => ({ ar, en })

/** Default checklist from spec §42.2 (weights add up to 100). */
export function buildQualityChecklists() {
  return [
    {
      id: 'qc-case',
      name: L('جودة التعامل مع الطلب', 'Request handling quality'),
      subject_type: 'case',
      criteria: [
        { key: 'communication', label: L('التواصل', 'Communication'), weight: 25 },
        { key: 'accuracy', label: L('دقة المعلومة', 'Accuracy'), weight: 25 },
        { key: 'resolution', label: L('الحل', 'Resolution'), weight: 25 },
        { key: 'process', label: L('الالتزام بالإجراءات', 'Process compliance'), weight: 15 },
        { key: 'documentation', label: L('التوثيق', 'Documentation'), weight: 10 },
      ],
      pass_score: 75,
      active: true,
    },
    {
      id: 'qc-call',
      name: L('جودة مكالمة المتابعة', 'Follow-up call quality'),
      subject_type: 'follow_up',
      criteria: [
        { key: 'greeting', label: L('الترحيب والتعريف', 'Greeting'), weight: 20 },
        { key: 'checklist', label: L('استكمال قائمة التحقق', 'Checklist done'), weight: 50 },
        { key: 'next_step', label: L('وضوح الخطوة الجاية', 'Clear next step'), weight: 30 },
      ],
      pass_score: 70,
      active: true,
    },
  ]
}

export function buildSamplingRules() {
  return [
    { id: 'qs-weekly', name: L('عينة أسبوعية 10%', 'Weekly 10% sample'), checklist_id: 'qc-case', percent: 10, min_per_agent: 2, only_low_csat: false, case_type_ids: [], active: true },
    { id: 'qs-low-csat', name: L('كل تقييم منخفض', 'Every low rating'), checklist_id: 'qc-case', percent: 100, min_per_agent: 0, only_low_csat: true, case_type_ids: [], active: true },
  ]
}

const ROOT_CAUSES = ['training', 'process', 'product', 'communication', 'system', 'customer']

/** Reviews on resolved cases: some done (varied scores), some waiting in the queue. */
export function buildQualityReviews(manifest) {
  const random = createRandom(`quality-${manifest.template}`)
  const checklist = buildQualityChecklists()[0]
  const resolved = buildCases(manifest).filter((item) => item.resolved_at && item.assignee_id)
  return resolved.slice(0, 12).map((item, index) => {
    const done = index < 7
    const scores = done ? Object.fromEntries(checklist.criteria.map((criterion) => [criterion.key, random.pick([2, 3, 4, 4, 5, 5])])) : {}
    const total = done ? weightedScore(checklist.criteria, scores) : null
    return {
      id: `qr-${index + 1}`,
      checklist_id: checklist.id,
      subject_type: 'case',
      subject_id: item.id,
      subject: { id: item.id, number: item.case_number, title: item.subject },
      agent_id: item.assignee_id,
      reviewer_id: done ? 'me' : null,
      source: index % 4 === 0 ? 'qs-low-csat' : 'qs-weekly',
      status: done ? 'done' : 'pending',
      scores,
      total,
      passed: done ? total >= checklist.pass_score : null,
      comments: done && total < 75 ? 'الرد الأول كان متأخر ومفيش ملاحظة داخلية بالسبب.' : null,
      root_cause: done && total < 75 ? random.pick(ROOT_CAUSES) : null,
      corrective_action: done && total < 75 ? 'مراجعة سكريبت الرد الأول مع الموظف.' : null,
      preventive_action: null,
      created_at: hoursAgo(24 * (10 - index * 0.5)),
      reviewed_at: done ? hoursAgo(24 * (8 - index)) : null,
    }
  })
}

export function buildSurveys() {
  return [
    { id: 'sv-csat', name: L('تقييم بعد حل الطلب', 'Rating after a request is solved'), type: 'csat', trigger: { event: 'case.resolved', delay_hours: 1 }, channel: 'whatsapp', question: L('قد إيه كنت راضي عن حل طلبك؟', 'How satisfied are you with how we solved your request?'), low_score_action: { type: 'create_case', case_type_key: 'complaint' }, active: true },
    { id: 'sv-nps', name: L('مؤشر الولاء كل 3 شهور', 'Quarterly NPS'), type: 'nps', trigger: { event: 'periodic', every_days: 90 }, channel: 'portal', question: L('قد إيه ممكن ترشحنا لصديق؟', 'How likely are you to recommend us to a friend?'), low_score_action: { type: 'create_case', case_type_key: 'complaint' }, active: true },
    { id: 'sv-ces', name: L('سهولة الخدمة', 'Customer effort'), type: 'ces', trigger: { event: 'record.completed', delay_hours: 24 }, channel: 'portal', question: L('قد إيه كان سهل تخلص اللي محتاجه؟', 'How easy was it to get what you needed?'), low_score_action: { type: 'none' }, active: true },
  ]
}

/** NPS (0–10) and CES (1–7) answers per customer (no case). */
export function buildSurveyResponses(manifest) {
  const random = createRandom(`surveys-${manifest.template}`)
  const customers = buildCustomers(manifest)
  const nps = customers.slice(1, 18).map((customer, index) => ({ id: `nps-${index + 1}`, case_id: null, customer_id: customer.id, customer: { id: customer.id, name: customer.name }, survey: 'nps', survey_id: 'sv-nps', score: random.pick([10, 10, 9, 9, 9, 8, 8, 7, 6, 5, 3]), comment: null, channel: 'portal', responded_at: hoursAgo(24 * random.int(1, 60)) }))
  const ces = customers.slice(1, 12).map((customer, index) => ({ id: `ces-${index + 1}`, case_id: null, customer_id: customer.id, customer: { id: customer.id, name: customer.name }, survey: 'ces', survey_id: 'sv-ces', score: random.pick([7, 7, 6, 6, 5, 5, 4, 3, 2]), comment: null, channel: 'portal', responded_at: hoursAgo(24 * random.int(1, 60)) }))
  return [...nps, ...ces]
}
