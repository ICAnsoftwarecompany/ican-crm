import { useParams, useSearchParams } from 'react-router-dom'
import { CustomerDealsWorkspace } from '../../../features/customers'

export function CustomerDealsPage() {
  const { customerId } = useParams()
  const [searchParams] = useSearchParams()
  return <CustomerDealsWorkspace key={customerId} customerId={customerId} selectedDealId={searchParams.get('deal')} />
}
