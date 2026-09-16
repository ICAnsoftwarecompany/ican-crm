import { useMemo, useState } from 'react'
import { PackageSearch, RefreshCw, Search } from 'lucide-react'
import { ProductCard } from './ProductCard'
import { renderSafeValue } from '../customerMarketingUtils'

const TYPE_FILTERS = [
  { value: 'all', label: 'الكل' },
  { value: 'product', label: 'المنتجات' },
  { value: 'service', label: 'الخدمات' },
]

function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase()
}

function getCategoryType(product) {
  return normalizeText(product?.categoryType || product?.raw?.categroy?.type || product?.raw?.category?.type)
}

function getCategoryName(product) {
  return String(product?.categoryName || product?.raw?.categroy?.name || product?.raw?.category?.name || '').trim()
}

function getProductSearchText(product) {
  const dataItems = Array.isArray(product?.dataItems) ? product.dataItems : []

  return [
    product?.id,
    product?.productId,
    product?.name,
    product?.code,
    product?.description,
    product?.note,
    product?.price,
    product?.status,
    product?.sourceKind,
    product?.categoryName,
    product?.categoryType,
    product?.raw?.categroy?.name,
    product?.raw?.categroy?.type,
    product?.raw?.category?.name,
    product?.raw?.category?.type,
    ...dataItems.flatMap((item) => Object.entries(item || {}).flatMap(([key, value]) => [key, renderSafeValue(value)])),
    JSON.stringify(product?.raw || {}),
  ].map(normalizeText).filter(Boolean).join(' ')
}

function filterProducts(products, { typeFilter, categoryFilter, searchTerm }) {
  const normalizedSearch = normalizeText(searchTerm)
  const normalizedCategory = normalizeText(categoryFilter)

  return products.filter((product) => {
    const categoryType = getCategoryType(product)
    const categoryName = normalizeText(getCategoryName(product))

    if (typeFilter !== 'all' && categoryType !== typeFilter) return false
    if (normalizedCategory && categoryName !== normalizedCategory) return false
    if (normalizedSearch && !getProductSearchText(product).includes(normalizedSearch)) return false

    return true
  })
}

export function AvailableProductsPanel({
  products = [],
  isLoading = false,
  isError = false,
  onRetry,
  onOpenProductInfo,
}) {
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const categoryOptions = useMemo(() => {
    const options = products
      .map(getCategoryName)
      .filter(Boolean)
      .filter((name, index, list) => list.findIndex((item) => normalizeText(item) === normalizeText(name)) === index)
      .sort((first, second) => first.localeCompare(second))

    return options
  }, [products])

  const filteredProducts = useMemo(
    () => filterProducts(products, { typeFilter, categoryFilter, searchTerm }),
    [categoryFilter, products, searchTerm, typeFilter]
  )

  const productCount = useMemo(
    () => products.filter((product) => getCategoryType(product) === 'product').length,
    [products]
  )
  const serviceCount = useMemo(
    () => products.filter((product) => getCategoryType(product) === 'service').length,
    [products]
  )

  return (
    <section className="flex min-h-0 min-w-0 flex-col rounded-xl border border-[#E2E8F0] bg-white">
      <header className="shrink-0 border-b border-[#E2E8F0] px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F1F5F9] text-[#475569]">
              <PackageSearch size={16} />
            </span>
            <div className="min-w-0">
              <h3 className="break-words text-sm font-black text-[var(--text)]">منتجات غير مهتم بها</h3>
              <p className="text-xs font-semibold text-[var(--text-muted)]">
                منتجات: {productCount} | خدمات: {serviceCount}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-[#F8FAFC] px-2.5 py-1 text-xs font-black text-[#475569]">
            {filteredProducts.length} / {products.length}
          </span>
        </div>

        <div className="mt-3 grid gap-2 xl:grid-cols-[minmax(0,1fr)_auto_auto]">
          <label className="relative min-w-0">
            <Search size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="بحث في كل بيانات المنتجات..."
              className="h-9 w-full rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] ps-9 pe-3 text-xs font-bold text-[var(--text)] outline-none transition focus:border-[#00C2CB] focus:bg-white"
            />
          </label>

          <div className="flex min-w-0 flex-wrap rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] p-1">
            {TYPE_FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTypeFilter(option.value)}
                className={`h-7 rounded-md px-2.5 text-xs font-black transition ${
                  typeFilter === option.value
                    ? 'bg-white text-[#007A80] shadow-sm'
                    : 'text-[#64748B] hover:bg-white/70 hover:text-[var(--text)]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="h-9 min-w-40 rounded-lg border border-[#D7EEF0] bg-white px-3 text-xs font-black text-[var(--text)] outline-none transition focus:border-[#00C2CB]"
          >
            <option value="">كل الفئات</option>
            {categoryOptions.map((categoryName) => (
              <option key={categoryName} value={categoryName}>{categoryName}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-2 overflow-auto p-3">
        {isLoading ? (
          <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-5 text-center text-sm font-bold text-[var(--text-muted)]">
            جاري تحميل المنتجات...
          </div>
        ) : null}

        {isError ? (
          <div className="space-y-3 rounded-xl border border-red-100 bg-red-50 p-5 text-center text-sm font-bold text-red-700">
            <div>تعذر تحميل المنتجات</div>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-black text-red-700 transition hover:bg-red-100"
            >
              <RefreshCw size={13} />
              إعادة المحاولة
            </button>
          </div>
        ) : null}

        {!isLoading && !isError && filteredProducts.length ? (
          filteredProducts.map((product, index) => (
            <ProductCard
              key={product?.id || `${product?.productId || 'available'}-${index}`}
              product={product}
              index={index}
              tone="available"
              onOpenInfo={onOpenProductInfo}
            />
          ))
        ) : null}

        {!isLoading && !isError && !filteredProducts.length ? (
          <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-5 text-center text-sm font-bold text-[var(--text-muted)]">
            لا توجد منتجات مطابقة للفلاتر الحالية
          </div>
        ) : null}
      </div>
    </section>
  )
}
