import { useTranslation } from 'react-i18next'
import { BookOpen, Headset, Ticket, Truck, UsersRound } from 'lucide-react'
import { SubSidebarLayout } from '../../shared/components/sub-sidebar'
import { getSalesTeamsSidebarConfig } from './teams/salesTeamsNavigation'
import { getShippingNavigation } from '../../features/shipping/navigation/shippingNavigation'

const CUSTOMER_BASE = '/customer-management'

function prefixSidebar(sidebar, from, to) {
  const prefix = (path) => path === from ? to : path.startsWith(`${from}/`) ? `${to}${path.slice(from.length)}` : path
  return {
    ...sidebar,
    groups: sidebar.groups.map((group) => ({
      ...group,
      items: group.items.map((item) => ({
        ...item,
        to: item.to ? prefix(item.to) : item.to,
        children: item.children?.map((child) => ({ ...child, to: prefix(child.to) })),
      })),
    })),
    footerItems: sidebar.footerItems?.map((item) => ({ ...item, to: prefix(item.to) })),
  }
}

function getCustomerManagementSidebar(t) {
  const teams = prefixSidebar(getSalesTeamsSidebarConfig(t), '/LeadsCenter/teams', `${CUSTOMER_BASE}/teams`)
  teams.groups = teams.groups.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.id !== 'manual'),
  }))
  const shipping = prefixSidebar(getShippingNavigation(t), '/shipping', `${CUSTOMER_BASE}/shipping`)

  return {
    header: {
      icon: UsersRound,
      title: t('nav.customerManagementWorkspace'),
      description: t('nav.customerManagementDescription'),
      expandLabel: t('nav.customerManagementWorkspace'),
      collapseLabel: t('nav.customerManagementWorkspace'),
    },
    ariaLabel: t('nav.customerManagementWorkspace'),
    groups: [
      ...teams.groups,
      ...shipping.groups,
      {
        id: 'customer-tickets',
        label: t('nav.supportTickets'),
        items: [
          { id: 'tickets', to: `${CUSTOMER_BASE}/tickets`, label: t('nav.supportTickets'), icon: Ticket, end: true },
          { id: 'ticket-work', to: `${CUSTOMER_BASE}/tickets/my-work`, label: t('nav.serviceMyWork'), icon: Headset },
          { id: 'ticket-reports', to: `${CUSTOMER_BASE}/tickets/reports`, label: t('nav.serviceReports'), icon: BookOpen },
          { id: 'ticket-knowledge', to: `${CUSTOMER_BASE}/tickets/knowledge`, label: t('nav.serviceKnowledge'), icon: BookOpen },
          { id: 'ticket-settings', to: `${CUSTOMER_BASE}/tickets/settings`, label: t('nav.serviceSettings'), icon: Headset },
        ],
      },
    ],
    footerItems: [
      { id: 'shipping-settings', to: `${CUSTOMER_BASE}/shipping/settings`, label: t('nav.shippingSettings'), icon: Truck },
    ],
  }
}

export function CustomerManagementLayout() {
  const { t } = useTranslation()

  return (
    <SubSidebarLayout
      storageKey="customer-management-sidebar-collapsed"
      mobileId="customer-management-mobile-sidebar"
      mobileLabel={t('nav.customerManagementWorkspace')}
      sidebar={getCustomerManagementSidebar(t)}
    />
  )
}

export default CustomerManagementLayout
