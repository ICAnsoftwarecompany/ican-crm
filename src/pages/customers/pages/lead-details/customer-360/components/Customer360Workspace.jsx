import { CustomerDetailsContent } from '../../../../components/CustomerDetailsDrawer/CustomerDetailsDrawer'

/** All customer data and actions continue to use the production CRM hooks. */
export function Customer360Workspace({ customerId, initialTab }) {
  return (
    <section dir="rtl" aria-label="تفاصيل العميل والأنشطة" className="min-w-0">
      <CustomerDetailsContent customer={{ id: customerId }} enabled={Boolean(customerId)} mode="360" initialTab={initialTab} />
    </section>
  )
}
