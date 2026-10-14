import { useSearchParams } from 'react-router-dom'
import { ProductCreateWizard } from '../../features/products'

/**
 * /products/new — product / service create wizard (2026-10-07). `?kind=service` for a service, `?item_type=<id>` to
 * start with an item type (2026-10-14), `?draft=<id>` to continue a draft (2026-10-15).
 */
export function ProductCreatePage() {
  const [params] = useSearchParams()
  const kind = params.get('kind') === 'service' ? 'service' : 'product'
  const itemTypeId = params.get('item_type') || ''
  const draftId = params.get('draft') || ''
  return <ProductCreateWizard key={`${kind}-${itemTypeId}-${draftId}`} kind={kind} initialItemTypeId={itemTypeId} draftId={draftId} />
}
