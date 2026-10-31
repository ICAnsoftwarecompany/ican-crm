import { UserRoundX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLostCustomers } from '../../../features/customers/hooks/useCustomers'
import { CustomerSegmentTable } from '../components/CustomerSegmentTable'

export function InactiveCustomersPage() {
  const { t } = useTranslation()
  const query = useLostCustomers()
  return <CustomerSegmentTable query={query} title={t('customers.placeholders.inactive.title')} tableId="customers-lost" icon={UserRoundX} />
}
