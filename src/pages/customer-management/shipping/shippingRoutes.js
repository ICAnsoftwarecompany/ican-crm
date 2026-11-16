import { createElement } from 'react'
import { ShippingLayout } from './ShippingLayout'
import { ShippingWorkspacePlaceholder } from '../../features/shipping/components/ShippingWorkspacePlaceholder'

export const shippingRoutes = {
  path: 'shipping',
  element: createElement(ShippingLayout),
  children: [
    { index: true, element: createElement(ShippingWorkspacePlaceholder) },
    ...['shipments', 'claims', 'reports', 'settings'].map((path) => ({ path, element: createElement(ShippingWorkspacePlaceholder) })),
  ],
}
