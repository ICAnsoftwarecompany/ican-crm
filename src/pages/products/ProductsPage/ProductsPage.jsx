import { useMemo, useState } from 'react'
import { Edit3, Plus, RefreshCw } from 'lucide-react'
import { Button } from '../../../shared/components/ui/Button'
import { Badge } from '../../../shared/components/ui/Badge'
import { DataTable } from '../../../shared/components/data-table'
import { PageToolbar } from '../../../shared/components/data/PageToolbar'
import { AppModal } from '../../../shared/components/overlays/AppModal'
import { useProductCategories, useProductMutations, useProducts } from '../../../features/products/hooks/useProducts'
import { displayValue, extractMessage } from '../../../shared/utils/apiResponse'
import { resolveApiBaseURL } from '../../../services/apiBaseUrl'
import { ProductFormDrawer } from './ProductFormDrawer'
import { filterCategoryTreeByType, flattenCategoryTree, getCategoryChildren, getCategoryLabel } from './categoryTree'

function normalizeId(value) {
  if (value === null || value === undefined || value === '') return ''
  return String(value)
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('ar-EG')
}

function getProductCategoryId(product) {
  return normalizeId(
    product.category_id ||
    product.category?.id ||
    product.categroy?.id ||
    product.categoryId
  )
}

function getProductStatus(product) {
  return Number(product.status ?? product.active ?? 1) === 1
}

function normalizeItemType(item) {
  return String(item?.type ?? '')
    .trim()
    .toLowerCase()
}

function isTypeVisibleForPage(itemType, targetType) {
  if (targetType === 'product') return itemType === 'product' || itemType === ''
  return itemType === targetType
}

function hasNestedCatalogData(item) {
  return Array.isArray(item?.products) || getCategoryChildren(item).length > 0
}

function normalizeProductsForPage(items = [], productType = 'product') {
  const targetType = String(productType || 'product').trim().toLowerCase()
  const rows = []

  const visit = (item, parentCategory = null, inheritedType = '') => {
    if (!item || typeof item !== 'object') return

    const itemType = normalizeItemType(item) || inheritedType
    const isActive = getProductStatus(item)
    const nestedProducts = Array.isArray(item.products) ? item.products : []
    const children = getCategoryChildren(item)

    if (isActive && isTypeVisibleForPage(itemType, targetType) && nestedProducts.length > 0) {
      nestedProducts.forEach((product) => {
        if (!getProductStatus(product)) return

        const productItemType = normalizeItemType(product) || itemType
        if (!isTypeVisibleForPage(productItemType, targetType)) return

        rows.push({
          ...product,
          type: productItemType,
          category_id: product.category_id ?? item.id ?? product.category_id,
          category: product.category || product.categroy || item,
          _sourceCategory: item,
        })
      })
    }

    if (isActive && isTypeVisibleForPage(itemType, targetType) && !hasNestedCatalogData(item)) {
      rows.push({
        ...item,
        type: itemType,
        category_id: item.category_id ?? parentCategory?.id ?? item.category_id,
        category: item.category || item.categroy || parentCategory,
        _sourceCategory: parentCategory,
      })
    }

    children.forEach((child) => visit(child, item, itemType))
  }

  items.forEach((item) => visit(item))
  return rows
}

function parseProductData(value) {
  if (!value) return []

  let parsed = value
  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value)
    } catch {
      return []
    }
  }

  const source = Array.isArray(parsed) ? parsed[0] : parsed
  if (!source || typeof source !== 'object') return []

  return Object.entries(source).map(([key, fieldValue]) => ({
    key,
    value: typeof fieldValue === 'object' ? JSON.stringify(fieldValue) : String(fieldValue ?? ''),
  }))
}

function productDataToObject(value) {
  return parseProductData(value).reduce((result, field) => {
    result[field.key] = field.value
    return result
  }, {})
}

function getTenantBaseURL() {
  try {
    return resolveApiBaseURL()
  } catch {
    return typeof window !== 'undefined' ? window.location.origin : ''
  }
}

function buildProductImageUrl(imagePath) {
  if (!imagePath) return ''
  const image = String(imagePath).trim()
  if (!image) return ''
  if (/^https?:\/\//i.test(image)) return image

  const baseURL = getTenantBaseURL().replace(/\/+$/, '')
  const normalizedPath = image.replace(/^\/+/, '')
  return `${baseURL}/${encodeURI(normalizedPath)}`
}

function ProductImage({ product, onPreview }) {
  const imageUrl = buildProductImageUrl(product.image)

  if (!imageUrl) {
    return (
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F9FA] text-xs font-bold text-[#007A80]">
        IMG
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onPreview?.({ src: imageUrl, title: product.name || 'صورة المنتج' })}
      className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-2)] transition hover:ring-2 hover:ring-[#00C2CB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]"
      title="عرض الصورة"
    >
      <img
        src={imageUrl}
        alt={product.name || 'صورة المنتج'}
        className="h-full w-full object-cover"
        loading="lazy"
        onError={(event) => {
          event.currentTarget.style.display = 'none'
        }}
      />
    </button>
  )
}

