import { InterestCard, toInterestView, useInterestCatalogIndex } from '../../../../../../features/leads'

/**
 * "Interested products" log entry. Since 2026-10-15 each product is completed from the catalog (the log often only
 * has `product_id`), so it shows the name, kind, item type, category and price like the rest of the Leads Center.
 */
export function InterestedProductsActivity({ activity }) {
  const { index } = useInterestCatalogIndex()
  const products = Array.isArray(activity?.products) ? activity.products : []

  if (!products.length) {
    return activity?.description
      ? <p className="text-sm font-semibold text-[var(--text)]">{activity.description}</p>
      : null
  }

  return (
    <div className="space-y-2">
      {products.map((product, index_) => (
        <InterestCard key={product?.id || index_} view={toInterestView(product, index)} variant="compact" />
      ))}
    </div>
  )
}
