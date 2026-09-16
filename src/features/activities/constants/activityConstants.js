import {
  AlertTriangle,
  Ban,
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock3,
  PhoneCall,
  PlayCircle,
  UsersRound,
} from 'lucide-react'

export const ACTIVITY_TYPES = {
  all: {
    value: 'all',
    label: 'الكل',
    shortLabel: 'All',
    icon: Circle,
  },
  call: {
    value: 'call',
    label: 'مكالمة',
    pluralLabel: 'المكالمات',
    shortLabel: 'Call',
    icon: PhoneCall,
    color: 'text-rose-700',
    badgeClassName: 'border-rose-100 bg-rose-50 text-rose-700',
  },
  meeting: {
    value: 'meeting',
    label: 'اجتماع',
    pluralLabel: 'الاجتماعات',
    shortLabel: 'Meeting',
    icon: UsersRound,
    color: 'text-teal-700',
    badgeClassName: 'border-teal-100 bg-teal-50 text-teal-700',
  },
}

export const ACTIVITY_STATUSES = {
  scheduled: {
    value: 'scheduled',
    label: 'مجدول',
    icon: CalendarClock,
    badgeClassName: 'border-sky-100 bg-sky-50 text-sky-700',
  },
  in_progress: {
    value: 'in_progress',
    label: 'قيد التنفيذ',
    icon: PlayCircle,
    badgeClassName: 'border-amber-100 bg-amber-50 text-amber-700',
  },
  completed: {
    value: 'completed',
    label: 'مكتمل',
    icon: CheckCircle2,
    badgeClassName: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  },
  cancelled: {
    value: 'cancelled',
    label: 'ملغي',
    icon: Ban,
    badgeClassName: 'border-slate-200 bg-slate-50 text-slate-600',
  },
}

export const ACTIVITY_DERIVED_STATES = {
  today: {
    value: 'today',
    label: 'اليوم',
    icon: Clock3,
    badgeClassName: 'border-cyan-100 bg-cyan-50 text-cyan-700',
  },
  upcoming: {
    value: 'upcoming',
    label: 'قادم',
    icon: CalendarClock,
    badgeClassName: 'border-indigo-100 bg-indigo-50 text-indigo-700',
  },
  overdue: {
    value: 'overdue',
    label: 'متأخر',
    icon: AlertTriangle,
    badgeClassName: 'border-red-100 bg-red-50 text-red-700',
  },
}

export const ACTIVITY_PRIORITIES = {
  low: {
    value: 'low',
    label: 'منخفضة',
    badgeClassName: 'border-slate-200 bg-slate-50 text-slate-600',
  },
  medium: {
    value: 'medium',
    label: 'متوسطة',
    badgeClassName: 'border-blue-100 bg-blue-50 text-blue-700',
  },
  high: {
    value: 'high',
    label: 'عالية',
    badgeClassName: 'border-orange-100 bg-orange-50 text-orange-700',
  },
  urgent: {
    value: 'urgent',
    label: 'عاجلة',
    badgeClassName: 'border-red-100 bg-red-50 text-red-700',
  },
}

export const ACTIVITY_VIEW_MODES = {
  list: 'list',
  calendar: 'calendar',
}

export const ACTIVITY_TAB_OPTIONS = [
  ACTIVITY_TYPES.all,
  ACTIVITY_TYPES.call,
  ACTIVITY_TYPES.meeting,
]

export const ACTIVITY_EMPTY_LABEL = '-'
