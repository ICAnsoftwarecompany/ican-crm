import { ProductsLayout } from './layout/ProductsLayout'
import { ProductsPage } from './ProductsPage/ProductsPage'
import { ProductCategoriesPage } from './ProductsPage/ProductCategoriesPage'
import { ServicesPage } from './ServicesPage/ServicesPage'
import { ServiceCategoriesPage } from './ServicesPage/ServiceCategoriesPage'
import { ProductsReportsPage } from './ProductsReportsPage'
import { ProductDetailsPage } from './ProductDetailsPage'
import { ItemTypesPage } from './ItemTypesPage'
import { UnitsPage } from './UnitsPage'
import { InstancesPage } from './InstancesPage'

/**
 * Route objects of Products & Services (2026-10-06), spread into the MainLayout children in app/router.
 * Static paths rank above `:productId`, so `/products/units` is the units page, not a product.
 */
export const productRoutes = [
  {
    path: 'products',
    element: <ProductsLayout />,
    children: [
      { index: true, element: <ProductsPage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'instances', element: <InstancesPage /> },
      { path: 'categories', element: <ProductCategoriesPage /> },
      { path: 'service-categories', element: <ServiceCategoriesPage /> },
      { path: 'item-types', element: <ItemTypesPage /> },
      { path: 'units', element: <UnitsPage /> },
      { path: 'reports', element: <ProductsReportsPage /> },
      { path: ':productId', element: <ProductDetailsPage /> },
    ],
  },
]
