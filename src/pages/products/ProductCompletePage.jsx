import { useParams } from 'react-router-dom'
import { ProductCompleteWizard } from '../../features/products'

/** /products/:productId/complete — guided completion of the missing data (2026-10-15). */
export function ProductCompletePage() {
  const { productId } = useParams()
  return <ProductCompleteWizard key={productId} productId={productId} />
}
