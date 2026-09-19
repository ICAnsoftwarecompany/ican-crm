import { CalendarPlus, FileSignature, Mail, PhoneForwarded, RotateCcw, XCircle } from 'lucide-react'

export function getActivityNextActions(t) {
  return [
    {
      value: 'none',
      label: t('activities.nextActions.none'),
      icon: XCircle,
      requiresDate: false,
      requiresTime: false,
      createsEntity: null,
    },
    {
      value: 'call_again',
      label: t('activities.nextActions.call_again'),
      icon: PhoneForwarded,
      requiresDate: true,
      requiresTime: true,
      createsEntity: 'call',
    },
    {
      value: 'schedule_meeting',
      label: t('activities.nextActions.schedule_meeting'),
      icon: CalendarPlus,
      requiresDate: true,
      requiresTime: true,
      createsEntity: 'meeting',
    },
    {
      value: 'create_task',
      label: t('activities.nextActions.create_task'),
      icon: RotateCcw,
      requiresDate: true,
      requiresTime: false,
      createsEntity: 'task',
    },
    {
      value: 'send_proposal',
      label: t('activities.nextActions.send_proposal'),
      icon: FileSignature,
      requiresDate: false,
      requiresTime: false,
      createsEntity: 'proposal',
    },
    {
      value: 'send_email',
      label: t('activities.nextActions.send_email'),
      icon: Mail,
      requiresDate: false,
      requiresTime: false,
      createsEntity: 'email',
    },
  ]
}

export function getNextActionConfig(value, t) {
  const actions = getActivityNextActions(t)
  return actions.find((item) => item.value === value) || actions[0]
}
