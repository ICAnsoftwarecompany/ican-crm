import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  CalendarClock,
  Columns2,
  ImageIcon,
  Loader2,
  Package,
  RefreshCw,
  UsersRound,
  X,
} from 'lucide-react'
import { AppModal } from '../../../../../shared/components/overlays/AppModal'
import { productsApi } from '../../../../../features/products/api/productsApi'
import { buildCustomerAssetUrl } from '../CustomerTableDetailsDialogs/CustomerTableDetailsDialogs'
import { getCustomerLinkedProducts, parseMarketingData, renderSafeValue } from '../customerMarketingUtils'
import {
  formatDataItems,
  formatDateTime,
  getCustomerLead,
  getProductIdentity,
  normalizeProduct,
} from './customerProductsDialogUtils'

function extractProductInfo(response) {
  if (response?.success && response?.data && typeof response.data === 'object') {
    return response.data
  }

  if (response?.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
    return response.data
  }

  return response || null
}

function getProductId(product) {
  return getProductIdentity(product)
}

function getLeadName(row) {
  const lead = getCustomerLead(row)
  return lead?.name || row?.name || row?.customer?.name || '-'
}

function getLeadPhone(row) {
  const lead = getCustomerLead(row)
  return lead?.phone || row?.phone || '-'
}

function getLeadStatus(row) {
  const lead = getCustomerLead(row)
  return lead?.status?.status || lead?.status?.name || lead?.status_title || lead?.status || '-'
}

function getInterestedCustomers(product, rows = []) {
  const productId = getProductId(product)
  if (!productId) return []

  return rows
    .map((row) => {
      const match = getCustomerLinkedProducts(row).find((item) => getProductId(item) === productId)
      return match ? { row, interest: match } : null
    })
    .filter(Boolean)
}

function DetailItem({ label, value }) {
  if (value === null || value === undefined || value === '') return null

  return (
    <div className="min-w-0 rounded-lg border border-[#E2E8F0] bg-white p-2">
      <div className="text-[10px] font-black uppercase text-[#007A80]">{label}</div>
      <div className="break-words text-xs font-bold text-[var(--text)]">{renderSafeValue(value)}</div>
    </div>
  )
}

function KeyValueGrid({ title, items = [], emptyLabel = 'لا توجد بيانات إضافية' }) {
  return (
    <section className="rounded-xl border border-[#D7EEF0] bg-[#F8FEFF] p-3">
      <h4 className="mb-2 text-sm font-black text-[var(--text)]">{title}</h4>
      {items.length ? (
        <div className="grid min-w-0 gap-2 sm:grid-cols-2">
          {items.map((item) => (
            <DetailItem key={`${item.key}-${renderSafeValue(item.value)}`} label={item.key} value={item.value} />
          ))}
        </div>
      ) : (
        <span className="text-xs font-bold text-[var(--text-muted)]">{emptyLabel}</span>
      )}
    </section>
  )
}

