import { Target } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useRetargetingCustomers } from '../../../features/customers/hooks/useCustomers'
import { CustomerSegmentTable } from '../components/CustomerSegmentTable'

export function RetargetingCustomersPage() {
  const { t } = useTranslation()
  const query = useRetargetingCustomers()
  return <CustomerSegmentTable query={query} title={t('customers.customerSegments.retargeting')} tableId="customers-retargeting" icon={Target} />
}
