import { useState } from 'react'
import { PackagePlus, Plus } from 'lucide-react'
import { Button } from '../../shared/components/ui/Button'
import { Input } from '../../shared/components/ui/Input'
import { Badge } from '../../shared/components/ui/Badge'
import { DataTable } from '../../shared/components/data-table'
import { PageToolbar } from '../../shared/components/data/PageToolbar'
import { ResourceState } from '../../shared/components/data/ResourceState'
import { useProductCategories, useProductMutations, useProducts } from '../../features/products/hooks/useProducts'
import { extractMessage } from '../../shared/utils/apiResponse'

export function ProductsPage() {
  const categoriesQuery = useProductCategories()
  const productsQuery = useProducts()
  const mutations = useProductMutations()
  const [categoryName, setCategoryName] = useState('')
  const [productForm, setProductForm] = useState({ name: '', desc: '', price: '', category_id: '', status: '1' })
  const [feedback, setFeedback] = useState('')

  const categories = categoriesQuery.data || []
  const products = productsQuery.data || []

  const handleProductChange = (event) => {
    const { name, value } = event.target
    setProductForm((current) => ({ ...current, [name]: value }))
  }

  const handleCreateCategory = async (event) => {
    event.preventDefault()
    setFeedback('')

    try {
      await mutations.createCategory.mutateAsync({ name: categoryName })
      setCategoryName('')
      setFeedback('تم إنشاء الفئة')
    } catch (error) {
      setFeedback(extractMessage(error, 'فشل إنشاء الفئة'))
    }
  }

  const handleCreateProduct = async (event) => {
    event.preventDefault()
    setFeedback('')

    try {
      await mutations.createProduct.mutateAsync(productForm)
      setProductForm({ name: '', desc: '', price: '', category_id: '', status: '1' })
      setFeedback('تم إنشاء المنتج')
    } catch (error) {
      setFeedback(extractMessage(error, 'فشل إنشاء المنتج'))
    }
  }

  const productColumns = [
    {
      id: 'name',
      header: 'اسم المنتج',
      accessor: 'name',
      searchable: true,
      sortable: true,
      visible: true,
      width: 'w-32',
    },
    {
      id: 'desc',
      header: 'الوصف',
      accessor: 'desc',
      searchable: true,
      sortable: false,
      visible: true,
      width: 'w-40',
    },
    {
      id: 'price',
      header: 'السعر',
      accessor: 'price',
      searchable: false,
      sortable: true,
      visible: true,
      width: 'w-24',
      render: (row) => <span className="font-bold text-blue-600">{row.price || 'غير محدد'}</span>,
    },
    {
      id: 'category',
      header: 'الفئة',
      accessor: 'categroy.name',
      searchable: true,
      sortable: true,
      visible: true,
      width: 'w-28',
    },
    {
      id: 'status',
      header: 'الحالة',
      accessor: 'status',
      searchable: false,
      sortable: true,
      visible: true,
      width: 'w-20',
      render: (row) => (
        <Badge variant={row.status === 1 ? 'success' : 'warning'}>
          {row.status === 1 ? 'نشط' : 'معطل'}
        </Badge>
      ),
    },
    {
      id: 'createdAt',
      header: 'تاريخ الإنشاء',
      accessor: 'created_at',
      searchable: false,
      sortable: true,
      visible: true,
      width: 'w-28',
      render: (row) => new Date(row.created_at).toLocaleDateString('ar-SA'),
    },
  ]

  return (
    <div>
      <PageToolbar title="المنتجات والفئات" description="إدارة المنتجات التي يمكن ربطها بالحملات واهتمامات العملاء." />
      {feedback && <div className="mb-4 rounded-lg bg-[#E8F9FA] text-[#007A80] text-sm p-3 font-arabic">{feedback}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-4">
        <div className="grid gap-4 h-fit">
          <form onSubmit={handleCreateCategory} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 grid gap-3">
            <h2 className="font-bold">فئة جديدة</h2>
            <Input label="اسم الفئة" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} />
            <Button type="submit" loading={mutations.createCategory.isPending} className="gap-2">
              <Plus size={16} />
              إضافة فئة
            </Button>
          </form>

          <form onSubmit={handleCreateProduct} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 grid gap-3">
            <h2 className="font-bold">منتج جديد</h2>
            <Input label="اسم المنتج" name="name" value={productForm.name} onChange={handleProductChange} />
            <Input label="الوصف" name="desc" value={productForm.desc} onChange={handleProductChange} />
            <Input label="السعر" name="price" type="number" value={productForm.price} onChange={handleProductChange} />
            <label className="grid gap-1.5 text-sm font-medium font-arabic text-[var(--text)]">
              الفئة
              <select name="category_id" value={productForm.category_id} onChange={handleProductChange} className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3">
                <option value="">اختر فئة</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <Button type="submit" variant="accent" loading={mutations.createProduct.isPending} className="gap-2">
              <PackagePlus size={16} />
              إضافة منتج
            </Button>
          </form>
        </div>

        <section className="grid gap-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
            <h2 className="font-bold mb-3">الفئات</h2>
            <ResourceState isLoading={categoriesQuery.isLoading} error={categoriesQuery.error} empty={categories.length === 0} emptyTitle="لا توجد فئات" onRetry={categoriesQuery.refetch}>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge key={category.id}>{category.name}</Badge>
                ))}
              </div>
            </ResourceState>
          </div>

          <DataTable
            data={products}
            columns={productColumns}
            tableId="products"
            isLoading={productsQuery.isLoading}
            error={productsQuery.error}
            onRetry={productsQuery.refetch}
            emptyMessage="لا توجد منتجات - أضف أول منتج لاستخدامه في الحملات"
            enableSorting={true}
            enableFiltering={true}
            enablePagination={true}
            enableColumnVisibility={true}
            showToolbar={true}
            showFooter={true}
          />
        </section>
      </div>
    </div>
  )
}
