import { useTranslation } from 'react-i18next'
import { CustomerDetailsContent } from '../../../../components/CustomerDetailsDrawer/CustomerDetailsDrawer'

/** All customer data and actions continue to use the production CRM hooks. */
export function Customer360Workspace({ customerId, initialTab }) {
  const { t } = useTranslation()

  return (
    <section aria-label={t('customers.leadDetails.customerDetailsAndActivities')} className="min-w-0">
      <CustomerDetailsContent customer={{ id: customerId }} enabled={Boolean(customerId)} mode="360" initialTab={initialTab} />
    </section>
  )
}
