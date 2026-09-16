import { Heart } from 'lucide-react'
import { ProductCard } from './ProductCard'

function getCategoryType(product) {
  return String(product?.categoryType || product?.raw?.categroy?.type || product?.raw?.category?.type || '').trim().toLowerCase()
}

export function InterestedProductsPanel({ products = [], onOpenProductInfo }) {
  const productCount = products.filter((product) => getCategoryType(product) === 'product').length
  const serviceCount = products.filter((product) => getCategoryType(product) === 'service').length

  return (
    <section className="flex min-h-0 min-w-0 flex-col rounded-xl border border-[#BEEFF2] bg-[#F8FEFF]">
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-[#D7EEF0] px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#007A80]">
            <Heart size={16} />
          </span>
          <div className="min-w-0">
            <h3 className="break-words text-sm font-black text-[var(--text)]">المنتجات المهتم بها</h3>
            <p className="text-xs font-semibold text-[var(--text-muted)]">
              منتجات: {productCount} | خدمات: {serviceCount}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-[#007A80]">{products.length}</span>
          <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-[#166534]">P {productCount}</span>
          <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-[#92400E]">S {serviceCount}</span>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-2 overflow-auto p-3">
        {products.length ? (
          products.map((product, index) => (
            <ProductCard
              key={product?.id || `${product?.productId || 'interested'}-${index}`}
              product={product}
              index={index}
              onOpenInfo={onOpenProductInfo}
            />
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-[#BEEFF2] bg-white p-5 text-center text-sm font-bold text-[var(--text-muted)]">
            لا توجد منتجات مهتم بها لهذا العميل
          </div>
        )}
      </div>
    </section>
  )
}
