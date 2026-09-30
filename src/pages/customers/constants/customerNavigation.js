import {
  ArrowLeftRight,
  BellRing,
  Bot,
  CalendarClock,
  Copy,
  Settings,
  SlidersHorizontal,
  Tags,
  Trash2,
  UserCheck,
  UserPlus,
  UserRoundX,
  Users,
  UsersRound,
  Workflow,
} from 'lucide-react'

export const LEADS_CENTER_ROUTE = '/LeadsCenter'

/**
 * Leads Center sub-sidebar (reorganized 2026-10-01):
 * - Activities & appointments moved into the first group, under "Inactive".
 * - Sales teams moved to the main sidebar (Sales → under Proposals); its route is unchanged.
 * - "Multi-status view" and "Proposal builder" removed from the sidebar (routes still exist:
 *   the status board is reachable from the main table's view switch, proposals from the main sidebar).
 * - Footer: Automation, AI setup, Settings.
 */
export function getCustomerNavigationGroups(t) {
  return [
    {
      id: 'leads-center',
      label: t('customers.title'),
      items: [
        { to: LEADS_CENTER_ROUTE, label: t('customers.nav.allLeads'), icon: Users, end: true },
        { to: `${LEADS_CENTER_ROUTE}/new`, label: t('customers.nav.newLeads'), icon: UserPlus },
        { to: `${LEADS_CENTER_ROUTE}/follow-up`, label: t('customers.nav.needsFollowUp'), icon: BellRing },
        { to: `${LEADS_CENTER_ROUTE}/inactive`, label: t('customers.nav.inactive'), icon: UserRoundX },
        { to: `${LEADS_CENTER_ROUTE}/activities`, label: t('customers.nav.activitiesAndAppointments'), icon: CalendarClock },
      ],
    },
    {
      id: 'organization',
      label: t('customers.nav.organization'),
      items: [
        { to: `${LEADS_CENTER_ROUTE}/segments`, label: t('customers.nav.segmentsAndTags'), icon: Tags },
        { to: `${LEADS_CENTER_ROUTE}/assignments`, label: t('customers.nav.leadDistribution'), icon: UserCheck },
        { to: `${LEADS_CENTER_ROUTE}/duplicates`, label: t('customers.nav.duplicateRecords'), icon: Copy },
        { to: `${LEADS_CENTER_ROUTE}/customization`, label: t('customers.nav.setupCustomization'), icon: SlidersHorizontal },
      ],
    },
    {
      id: 'tools',
      label: t('customers.nav.tools'),
      items: [
        { to: `${LEADS_CENTER_ROUTE}/import-export`, label: t('customers.nav.importExport'), icon: ArrowLeftRight },
        { to: `${LEADS_CENTER_ROUTE}/trash`, label: t('customers.page.deletedRecordsTitle'), icon: Trash2 },
      ],
    },
  ]
}

/** Pinned bottom items: Automation, AI setup, Settings. */
export function getCustomerFooterItems(t) {
  return [
    { to: `${LEADS_CENTER_ROUTE}/automation`, label: t('customers.nav.automation'), icon: Workflow },
    { to: `${LEADS_CENTER_ROUTE}/ai`, label: t('customers.nav.aiSetup'), icon: Bot },
    getCustomerSettingsItem(t),
  ]
}

export function getCustomerSettingsItem(t) {
  return {
    to: `${LEADS_CENTER_ROUTE}/settings`,
    label: t('customers.nav.leadsCenterSettings'),
    icon: Settings,
  }
}

/** Everything <SubSidebarLayout sidebar={...}> needs for the Leads Center. */
export function getCustomersSidebarConfig(t) {
  return {
    header: {
      icon: UsersRound,
      title: t('customers.nav.manageCustomers'),
      description: t('customers.nav.manageCustomersDesc'),
      expandLabel: t('customers.nav.openCustomersList'),
      collapseLabel: t('customers.nav.closeCustomersList'),
    },
    ariaLabel: t('customers.nav.customersListAriaLabel'),
    groups: getCustomerNavigationGroups(t),
    footerItems: getCustomerFooterItems(t),
  }
}
