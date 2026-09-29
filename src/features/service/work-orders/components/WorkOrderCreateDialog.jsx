import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { getServiceFieldErrors } from '../../core/utils/serviceErrors'
import { CustomerSelect } from '../../records/components/CustomerSelect'
import { useAssetList } from '../../assets/api/assetsApi'
import { useEntitlements } from '../../entitlements/api/entitlementsApi'
import { useWorkOrderMutations } from '../api/workOrdersApi'
import { WORK_ORDER_TYPES } from './WorkOrderStatusBadge'

const EMPTY = { type: 'maintenance', customer_id: '', asset_id: '', entitlement_id: '', address: '', zone: '', duration_minutes: 60, notes: '' }

/** New work order (a case may have several; installs and routine visits may have none). Scheduling is the next step. */
export function WorkOrderCreateDialog({ open, onClose, detailPath, customer, caseId }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { create } = useWorkOrderMutations()
  const [form, setForm] = useState(EMPTY)
  const errors = getServiceFieldErrors(create.error)
  const set = (name) => (value) => setForm((current) => ({ ...current, [name]: value }))
  const assets = useAssetList({ customer_id: form.customer_id || '__none__' })
  const entitlements = useEntitlements({ customer_id: form.customer_id || '__none__' }, { enabled: Boolean(form.customer_id) })
  const usable = (entitlements.data?.data || []).filter((entry) => entry.status === 'active')

  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY, customer_id: customer?.id || '' })
      create.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const submit = () =>
    create.mutate({ ...form, case_id: caseId || undefined, asset_id: form.asset_id || undefined, entitlement_id: form.entitlement_id || undefined, duration_minutes: Number(form.duration_minutes) || 60 }, {
      onSuccess: (workOrder) => {
        toast.success(t('service.workOrders.created', { number: workOrder.number }))
        onClose()
        if (detailPath) navigate(detailPath(workOrder))
      },
    })

  return (
    <FormDialog open={open} onClose={onClose} size="lg" className="max-w-2xl" title={t('service.workOrders.create.title')} description={t('service.workOrders.create.description')} submitText={t('service.workOrders.create.submit')} loading={create.isPending} onSubmit={submit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select label={t('service.workOrders.fields.type')} value={form.type} onChange={(type) => set('type')(type || 'maintenance')} options={WORK_ORDER_TYPES.map((value) => ({ value, label: t(`service.workOrders.types.${value}`) }))} error={errors.type && t('service.settings.validation.required')} />
        <Input type="number" dir="ltr" min="15" step="15" label={t('service.workOrders.fields.duration')} value={form.duration_minutes} onChange={(event) => set('duration_minutes')(event.target.value)} />
      </div>
      <CustomerSelect value={form.customer_id} onChange={(id) => setForm((current) => ({ ...current, customer_id: id, asset_id: '', entitlement_id: '' }))} fixed={customer} error={errors.customer_id && t('service.settings.validation.required')} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Select label={t('service.workOrders.fields.asset')} placeholder={t('service.workOrders.noAsset')} value={form.asset_id} disabled={!form.customer_id} onChange={set('asset_id')} options={assets.assets.map((asset) => ({ value: asset.id, label: `${localizeLabel(asset.name, i18n.language, asset.id)} · ${asset.serial_number}` }))} />
        <Select label={t('service.workOrders.fields.entitlement')} placeholder={t('service.workOrders.billable')} value={form.entitlement_id} disabled={!form.customer_id} onChange={set('entitlement_id')} options={usable.map((entry) => ({ value: entry.id, label: `${t(`service.entitlements.types.${entry.type}`)}${entry.balance?.remaining != null ? ` · ${t('service.workOrders.remaining', { count: entry.balance.remaining })}` : ''}` }))} />
      </div>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Input label={t('service.workOrders.fields.address')} dir="auto" value={form.address} onChange={(event) => set('address')(event.target.value)} />
        <Input label={t('service.workOrders.fields.zone')} dir="ltr" value={form.zone} onChange={(event) => set('zone')(event.target.value)} />
      </div>
      <Input label={t('service.workOrders.fields.notes')} dir="auto" value={form.notes} onChange={(event) => set('notes')(event.target.value)} />
    </FormDialog>
  )
}
