export const SCHEDULE_STATUS_OPTIONS = [
  { value: 'scheduled', label: 'مجدول' },
  { value: 'in_progress', label: 'قيد التنفيذ' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'cancelled', label: 'ملغي' },
]

export const PARTICIPANT_STATUS_OPTIONS = [
  { value: 'invited', label: 'مدعو' },
  { value: 'accepted', label: 'موافق' },
  { value: 'declined', label: 'رفض' },
  { value: 'attended', label: 'حضر' },
  { value: 'no_show', label: 'لم يحضر' },
]

export function getScheduleTypeLabel(type) {
  return String(type || '').toLowerCase() === 'call' ? 'مكالمة' : 'اجتماع'
}

export function getScheduleStatusLabel(status) {
  return SCHEDULE_STATUS_OPTIONS.find((option) => option.value === status)?.label || status || 'غير محدد'
}

export function getScheduleStatusBadgeClasses(status) {
  const normalizedStatus = String(status || '').trim().toLowerCase()

  if (normalizedStatus === 'scheduled') {
    return 'border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]'
  }

  if (normalizedStatus === 'in_progress') {
    return 'border-[#FDBA74] bg-[#FFF7ED] text-[#9A4D00]'
  }

  if (normalizedStatus === 'cancelled') {
    return 'border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]'
  }

  if (normalizedStatus === 'completed') {
    return 'border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]'
  }

  return 'border-[#E2E8F0] bg-white text-[#475569]'
}

export function getMeetingInfoPayload(response, fallback) {
  return response?.data?.data || response?.data || response || fallback
}

export function toDateTimeLocalValue(value) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const pad = (part) => String(part).padStart(2, '0')
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-') + `T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function getParticipantUserId(participant) {
  return participant?.user_id || participant?.user?.id || participant?.id
}

export function getUserDisplayName(user) {
  return user?.name || user?.username || user?.email || `#${user?.id || ''}`
}

export function getAttachmentName(attachment) {
  return attachment?.name || attachment?.file_name || attachment?.filename || attachment?.path || `#${attachment?.id || ''}`
}

export function getAttachmentUrl(attachment) {
  return attachment?.url || attachment?.file_url || attachment?.path || attachment?.file_path || ''
}
