import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { useCatalogProducts } from '../../hooks/useCatalogProducts'
import { useDealResourceMutations } from '../../hooks/useDealResources'
import { ProductPicker } from '../common/ProductPicker'

/** Pick catalog products for the deal (`POST /deals/products`, product_ids[]). Products already on the deal are hidden. */
export function AttachProductsDialog({ dealId, existingIds = [], open, onClose }) {
  const { t } = useTranslation()
  const catalog = useCatalogProducts()
  const { addProducts } = useDealResourceMutations(dealId)
  const [selected, setSelected] = useState([])

  useEffect(() => {
    if (open) setSelected([])
  }, [open])

  const toggle = (id) => setSelected((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]))

  const submit = async () => {
    try {
      await addProducts.mutateAsync(selected.map((id) => Number(id) || id))
      toast.success(t('dealWorkspace.products.attached', { count: selected.length }))
      onClose()
    } catch (error) {
      toast.error(extractMessage(error, t('dealWorkspace.products.attachFailed')))
    }
  }

  return (
    <FormDialog open={open} onClose={onClose} onSubmit={submit} loading={addProducts.isPending} submitDisabled={!selected.length} title={t('dealWorkspace.products.attachTitle')} submitText={t('dealWorkspace.products.attachSubmit', { count: selected.length })}>
      <ProductPicker products={catalog.products} selectedIds={selected} onToggle={toggle} excludeIds={existingIds} isLoading={catalog.isLoading} />
    </FormDialog>
  )
}
