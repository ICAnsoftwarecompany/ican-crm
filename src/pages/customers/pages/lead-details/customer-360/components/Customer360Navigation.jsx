import { LeadDetailsBreadcrumbs } from '../../LeadDetailsBreadcrumbs'
import { LeadPageSwitcher } from '../../LeadPageSwitcher'

export function Customer360Navigation({ customerId }) {
  return (
    <nav aria-label="التنقل داخل ملف العميل" className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1">
      <LeadDetailsBreadcrumbs />
      <LeadPageSwitcher activeCustomerId={customerId} />
    </nav>
  )
}