function ProductHero({ product, compact = false }) {
  const imageUrl = buildCustomerAssetUrl(product?.image)
  const category = product?.raw?.categroy || product?.raw?.category || {}

  return (
    <div className={`grid min-w-0 gap-3 ${compact ? 'xl:grid-cols-1' : 'lg:grid-cols-[220px_minmax(0,1fr)]'}`}>
      <div className={`${compact ? 'h-36' : 'h-52'} overflow-hidden rounded-xl border border-[#D7EEF0] bg-[#F8FEFF]`}>
        {imageUrl ? (
          <img src={imageUrl} alt={product?.name || 'Product'} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-[#007A80]">
            <ImageIcon size={compact ? 34 : 44} />
          </div>
        )}
      </div>

      <div className="min-w-0 space-y-3">
        <div className="flex min-w-0 items-start gap-2">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F9FA] text-[#007A80]">
            <Package size={20} />
          </span>
          <div className="min-w-0">
            <h3 className="break-words text-lg font-black text-[var(--text)]">{product?.name || '-'}</h3>
            <p className="break-words text-sm font-semibold text-[var(--text-muted)]">{product?.description || '-'}</p>
          </div>
        </div>

        <div className={`grid min-w-0 gap-2 ${compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-3'}`}>
          <DetailItem label="ID" value={product?.productId || product?.id} />
          <DetailItem label="Code" value={product?.code} />
          <DetailItem label="Price" value={product?.price} />
          <DetailItem label="Status" value={product?.status} />
          <DetailItem label="Category" value={product?.categoryName || category?.name} />
          <DetailItem label="Type" value={product?.categoryType || category?.type} />
          <DetailItem label="Created At" value={formatDateTime(product?.raw?.created_at || product?.created_at)} />
          <DetailItem label="Updated At" value={formatDateTime(product?.raw?.updated_at || product?.updated_at)} />
        </div>
      </div>
    </div>
  )
}

function ProductDataSection({ product, compact = false }) {
  const category = product?.raw?.categroy || product?.raw?.category || {}
  const productDataItems = formatDataItems(product?.dataItems?.length ? product.dataItems : parseMarketingData(product?.raw?.data || product?.data))
  const categoryDataItems = formatDataItems(parseMarketingData(category?.data))

  return (
    <div className={`grid min-w-0 gap-3 ${compact ? 'grid-cols-1' : 'lg:grid-cols-2'}`}>
      <KeyValueGrid title="البيانات الإضافية للمنتج" items={productDataItems} />

      <section className="rounded-xl border border-[#E2E8F0] bg-white p-3">
        <h4 className="mb-2 text-sm font-black text-[var(--text)]">بيانات الفئة</h4>
        <div className="grid min-w-0 gap-2 sm:grid-cols-2">
          <DetailItem label="Name" value={category?.name} />
          <DetailItem label="Description" value={category?.desc || category?.description} />
          <DetailItem label="Type" value={category?.type} />
          <DetailItem label="Status" value={category?.status} />
        </div>
        {categoryDataItems.length ? (
          <div className="mt-2">
            <KeyValueGrid title="البيانات الإضافية للفئة" items={categoryDataItems} />
          </div>
        ) : null}
      </section>
    </div>
  )
}

function InterestedCustomersTable({ rows = [], compact = false }) {
  return (
    <section className="rounded-xl border border-[#D7EEF0] bg-white">
      <header className="flex items-center justify-between gap-2 border-b border-[#D7EEF0] px-3 py-2">
        <div className="flex items-center gap-2 text-sm font-black text-[var(--text)]">
          <UsersRound size={16} className="text-[#007A80]" />
          العملاء المهتمين
        </div>
        <span className="rounded-full bg-[#E8F9FA] px-2.5 py-1 text-xs font-black text-[#007A80]">{rows.length}</span>
      </header>

      <div className={`${compact ? 'max-h-56' : 'max-h-72'} overflow-auto`}>
        <table className="w-full min-w-[620px] border-collapse text-start text-xs">
          <thead className="sticky top-0 bg-[#F8FEFF] text-[#475569]">
            <tr>
              <th className="border-b border-[#D7EEF0] px-3 py-2 text-start">العميل</th>
              <th className="border-b border-[#D7EEF0] px-3 py-2 text-start">الهاتف</th>
              <th className="border-b border-[#D7EEF0] px-3 py-2 text-start">الحالة</th>
              <th className="border-b border-[#D7EEF0] px-3 py-2 text-start">مستوى الاهتمام</th>
              <th className="border-b border-[#D7EEF0] px-3 py-2 text-start">تاريخ الاهتمام</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? rows.map(({ row, interest }, index) => (
              <tr key={`${row?.id || index}-${interest?.id || interest?.productId}`} className="border-b border-[#EEF4F5] last:border-b-0">
                <td className="px-3 py-2 font-black text-[var(--text)]">{getLeadName(row)}</td>
                <td className="px-3 py-2 font-semibold text-[#475569]">{getLeadPhone(row)}</td>
                <td className="px-3 py-2 font-semibold text-[#475569]">{getLeadStatus(row)}</td>
                <td className="px-3 py-2 font-semibold text-[#92400E]">{interest?.interestLevel || '-'}</td>
                <td className="px-3 py-2 font-semibold text-[#475569]">
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock size={12} />
                    {formatDateTime(interest?.linkRaw?.created_at || interest?.raw?.created_at || interest?.created_at)}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center font-bold text-[var(--text-muted)]">
                  لا يوجد عملاء مهتمين بهذا المنتج داخل بيانات الجدول الحالية
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function ProductInfoContent({
  product,
  customerRows = [],
  compact = false,
  onEnableDualView,
  onClose,
  showDualButton = false,
}) {
  const productId = getProductId(product)
  const productInfoQuery = useQuery({
    queryKey: ['customer-products-dialog', 'product-info', productId],
    queryFn: () => productsApi.getProductInfo(productId),
    enabled: Boolean(productId),
    select: extractProductInfo,
  })

  const normalizedProduct = useMemo(
    () => normalizeProduct(productInfoQuery.data || product || {}, product?.sourceKind || 'catalog'),
    [product, productInfoQuery.data]
  )
  const interestedCustomers = useMemo(
    () => getInterestedCustomers(normalizedProduct, customerRows),
    [customerRows, normalizedProduct]
  )

  return (
    <div className={`min-w-0 ${compact ? 'h-full overflow-auto pe-1' : 'space-y-4'}`}>
      <div className="mb-3 flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-xl border border-[#D7EEF0] bg-[#F8FEFF] px-3 py-2">
        <div className="min-w-0">
          <div className="break-words text-sm font-black text-[var(--text)]">{normalizedProduct?.name || 'تفاصيل المنتج'}</div>
          <div className="text-xs font-semibold text-[var(--text-muted)]">
            {productInfoQuery.isFetching ? 'جاري تحديث البيانات...' : `العملاء المهتمين: ${interestedCustomers.length}`}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          {showDualButton ? (
            <button
              type="button"
              onClick={onEnableDualView}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#BEEFF2] bg-white px-2.5 text-xs font-black text-[#007A80] transition hover:bg-[#E8F9FA]"
            >
              <Columns2 size={14} />
              عرض مزدوج
            </button>
          ) : null}
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#475569] transition hover:bg-[#F8FAFC]"
              title="إغلاق التفاصيل"
            >
              <X size={15} />
            </button>
          ) : null}
        </div>
      </div>

      {productInfoQuery.isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-[#D7EEF0] bg-[#F8FEFF] p-4 text-sm font-bold text-[#007A80]">
          <Loader2 size={16} className="animate-spin" />
          جاري تحميل بيانات المنتج...
        </div>
      ) : null}

      {productInfoQuery.isError ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">
          <span>تعذر تحميل بيانات المنتج</span>
          <button
            type="button"
            onClick={() => productInfoQuery.refetch()}
            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-black text-red-700 transition hover:bg-red-100"
          >
            <RefreshCw size={13} />
            إعادة المحاولة
          </button>
        </div>
      ) : null}

      <div className="space-y-4">
        <ProductHero product={normalizedProduct} compact={compact} />
        <ProductDataSection product={normalizedProduct} compact={compact} />
        <InterestedCustomersTable rows={interestedCustomers} compact={compact} />

        <section className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
          <h4 className="mb-2 text-sm font-black text-[var(--text)]">كل البيانات الخام</h4>
          <pre className={`${compact ? 'max-h-52' : 'max-h-72'} overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-950 p-3 text-xs leading-6 text-slate-100`}>
            {JSON.stringify(productInfoQuery.data || normalizedProduct.raw || product || {}, null, 2)}
          </pre>
        </section>
      </div>
    </div>
  )
}

export function ProductInfoDialog({ product, customerRows = [], open, onClose, onEnableDualView }) {
  return (
    <AppModal
      isOpen={Boolean(open)}
      onClose={onClose}
      title={product?.name || 'تفاصيل المنتج'}
      description="تفاصيل المنتج أو الخدمة مع العملاء المهتمين"
      size="lg"
      className="max-w-6xl"
      closeOnBackdrop={false}
    >
      <ProductInfoContent
        product={product}
        customerRows={customerRows}
        onClose={onClose}
        onEnableDualView={onEnableDualView}
        showDualButton
      />
    </AppModal>
  )
}
