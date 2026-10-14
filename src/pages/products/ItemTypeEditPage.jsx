import { useParams } from 'react-router-dom'
import { ItemTypeWizard } from '../../features/products'

/** /products/item-types/:itemTypeId — edit an item type in the same wizard (2026-10-14). */
export function ItemTypeEditPage() {
  const { itemTypeId } = useParams()
  return <ItemTypeWizard key={itemTypeId} mode="edit" itemTypeId={itemTypeId} />
}
