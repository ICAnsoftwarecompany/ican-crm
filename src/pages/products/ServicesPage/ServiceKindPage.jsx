import { CatalogProductsView } from '../../../features/products'

/** /products/services/plans and /products/services/bundles — plans and bundles under Services (2026-10-15). */
export function ServiceKindPage({ kind }) {
  return <CatalogProductsView key={kind} kind={kind} />
}
