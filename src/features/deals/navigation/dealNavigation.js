import { BarChart3, CalendarDays, FileSignature, GitBranch, Handshake, LayoutList, PlusCircle } from 'lucide-react'
import { getDealStatusValue } from '../utils/dealDisplay'
import { DEAL_WORKSPACE_GROUPS, DEAL_WORKSPACE_PAGES, DEALS_HUB_PAGES, getDealPagePath, getDealsHubPath } from '../constants/dealWorkspacePages'

/**
 * Sub-sidebar config of one deal workspace (shared SubSidebarLayout). The header shows the deal itself
 * (name + status), so the user always knows which workspace is open.
 */
export function getDealWorkspaceSidebarConfig({ dealId, deal, t }) {
  const item = (page) => ({
    id: `deal-${page.id}`,
    to: getDealPagePath(dealId, page.id),
    label: t(`dealWorkspace.pages.${page.id}`),
    icon: page.icon,
    end: page.path === '',
  })
  const status = getDealStatusValue(deal?.status)
  return {
    header: {
      icon: Handshake,
      title: deal?.name || t('dealWorkspace.loading'),
      description: status ? t(`dealWorkspace.options.dealStatus.${status}`, status) : t('dealWorkspace.workspace.description'),
    },
    ariaLabel: t('dealWorkspace.workspace.menu'),
    groups: DEAL_WORKSPACE_GROUPS.map((group) => ({
      id: group,
      label: t(`dealWorkspace.groups.${group}`),
      items: DEAL_WORKSPACE_PAGES.filter((page) => page.group === group).map(item),
    })),
    footerItems: DEAL_WORKSPACE_PAGES.filter((page) => page.group === 'footer').map(item),
  }
}

const HUB_ICONS = { deals: LayoutList, new: PlusCircle, contracts: FileSignature, calendar: CalendarDays, reports: BarChart3, pipelines: GitBranch }

/** Sub-sidebar config of the deals hub (`/deals`, `/deals/contracts`, …). */
export function getDealsHubSidebarConfig(t) {
  const groups = ['work', 'insights', 'setup']
  return {
    header: { icon: Handshake, title: t('dealWorkspace.title'), description: t('dealWorkspace.hub.description') },
    ariaLabel: t('dealWorkspace.hub.menu'),
    groups: groups.map((group) => ({
      id: group,
      label: t(`dealWorkspace.groups.${group}`),
      items: DEALS_HUB_PAGES.filter((page) => page.group === group).map((page) => ({
        id: `deals-hub-${page.id}`,
        to: getDealsHubPath(page.id),
        label: t(`dealWorkspace.hub.pages.${page.id}`),
        icon: HUB_ICONS[page.id],
        end: page.path === '',
      })),
    })),
  }
}
