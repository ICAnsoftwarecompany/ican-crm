import { useMemo, useState } from 'react'
import { AppModal } from '../../../../../shared/components/overlays/AppModal'
import { useProducts } from '../../../../../features/products/hooks/useProducts'
import { AvailableProductsPanel } from './AvailableProductsPanel'
import { InterestedProductsPanel } from './InterestedProductsPanel'
import { LeadSummaryRow } from './LeadSummaryRow'
import { ProductInfoContent, ProductInfoDialog } from './ProductInfoDialog'
import { splitProductsByInterest } from './customerProductsDialogUtils'

export function CustomerProductsDialog({ row, products = [], customerRows = [], open, onClose }) {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [dualViewEnabled, setDualViewEnabled] = useState(false)
  const productsQuery = useProducts()
  const allProducts = Array.isArray(productsQuery.data) ? productsQuery.data : []
  const { interested, available } = useMemo(
    () => splitProductsByInterest(allProducts, products),
    [allProducts, products]
  )

  return (
    <AppModal
      isOpen={Boolean(open)}
      onClose={onClose}
      title="المنتجات والاهتمامات"
      description="مقارنة منتجات العميل المهتم بها مع باقي منتجات الكتالوج"
      size="lg"
      className="flex h-[min(88vh,860px)] min-h-[520px] w-[min(96vw,1280px)] max-w-[96vw] resize flex-col overflow-hidden"
      contentClassName="min-h-0 flex-1 overflow-hidden"
      closeOnBackdrop={false}
    >
      <div className="flex h-full min-h-0 min-w-0 flex-col gap-3">
        <LeadSummaryRow
          row={row}
          interestedCount={interested.length}
          availableCount={available.length}
        />

        <div className={`grid min-h-0 min-w-0 flex-1 gap-3 ${
          dualViewEnabled && selectedProduct
            ? 'xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]'
            : 'lg:grid-cols-2'
        }`}>
          <div className={`grid min-h-0 min-w-0 gap-3 ${
            dualViewEnabled && selectedProduct ? 'lg:grid-cols-1' : 'contents'
          }`}>
            <InterestedProductsPanel products={interested} onOpenProductInfo={setSelectedProduct} />
            <AvailableProductsPanel
              products={available}
              isLoading={productsQuery.isLoading}
              isError={productsQuery.isError}
              onRetry={() => productsQuery.refetch?.()}
              onOpenProductInfo={setSelectedProduct}
            />
          </div>

          {dualViewEnabled && selectedProduct ? (
            <aside className="min-h-0 min-w-0 rounded-xl border border-[#BEEFF2] bg-white p-3 shadow-sm">
              <ProductInfoContent
                product={selectedProduct}
                customerRows={customerRows}
                compact
                onClose={() => {
                  setDualViewEnabled(false)
                  setSelectedProduct(null)
                }}
              />
            </aside>
          ) : null}
        </div>
      </div>

      <ProductInfoDialog
        product={selectedProduct}
        customerRows={customerRows}
        open={Boolean(selectedProduct && !dualViewEnabled)}
        onClose={() => setSelectedProduct(null)}
        onEnableDualView={() => setDualViewEnabled(true)}
      />
    </AppModal>
  )
}
