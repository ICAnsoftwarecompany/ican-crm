import { useState } from 'react'
import { Package } from 'lucide-react'
import { getCustomerLinkedProducts } from './customerMarketingUtils'
import { OpenDetailsButton, ProductDetailsDialog } from './CustomerTableDetailsDialogs'

function formatDataItems(items = []) {
  return items
    .flatMap((item) => Object.entries(item || {}).map(([key, value]) => `${key}: ${value}`))
    .filter(Boolean)
}

const INTEREST_LEVEL_META = {
  high: { label: 'H', text: 'High', className: 'border-[#FCA5A5] bg-[#FEF2F2] text-[#B91C1C]' },
  hight: { label: 'H', text: 'High', className: 'border-[#FCA5A5] bg-[#FEF2F2] text-[#B91C1C]' },
  medium: { label: 'M', text: 'Medium', className: 'border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]' },
  low: { label: 'L', text: 'Low', className: 'border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]' },
}

function getInterestMeta(value = '') {
  const key = String(value || '').trim().toLowerCase()
  return INTEREST_LEVEL_META[key] || {
    label: key ? key.slice(0, 1).toUpperCase() : '',
    text: value,
    className: 'border-[#E2E8F0] bg-white text-[#475569]',
  }
}

export function CustomerProductsCell({ row }) {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const products = getCustomerLinkedProducts(row)

  if (!products.length) {
    return <span className="text-xs font-semibold text-[var(--text-muted)]">-</span>
  }

  return (
    <>
      <div className="flex min-w-[320px] max-w-full flex-wrap items-stretch gap-1.5">
        {products.map((product) => {
          const dataItems = formatDataItems(product.dataItems).slice(0, 2)
          const interestMeta = getInterestMeta(product.interestLevel)
        const title = [
          product.name,
          product.price ? `Price: ${product.price}` : '',
          product.description,
          product.note,
          product.interestLevel,
          ...dataItems,
        ].filter(Boolean).join(' | ')

        return (
          <div
            key={product.id}
            className="min-w-[210px] flex-1 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-2 py-1.5"
            title={title}
          >
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white text-[#007A80]">
                <Package size={14} />
              </span>
              <span className="min-w-[120px] flex-1 break-words text-xs font-black text-[var(--text)]">
                {product.name || `Product ${product.productId || ''}`}
              </span>
              {product.price ? (
                <span className="shrink-0 rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-1.5 py-0.5 text-[9px] font-black text-[#166534]">
                  {product.price}
                </span>
              ) : null}
              {product.isMain ? (
                <span className="shrink-0 rounded-full bg-[#DCFCE7] px-1.5 py-0.5 text-[9px] font-black text-[#166534]">
                  Main
                </span>
              ) : null}
              <OpenDetailsButton onClick={() => setSelectedProduct(product)} />
            </div>
            {product.note || product.description ? (
              <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1">
                <span className="min-w-0 max-w-full break-words text-[10px] font-semibold text-[var(--text-muted)]">
                  {product.note || product.description}
                </span>
                {product.interestLevel ? (
                  <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-black ${interestMeta.className}`} title={interestMeta.text}>
                    {interestMeta.label}
                  </span>
                ) : null}
              </div>
            ) : null}
            {dataItems.length ? (
              <div className="mt-1 flex flex-wrap gap-1">
                {dataItems.map((item) => (
                  <span key={item} className="rounded-full bg-white px-1.5 py-0.5 text-[9px] font-bold text-[#64748B]">
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        )
      })}
      </div>
      <ProductDetailsDialog product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </>
  )
}
