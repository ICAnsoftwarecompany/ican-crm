import { useTranslation } from 'react-i18next'
import { ProductsPage } from '../ProductsPage/ProductsPage'

export function ServicesPage() {
  const { t } = useTranslation()

  return (
    <ProductsPage
      productType="service"
      title={t('products.services.pageTitle')}
      description={t('products.services.pageDescription')}
      entityLabel={t('products.services.entityLabel')}
      tableId="services"
      emptyMessage={t('products.services.emptyMessage')}
      createLabel={t('products.services.createLabel')}
    />
  )
}
