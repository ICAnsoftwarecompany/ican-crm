import { useSearchParams } from 'react-router-dom'
import { ProductCreateWizard } from '../../features/products/index'

/**
 * /products/new (`?kind=service` for a service, `?item_type=<id>` to start with an item type) — product create
 * wizard (2026-10-07; item type param 2026-10-14).
 */
export function ProductCreatePage() {
  const [params] = useSearchParams()
  const kind = params.get('kind') === 'service' ? 'service' : 'product'
  const itemTypeId = params.get('item_type') || ''
  return <ProductCreateWizard key={`${kind}-${itemTypeId}`} kind={kind} initialItemTypeId={itemTypeId} />
}
