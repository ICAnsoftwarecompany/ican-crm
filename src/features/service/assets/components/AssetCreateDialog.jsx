import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { getServiceFieldErrors } from '../../core/utils/serviceErrors'
import { useCatalogItems } from '../../catalog/api/catalogApi'
import { CustomerSelect } from '../../records/components/CustomerSelect'
import { useAssetMutations } from '../api/assetsApi'

const EMPTY = { customer_id: '', item_id: '', serial_number: '', model_number: '', purchase_date: '', installation_date: '' }

/** Register an asset manually (standalone / old sales). Contract sales create assets through the handoff. */
export function AssetCreateDialog({ open, onClose, customer, detailPath }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const items = useCatalogItems({ kind: 'product' })
  const { create } = useAssetMutations()
  const [form, setForm] = useState(EMPTY)
  const errors = getServiceFieldErrors(create.error)
  const err = (name) => errors[name] && t(`service.settings.validation.${errors[name][0]}`, { defaultValue: t('service.settings.validation.required') })
  const set = (name) => (value) => setForm((current) => ({ ...current, [name]: value }))
  const iso = (value) => (value ? new Date(value).toISOString() : null)

  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY, customer_id: customer?.id || '' })
      create.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const submit = () =>
    create.mutate(
      { ...form, purchase_date: iso(form.purchase_date), installation_date: iso(form.installation_date), serial_number: form.serial_number || null },
      {
        onSuccess: (asset) => {
          toast.success(t('service.assets.create.done'))
          onClose()
          if (detailPath) navigate(detailPath(asset))
        },
      }
    )

  return (
    <FormDialog open={open} onClose={onClose} title={t('service.assets.create.title')} description={t('service.assets.create.description')} submitText={t('service.cases.create.submit')} loading={create.isPending} onSubmit={submit}>
      <CustomerSelect value={form.customer_id} onChange={set('customer_id')} fixed={customer} error={err('customer_id')} />
      <Select label={t('service.assets.fields.item')} value={form.item_id} onChange={set('item_id')} error={err('item_id')} options={(items.data || []).filter((item) => item.service_config?.fulfillment?.creates === 'asset').map((item) => ({ value: item.id, label: localizeLabel(item.name, i18n.language, item.id) }))} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label={t('service.assets.fields.serial')} dir="ltr" value={form.serial_number} error={err('serial_number')} onChange={(event) => set('serial_number')(event.target.value)} />
        <Input label={t('service.assets.fields.model')} dir="ltr" value={form.model_number} onChange={(event) => set('model_number')(event.target.value)} />
        <Input type="date" dir="ltr" label={t('service.assets.fields.purchase')} value={form.purchase_date} onChange={(event) => set('purchase_date')(event.target.value)} />
        <Input type="date" dir="ltr" label={t('service.assets.fields.installation')} value={form.installation_date} onChange={(event) => set('installation_date')(event.target.value)} />
      </div>
    </FormDialog>
  )
}
