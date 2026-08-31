import { useMemo, useState } from 'react'
import { ChevronDown, ChevronLeft, Edit3, FolderTree, GitBranch, Package, Plus, RefreshCw, Table2 } from 'lucide-react'
import { Button } from '../../../shared/components/ui/Button'
import { Badge } from '../../../shared/components/ui/Badge'
import { PageToolbar } from '../../../shared/components/data/PageToolbar'
import { DataTable } from '../../../shared/components/data-table'
import { AppModal } from '../../../shared/components/overlays/AppModal'
import { useProductCategories, useProductMutations } from '../../../features/products/hooks/useProducts'
import { displayValue, extractMessage } from '../../../shared/utils/apiResponse'
import { resolveApiBaseURL } from '../../../services/apiBaseUrl'
import { CategoryFormDrawer } from './CategoryFormDrawer'
import {
  countActiveCategoriesTree,
  countCategoriesTree,
  filterCategoryTreeByType,
  flattenCategoryTree,
  getCategoryChildren,
  getCategoryLabel,
} from './categoryTree'

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('ar-EG')
}

function getCategoryStatus(category) {
  return Number(category.active ?? category.status ?? 1) === 1
}

function getTenantBaseURL() {
  try {
    return resolveApiBaseURL()
  } catch {
    return typeof window !== 'undefined' ? window.location.origin : ''
  }
}

function buildCategoryImageUrl(imagePath) {
  if (!imagePath) return ''
  const image = String(imagePath).trim()
  if (!image) return ''
  if (/^https?:\/\//i.test(image)) return image

  const baseURL = getTenantBaseURL().replace(/\/+$/, '')
  const normalizedPath = image.replace(/^\/+/, '')
  return `${baseURL}/${encodeURI(normalizedPath)}`
}

function CategoryImage({ category, size = 'md', onPreview }) {
  const imageUrl = buildCategoryImageUrl(category.image)
  const sizeClass = size === 'sm' ? 'h-9 w-9' : 'h-11 w-11'

  if (!imageUrl) {
    return (
      <span className={`inline-flex ${sizeClass} shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#E8F9FA] text-[#007A80]`}>
        <Package size={size === 'sm' ? 16 : 18} />
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        onPreview?.({
          src: imageUrl,
          title: getCategoryLabel(category),
        })
      }}
      className={`inline-flex ${sizeClass} shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-2)] transition hover:ring-2 hover:ring-[#00C2CB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2CB]`}
      title="عرض الصورة"
    >
      <img
        src={imageUrl}
        alt={getCategoryLabel(category)}
        className="h-full w-full object-cover"
        loading="lazy"
        onError={(event) => {
          event.currentTarget.style.display = 'none'
        }}
      />
    </button>
  )
}

function CategoryImagePreviewModal({ image, onClose }) {
  return (
    <AppModal
      isOpen={Boolean(image)}
      onClose={onClose}
      title={image?.title || 'صورة الفئة'}
      size="lg"
      className="max-w-4xl"
    >
      <div className="flex justify-center">
        {image?.src && (
          <img
            src={image.src}
            alt={image.title || 'صورة الفئة'}
            className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain"
          />
        )}
      </div>
    </AppModal>
  )
}

function getExpandableCategoryIds(categories = []) {
  return flattenCategoryTree(categories)
    .filter((category) => getCategoryChildren(category).length > 0)
    .map((category) => String(category.id))
}

function parseCategoryData(value) {
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

function formatCategoryData(value) {
  return parseCategoryData(value)
    .map((field) => `${field.key}: ${field.value}`)
    .join(' | ')
}

function categoryDataToObject(value) {
  return parseCategoryData(value).reduce((result, field) => {
    result[field.key] = field.value
    return result
  }, {})
}

function CategoryDataBadges({ data }) {
  const fields = parseCategoryData(data)
  if (!fields.length) return null

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {fields.map((field) => (
        <span
          key={field.key}
          className="inline-flex items-center gap-1 rounded-full border border-[#00C2CB]/30 bg-[#E8F9FA] px-2.5 py-1 text-xs text-[#007A80]"
        >
          <strong>{field.key}</strong>
          <span>{field.value}</span>
        </span>
      ))}
    </div>
  )
}

function CategoryPathTrail({ pathLabels }) {
  if (!pathLabels.length) return null

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1 text-xs text-[var(--text-light)]">
      <span className="font-semibold text-[var(--text-muted)]">المسار:</span>
      {pathLabels.map((label, index) => (
        <span key={`${label}-${index}`} className="inline-flex items-center gap-1">
          {index > 0 && <ChevronLeft size={12} className="text-[#00C2CB]" />}
          <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5">
            {label}
          </span>
        </span>
      ))}
    </div>
  )
}

