import { useSearchParams } from 'react-router-dom'
import { ProductCreateWizard } from '../../features/products'

/** /products/new (`?kind=service` for a service) — product create wizard (2026-10-07). */
export function ProductCreatePage() {
  const [params] = useSearchParams()
  const kind = params.get('kind') === 'service' ? 'service' : 'product'
  return <ProductCreateWizard key={kind} kind={kind} />
}
