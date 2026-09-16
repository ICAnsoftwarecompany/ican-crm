import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { PanelLeft } from 'lucide-react'
import {
  CUSTOMERS_BULK_ACTIONS_PIN_MODE_EVENT,
  CUSTOMERS_SIDEBAR_BULK_ACTIONS_SLOT_ID,
  CustomersSidebar,
} from './CustomersSidebar'
import { CustomersMobileSidebar } from './CustomersMobileSidebar'
import { useLocalStorage } from '../../../shared/components/data-table/hooks/useLocalStorage'

export function CustomersLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [bulkActionsPinMode, setBulkActionsPinMode] = useState('none')
  const [customersSidebarCollapsed, setCustomersSidebarCollapsed] = useLocalStorage(
    'customers-sidebar-collapsed',
    false
  )

  useEffect(() => {
    const handlePinModeChange = (event) => {
      setBulkActionsPinMode(event.detail?.pinMode || 'none')
    }

    window.addEventListener(CUSTOMERS_BULK_ACTIONS_PIN_MODE_EVENT, handlePinModeChange)
    return () => {
      window.removeEventListener(CUSTOMERS_BULK_ACTIONS_PIN_MODE_EVENT, handlePinModeChange)
    }
  }, [])

  return (
    <div className="flex min-h-0 flex-1 overflow-visible rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <CustomersSidebar
        collapsed={customersSidebarCollapsed}
        onToggleCollapse={() => setCustomersSidebarCollapsed((value) => !value)}
      />
      <aside
        id={CUSTOMERS_SIDEBAR_BULK_ACTIONS_SLOT_ID}
        className={[
          'hidden shrink-0 bg-[#F8FEFF] transition-[width,padding,border-color] duration-200 lg:sticky lg:top-[4.5rem] lg:block lg:h-[calc(100vh-4.5rem)] lg:overflow-y-auto',
          bulkActionsPinMode === 'vertical'
            ? 'w-[190px] border-e border-[#BEEFF2] p-2'
            : 'w-0 border-e border-transparent p-0',
        ].join(' ')}
        aria-label="إجراءات العملاء المحددين"
        aria-hidden={bulkActionsPinMode !== 'vertical'}
      />
      <CustomersMobileSidebar
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <main className="min-w-0 flex-1 bg-[var(--brand-bg)]">
        <div className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]"
            aria-expanded={mobileSidebarOpen}
            aria-controls="customers-mobile-sidebar"
          >
            <PanelLeft size={16} />
            قائمة مركز العملاء المحتملين
          </button>
        </div>

        <div className="min-w-0 p-4 lg:p-5">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
