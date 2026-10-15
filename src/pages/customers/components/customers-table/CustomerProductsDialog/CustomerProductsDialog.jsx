import { useMemo, useState } from 'react'
import { AppModal } from '../../../../../shared/components/overlays/AppModal'
import { toInterestView, useInterestCatalogIndex } from '../../../../../features/leads'
import { AvailableProductsPanel } from './AvailableProductsPanel'
import { InterestedProductsPanel } from './InterestedProductsPanel'
import { LeadSummaryRow } from './LeadSummaryRow'
import { ProductInfoContent, ProductInfoDialog } from './ProductInfoDialog'
import { splitProductsByInterest } from './customerProductsDialogUtils'
import { useTranslation } from 'react-i18next'

export function CustomerProductsDialog({ row, products = [], customerRows = [], open, onClose }) {
  const { t } = useTranslation()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [dualViewEnabled, setDualViewEnabled] = useState(false)
  // Catalog-aware since 2026-10-15: items carry the legacy product (for ProductInfoDialog) and the display view.
  const catalog = useInterestCatalogIndex()
  const { interested, available } = useMemo(() => {
    const split = splitProductsByInterest(catalog.products.map((product) => product.raw), products)
    const toItem = (product) => ({ product, view: toInterestView(product, catalog.index) })
    return { interested: split.interested.map(toItem), available: split.available.map(toItem) }
  }, [catalog.index, catalog.products, products])

  return (
    <AppModal
      isOpen={Boolean(open)}
      onClose={onClose}
      title={t('customers.productsDialog.title')}
      description={t('customers.productsDialog.description')}
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
            <InterestedProductsPanel items={interested} onOpenProductInfo={setSelectedProduct} />
            <AvailableProductsPanel
              items={available}
              isLoading={catalog.isLoading}
              isError={Boolean(catalog.error)}
              onRetry={() => catalog.refetch?.()}
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
