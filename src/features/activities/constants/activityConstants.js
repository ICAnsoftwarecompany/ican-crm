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

export function getActivityTypes(t) {
  return {
    all: {
      value: 'all',
      label: t('activities.typeMeta.all'),
      shortLabel: t('activities.typeMeta.allShort'),
      icon: Circle,
    },
    call: {
      value: 'call',
      label: t('activities.type.call'),
      pluralLabel: t('activities.typeMeta.callPlural'),
      shortLabel: t('activities.typeMeta.callShort'),
      icon: PhoneCall,
      color: 'text-rose-700',
      badgeClassName: 'border-rose-100 bg-rose-50 text-rose-700',
    },
    meeting: {
      value: 'meeting',
      label: t('activities.type.meeting'),
      pluralLabel: t('activities.typeMeta.meetingPlural'),
      shortLabel: t('activities.typeMeta.meetingShort'),
      icon: UsersRound,
      color: 'text-teal-700',
      badgeClassName: 'border-teal-100 bg-teal-50 text-teal-700',
    },
  }
}

export function getActivityStatuses(t) {
  return {
    scheduled: {
      value: 'scheduled',
      label: t('activities.status.scheduled'),
      icon: CalendarClock,
      badgeClassName: 'border-sky-100 bg-sky-50 text-sky-700',
    },
    in_progress: {
      value: 'in_progress',
      label: t('activities.status.in_progress'),
      icon: PlayCircle,
      badgeClassName: 'border-amber-100 bg-amber-50 text-amber-700',
    },
    completed: {
      value: 'completed',
      label: t('activities.status.completed'),
      icon: CheckCircle2,
      badgeClassName: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    },
    cancelled: {
      value: 'cancelled',
      label: t('activities.status.cancelled'),
      icon: Ban,
      badgeClassName: 'border-slate-200 bg-slate-50 text-slate-600',
    },
  }
}

export function getActivityDerivedStates(t) {
  return {
    today: {
      value: 'today',
      label: t('activities.derivedStates.today'),
      icon: Clock3,
      badgeClassName: 'border-cyan-100 bg-cyan-50 text-cyan-700',
    },
    upcoming: {
      value: 'upcoming',
      label: t('activities.derivedStates.upcoming'),
      icon: CalendarClock,
      badgeClassName: 'border-indigo-100 bg-indigo-50 text-indigo-700',
    },
    overdue: {
      value: 'overdue',
      label: t('activities.derivedStates.overdue'),
      icon: AlertTriangle,
      badgeClassName: 'border-red-100 bg-red-50 text-red-700',
    },
  }
}

export function getActivityPriorities(t) {
  return {
    low: {
      value: 'low',
      label: t('activities.scheduleDialog.priorityOptions.low'),
      badgeClassName: 'border-slate-200 bg-slate-50 text-slate-600',
    },
    medium: {
      value: 'medium',
      label: t('activities.scheduleDialog.priorityOptions.medium'),
      badgeClassName: 'border-blue-100 bg-blue-50 text-blue-700',
    },
    high: {
      value: 'high',
      label: t('activities.scheduleDialog.priorityOptions.high'),
      badgeClassName: 'border-orange-100 bg-orange-50 text-orange-700',
    },
    urgent: {
      value: 'urgent',
      label: t('activities.scheduleDialog.priorityOptions.urgent'),
      badgeClassName: 'border-red-100 bg-red-50 text-red-700',
    },
  }
}

export const ACTIVITY_VIEW_MODES = {
  list: 'list',
  calendar: 'calendar',
}

export function getActivityTabOptions(t) {
  const types = getActivityTypes(t)
  return [types.all, types.call, types.meeting]
}

export const ACTIVITY_EMPTY_LABEL = '-'
