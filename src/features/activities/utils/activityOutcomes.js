export const CALL_OUTCOMES = [
  { value: 'connected', label: 'تم التواصل' },
  { value: 'no_answer', label: 'لا يوجد رد' },
  { value: 'interested', label: 'مهتم' },
  { value: 'not_interested', label: 'غير مهتم' },
  { value: 'wrong_number', label: 'رقم غير صحيح' },
]

export const MEETING_OUTCOMES = [
  { value: 'completed', label: 'تم الاجتماع' },
  { value: 'proposal_requested', label: 'طلب عرض سعر' },
  { value: 'deal_possible', label: 'فرصة بيع' },
  { value: 'postponed', label: 'تم التأجيل' },
  { value: 'no_show', label: 'لم يحضر' },
]

export function getOutcomeOptions(type) {
  return type === 'call' ? CALL_OUTCOMES : MEETING_OUTCOMES
}

export function getOutcomeLabel(value, type) {
  return getOutcomeOptions(type).find((item) => item.value === value)?.label || value || '-'
}
