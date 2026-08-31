import { ProductsPage } from '../ProductsPage/ProductsPage'

export function ServicesPage() {
  return (
    <ProductsPage
      productType="service"
      title="الخدمات"
      description="إدارة الخدمات وربطها بتصنيفات الخدمات المناسبة."
      entityLabel="خدمة"
      tableId="services"
      emptyMessage="لا توجد خدمات"
      createLabel="خدمة جديدة"
    />
  )
}
