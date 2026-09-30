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
      ],
    },
    {
      id: 'organization',
      label: t('customers.nav.organization'),
      items: [
        { to: `${LEADS_CENTER_ROUTE}/segments`, label: t('customers.nav.segmentsAndTags'), icon: Tags },
        { to: `${LEADS_CENTER_ROUTE}/assignments`, label: t('customers.nav.leadDistribution'), icon: UserCheck },
        { to: `${LEADS_CENTER_ROUTE}/teams`, label: t('customers.nav.salesTeams'), icon: UsersRound },
        { to: `${LEADS_CENTER_ROUTE}/duplicates`, label: t('customers.nav.duplicateRecords'), icon: Copy },
        { to: `${LEADS_CENTER_ROUTE}/customization`, label: t('customers.nav.setupCustomization'), icon: SlidersHorizontal },
      ],
    },
    {
      id: 'tools',
      label: t('customers.nav.tools'),
      items: [
        { to: `${LEADS_CENTER_ROUTE}/status-board`, label: t('customers.nav.multiStatusView'), icon: Columns3 },
        { to: `${LEADS_CENTER_ROUTE}/activities`, label: t('customers.nav.activitiesAndAppointments'), icon: CalendarClock },
        { to: `${LEADS_CENTER_ROUTE}/proposals`, label: t('customers.nav.proposalBuilder'), icon: FileSignature },
        { to: `${LEADS_CENTER_ROUTE}/import-export`, label: t('customers.nav.importExport'), icon: ArrowLeftRight },
        { to: `${LEADS_CENTER_ROUTE}/trash`, label: t('customers.page.deletedRecordsTitle'), icon: Trash2 },
      ],
    },
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
    footerItems: [getCustomerSettingsItem(t)],
  }
}
