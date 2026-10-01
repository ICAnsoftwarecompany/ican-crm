import { useTranslation } from 'react-i18next'
const LEVEL_KEYS = {
  high: 'customers.activityTimeline.levels.high',
  medium: 'customers.activityTimeline.levels.medium',
  low: 'customers.activityTimeline.levels.low',
}

function getProductName(product, t) {
  if (product?.name) return product.name
  if (product?.productId || product?.productId === 0) return t('customers.activityTimeline.productNumber', { id: product.productId })
  return t('customers.productsDialog.product')
}

export function InterestedProductsActivity({ activity }) {
  const { t } = useTranslation()
  const products = Array.isArray(activity?.products) ? activity.products : []

  if (!products.length) {
    return activity?.description
      ? <p className="text-sm font-semibold text-slate-700">{activity.description}</p>
      : null
  }

  return (
    <div className="space-y-2">
      {products.map((product, index) => {
        const levelKey = LEVEL_KEYS[String(product?.interestLevel || '').toLowerCase()]
        const level = levelKey ? t(levelKey) : t('customers.activityTimeline.levels.unspecified')
        return (
          <div key={product?.id || index} className="rounded-xl border border-violet-200 bg-violet-50/50 p-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-black text-slate-900">{getProductName(product, t)}</div>
              <span className="rounded-full border border-violet-200 bg-white px-2 py-0.5 text-[11px] font-bold text-violet-700">
                {t('customers.activityTimeline.interestLevel', { level })}
              </span>
            </div>
            {product?.note ? <p className="mt-1 text-xs font-semibold text-slate-600">{product.note}</p> : null}
          </div>
        )
      })}
    </div>
  )
}
