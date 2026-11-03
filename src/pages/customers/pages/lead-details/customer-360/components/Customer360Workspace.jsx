import { CustomerDetailsContent } from '../../../../components/CustomerDetailsDrawer/CustomerDetailsDrawer'

/** Reuses the production data loaders, tabs and mutations without duplicating business logic. */
export function Customer360Workspace({ customerId, initialTab }) {
  return (
    <section dir="rtl" aria-label="تفاصيل العميل والأنشطة" className="min-w-0 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:p-4">
      <CustomerDetailsContent customer={{ id: customerId }} enabled={Boolean(customerId)} mode="360" initialTab={initialTab} />
    </section>
  )
}
