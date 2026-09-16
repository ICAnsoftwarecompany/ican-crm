import { BadgeCheck, CalendarClock, Eye, ImageIcon, Package, Tag } from 'lucide-react'
import { buildCustomerAssetUrl } from '../CustomerTableDetailsDialogs/CustomerTableDetailsDialogs'
import { renderSafeValue } from '../customerMarketingUtils'
import { formatDataItems, formatDateTime, getProductDate } from './customerProductsDialogUtils'

function ProductImage({ product }) {
  const imageUrl = buildCustomerAssetUrl(product?.image || product?.raw?.image)

  return (
    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-[#D7EEF0] bg-[#F8FEFF]">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={product?.name || 'Product'}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-[#007A80]">
          <ImageIcon size={28} />
        </div>
      )}
    </div>
  )
}

export function ProductCard({ product, index, tone = 'interested', onOpenInfo }) {
  const dataItems = formatDataItems(product?.dataItems || [])
  const createdAt = formatDateTime(getProductDate(product))
  const raw = product?.raw || product?.linkRaw || product || {}
  const isInterested = tone === 'interested'

  return (
    <article className={`min-w-0 rounded-xl border bg-white p-3 shadow-sm ${
      isInterested ? 'border-[#BEEFF2]' : 'border-[#E2E8F0]'
    }`}>
      <div className="flex min-w-0 gap-3">
        <ProductImage product={product} />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex min-w-0 items-start gap-2">
            <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              isInterested ? 'bg-[#E8F9FA] text-[#007A80]' : 'bg-[#F1F5F9] text-[#475569]'
            }`}>
              <Package size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="break-words text-sm font-black text-[var(--text)]">
                {product?.name || `Product ${product?.productId || index + 1}`}
              </h3>
              <p className="break-words text-xs font-semibold text-[var(--text-muted)]">
                {product?.description || product?.note || '-'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenInfo?.(product)}
              className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border border-[#BEEFF2] bg-white px-2 text-[11px] font-black text-[#007A80] transition hover:bg-[#E8F9FA]"
              title="عرض تفاصيل المنتج"
            >
              <Eye size={13} />
              تفاصيل
            </button>
          </div>

          <div className="flex min-w-0 flex-wrap gap-1.5">
            {product?.sourceKind ? (
              <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-[#BEEFF2] bg-[#E8F9FA] px-2 py-0.5 text-[10px] font-black text-[#007A80]">
                <Tag size={11} />
                <span className="min-w-0 break-words">{product.sourceKind}</span>
              </span>
            ) : null}
            {product?.categoryName ? (
              <span className="max-w-full break-words rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 text-[10px] font-bold text-[#475569]">
                {product.categoryName}
              </span>
            ) : null}
            {product?.categoryType ? (
              <span className="max-w-full break-words rounded-full border border-[#CBD5E1] bg-white px-2 py-0.5 text-[10px] font-black text-[#334155]">
                {product.categoryType === 'service' ? 'خدمة' : product.categoryType === 'product' ? 'منتج' : product.categoryType}
              </span>
            ) : null}
            {product?.price ? (
              <span className="rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-2 py-0.5 text-[10px] font-black text-[#166534]">
                {product.price}
              </span>
            ) : null}
            {product?.interestLevel ? (
              <span className="rounded-full border border-[#FDE68A] bg-[#FFFBEB] px-2 py-0.5 text-[10px] font-black text-[#92400E]">
                {product.interestLevel}
              </span>
            ) : null}
            {product?.isMain ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-2 py-0.5 text-[10px] font-black text-[#166534]">
                <BadgeCheck size={11} />
                Main
              </span>
            ) : null}
            {createdAt ? (
              <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 text-[10px] font-bold text-[#475569]">
                <CalendarClock size={11} />
                <span className="min-w-0 break-words">{createdAt}</span>
              </span>
            ) : null}
          </div>

          {product?.note && product?.description ? (
            <p className="break-words rounded-lg bg-[#F8FEFF] px-2 py-1.5 text-xs font-semibold text-[#475569]">
              {product.note}
            </p>
          ) : null}

          {dataItems.length ? (
            <div className="flex min-w-0 flex-wrap gap-1">
              {dataItems.slice(0, 6).map((item) => (
                <span
                  key={`${item.key}-${renderSafeValue(item.value)}`}
                  className="inline-flex max-w-full items-center gap-1 rounded-full bg-[#F8FAFC] px-2 py-0.5 text-[10px] font-bold text-[#475569]"
                >
                  <span className="shrink-0 text-[#007A80]">{item.key}</span>
                  <span className="min-w-0 break-words">{renderSafeValue(item.value)}</span>
                </span>
              ))}
            </div>
          ) : null}

          <details className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2">
            <summary className="cursor-pointer text-xs font-black text-[#007A80]">البيانات الخام</summary>
            <pre className="mt-2 max-h-44 overflow-auto whitespace-pre-wrap break-words text-[11px] leading-5 text-[#334155]">
              {JSON.stringify(raw, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </article>
  )
}
