import { Tags, UserPlus, Workflow } from 'lucide-react'

export const SETTINGS_ROUTE = '/settings'

export const settingsNavigationGroups = [
  {
    id: 'general',
    label: 'الإعدادات الرئيسية',
    items: [
      { to: `${SETTINGS_ROUTE}/definitions`, label: 'التعريفات', icon: Tags },
      { to: `${SETTINGS_ROUTE}/users`, label: 'المستخدمون', icon: UserPlus },
      { to: `${SETTINGS_ROUTE}/integrations`, label: 'التكاملات', icon: Workflow },
    ],
  },
]
