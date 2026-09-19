function getCallOutcomes(t) {
  return [
    { value: 'connected', label: t('activities.outcomes.call.connected') },
    { value: 'no_answer', label: t('activities.outcomes.call.no_answer') },
    { value: 'interested', label: t('activities.outcomes.call.interested') },
    { value: 'not_interested', label: t('activities.outcomes.call.not_interested') },
    { value: 'wrong_number', label: t('activities.outcomes.call.wrong_number') },
  ]
}

function getMeetingOutcomes(t) {
  return [
    { value: 'completed', label: t('activities.outcomes.meeting.completed') },
    { value: 'proposal_requested', label: t('activities.outcomes.meeting.proposal_requested') },
    { value: 'deal_possible', label: t('activities.outcomes.meeting.deal_possible') },
    { value: 'postponed', label: t('activities.outcomes.meeting.postponed') },
    { value: 'no_show', label: t('activities.outcomes.meeting.no_show') },
  ]
}

export function getOutcomeOptions(type, t) {
  return type === 'call' ? getCallOutcomes(t) : getMeetingOutcomes(t)
}

export function getOutcomeLabel(value, type, t) {
  return getOutcomeOptions(type, t).find((item) => item.value === value)?.label || value || '-'
}
