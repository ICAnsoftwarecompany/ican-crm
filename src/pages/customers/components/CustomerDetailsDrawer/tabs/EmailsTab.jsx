import { Mail } from 'lucide-react'

import { RelatedCard } from '../CustomerDetailsTabPrimitives'
import { fieldValue } from '../customerDetailsUtils'

export function EmailsTab({ customer, layoutMode = 'compact' }) {
  return (
    <div className={layoutMode === 'wide' ? 'grid grid-cols-2 gap-3 py-4' : 'py-4'}>
      <RelatedCard title="Primary email" subtitle={fieldValue(customer.email)} icon={Mail} />
    </div>
  )
}
