import { LeadDetailsBreadcrumbs } from '../../LeadDetailsBreadcrumbs'
import { LeadPageSwitcher } from '../../LeadPageSwitcher'

export function Customer360Navigation({ customerId }) {
  return <div className="flex flex-wrap items-center justify-between gap-3"><LeadDetailsBreadcrumbs /><LeadPageSwitcher activeCustomerId={customerId} /></div>
}
