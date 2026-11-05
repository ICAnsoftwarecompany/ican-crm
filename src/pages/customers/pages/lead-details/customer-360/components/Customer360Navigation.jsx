import { useTranslation } from 'react-i18next'
import { LeadDetailsBreadcrumbs } from '../../LeadDetailsBreadcrumbs'
import { LeadPageSwitcher } from '../../LeadPageSwitcher'

export function Customer360Navigation({ customerId }) {
  const { t } = useTranslation()

  return (
    <nav aria-label={t('customers.leadDetails.profileNavigation')} className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1">
      <LeadDetailsBreadcrumbs />
      <LeadPageSwitcher activeCustomerId={customerId} />
    </nav>
  )
}
