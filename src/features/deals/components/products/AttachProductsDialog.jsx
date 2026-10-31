import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { useCatalogProducts } from '../../hooks/useCatalogProducts'
import { useDealResourceMutations } from '../../hooks/useDealResources'
import { ProductPicker } from '../common/ProductPicker'
import { ProductDetailsFields } from './ProductDetailsFields'
import { buildDealProductsPayload, validProductDetails } from '../../utils/dealProducts'

/** Attach products and their deal-specific details; already attached products are hidden. */
export function AttachProductsDialog({ dealId, existingIds = [], open, onClose }) {
  const { t } = useTranslation()
  const catalog = useCatalogProducts()
  const { addProducts } = useDealResourceMutations(dealId)
  const [selected, setSelected] = useState([])
  const [details, setDetails] = useState({})

  useEffect(() => {
    if (open) { setSelected([]); setDetails({}) }
  }, [open])

  const toggle = (id) => setSelected((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]))

  const submit = async () => {
    try {
      if (selected.some((id) => !validProductDetails(details[id]))) return toast.error(t('dealWorkspace.products.invalidDetails'))
      await addProducts.mutateAsync(buildDealProductsPayload(selected, details))
      toast.success(t('dealWorkspace.products.attached', { count: selected.length }))
      onClose()
    } catch (error) {
      toast.error(extractMessage(error, t('dealWorkspace.products.attachFailed')))
    }
  }

  return (
    <FormDialog open={open} onClose={onClose} onSubmit={submit} loading={addProducts.isPending} submitDisabled={!selected.length} title={t('dealWorkspace.products.attachTitle')} submitText={t('dealWorkspace.products.attachSubmit', { count: selected.length })}>
      <ProductPicker products={catalog.products} selectedIds={selected} onToggle={toggle} excludeIds={existingIds} isLoading={catalog.isLoading} />
      {selected.map((id) => <section key={id} className="space-y-2 border-t border-[var(--border)] pt-3"><h3 className="text-sm font-bold text-[var(--text)]">{catalog.products.find((product) => String(product.id) === String(id))?.name || `#${id}`}</h3><ProductDetailsFields value={details[id]} onChange={(value) => setDetails((current) => ({ ...current, [id]: value }))} /></section>)}
    </FormDialog>
  )
}
