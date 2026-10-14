import { useSearchParams } from 'react-router-dom'
import { ItemTypeWizard } from '../../features/products/index'

/** /products/item-types/new (`?kind=service`, `?returnTo=/products/new`) — item type wizard (2026-10-14). */
export function ItemTypeCreatePage() {
  const [params] = useSearchParams()
  return <ItemTypeWizard mode="create" initialKind={params.get('kind') || 'product'} returnTo={params.get('returnTo') || ''} />
}
