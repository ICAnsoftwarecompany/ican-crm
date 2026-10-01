import { Mail } from 'lucide-react'

import { RelatedCard } from '../CustomerDetailsTabPrimitives'
import { fieldValue } from '../customerDetailsUtils'
import { useTranslation } from 'react-i18next'

export function EmailsTab({ customer, layoutMode = 'compact' }) {
  const { t } = useTranslation()
  return (
    <div className={layoutMode === 'wide' ? 'grid grid-cols-2 gap-3 py-4' : 'py-4'}>
      <RelatedCard title={t('customers.homeTab.primaryEmail')} subtitle={fieldValue(customer.email)} icon={Mail} />
    </div>
  )
}
