import { ProductCategoriesPage } from '../ProductsPage/ProductCategoriesPage'

export function ServiceCategoriesPage() {
  return (
    <ProductCategoriesPage
      categoryType="service"
      title="تصنيفات الخدمات"
      description="إدارة تصنيفات الخدمات بنفس طريقة فئات المنتجات، مع إرسال النوع service عند الإضافة أو التعديل."
      tableId="service-categories-table"
      emptyMessage="لا توجد تصنيفات خدمات"
      createLabel="تصنيف خدمة جديد"
    />
  )
}
