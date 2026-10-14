import { Suspense, lazy } from 'react'
import { CardSkeleton } from '../../../../../shared/components/feedback/Skeleton'

// Customer Service "Service" tab (features/service, F1). Lazy so the drawer
// does not pull the Service area into the Leads Center chunk.
const CustomerServiceTab = lazy(() =>
  import('../../../../../features/service').then((module) => ({ default: module.CustomerServiceTab }))
)

/** Adapts the Leads Center customer row to the Service tab's customer shape. */
export function CustomerServiceTabSlot({ customer }) {
  const serviceCustomer = {
    id: customer?.id,
    name: customer?.lead?.name || customer?.name || '',
    phone: customer?.lead?.phone || customer?.phone || '',
  }
  return (
    <Suspense fallback={<div className="py-4"><CardSkeleton /></div>}>
      <CustomerServiceTab customer={serviceCustomer} />
    </Suspense>
  )
}