function CategoryTreeNode({
  category,
  depth = 0,
  path = [],
  expandedIds,
  onToggle,
  onEdit,
  onCreateChild,
  onPreviewImage,
}) {
  const children = getCategoryChildren(category)
  const label = getCategoryLabel(category)
  const nextPath = [...path, label]
  const isActive = getCategoryStatus(category)
  const productsCount = Array.isArray(category.products) ? category.products.length : 0
  const hasChildren = children.length > 0
  const isExpanded = expandedIds.has(String(category.id))

  const toggleCategory = () => {
    if (hasChildren) onToggle(category.id)
  }

  return (
    <div className="relative">
      <div
        className={[
          'relative rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm transition-colors',
          'before:absolute before:bottom-3 before:top-3 before:start-0 before:w-1 before:rounded-e-full before:bg-[#00C2CB]/60',
          hasChildren ? 'cursor-pointer hover:bg-[var(--surface-2)]' : '',
        ].join(' ')}
        onClick={toggleCategory}
      >
        <div className="flex flex-wrap items-start justify-between gap-3 ps-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onToggle(category.id)
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#007A80] transition-colors hover:bg-[#D2F4F6]"
                  aria-label={isExpanded ? 'إغلاق الفئة' : 'فتح الفئة'}
                >
                  {isExpanded ? <ChevronDown size={17} /> : <ChevronLeft size={17} />}
                </button>
              ) : (
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--text-muted)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                </span>
              )}

              <CategoryImage category={category} onPreview={onPreviewImage} />

              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-[var(--text)]">
                  {displayValue(label)}
                </h3>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  كود #{category.id} {category.category_id ? `داخل فئة #${category.category_id}` : 'فئة رئيسية'}
                </p>
              </div>

              <Badge variant={isActive ? 'success' : 'warning'}>
                {isActive ? 'نشطة' : 'معطلة'}
              </Badge>

              <span className="rounded-full bg-[#EEF6FF] px-2 py-1 text-xs font-semibold text-[#1D4ED8]">
                المستوى {depth + 1}
              </span>

              <span className="rounded-full bg-[var(--surface-2)] px-2 py-1 text-xs font-semibold text-[var(--text-muted)]">
                داخلها {children.length} فئة
              </span>

              <span className="rounded-full bg-[var(--surface-2)] px-2 py-1 text-xs font-semibold text-[var(--text-muted)]">
                {productsCount} منتج
              </span>

              {hasChildren && (
                <span className="rounded-full bg-[#E8F9FA] px-2 py-1 text-xs font-semibold text-[#007A80]">
                  {isExpanded ? 'مفتوحة' : 'مغلقة'}
                </span>
              )}
            </div>

            <CategoryPathTrail pathLabels={nextPath} />

            {category.desc && (
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                {category.desc}
              </p>
            )}

            <CategoryDataBadges data={category.data} />

            <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--text-light)]">
              <span>تاريخ الإنشاء: {formatDate(category.created_at) || 'غير محدد'}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(event) => {
                event.stopPropagation()
                onCreateChild(category)
              }}
            >
              <Plus size={14} />
              إضافة فرعية
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(event) => {
                event.stopPropagation()
                onEdit(category)
              }}
            >
              <Edit3 size={14} />
              تعديل
            </Button>
          </div>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="relative ms-5 mt-2 space-y-2 border-s-2 border-dashed border-[#00C2CB]/35 ps-4">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#E8F9FA] px-3 py-1 text-xs font-semibold text-[#007A80]">
            <GitBranch size={13} />
            الفئات داخل {label}
          </div>

          {children.map((child) => (
            <div key={child.id} className="relative">
              <span className="absolute -start-4 top-6 h-px w-4 bg-[#00C2CB]/45" />
              <CategoryTreeNode
                category={child}
                depth={depth + 1}
                path={nextPath}
                expandedIds={expandedIds}
                onToggle={onToggle}
                onEdit={onEdit}
                onCreateChild={onCreateChild}
                onPreviewImage={onPreviewImage}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CategoryTreeView({ categories, isLoading, error, onRetry, expandedIds, onToggle, onEdit, onCreateChild, onPreviewImage }) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-center text-sm text-[var(--text-muted)]">
        جاري تحميل شجرة الفئات...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        تعذر تحميل الفئات.
        <Button variant="outline" size="sm" className="ms-2" onClick={onRetry}>
          إعادة المحاولة
        </Button>
      </div>
    )
  }

  if (!categories.length) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
        <FolderTree className="mx-auto mb-3 text-[var(--text-muted)]" size={32} />
        <h3 className="font-bold text-[var(--text)]">لا توجد فئات</h3>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          أضف أول فئة رئيسية ثم اربط بها الفئات الفرعية.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <CategoryTreeNode
          key={category.id}
          category={category}
          expandedIds={expandedIds}
          onToggle={onToggle}
          onEdit={onEdit}
          onCreateChild={onCreateChild}
          onPreviewImage={onPreviewImage}
        />
      ))}
    </div>
  )
}

