import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { FileText, Files, FilePlus2, LayoutTemplate, Settings2, Workflow } from 'lucide-react'
import { SubSidebarLayout } from '../../../shared/components/sub-sidebar'
import { getCustomersSidebarConfig } from '../constants/customerNavigation'
import {
  CUSTOMERS_BULK_ACTIONS_PIN_MODE_EVENT,
  CUSTOMERS_SIDEBAR_BULK_ACTIONS_SLOT_ID,
} from '../constants/customersLayoutConstants'

export function CustomersLayout() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const isProposals = /^\/LeadsCenter\/proposals(?:\/|$)/.test(pathname)
  const proposalSidebar = {
    header: { icon: FileText, title: t('proposals.workspace.title'), description: t('proposals.workspace.listHelp'), expandLabel: t('proposals.workspace.title'), collapseLabel: t('proposals.workspace.title') },
    ariaLabel: t('proposals.workspace.title'),
    groups: [{ id: 'proposals', label: t('proposals.workspace.title'), items: [
      { to: '/LeadsCenter/proposals', label: t('proposals.workspace.list'), icon: Files, end: true },
      { to: '/LeadsCenter/proposals?action=new', label: t('proposals.workspace.new'), icon: FilePlus2 },
      { to: '/LeadsCenter/proposals/templates', label: t('proposals.workspace.templates'), icon: LayoutTemplate },
      { to: '/LeadsCenter/proposals?view=settings', label: t('proposals.workspace.settings'), icon: Settings2 },
      { to: '/LeadsCenter/proposals?view=automation', label: t('proposals.workspace.automation'), icon: Workflow },
    ] }],
    footerItems: [],
  }
  const [bulkActionsPinMode, setBulkActionsPinMode] = useState('none')

  useEffect(() => {
    const handlePinModeChange = (event) => {
      setBulkActionsPinMode(event.detail?.pinMode || 'none')
    }

    window.addEventListener(CUSTOMERS_BULK_ACTIONS_PIN_MODE_EVENT, handlePinModeChange)
    return () => {
      window.removeEventListener(CUSTOMERS_BULK_ACTIONS_PIN_MODE_EVENT, handlePinModeChange)
    }
  }, [])

  // Pinned "vertical" bulk-actions rail sits between the sub-sidebar and the page.
  const bulkActionsRail = (
    <aside
      id={CUSTOMERS_SIDEBAR_BULK_ACTIONS_SLOT_ID}
      className={[
        'hidden shrink-0 bg-[#F8FEFF] transition-[width,padding,border-color] duration-200 lg:sticky lg:top-[4.5rem] lg:block lg:h-[calc(100vh-4.5rem)] lg:overflow-y-auto',
        bulkActionsPinMode === 'vertical'
          ? 'w-[190px] border-e border-[#BEEFF2] p-2'
          : 'w-0 border-e border-transparent p-0',
      ].join(' ')}
      aria-label={t('customers.nav.bulkActionsRail')}
      aria-hidden={bulkActionsPinMode !== 'vertical'}
    />
  )

  return (
    <SubSidebarLayout
      storageKey={isProposals ? "proposals-sidebar-collapsed" : "customers-sidebar-collapsed"}
      mobileId={isProposals ? "proposals-mobile-sidebar" : "customers-mobile-sidebar"}
      mobileLabel={isProposals ? t("proposals.workspace.title") : t("customers.nav.leadsCenterMenu")}
      sidebar={isProposals ? proposalSidebar : getCustomersSidebarConfig(t)}
      afterSidebar={isProposals ? null : bulkActionsRail}
    />
  )
}
