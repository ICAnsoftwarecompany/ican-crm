import {
  ArrowLeftRight,
  BellRing,
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

export const customerNavigationGroups = [
  {
    id: 'customers',
    label: 'العملاء',
    items: [
      { to: '/customers', label: 'جميع العملاء', icon: Users, end: true },
      { to: '/customers/new', label: 'العملاء الجدد', icon: UserPlus },
      { to: '/customers/follow-up', label: 'يحتاجون متابعة', icon: BellRing },
      { to: '/customers/inactive', label: 'العملاء غير النشطين', icon: UserRoundX },
    ],
  },
  {
    id: 'organization',
    label: 'التنظيم',
    items: [
      { to: '/customers/segments', label: 'التصنيفات والوسوم', icon: Tags },
      { to: '/customers/assignments', label: 'توزيع العملاء', icon: UserCheck },
      { to: '/customers/teams', label: 'فرق السيلز', icon: UsersRound },
      { to: '/customers/duplicates', label: 'العملاء المكررون', icon: Copy },
      { to: '/customers/customization', label: 'الإعداد والتخصيص', icon: SlidersHorizontal },
    ],
  },
  {
    id: 'tools',
    label: 'الأدوات',
    items: [
      { to: '/customers/status-board', label: 'العرض المتعدد للحالات', icon: Columns3 },
      { to: '/customers/proposals', label: 'منشئ عروض الأسعار', icon: FileSignature },
      { to: '/customers/import-export', label: 'الاستيراد والتصدير', icon: ArrowLeftRight },
      { to: '/customers/trash', label: 'العملاء المحذوفون', icon: Trash2 },
    ],
  },
]

export const customerSettingsItem = {
  to: '/customers/settings',
  label: 'إعدادات العملاء',
  icon: Settings,
}
