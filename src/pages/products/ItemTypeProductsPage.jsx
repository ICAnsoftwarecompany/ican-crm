import { useParams } from 'react-router-dom'
import { CatalogProductsView } from '../../features/products'

/** /products/types/:itemTypeId — the products or services of one item type (sub-page in the sidebar, 2026-10-15). */
export function ItemTypeProductsPage() {
  const { itemTypeId } = useParams()
  return <CatalogProductsView key={itemTypeId} itemTypeId={itemTypeId} />
}
