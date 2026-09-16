import { CalendarPlus, FileSignature, Mail, PhoneForwarded, RotateCcw, XCircle } from 'lucide-react'

export const ACTIVITY_NEXT_ACTIONS = [
  {
    value: 'none',
    label: 'بدون إجراء',
    icon: XCircle,
    requiresDate: false,
    requiresTime: false,
    createsEntity: null,
  },
  {
    value: 'call_again',
    label: 'مكالمة متابعة',
    icon: PhoneForwarded,
    requiresDate: true,
    requiresTime: true,
    createsEntity: 'call',
  },
  {
    value: 'schedule_meeting',
    label: 'اجتماع متابعة',
    icon: CalendarPlus,
    requiresDate: true,
    requiresTime: true,
    createsEntity: 'meeting',
  },
  {
    value: 'create_task',
    label: 'إنشاء مهمة',
    icon: RotateCcw,
    requiresDate: true,
    requiresTime: false,
    createsEntity: 'task',
  },
  {
    value: 'send_proposal',
    label: 'إرسال Proposal',
    icon: FileSignature,
    requiresDate: false,
    requiresTime: false,
    createsEntity: 'proposal',
  },
  {
    value: 'send_email',
    label: 'إرسال بريد',
    icon: Mail,
    requiresDate: false,
    requiresTime: false,
    createsEntity: 'email',
  },
]

export function getNextActionConfig(value) {
  return ACTIVITY_NEXT_ACTIONS.find((item) => item.value === value) || ACTIVITY_NEXT_ACTIONS[0]
}
