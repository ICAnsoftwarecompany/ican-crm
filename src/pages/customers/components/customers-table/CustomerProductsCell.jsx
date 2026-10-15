import { useState } from 'react'
import { InterestCard, toInterestView, useInterestCatalogIndex } from '../../../../features/leads'
import { getCustomerLinkedProducts } from './customerMarketingUtils'
import { OpenDetailsButton } from './CustomerTableDetailsDialogs/CustomerTableDetailsDialogs'
import { CustomerProductsDialog } from './CustomerProductsDialog/CustomerProductsDialog'

const productTime = (product) => {
  const time = new Date(
    product?.linkRaw?.created_at || product?.linkRaw?.updated_at || product?.raw?.created_at || product?.raw?.updated_at || 0
  ).getTime()
  return Number.isNaN(time) ? 0 : time
}

/**
 * "Products & interests" column: the latest interest as the catalog describes it (name, kind, item type · category,
 * price, level, details), "+N" for the others, and the products dialog. Rebuilt 2026-10-15 on the shared
 * `InterestCard` from `features/leads/interests`.
 */
export function CustomerProductsCell({ row, customerRows = [], t }) {
  const [isProductsDialogOpen, setIsProductsDialogOpen] = useState(false)
  const { index } = useInterestCatalogIndex()
  const products = [...getCustomerLinkedProducts(row)].sort((a, b) => productTime(b) - productTime(a))

  if (!products.length) {
    return <span className="text-xs font-semibold text-[var(--text-muted)]">-</span>
  }

  const views = products.map((product) => toInterestView(product, index))
  const [latest, ...others] = views

  return (
    <>
      <InterestCard
        view={latest}
        variant="compact"
        className="w-full max-w-full"
        actions={(
          <span className="flex shrink-0 items-center gap-1">
            {others.length > 0 && (
              <span
                className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-bold text-[var(--text)]"
                title={others.map((view) => view.name).filter(Boolean).join(' | ')}
              >
                +{others.length}
              </span>
            )}
            <OpenDetailsButton onClick={() => setIsProductsDialogOpen(true)} label={t ? t('customers.table.view') : 'View'} />
          </span>
        )}
      />
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
