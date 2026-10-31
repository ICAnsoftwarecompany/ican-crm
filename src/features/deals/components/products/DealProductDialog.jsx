import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { AppModal } from '../../../../shared/components/overlays/AppModal'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { Button } from '../../../../shared/components/ui/Button'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { useDealProduct, useDealResourceMutations } from '../../hooks/useDealResources'
import { validProductDetails } from '../../utils/dealProducts'
import { ProductDetailsFields } from './ProductDetailsFields'

function ProductEditForm({ product, dealId, onClose }) {
  const { t } = useTranslation()
  const [details, setDetails] = useState(product.details)
  const [error, setError] = useState('')
  const { updateProduct } = useDealResourceMutations(dealId)
  const save = async (event) => {
    event.preventDefault()
    if (updateProduct.isPending) return
    if (!validProductDetails(details)) return setError(t('dealWorkspace.products.invalidDetails'))
    setError('')
    try {
      await updateProduct.mutateAsync({ productId: product.id, details })
      toast.success(t('dealWorkspace.products.updated'))
      onClose()
    } catch (cause) { setError(extractMessage(cause, t('dealWorkspace.products.updateFailed'))) }
  }
  const extra = Object.entries(details).filter(([key]) => !['quantity', 'unit_price', 'discount', 'package', 'notes'].includes(key))
  return <form onSubmit={save} className="space-y-4">
    {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    <ProductDetailsFields value={details} onChange={setDetails} disabled={updateProduct.isPending} />
    {extra.length > 0 && <dl className="space-y-2 text-sm text-[var(--text)]">{extra.map(([key, value]) => <div key={key} className="flex flex-wrap gap-2"><dt className="text-[var(--text-muted)]">{key}:</dt><dd className="break-all">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</dd></div>)}</dl>}
    <Button type="submit" loading={updateProduct.isPending}>{t('dealWorkspace.settings.save')}</Button>
  </form>
}

export function DealProductDialog({ dealId, productId, onClose }) {
  const { t } = useTranslation()
  const query = useDealProduct(dealId, productId)
  return <AppModal isOpen onClose={onClose} title={query.product?.name || t('dealWorkspace.products.editDetails')} size="lg">
    <ResourceState isLoading={query.isLoading} error={query.error} onRetry={query.refetch} empty={!query.product} emptyTitle={t('dealWorkspace.products.notFound')}>
      {query.product && <ProductEditForm key={`${dealId}:${productId}`} product={query.product} dealId={dealId} onClose={onClose} />}
    </ResourceState>
  </AppModal>
}
