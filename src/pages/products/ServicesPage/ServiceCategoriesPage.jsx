import { useTranslation } from 'react-i18next'
import { ProductCategoriesPage } from '../ProductsPage/ProductCategoriesPage'

export function ServiceCategoriesPage() {
  const { t } = useTranslation()

  return (
    <ProductCategoriesPage
      categoryType="service"
      title={t('products.serviceCategories.pageTitle')}
      description={t('products.serviceCategories.pageDescription')}
      tableId="service-categories-table"
      emptyMessage={t('products.serviceCategories.emptyMessage')}
      createLabel={t('products.serviceCategories.createLabel')}
    />
  )
}
