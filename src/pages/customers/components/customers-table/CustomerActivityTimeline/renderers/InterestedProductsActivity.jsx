const LEVELS = {
  high: 'مرتفع',
  medium: 'متوسط',
  low: 'منخفض',
}

function getProductName(product) {
  if (product?.name) return product.name
  if (product?.productId || product?.productId === 0) return `Product #${product.productId}`
  return 'Product'
}

export function InterestedProductsActivity({ activity }) {
  const products = Array.isArray(activity?.products) ? activity.products : []

  if (!products.length) {
    return activity?.description
      ? <p className="text-sm font-semibold text-slate-700">{activity.description}</p>
      : null
  }

  return (
    <div className="space-y-2">
      {products.map((product, index) => {
        const level = LEVELS[String(product?.interestLevel || '').toLowerCase()] || 'غير محدد'
        return (
          <div key={product?.id || index} className="rounded-xl border border-violet-200 bg-violet-50/50 p-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-black text-slate-900">{getProductName(product)}</div>
              <span className="rounded-full border border-violet-200 bg-white px-2 py-0.5 text-[11px] font-bold text-violet-700">
                اهتمام {level}
              </span>
            </div>
            {product?.note ? <p className="mt-1 text-xs font-semibold text-slate-600">{product.note}</p> : null}
          </div>
        )
      })}
    </div>
  )
}
