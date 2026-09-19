export function getScheduleStatusOptions(t) {
  return [
    { value: 'scheduled', label: t('activities.status.scheduled') },
    { value: 'in_progress', label: t('activities.status.in_progress') },
    { value: 'completed', label: t('activities.status.completed') },
    { value: 'cancelled', label: t('activities.status.cancelled') },
  ]
}

export function getParticipantStatusOptions(t) {
  return [
    { value: 'invited', label: t('activities.drawer.invitedStatus') },
    { value: 'accepted', label: t('activities.participantStatus.accepted') },
    { value: 'declined', label: t('activities.participantStatus.declined') },
    { value: 'attended', label: t('activities.participantStatus.attended') },
    { value: 'no_show', label: t('activities.outcomes.meeting.no_show') },
  ]
}

export function getScheduleTypeLabel(type, t) {
  return String(type || '').toLowerCase() === 'call' ? t('activities.type.call') : t('activities.type.meeting')
}

export function getScheduleStatusLabel(status, t) {
  return getScheduleStatusOptions(t).find((option) => option.value === status)?.label || status || t('activities.preMeetingReport.options.unspecified')
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
