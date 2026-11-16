import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Columns2, Package, PhoneCall } from 'lucide-react'
import { CatalogBrowserDrawer } from '../../../features/products'
import { cn } from '../../../shared/utils/cn'

const toolClass = 'relative inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-sm font-bold transition-colors'

function CountDot({ count, className }) {
  return (
    <span className={cn('absolute -top-1.5 -end-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-black leading-none text-white', className)}>
      {count > 99 ? '99+' : count}
    </span>
  )
}

/**
 * Leads Center header tools, next to the Table / Pipeline switch (2026-10-15; moved from the status tabs bar):
 * multi-status view, today's meetings / calls side panel (table view only), and the products & services browser.
 */
export function CustomersHeaderTools({ multiViewStatusId = null, activeActivityDrawerType, onToggleActivityDrawer, meetingsTodayCount = 0, callsTodayCount = 0, showActivities = true }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [catalogOpen, setCatalogOpen] = useState(false)
  // Multi-status board, opened on the selected status tab (same URL as before the move).
  const openMultiView = () => navigate(`/LeadsCenter/status-board${multiViewStatusId ? `?statuses=${multiViewStatusId}` : ''}`)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => setCatalogOpen(true)}
        className={cn(toolClass, catalogOpen ? 'border-[#00C2CB] bg-[var(--surface-2)] text-[#007A80]' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-2)]')}
        title={t('catalog.browser.button')}
        aria-label={t('catalog.browser.button')}
      >
        <Package size={16} />
        <span className="customers-header-tool-label">{t('catalog.browser.button')}</span>
      </button>

      <button
        type="button"
        onClick={openMultiView}
        title={t('customers.productsDialog.dualView')}
        aria-label={t('customers.productsDialog.dualView')}
        className={cn(toolClass, 'border-[#00C2CB] bg-[var(--surface)] text-[#007A80] hover:bg-[var(--surface-2)]')}
      >
        <Columns2 size={16} />
        <span className="customers-header-tool-label">{t('customers.productsDialog.dualView')}</span>
      </button>

      {showActivities && (
        <>
          <button
            type="button"
            onClick={() => onToggleActivityDrawer?.('meeting')}
            className={cn(toolClass, 'w-9 px-0', activeActivityDrawerType === 'meeting' ? 'border-[#00C2CB] bg-[var(--surface-2)] text-[#007A80]' : 'border-[var(--border)] bg-[var(--surface)] text-[#0F766E] hover:bg-[var(--surface-2)]')}
            title={t('customers.page.meetingsToday')}
            aria-label={t('customers.page.meetingsToday')}
            aria-pressed={activeActivityDrawerType === 'meeting'}
          >
            <CalendarDays size={17} />
            <CountDot count={meetingsTodayCount} className="bg-[#0F766E]" />
          </button>
          <button
            type="button"
            onClick={() => onToggleActivityDrawer?.('call')}
            className={cn(toolClass, 'w-9 px-0', activeActivityDrawerType === 'call' ? 'border-[#EF4444] bg-[var(--surface-2)] text-[#B91C1C]' : 'border-[var(--border)] bg-[var(--surface)] text-[#B91C1C] hover:bg-[var(--surface-2)]')}
            title={t('customers.page.callsToday')}
            aria-label={t('customers.page.callsToday')}
            aria-pressed={activeActivityDrawerType === 'call'}
          >
            <PhoneCall size={17} />
            <CountDot count={callsTodayCount} className="bg-[#B91C1C]" />
          </button>
        </>
      )}

      <CatalogBrowserDrawer open={catalogOpen} onClose={() => setCatalogOpen(false)} />
    </div>
  )
}
