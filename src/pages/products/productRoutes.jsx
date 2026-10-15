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
import { ProductCreatePage } from './ProductCreatePage'
import { ItemTypeCreatePage } from './ItemTypeCreatePage'
import { ItemTypeEditPage } from './ItemTypeEditPage'
import { ProductCompletePage } from './ProductCompletePage'
import { ProductsOverviewPage } from './ProductsOverviewPage'
import { ItemTypeProductsPage } from './ItemTypeProductsPage'
import { ServiceKindPage } from './ServicesPage/ServiceKindPage'

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
      { path: 'overview', element: <ProductsOverviewPage /> },
      { path: 'new', element: <ProductCreatePage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'services/plans', element: <ServiceKindPage kind="plan" /> },
      { path: 'services/bundles', element: <ServiceKindPage kind="bundle" /> },
      { path: 'types/:itemTypeId', element: <ItemTypeProductsPage /> },
      { path: 'instances', element: <InstancesPage /> },
      { path: 'categories', element: <ProductCategoriesPage /> },
      { path: 'service-categories', element: <ServiceCategoriesPage /> },
      { path: 'item-types', element: <ItemTypesPage /> },
      { path: 'item-types/new', element: <ItemTypeCreatePage /> },
      { path: 'item-types/:itemTypeId', element: <ItemTypeEditPage /> },
      { path: 'units', element: <UnitsPage /> },
      { path: 'reports', element: <ProductsReportsPage /> },
      { path: ':productId', element: <ProductDetailsPage /> },
      { path: ':productId/complete', element: <ProductCompletePage /> },
    ],
  },
]
