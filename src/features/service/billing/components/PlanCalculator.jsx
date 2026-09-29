import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Calculator } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { Input } from '../../../../shared/components/ui/Input'
import { Select } from '../../../../shared/components/ui/Select'
import { EmptyState } from '../../../../shared/components/feedback/EmptyState'
import { formatDateInput } from '../../../../shared/utils/dateTime'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { getServiceFieldErrors } from '../../core/utils/serviceErrors'
import { useCatalogItems } from '../../catalog/api/catalogApi'
import { usePlanPreview, usePlansForItem } from '../api/billingApi'
import { PlanPreviewTable } from './PlanPreviewTable'

const numberOrUndefined = (value) => (value === '' || value == null ? undefined : Number(value))

/**
 * Reusable plan calculator (spec §29.6): pick an item and a plan, enter price/dates/overrides,
 * the **server** returns the schedule. Built to be embedded later in a deal/quote screen via
 * `itemId` / `price` props; nothing is saved.
 */
export function PlanCalculator({ itemId: fixedItemId, price: fixedPrice, compact = false }) {
  const { t, i18n } = useTranslation()
  const language = i18n.language
  const items = useCatalogItems({}, { enabled: !fixedItemId })
  const [form, setForm] = useState({ item_id: fixedItemId || '', plan_id: '', price: fixedPrice ?? '', quantity: 1, contract_date: formatDateInput(new Date()), delivery_date: '', down_percent: '', count: '', discount_percent: '' })
  const plans = usePlansForItem(form.item_id || null)
  const preview = usePlanPreview()
  const patch = (next) => setForm((current) => ({ ...current, ...next }))

  const sellable = useMemo(() => (items.data?.data || items.data || []).filter((item) => Number(item.price) > 0), [items.data])
  const planList = useMemo(() => (Array.isArray(plans.data) ? plans.data : []), [plans.data])

  // Default plan = the assignment marked default, else the first available.
  useEffect(() => {
    if (!planList.length || planList.some((plan) => plan.id === form.plan_id)) return
    patch({ plan_id: (planList.find((plan) => plan.is_default) || planList[0]).id })
  }, [planList, form.plan_id])

  const chooseItem = (itemId) => {
    const item = sellable.find((entry) => entry.id === itemId)
    patch({ item_id: itemId, plan_id: '', price: item?.price ?? '' })
    preview.reset()
  }

  const run = (event) => {
    event?.preventDefault()
    if (!form.plan_id) return
    preview.mutate({
      planId: form.plan_id,
      item_id: form.item_id || undefined,
      price: numberOrUndefined(form.price),
      quantity: Number(form.quantity) || 1,
      contract_date: form.contract_date,
      delivery_date: form.delivery_date || undefined,
      overrides: { down_percent: numberOrUndefined(form.down_percent), count: numberOrUndefined(form.count), discount_percent: numberOrUndefined(form.discount_percent) },
    })
  }

  const fieldErrors = getServiceFieldErrors(preview.error)
  const hasFieldErrors = Object.keys(fieldErrors).length > 0

  return (
    <div className={compact ? 'grid gap-4' : 'grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]'}>
      <form onSubmit={run} className="grid content-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        {!fixedItemId && (
          <Select
            label={t('service.billing.calculator.item')}
            value={form.item_id}
            onChange={chooseItem}
            disabled={items.isLoading}
            placeholder={t('service.billing.calculator.anyItem')}
            options={sellable.map((item) => ({ value: item.id, label: localizeLabel(item.name, language, item.id) }))}
          />
        )}
        <Select
          label={t('service.billing.fields.plan')}
          value={form.plan_id}
          onChange={(planId) => { patch({ plan_id: planId }); preview.reset() }}
          disabled={plans.isLoading}
          placeholder={t('service.billing.calculator.choosePlan')}
          options={planList.map((plan) => ({ value: plan.id, label: localizeLabel(plan.name, language, plan.id) }))}
        />
        {plans.isError && <p className="text-xs text-sla-breached">{t('service.billing.calculator.plansError')}</p>}
        {!plans.isLoading && !plans.isError && form.item_id && !planList.length && <p className="text-xs text-[var(--text-muted)]">{t('service.billing.calculator.noPlans')}</p>}
        <div className="grid grid-cols-2 gap-3">
          <Input type="number" dir="ltr" min="0" label={t('service.billing.calculator.price')} value={form.price} onChange={(event) => patch({ price: event.target.value })} error={fieldErrors.price && t('service.billing.calculator.priceRequired')} disabled={fixedPrice != null} />
          <Input type="number" dir="ltr" min="1" label={t('service.billing.calculator.quantity')} value={form.quantity} onChange={(event) => patch({ quantity: event.target.value })} />
          <Input type="date" dir="ltr" label={t('service.billing.calculator.contractDate')} value={form.contract_date} onChange={(event) => patch({ contract_date: event.target.value })} error={fieldErrors.contract_date && t('service.billing.calculator.dateRequired')} />
          <Input type="date" dir="ltr" label={t('service.billing.calculator.deliveryDate')} value={form.delivery_date} onChange={(event) => patch({ delivery_date: event.target.value })} />
        </div>
        <fieldset className="grid gap-2">
          <legend className="mb-1 text-xs font-semibold text-[var(--text-muted)]">{t('service.billing.calculator.overrides')}</legend>
          <div className="grid grid-cols-3 gap-2">
            <Input type="number" dir="ltr" min="0" label={t('service.billing.calculator.downPercent')} value={form.down_percent} onChange={(event) => patch({ down_percent: event.target.value })} />
            <Input type="number" dir="ltr" min="1" label={t('service.billing.fields.count')} value={form.count} onChange={(event) => patch({ count: event.target.value })} />
            <Input type="number" dir="ltr" min="0" label={t('service.billing.calculator.discountPercent')} value={form.discount_percent} onChange={(event) => patch({ discount_percent: event.target.value })} />
          </div>
        </fieldset>
        <Button type="submit" disabled={!form.plan_id || preview.isPending}>
          <Calculator size={15} aria-hidden="true" />
          {preview.isPending ? t('service.billing.calculator.calculating') : t('service.billing.calculator.calculate')}
        </Button>
        <p className="text-xs text-[var(--text-muted)]">{t('service.billing.calculator.serverNote')}</p>
      </form>
      <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        {preview.isError && !hasFieldErrors ? (
          <EmptyState title={t('service.billing.calculator.previewError')} />
        ) : preview.data ? (
          <PlanPreviewTable preview={preview.data} />
        ) : (
          <EmptyState icon={<Calculator size={22} />} title={t('service.billing.calculator.emptyTitle')} description={t('service.billing.calculator.emptyHint')} />
        )}
      </div>
    </div>
  )
}
