import {
  AlertCircle,
  AlertTriangle,
  Bell,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  CheckSquare,
  Eye,
  Mail,
  Megaphone,
  MessageCircle,
  Send,
  UserCheck,
  UserRoundPlus,
  Users,
} from 'lucide-react'

const iconRegistry = {
  'alert-circle': { icon: AlertCircle, tone: 'danger' },
  'alert-triangle': { icon: AlertTriangle, tone: 'warning' },
  bell: { icon: Bell, tone: 'info' },
  briefcase: { icon: BriefcaseBusiness, tone: 'sales' },
  calendar: { icon: CalendarClock, tone: 'calendar' },
  check: { icon: CheckCircle2, tone: 'success' },
  'check-square': { icon: CheckSquare, tone: 'tasks' },
  eye: { icon: Eye, tone: 'info' },
  mail: { icon: Mail, tone: 'communication' },
  megaphone: { icon: Megaphone, tone: 'marketing' },
  message: { icon: MessageCircle, tone: 'communication' },
  send: { icon: Send, tone: 'marketing' },
  'user-check': { icon: UserCheck, tone: 'sales' },
  'user-plus': { icon: UserRoundPlus, tone: 'sales' },
  users: { icon: Users, tone: 'communication' },
}

const toneVariables = {
  critical: '--notification-critical',
  danger: '--notification-danger',
  high: '--notification-high',
  warning: '--notification-warning',
  medium: '--notification-medium',
  success: '--notification-success',
  low: '--notification-low',
  info: '--notification-info',
  sales: '--notification-sales',
  tasks: '--notification-tasks',
  calendar: '--notification-calendar',
  communication: '--notification-communication',
  marketing: '--notification-marketing',
  system: '--notification-system',
}

export function resolveNotificationIcon(iconName, fallbackIcon, fallbackTone = 'system', severity = '') {
  const registered = iconRegistry[String(iconName || '').toLowerCase()]
  const tone = toneVariables[String(severity || '').toLowerCase()]
    ? String(severity).toLowerCase()
    : registered?.tone || fallbackTone
  return {
    icon: registered?.icon || fallbackIcon || Bell,
    iconName: registered ? String(iconName).toLowerCase() : 'bell',
    tone,
    color: `var(${toneVariables[tone] || toneVariables.system})`,
  }
}
