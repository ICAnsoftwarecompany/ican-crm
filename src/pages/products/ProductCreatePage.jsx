import { useSearchParams } from 'react-router-dom'
import { ProductCreateWizard } from '../../features/products'

/**
 * /products/new — product / service create wizard (2026-10-07). `?kind=service` for a service, `?item_type=<id>` to
 * start with an item type (2026-10-14), `?draft=<id>` to continue a draft (2026-10-15).
 */
export function ProductCreatePage() {
  const [params] = useSearchParams()
  // product · service · plan · bundle (plans and bundles live under Services since 2026-10-15)
  const kind = ['service', 'plan', 'bundle'].includes(params.get('kind')) ? params.get('kind') : 'product'
  const itemTypeId = params.get('item_type') || ''
  const draftId = params.get('draft') || ''
  return <ProductCreateWizard key={`${kind}-${itemTypeId}-${draftId}`} kind={kind} initialItemTypeId={itemTypeId} draftId={draftId} />
}
