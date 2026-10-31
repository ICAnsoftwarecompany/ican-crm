import { UserPlus } from 'lucide-react'
import { useEffect } from 'react'
import { useFreshCustomers } from '../../../features/customers/hooks/useCustomers'
import { CustomerSegmentTable } from '../components/CustomerSegmentTable'
import { useTranslation } from 'react-i18next'

export function NewCustomersPage() {
  const { t } = useTranslation()
  const query = useFreshCustomers()
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isFetchNextPageError } = query
  const hasFreshCustomers = data?.pages.some((page) => page.data.length > 0)

  useEffect(() => {
    if (hasFreshCustomers || !hasNextPage || isFetchingNextPage || isFetchNextPageError) return
    fetchNextPage()
  }, [hasFreshCustomers, hasNextPage, isFetchingNextPage, fetchNextPage, isFetchNextPageError])
  return (
    <CustomerSegmentTable
      query={query}
      tableId="customers-fresh"
      title={t('customers.placeholders.newLeads.title')}
      icon={UserPlus}
    />
  )
}
