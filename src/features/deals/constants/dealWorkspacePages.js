import {
  BarChart3,
  Bot,
  CalendarDays,
  FileSignature,
  KanbanSquare,
  LayoutDashboard,
  ListTodo,
  Package,
  PhoneCall,
  Presentation,
  Settings,
  Sparkles,
  Users,
  Workflow,
} from 'lucide-react'

/**
 * Pages of ONE deal workspace (`/deals/:dealId/<path>`), in sub-sidebar order. `path: ''` is the index.
 * Labels: `dealWorkspace.pages.<id>`. Add a page = an entry here + a route in pages/deals/dealRoutes.jsx.
 */
export const DEAL_WORKSPACE_PAGES = [
  { id: 'overview', path: '', icon: LayoutDashboard, group: 'work' },
  { id: 'pipeline', path: 'pipeline', icon: KanbanSquare, group: 'work' },
  { id: 'contracts', path: 'contracts', icon: FileSignature, group: 'work' },
  { id: 'team', path: 'team', icon: Users, group: 'collaboration' },
  { id: 'meetings', path: 'meetings', icon: Presentation, group: 'collaboration' },
  { id: 'calls', path: 'calls', icon: PhoneCall, group: 'collaboration' },
  { id: 'tasks', path: 'tasks', icon: ListTodo, group: 'collaboration' },
  { id: 'products', path: 'products', icon: Package, group: 'catalog' },
  { id: 'reports', path: 'reports', icon: BarChart3, group: 'insights' },
  { id: 'calendar', path: 'calendar', icon: CalendarDays, group: 'insights' },
  { id: 'automation', path: 'automation', icon: Workflow, group: 'setup' },
  { id: 'assistant', path: 'assistant', icon: Sparkles, group: 'setup' },
  { id: 'ai', path: 'ai', icon: Bot, group: 'setup' },
  { id: 'settings', path: 'settings', icon: Settings, group: 'footer' },
]

export const DEAL_WORKSPACE_GROUPS = ['work', 'collaboration', 'catalog', 'insights', 'setup']

export function getDealPagePath(dealId, pageId) {
  const page = DEAL_WORKSPACE_PAGES.find((entry) => entry.id === pageId)
  if (!page || dealId === undefined || dealId === null || dealId === '') return null
  return page.path ? `/deals/${dealId}/${page.path}` : `/deals/${dealId}`
}

/** Pages of the deals hub (`/deals/<path>`). Labels: `dealWorkspace.hub.pages.<id>`. */
export const DEALS_HUB_PAGES = [
  { id: 'deals', path: '', group: 'work' },
  { id: 'contracts', path: 'contracts', group: 'work' },
  { id: 'reports', path: 'reports', group: 'insights' },
  { id: 'pipelines', path: 'pipelines', group: 'setup' },
]

export function getDealsHubPath(pageId) {
  const page = DEALS_HUB_PAGES.find((entry) => entry.id === pageId)
  if (!page) return null
  return page.path ? `/deals/${page.path}` : '/deals'
}

/** AI capabilities listed on the deal AI setup page. Labels: `dealWorkspace.ai.capabilities.<id>`. */
export const DEAL_AI_CAPABILITIES = ['summarizeDeal', 'nextBestAction', 'scoreLeads', 'draftFollowUp', 'forecastRevenue', 'detectRisks']