function ProductImagePreviewModal({ image, onClose }) {
  return (
    <AppModal
      isOpen={Boolean(image)}
      onClose={onClose}
      title={image?.title || 'صورة المنتج'}
      size="lg"
      className="max-w-4xl"
    >
      <div className="flex justify-center">
        {image?.src && (
          <img
            src={image.src}
            alt={image.title || 'صورة المنتج'}
            className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain"
          />
        )}
      </div>
    </AppModal>
  )
}

export function ProductsPage({
  productType = 'product',
  title = 'المنتجات',
  description = 'إدارة المنتجات وربطها بالفئات المناسبة.',
  entityLabel = 'منتج',
  tableId = 'products',
  emptyMessage = 'لا توجد منتجات',
  createLabel = 'منتج جديد',
} = {}) {
  const categoriesQuery = useProductCategories()
  const productsQuery = useProducts()
  const mutations = useProductMutations()
  const [productDrawerMode, setProductDrawerMode] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [formError, setFormError] = useState('')
  const [previewImage, setPreviewImage] = useState(null)

  const categories = categoriesQuery.data || []
  const productCategories = useMemo(() => filterCategoryTreeByType(categories, productType), [categories, productType])
  const flatCategories = useMemo(() => flattenCategoryTree(productCategories), [productCategories])
  const allProducts = productsQuery.data || []
  const products = useMemo(() => normalizeProductsForPage(allProducts, productType), [allProducts, productType])
  const productDrawerOpen = Boolean(productDrawerMode)

  const isSavingProduct = mutations.createProduct.isPending || mutations.updateProduct.isPending

  const categoryById = useMemo(() => {
    return new Map(flatCategories.map((category) => [normalizeId(category.id || category.category_id), category]))
  }, [flatCategories])

  const tableRows = useMemo(() => {
    return products.map((product, index) => {
      const category = product.category || product.categroy || categoryById.get(getProductCategoryId(product))
      const active = getProductStatus(product)

      return {
        ...product,
        _index: index,
        _categoryLabel: category ? getCategoryLabel(category) : '',
        _active: active,
        _statusLabel: active ? 'نشط' : 'معطل',
        _dataFields: productDataToObject(product.data),
        _createdAtDisplay: formatDate(product.created_at),
        _updatedAtDisplay: formatDate(product.updated_at),
      }
    })
  }, [categoryById, products])

  const openCreateProduct = () => {
    setProductDrawerMode('create')
    setSelectedProduct(null)
    setFormError('')
  }

  const openEditProduct = (product) => {
    setProductDrawerMode('edit')
    setSelectedProduct(product)
    setFormError('')
  }

  const closeProductDrawer = () => {
    setProductDrawerMode(null)
    setSelectedProduct(null)
    setFormError('')
  }

  const handleProductSubmit = async (payload) => {
    setFormError('')

    try {
      if (productDrawerMode === 'create') {
        await mutations.createProduct.mutateAsync(payload)
      } else if (selectedProduct?.id) {
        await mutations.updateProduct.mutateAsync({ id: selectedProduct.id, payload })
      }
      closeProductDrawer()
    } catch (error) {
      setFormError(extractMessage(error, 'تعذر حفظ بيانات المنتج'))
    }
  }

  const additionalDataKeys = useMemo(() => {
    const keys = new Set()
    tableRows.forEach((row) => {
      Object.keys(row._dataFields || {}).forEach((key) => keys.add(key))
    })
    return Array.from(keys)
  }, [tableRows])

  const additionalDataColumns = useMemo(() => {
    return additionalDataKeys.map((key) => ({
      id: `data-${key}`,
      header: key,
      accessor: `_dataFields.${key}`,
      searchable: true,
      sortable: true,
      visible: true,
      width: 'w-36',
      render: (row) => displayValue(row._dataFields?.[key]),
    }))
  }, [additionalDataKeys])

  const productColumns = useMemo(() => [
    {
      id: 'image',
      header: 'الصورة',
      accessor: 'image',
      searchable: false,
      sortable: false,
      visible: true,
      width: 'w-20',
      render: (row) => <ProductImage product={row} onPreview={setPreviewImage} />,
    },
    {
      id: 'name',
      header: 'اسم المنتج',
      accessor: 'name',
      searchable: true,
      sortable: true,
      visible: true,
      width: 'w-40',
      render: (row) => (
        <span className="font-semibold text-[var(--text)]">
          {displayValue(row.name, `Product #${row.id || row._index + 1}`)}
        </span>
      ),
    },
    {
      id: 'desc',
      header: 'الوصف',
      accessor: 'desc',
      searchable: true,
      sortable: false,
      visible: true,
      width: 'w-56',
      render: (row) => displayValue(row.desc || row.description),
    },
    {
      id: 'price',
      header: 'السعر',
      accessor: 'price',
      searchable: false,
      sortable: true,
      visible: true,
      width: 'w-24',
      render: (row) => (
        <span className="font-bold text-[#1D4ED8]">
          {displayValue(row.price, 'غير محدد')}
        </span>
      ),
    },
    {
      id: 'category',
      header: 'الفئة',
      accessor: '_categoryLabel',
      searchable: true,
      sortable: true,
      visible: true,
      width: 'w-32',
      render: (row) => displayValue(row._categoryLabel),
    },
    ...additionalDataColumns,
    {
      id: 'status',
      header: 'الحالة',
      accessor: '_statusLabel',
      searchable: true,
      sortable: true,
      visible: true,
      width: 'w-24',
      render: (row) => (
        <Badge variant={row._active ? 'success' : 'warning'}>
          {row._statusLabel}
        </Badge>
      ),
    },
    {
      id: 'createdAt',
      header: 'تاريخ الإنشاء',
      accessor: '_createdAtDisplay',
      searchable: false,
      sortable: true,
      visible: true,
      width: 'w-28',
      render: (row) => displayValue(row._createdAtDisplay),
    },
    {
      id: 'actions',
      header: 'الإجراءات',
      accessor: 'id',
      searchable: false,
      sortable: false,
      visible: true,
      width: 'w-24',
      render: (row) => (
        <Button variant="outline" size="sm" onClick={() => openEditProduct(row)}>
          <Edit3 size={14} />
          تعديل
        </Button>
      ),
    },
  ], [additionalDataColumns])

  return (
    <div className="space-y-4">
      <PageToolbar
        title={title}
        description={description}
      >
        <Button
          variant="outline"
          onClick={() => {
            productsQuery.refetch()
            categoriesQuery.refetch()
          }}
          disabled={productsQuery.isFetching || categoriesQuery.isFetching}
        >
          <RefreshCw size={16} className={productsQuery.isFetching || categoriesQuery.isFetching ? 'animate-spin' : ''} />
          تحديث
        </Button>
        <Button onClick={openCreateProduct}>
          <Plus size={16} />
          {createLabel}
        </Button>
      </PageToolbar>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <div className="text-xs font-semibold text-[var(--text-muted)]">إجمالي {title}</div>
          <div className="mt-1 text-xl font-bold text-[var(--text)]">{products.length}</div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <div className="text-xs font-semibold text-[var(--text-muted)]">الفئات</div>
          <div className="mt-1 text-xl font-bold text-[var(--text)]">{productCategories.length}</div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <div className="text-xs font-semibold text-[var(--text-muted)]">{title} نشطة</div>
          <div className="mt-1 text-xl font-bold text-[var(--text)]">
            {products.filter(getProductStatus).length}
          </div>
        </div>
      </div>

      <DataTable
        data={tableRows}
        columns={productColumns}
        tableId={tableId}
        isLoading={productsQuery.isLoading || categoriesQuery.isLoading}
        error={productsQuery.error || categoriesQuery.error}
        onRetry={() => {
          productsQuery.refetch()
          categoriesQuery.refetch()
        }}
        emptyMessage={emptyMessage}
        enableSorting={true}
        enableFiltering={true}
        enablePagination={true}
        enableColumnVisibility={true}
        enableAdvancedFilters={true}
        enableGlobalSearch={true}
        enableExport={true}
        showToolbar={true}
        showFooter={true}
      />

      <ProductFormDrawer
        open={productDrawerOpen}
        mode={productDrawerMode}
        product={selectedProduct}
        categories={flatCategories}
        productFieldNames={additionalDataKeys}
        productType={productType}
        entityLabel={entityLabel}
        loading={isSavingProduct}
        error={formError}
        onClose={closeProductDrawer}
        onSubmit={handleProductSubmit}
      />

      <ProductImagePreviewModal
        image={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  )
}