export function ProductCategoriesPage({
  categoryType = 'product',
  title = 'فئات المنتجات',
  description = 'اختر طريقة عرض الفئات: شجرة توضح التبعية، أو جدول DataTable للبحث والفرز.',
  tableId = 'product-categories-table',
  emptyMessage = 'لا توجد فئات',
  createLabel = 'فئة جديدة',
} = {}) {
  const categoriesQuery = useProductCategories()
  const mutations = useProductMutations()
  const [drawerMode, setDrawerMode] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [initialParentId, setInitialParentId] = useState('')
  const [formError, setFormError] = useState('')
  const [expandedCategoryIds, setExpandedCategoryIds] = useState(() => new Set())
  const [viewMode, setViewMode] = useState('tree')
  const [previewImage, setPreviewImage] = useState(null)

  const allCategories = categoriesQuery.data || []
  const categories = useMemo(
    () => filterCategoryTreeByType(allCategories, categoryType),
    [allCategories, categoryType]
  )
  const flatCategories = useMemo(() => flattenCategoryTree(categories), [categories])
  const totalCategories = useMemo(() => countCategoriesTree(categories), [categories])
  const activeCategories = useMemo(() => countActiveCategoriesTree(categories), [categories])
  const expandableCategoryIds = useMemo(() => getExpandableCategoryIds(categories), [categories])
  const allExpanded = expandableCategoryIds.length > 0
    && expandableCategoryIds.every((id) => expandedCategoryIds.has(id))
  const drawerOpen = Boolean(drawerMode)
  const isSaving = mutations.createCategory.isPending || mutations.updateCategory.isPending

  const tableRows = useMemo(() => {
    const categoryById = new Map(flatCategories.map((category) => [String(category.id), category]))

    return flatCategories.map((category) => {
      const children = getCategoryChildren(category)
      const parent = category.category_id ? categoryById.get(String(category.category_id)) : null
      const active = getCategoryStatus(category)

      return {
        ...category,
        _level: (category._depth || 0) + 1,
        _statusLabel: active ? 'نشطة' : 'معطلة',
        _active: active,
        _childrenCount: children.length,
        _productsCount: Array.isArray(category.products) ? category.products.length : 0,
        _parentLabel: parent ? getCategoryLabel(parent) : 'فئة رئيسية',
        _dataDisplay: formatCategoryData(category.data),
        _dataFields: categoryDataToObject(category.data),
        _createdAtDisplay: formatDate(category.created_at),
      }
    })
  }, [flatCategories])

  const openCreateDrawer = (parentCategory = null) => {
    setDrawerMode('create')
    setSelectedCategory(null)
    setInitialParentId(parentCategory?.id ? String(parentCategory.id) : '')
    setFormError('')
  }

  const openEditDrawer = (category) => {
    setDrawerMode('edit')
    setSelectedCategory(category)
    setInitialParentId('')
    setFormError('')
  }

  const closeDrawer = () => {
    setDrawerMode(null)
    setSelectedCategory(null)
    setInitialParentId('')
    setFormError('')
  }

  const toggleCategory = (categoryId) => {
    setExpandedCategoryIds((current) => {
      const next = new Set(current)
      const id = String(categoryId)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleAllCategories = () => {
    setExpandedCategoryIds(allExpanded ? new Set() : new Set(expandableCategoryIds))
  }

  const handleSubmit = async (payload) => {
    setFormError('')

    try {
      if (drawerMode === 'create') {
        await mutations.createCategory.mutateAsync(payload)
      } else if (selectedCategory?.id) {
        await mutations.updateCategory.mutateAsync({ id: selectedCategory.id, payload })
      }
      closeDrawer()
    } catch (error) {
      setFormError(extractMessage(error, 'تعذر حفظ بيانات الفئة'))
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

  const tableColumns = useMemo(() => [
    {
      id: 'image',
      header: 'الصورة',
      accessor: 'image',
      searchable: false,
      sortable: false,
      visible: true,
      width: 'w-20',
      render: (row) => <CategoryImage category={row} size="sm" onPreview={setPreviewImage} />,
    },
    {
      id: 'name',
      header: 'اسم الفئة',
      accessor: 'name',
      searchable: true,
      sortable: true,
      visible: true,
      width: 'w-44',
      render: (row) => (
        <span className="font-semibold text-[var(--text)]">
          {displayValue(getCategoryLabel(row))}
        </span>
      ),
    },
    {
      id: 'path',
      header: 'المسار',
      accessor: '_pathLabel',
      searchable: true,
      sortable: true,
      visible: true,
      width: 'w-64',
      render: (row) => displayValue(row._pathLabel),
    },
    {
      id: 'parent',
      header: 'الفئة الأب',
      accessor: '_parentLabel',
      searchable: true,
      sortable: true,
      visible: true,
      width: 'w-36',
      render: (row) => displayValue(row._parentLabel),
    },
    {
      id: 'level',
      header: 'المستوى',
      accessor: '_level',
      searchable: false,
      sortable: true,
      visible: true,
      width: 'w-24',
      render: (row) => `المستوى ${row._level}`,
    },
    {
      id: 'children',
      header: 'فئات داخلها',
      accessor: '_childrenCount',
      searchable: false,
      sortable: true,
      visible: true,
      width: 'w-28',
      render: (row) => row._childrenCount,
    },
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
    ...additionalDataColumns,
    {
      id: 'createdAt',
      header: 'تاريخ الإنشاء',
      accessor: '_createdAtDisplay',
      searchable: false,
      sortable: true,
      visible: true,
      width: 'w-32',
      render: (row) => displayValue(row._createdAtDisplay),
    },
    {
      id: 'actions',
      header: 'الإجراءات',
      accessor: 'id',
      searchable: false,
      sortable: false,
      visible: true,
      width: 'w-44',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => openCreateDrawer(row)}>
            <Plus size={14} />
            فرعية
          </Button>
          <Button variant="outline" size="sm" onClick={() => openEditDrawer(row)}>
            <Edit3 size={14} />
            تعديل
          </Button>
        </div>
      ),
    },
  ], [additionalDataColumns])

  return (
    <div className="space-y-4">
      <PageToolbar
        title={title}
        description={description}
      >
        <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1">
          <Button
            variant={viewMode === 'tree' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('tree')}
          >
            <FolderTree size={15} />
            شجرة
          </Button>
          <Button
            variant={viewMode === 'table' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <Table2 size={15} />
            جدول
          </Button>
        </div>
        {viewMode === 'tree' && (
          <Button
            variant="outline"
            onClick={toggleAllCategories}
            disabled={!expandableCategoryIds.length}
          >
            {allExpanded ? <ChevronDown size={16} /> : <ChevronLeft size={16} />}
            {allExpanded ? 'إغلاق كل الفئات' : 'فتح كل الفئات'}
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => categoriesQuery.refetch()}
          disabled={categoriesQuery.isFetching}
        >
          <RefreshCw size={16} className={categoriesQuery.isFetching ? 'animate-spin' : ''} />
          تحديث
        </Button>
        <Button onClick={() => openCreateDrawer()}>
          <Plus size={16} />
          {createLabel}
        </Button>
      </PageToolbar>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
            <FolderTree size={14} />
            إجمالي الفئات
          </div>
          <div className="mt-1 text-xl font-bold text-[var(--text)]">{totalCategories}</div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
            <GitBranch size={14} />
            فئات رئيسية
          </div>
          <div className="mt-1 text-xl font-bold text-[var(--text)]">{categories.length}</div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
            <Package size={14} />
            فئات نشطة
          </div>
          <div className="mt-1 text-xl font-bold text-[var(--text)]">{activeCategories}</div>
        </div>
      </div>

      {viewMode === 'tree' ? (
        <CategoryTreeView
          categories={categories}
          isLoading={categoriesQuery.isLoading}
          error={categoriesQuery.error}
          onRetry={categoriesQuery.refetch}
          expandedIds={expandedCategoryIds}
          onToggle={toggleCategory}
          onEdit={openEditDrawer}
          onCreateChild={openCreateDrawer}
          onPreviewImage={setPreviewImage}
        />
      ) : (
        <DataTable
          data={tableRows}
          columns={tableColumns}
          tableId={tableId}
          isLoading={categoriesQuery.isLoading}
          error={categoriesQuery.error}
          onRetry={categoriesQuery.refetch}
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
      )}

      <CategoryFormDrawer
        open={drawerOpen}
        mode={drawerMode}
        category={selectedCategory}
        initialParentId={initialParentId}
        categoryType={categoryType}
        categories={flatCategories}
        loading={isSaving}
        error={formError}
        onClose={closeDrawer}
        onSubmit={handleSubmit}
      />

      <CategoryImagePreviewModal
        image={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  )
}
