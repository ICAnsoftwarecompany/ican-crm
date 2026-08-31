import { CalendarDays } from 'lucide-react'

import { RelatedCard } from '../CustomerDetailsTabPrimitives'
import { formatDateTime } from '../customerDetailsUtils'

export function CalendarTab({ customer, layoutMode = 'compact' }) {
  return (
    <div className={layoutMode === 'wide' ? 'grid grid-cols-2 gap-3 py-4' : 'py-4'}>
      <RelatedCard
        title="Creation date"
        subtitle={formatDateTime(customer.created_at || customer.createdAt)}
        icon={CalendarDays}
      />
    </div>
  )
}
