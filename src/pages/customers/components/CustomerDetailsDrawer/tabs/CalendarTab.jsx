import { CalendarDays } from 'lucide-react'

import { RelatedCard } from '../CustomerDetailsTabPrimitives'
import { formatDateTime } from '../customerDetailsUtils'
import { useTranslation } from 'react-i18next'

export function CalendarTab({ customer, layoutMode = 'compact' }) {
  const { t } = useTranslation()
  return (
    <div className={layoutMode === 'wide' ? 'grid grid-cols-2 gap-3 py-4' : 'py-4'}>
      <RelatedCard
        title={t('customers.homeTab.creationDate')}
        subtitle={formatDateTime(customer.created_at || customer.createdAt)}
        icon={CalendarDays}
      />
    </div>
  )
}
