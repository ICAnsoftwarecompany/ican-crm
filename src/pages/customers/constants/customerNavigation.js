import {
  ArrowLeftRight,
  BellRing,
  CalendarClock,
  Columns3,
  Copy,
  FileSignature,
  Settings,
  SlidersHorizontal,
  Tags,
  Trash2,
  UserCheck,
  UserPlus,
  UserRoundX,
  Users,
  UsersRound,
} from 'lucide-react'

export const LEADS_CENTER_ROUTE = '/LeadsCenter'

export const customerNavigationGroups = [
  {
    id: 'leads-center',
    label: 'مركز العملاء المحتملين',
    items: [
      { to: LEADS_CENTER_ROUTE, label: 'كل العملاء المحتملين', icon: Users, end: true },
      { to: `${LEADS_CENTER_ROUTE}/new`, label: 'العملاء المحتملون الجدد', icon: UserPlus },
      { to: `${LEADS_CENTER_ROUTE}/follow-up`, label: 'يحتاجون متابعة', icon: BellRing },
      { to: `${LEADS_CENTER_ROUTE}/inactive`, label: 'غير النشطين', icon: UserRoundX },
    ],
  },
  {
    id: 'organization',
    label: 'التنظيم',
    items: [
      { to: `${LEADS_CENTER_ROUTE}/segments`, label: 'التصنيفات والوسوم', icon: Tags },
      { to: `${LEADS_CENTER_ROUTE}/assignments`, label: 'توزيع العملاء المحتملين', icon: UserCheck },
      { to: `${LEADS_CENTER_ROUTE}/teams`, label: 'فرق السيلز', icon: UsersRound },
      { to: `${LEADS_CENTER_ROUTE}/duplicates`, label: 'السجلات المكررة', icon: Copy },
      { to: `${LEADS_CENTER_ROUTE}/customization`, label: 'الإعداد والتخصيص', icon: SlidersHorizontal },
    ],
  },
  {
    id: 'tools',
    label: 'الأدوات',
    items: [
      { to: `${LEADS_CENTER_ROUTE}/status-board`, label: 'العرض المتعدد للحالات', icon: Columns3 },
      { to: `${LEADS_CENTER_ROUTE}/activities`, label: 'الأنشطة والمواعيد', icon: CalendarClock },
      { to: `${LEADS_CENTER_ROUTE}/proposals`, label: 'منشئ عروض الأسعار', icon: FileSignature },
      { to: `${LEADS_CENTER_ROUTE}/import-export`, label: 'الاستيراد والتصدير', icon: ArrowLeftRight },
      { to: `${LEADS_CENTER_ROUTE}/trash`, label: 'السجلات المحذوفة', icon: Trash2 },
    ],
  },
]

export const customerSettingsItem = {
  to: `${LEADS_CENTER_ROUTE}/settings`,
  label: 'إعدادات مركز العملاء المحتملين',
  icon: Settings,
}
