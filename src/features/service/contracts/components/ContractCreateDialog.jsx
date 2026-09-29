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
import { useResourceList } from '../../settings/api/settingsApi'
import { contractTypesResource } from '../../settings/resources/contractResources'
import { paymentPlansResource } from '../../settings/resources/billingResources'
import { useContractMutations } from '../api/contractsApi'
import { ContractLinesField } from './ContractLinesField'

const EMPTY = { customer_id: '', type_id: '', payment_plan_id: '', start_date: '', end_date: '', items: [] }

/** Draft a contract (standalone mode or service contracts). Deals will create contracts from Sales. */
export function ContractCreateDialog({ open, onClose, customer, detailPath }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const types = useResourceList(contractTypesResource)
  const plans = useResourceList(paymentPlansResource)
  const catalog = useCatalogItems({})
  const { create } = useContractMutations()
  const [form, setForm] = useState(EMPTY)
  const errors = getServiceFieldErrors(create.error)
  const required = (name) => errors[name] && t('service.settings.validation.required')
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
      { ...form, payment_plan_id: form.payment_plan_id || undefined, start_date: iso(form.start_date), end_date: iso(form.end_date), items: form.items.map((line) => ({ ...line, quantity: Number(line.quantity), unit_price: Number(line.unit_price), discount: Number(line.discount) || 0 })) },
      {
        onSuccess: (contract) => {
          toast.success(t('service.contracts.created', { number: contract.contract_number }))
          onClose()
          if (detailPath) navigate(detailPath(contract))
        },
      }
    )

  return (
    <FormDialog open={open} onClose={onClose} size="lg" className="max-w-2xl" title={t('service.contracts.create.title')} description={t('service.contracts.create.description')} submitText={t('service.contracts.create.submit')} loading={create.isPending} onSubmit={submit}>
      <CustomerSelect value={form.customer_id} onChange={set('customer_id')} fixed={customer} error={required('customer_id')} />
      <Select label={t('service.contracts.fields.type')} value={form.type_id} error={required('type_id')} onChange={set('type_id')} options={(types.data || []).map((type) => ({ value: type.id, label: localizeLabel(type.label, i18n.language, type.key) }))} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input type="date" dir="ltr" label={t('service.contracts.fields.start')} value={form.start_date} onChange={(event) => set('start_date')(event.target.value)} />
        <Input type="date" dir="ltr" label={t('service.contracts.fields.end')} value={form.end_date} onChange={(event) => set('end_date')(event.target.value)} />
      </div>
      <Select label={t('service.contracts.fields.paymentPlan')} placeholder={t('service.contracts.noPaymentPlan')} value={form.payment_plan_id} onChange={set('payment_plan_id')} options={(plans.data || []).filter((plan) => plan.status !== 'archived').map((plan) => ({ value: plan.id, label: localizeLabel(plan.name, i18n.language, plan.id) }))} />
      <ContractLinesField lines={form.items} onChange={set('items')} items={catalog.data || []} error={required('items')} />
    </FormDialog>
  )
}
