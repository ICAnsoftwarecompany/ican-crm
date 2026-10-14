import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SubSidebarLayout } from '../../../shared/components/sub-sidebar'
import { getCustomersSidebarConfig } from '../constants/customerNavigation'
import {
  CUSTOMERS_BULK_ACTIONS_PIN_MODE_EVENT,
  CUSTOMERS_SIDEBAR_BULK_ACTIONS_SLOT_ID,
} from '../constants/customersLayoutConstants'

export function CustomersLayout() {
  const { t } = useTranslation()
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
      storageKey="customers-sidebar-collapsed"
      mobileId="customers-mobile-sidebar"
      mobileLabel={t('customers.nav.leadsCenterMenu')}
      sidebar={getCustomersSidebarConfig(t)}
      afterSidebar={bulkActionsRail}
    />
  )
}
