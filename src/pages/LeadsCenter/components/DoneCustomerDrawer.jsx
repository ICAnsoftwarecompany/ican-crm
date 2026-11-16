import { useTranslation } from 'react-i18next'
import { AppDrawer } from '../../../shared/components/overlays/AppDrawer'
import { CustomerDealsDrawerSection } from '../../../features/customers'

export function DoneCustomerDrawer({ customer, columns, open, onClose }) {
  const { t } = useTranslation()
  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      title={customer?.name || t('customers.drawer.detailsTitle')}
      size="lg"
      drawerKey="done-customer"
      closeOnBackdrop={false}
      avoidRightSidebar
      pushPage={false}
      portal
      containerClassName="z-[110000]"
      topOffset="calc(var(--layout-header-height, 48px) - 1px)"
    >
      {open && customer && <div className="min-w-0 space-y-5 text-[var(--text)]">
        <dl className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          {columns.map((column) => <div key={column.id} className="min-w-0">
            <dt className="mb-1 text-xs text-[var(--text-muted)]">{column.header}</dt>
            <dd className="break-words text-sm font-medium">{column.id !== 'name' && column.render ? column.render(customer) : customer[column.accessor] || '-'}</dd>
          </div>)}
        </dl>
        {customer.id != null && <CustomerDealsDrawerSection key={customer.id} customerId={customer.id} />}
      </div>}
    </AppDrawer>
  )
}
