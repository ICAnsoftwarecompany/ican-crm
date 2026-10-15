import { useTranslation } from 'react-i18next'
import { SubSidebarLayout } from '../../../shared/components/sub-sidebar'
import { useItemTypes } from '../../../features/products'
import { getProductsSidebarConfig } from '../constants/productNavigation'

/** Products & Services layout. The sidebar lists a sub-page per active item type (2026-10-15). */
export function ProductsLayout() {
  const { t } = useTranslation()
  const itemTypesQuery = useItemTypes()

  return (
    <SubSidebarLayout
      storageKey="products-sidebar-collapsed"
      mobileId="products-mobile-sidebar"
      mobileLabel={t('products.sidebar.ariaLabel')}
      sidebar={getProductsSidebarConfig(t, { itemTypes: itemTypesQuery.data || [] })}
    />
  )
}
