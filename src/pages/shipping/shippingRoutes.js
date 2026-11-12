import { ShippingLayout } from './ShippingLayout'
import { ShippingWorkspacePlaceholder } from '../../features/shipping/components/ShippingWorkspacePlaceholder'

export const shippingRoutes = {
  path: 'shipping',
  element: <ShippingLayout />,
  children: [
    { index: true, element: <ShippingWorkspacePlaceholder /> },
    ...['shipments', 'claims', 'reports', 'settings'].map((path) => ({ path, element: <ShippingWorkspacePlaceholder /> })),
  ],
}
