import { ProductStockFields } from '../../components/products/ProductStockFields'

/** Step 2: stock and alternative units (pre-filled from the item type's default units). */
export function StockStep({ wizard, onCreateUnit }) {
  return <ProductStockFields mode="create" state={wizard.formState} onCreateUnit={onCreateUnit} />
}
