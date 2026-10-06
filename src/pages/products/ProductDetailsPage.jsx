import { useParams } from 'react-router-dom'
import { ProductDetailsView } from '../../features/products'

/** /products/:productId — product or service details with units, relations and instances (2026-10-06). */
export function ProductDetailsPage() {
  const { productId } = useParams()
  return <ProductDetailsView key={productId} productId={productId} />
}
