import {
  BarChart3,
  Bot,
  CalendarDays,
  LayoutList,
  Plus,
  Settings,
  SlidersHorizontal,
  Workflow,
} from 'lucide-react'
import { getCommunicationModule, getCommunicationPagePath } from '../constants/communicationModules'

const PAGE_ICONS = {
  view: LayoutList,
  create: Plus,
  reports: BarChart3,
  calendar: CalendarDays,
  automation: Workflow,
  customization: SlidersHorizontal,
  ai: Bot,
  settings: Settings,
}

// Sub-sidebar grouping: daily work → follow-up → setup. Settings is pinned in the footer.
const GROUPS = [
  { id: 'work', pages: ['view', 'create'] },
  { id: 'insights', pages: ['reports', 'calendar'] },
  { id: 'setup', pages: ['automation', 'customization', 'ai'] },
]

function buildItem(module, pageId, t) {
  return {
    id: `${module.id}-${pageId}`,
    to: getCommunicationPagePath(module, pageId),
    label: t(`communication.pages.${pageId}`),
    icon: PAGE_ICONS[pageId],
    end: pageId === 'view',
  }
}

/**
 * Sub-sidebar config for one communication module, in the shape <SubSidebarLayout sidebar={...}>
 * expects. Returns null for an unknown module id.
 */
export function getCommunicationSidebarConfig(moduleId, t) {
  const module = getCommunicationModule(moduleId)
  if (!module) return null

  return {
    header: {
      icon: module.icon,
      title: t(`communication.modules.${module.id}.title`),
      description: t(`communication.modules.${module.id}.description`),
    },
    ariaLabel: t(`communication.modules.${module.id}.menu`),
    groups: GROUPS.map((group) => ({
      id: group.id,
      label: t(`communication.groups.${group.id}`),
      items: group.pages.map((pageId) => buildItem(module, pageId, t)),
    })),
    footerItems: [buildItem(module, 'settings', t)],
  }
}
