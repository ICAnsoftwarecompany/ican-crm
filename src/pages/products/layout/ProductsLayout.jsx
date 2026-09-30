import { useTranslation } from 'react-i18next'
import { SubSidebarLayout } from '../../../shared/components/sub-sidebar'
import { getProductsSidebarConfig } from '../constants/productNavigation'

export function ProductsLayout() {
  const { t } = useTranslation()

  return (
    <SubSidebarLayout
      storageKey="products-sidebar-collapsed"
      mobileId="products-mobile-sidebar"
      mobileLabel={t('products.sidebar.ariaLabel')}
      sidebar={getProductsSidebarConfig(t)}
    />
  )
}
