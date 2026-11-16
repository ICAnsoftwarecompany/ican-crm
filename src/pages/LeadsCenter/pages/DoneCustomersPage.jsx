import { BadgeCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDoneCustomers } from '../../../features/customers/hooks/useCustomers'
import { CustomerSegmentTable } from '../components/CustomerSegmentTable'

export function DoneCustomersPage() {
  const { t } = useTranslation()
  const query = useDoneCustomers()
  return <CustomerSegmentTable query={query} title={t('customers.customerSegments.done')} tableId="customers-done" icon={BadgeCheck} showCustomerDeals />
}
