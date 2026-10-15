import { BarChart3, GitBranch, MessagesSquare, Plus, UserCheck, UserCog, UsersRound } from 'lucide-react'
import { SALES_TEAMS_ROUTES } from '../../features/leads'

/**
 * Sales teams sub-sidebar (2026-10-16): Teams (list + create team), Sales users (rank, manager, role, type, active),
 * Distribution rules with "New rule" (the step-by-step builder page), Chat distribution per channel, then Reports.
 * Footer: back to the Leads Center.
 */
export function getSalesTeamsSidebarConfig(t) {
  return {
    header: {
      icon: UsersRound,
      title: t('salesTeams.nav.title'),
      description: t('salesTeams.nav.description'),
      expandLabel: t('salesTeams.nav.expand'),
      collapseLabel: t('salesTeams.nav.collapse'),
    },
    ariaLabel: t('salesTeams.nav.menu'),
    groups: [
      {
        id: 'sales-teams',
        label: t('salesTeams.nav.manage'),
        items: [
          { id: 'teams', to: SALES_TEAMS_ROUTES.teams, label: t('salesTeams.nav.teams'), icon: UsersRound, end: true },
          { id: 'users', to: SALES_TEAMS_ROUTES.users, label: t('salesTeams.nav.users'), icon: UserCog },
          {
            id: 'rules',
            to: SALES_TEAMS_ROUTES.rules,
            label: t('salesTeams.nav.rules'),
            icon: GitBranch,
            end: true,
            children: [{ id: 'new-rule', to: SALES_TEAMS_ROUTES.newRule, label: t('salesTeams.nav.newRule'), icon: Plus }],
          },
          { id: 'channels', to: SALES_TEAMS_ROUTES.channels, label: t('salesTeams.nav.channels'), icon: MessagesSquare },
        ],
      },
      {
        id: 'insights',
        label: t('salesTeams.nav.insights'),
        items: [{ id: 'reports', to: SALES_TEAMS_ROUTES.reports, label: t('salesTeams.nav.reports'), icon: BarChart3 }],
      },
    ],
    footerItems: [{ id: 'leads-center', to: '/LeadsCenter', label: t('salesTeams.nav.backToLeads'), icon: UserCheck, end: true }],
  }
}
