import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../shared/components/ui/Input'
import { useCatalogProductMutations } from '../../hooks/useCatalogProducts'
import { formatApiError } from '../../utils/apiErrors'
import { getCreatedId } from '../../utils/catalogPayloads'
import { FormError } from '../../components/common/catalogUi'

/**
 * Creates a simple service (name + price, `POST /product/create` with kind `service`) without leaving the item
 * type wizard, so it can be attached right away (e.g. "installation"). 2026-10-14. `onSaved(id)` after saving.
 */
export function QuickServiceDialog({ open, suggestedName = '', onClose, onSaved }) {
  const { t } = useTranslation()
  const mutations = useCatalogProductMutations()
  const [form, setForm] = useState({ name: '', price: '0' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setForm({ name: suggestedName, price: '0' })
    setError('')
  }, [open, suggestedName])

  const submit = async () => {
    if (!form.name.trim()) return setError(t('catalog.validation.nameRequired'))
    const price = Number(form.price)
    if (form.price === '' || !(price >= 0)) return setError(t('catalog.validation.invalidNumber'))
    try {
      const response = await mutations.create.mutateAsync({ name: form.name.trim(), price, kind: 'service', status: true })
      const id = getCreatedId(response)
      toast.success(t('catalogSetup.typeWizard.relations.serviceCreated'))
      onSaved?.(id)
      onClose()
    } catch (requestError) {
      setError(formatApiError(requestError, t('catalog.common.saveFailed')))
    }
  }

  return (
    <FormDialog open={open} onClose={onClose} onSubmit={submit} loading={mutations.create.isPending} title={t('catalogSetup.typeWizard.relations.newService')}>
      <div className="space-y-4">
        <FormError message={error} />
        <p className="text-sm text-[var(--text-muted)]">{t('catalogSetup.typeWizard.relations.newServiceHint')}</p>
        <Input label={t('catalog.product.fields.name')} value={form.name} autoFocus onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
        <Input
          label={t('catalog.product.fields.price')}
          type="number"
          min={0}
          step="any"
          dir="ltr"
          value={form.price}
          onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
        />
      </div>
    </FormDialog>
  )
}
