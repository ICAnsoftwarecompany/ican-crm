import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Package, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { ConfirmDialog } from '../../../../shared/components/overlays/ConfirmDialog'
import { Button } from '../../../../shared/components/ui/Button'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { useDealProducts, useDealResourceMutations } from '../../hooks/useDealResources'
import { useDealWorkspace } from '../../hooks/useDealWorkspace'
import { formatMoney } from '../../utils/dealMoney'
import { AttachProductsDialog } from './AttachProductsDialog'

/** Products this deal sells (offered first in the won dialog and the lead products editor). */
export function DealProductsPanel() {
  const { t, i18n } = useTranslation()
  const { dealId } = useDealWorkspace()
  const query = useDealProducts(dealId)
  const { removeProduct } = useDealResourceMutations(dealId)
  const [attaching, setAttaching] = useState(false)
  const [removing, setRemoving] = useState(null)

  const confirmRemove = async () => {
    try {
      await removeProduct.mutateAsync(removing.id)
      toast.success(t('dealWorkspace.products.removed'))
    } catch (error) {
      toast.error(extractMessage(error, t('dealWorkspace.products.removeFailed')))
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[var(--text-muted)]">{t('dealWorkspace.products.description')}</p>
        <Button size="sm" onClick={() => setAttaching(true)}><Plus size={15} />{t('dealWorkspace.products.attachTitle')}</Button>
      </div>
      <ResourceState
        isLoading={query.isLoading}
        error={query.error}
        onRetry={query.refetch}
        empty={!query.products.length}
        emptyIcon={<Package size={24} />}
        emptyTitle={t('dealWorkspace.products.emptyTitle')}
        emptyDescription={t('dealWorkspace.products.emptyDescription')}
      >
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {query.products.map((product) => (
            <li key={product.id} className="flex items-start justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex min-w-0 gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]"><Package size={17} /></span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[var(--text)]">{product.name || `#${product.id}`}</p>
                  {product.price !== null && product.price !== undefined && <p className="text-xs text-[var(--text-muted)]" dir="ltr">{formatMoney(product.price, i18n.language)}</p>}
                </div>
              </div>
              <button type="button" onClick={() => setRemoving(product)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-red-600" aria-label={t('dealWorkspace.products.remove')} title={t('dealWorkspace.products.remove')}>
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      </ResourceState>
      <AttachProductsDialog dealId={dealId} existingIds={query.products.map((product) => product.id)} open={attaching} onClose={() => setAttaching(false)} />
      <ConfirmDialog
        isOpen={Boolean(removing)}
        onCancel={() => setRemoving(null)}
        onConfirm={confirmRemove}
        title={t('dealWorkspace.products.removeTitle')}
        message={t('dealWorkspace.products.removeMessage', { name: removing?.name || '' })}
        confirmText={t('dealWorkspace.products.remove')}
        cancelText={t('dealWorkspace.common.cancel')}
        type="danger"
        loading={removeProduct.isPending}
      />
    </div>
  )
}
