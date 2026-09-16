import { useState } from 'react'
import { Package } from 'lucide-react'
import { getCustomerLinkedProducts } from './customerMarketingUtils'
import { OpenDetailsButton } from './CustomerTableDetailsDialogs/CustomerTableDetailsDialogs'
import { CustomerProductsDialog } from './CustomerProductsDialog/CustomerProductsDialog'

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

export function CustomerProductsCell({ row, customerRows = [] }) {
  const [isProductsDialogOpen, setIsProductsDialogOpen] = useState(false)
  const products = [...getCustomerLinkedProducts(row)].sort((first, second) => {
    const firstTime = new Date(
      first?.linkRaw?.created_at ||
      first?.linkRaw?.updated_at ||
      first?.raw?.created_at ||
      first?.raw?.updated_at ||
      0
    ).getTime()
    const secondTime = new Date(
      second?.linkRaw?.created_at ||
      second?.linkRaw?.updated_at ||
      second?.raw?.created_at ||
      second?.raw?.updated_at ||
      0
    ).getTime()

    return (Number.isNaN(secondTime) ? 0 : secondTime) - (Number.isNaN(firstTime) ? 0 : firstTime)
  })
  const latestProduct = products[0]
  const remainingProducts = products.slice(1)

  if (!products.length) {
    return <span className="text-xs font-semibold text-[var(--text-muted)]">-</span>
  }

  const dataItems = formatDataItems(latestProduct.dataItems).slice(0, 2)
  const interestMeta = getInterestMeta(latestProduct.interestLevel)
  const title = [
    latestProduct.name,
    latestProduct.price ? `Price: ${latestProduct.price}` : '',
    latestProduct.description,
    latestProduct.note,
    latestProduct.interestLevel,
    ...dataItems,
    ...remainingProducts.map((product) => product.name).filter(Boolean),
  ].filter(Boolean).join(' | ')

  return (
    <>
      <div className="flex w-full min-w-0 max-w-full items-stretch gap-1.5">
        <div
          className="min-w-0 flex-1 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-2 py-1.5"
          title={title}
        >
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white text-[#007A80]">
              <Package size={14} />
            </span>
            <span className="min-w-0 flex-1 break-words text-xs font-black text-[var(--text)]">
              {latestProduct.name || `Product ${latestProduct.productId || ''}`}
            </span>
            {latestProduct.price ? (
              <span className="shrink-0 rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-1.5 py-0.5 text-[9px] font-black text-[#166534]">
                {latestProduct.price}
              </span>
            ) : null}
            {latestProduct.isMain ? (
              <span className="shrink-0 rounded-full bg-[#DCFCE7] px-1.5 py-0.5 text-[9px] font-black text-[#166534]">
                Main
              </span>
            ) : null}
            {remainingProducts.length ? (
              <span
                className="shrink-0 rounded-full border border-[#BEEFF2] bg-white px-2 py-0.5 text-[10px] font-black text-[#007A80]"
                title={remainingProducts.map((product) => product.name || `Product ${product.productId || ''}`).join(' | ')}
              >
                +{remainingProducts.length}
              </span>
            ) : null}
            <OpenDetailsButton
              onClick={() => {
                setIsProductsDialogOpen(true)
              }}
              label="عرض"
            />
          </div>
          {latestProduct.note || latestProduct.description ? (
            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1">
              <span className="min-w-0 max-w-full break-words text-[10px] font-semibold text-[var(--text-muted)]">
                {latestProduct.note || latestProduct.description}
              </span>
              {latestProduct.interestLevel ? (
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
      </div>
      <CustomerProductsDialog
        row={row}
        products={products}
        customerRows={customerRows}
        open={isProductsDialogOpen}
        onClose={() => setIsProductsDialogOpen(false)}
      />
    </>
  )
}
