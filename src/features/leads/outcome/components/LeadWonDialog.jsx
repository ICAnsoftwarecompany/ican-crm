import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowLeft, Check, CreditCard, Package, Settings } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../../store/authStore'
import { QUERY_KEYS } from '../../../../shared/constants/queryKeys'
import { definitionsApi } from '../../../definitions/api/definitionsApi'
import { leadsApi } from '../../api/leadsApi'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import {
  FieldLabel,
  InstallmentFields,
  LineItemsEditor,
  buildWonPayload,
  dealInputClass,
  getDealStatusValue,
  isInstallmentPayment,
  itemsTotal,
  previewInstallments,
  useDeals,
  dealsApi,
  validateWonForm,
} from '../../../deals'
import { useCatalogProducts } from '../../../products'
import { customerDealsPath } from '../../../customers'
import { getLeadOpenDeal } from '../../close/leadClose'
import { useLeadOutcome } from '../hooks/useLeadOutcome'
import { DIRECT_WON_PAYMENT_TYPES, leadIdOf, leadNameOf, linesFromInterests } from '../utils/leadOutcome'

const EMPTY_LINE = { product_id: '', quantity: 1, unit_price: '', discount: 0 }
const initialForm = (lines, dealId) => ({
  dealId: dealId || '',
  belongsToDeal: Boolean(dealId),
  documentAction: 'none',
  saleStatusId: '',
  items: lines.length ? lines : [{ ...EMPTY_LINE }],
  payment_type: 'cash',
  down_payment: '',
  number_of_installments: 6,
  frequency: 'monthly',
  interest_rate: 0,
  first_due_date: '',
})

/**
 * Mark one lead as won (2026-10-15): deal, products sold (prefilled from the lead's interests), payment (cash or
 * installments) → `POST /deals/{dealId}/directe/won/{leadId}`, the same body as the deal "won" (`buildWonPayload`).
 * An unassigned lead can create its deal on submit. The backend owns the contract and payment plan.
 */
export function LeadWonDialog({ open, customer, onClose, onDone, initialSaleStatusId }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const { markWon } = useLeadOutcome()
  const dealsQuery = useDeals()
  const productsQuery = useCatalogProducts()
  const statusesQuery = useQuery({
    queryKey: [...QUERY_KEYS.statuses.list, undefined],
    queryFn: () => definitionsApi.getStatuses(),
    enabled: open,
  })
  const saleStatuses = useMemo(() => {
    const payload = statusesQuery.data?.data ?? statusesQuery.data
    const statuses = Array.isArray(payload?.lead) ? payload.lead : Array.isArray(payload) ? payload : []
    return statuses.filter((status) => Number(status.is_deal) === 1 && Number(status.active ?? 1) === 1)
      .sort((a, b) => Number(a.priority || 0) - Number(b.priority || 0))
  }, [statusesQuery.data])
  const [form, setForm] = useState(() => initialForm([], ''))
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState(0)
  const sessionRef = useRef({ open: false, leadId: null, edited: false })
  const completedWinRef = useRef(null)
  const leadId = leadIdOf(customer)
  const products = useMemo(() => (productsQuery.data || []).filter((product) => product.status).map((product) => ({ id: product.id, name: product.name, price: product.price })), [productsQuery.data])
  const deals = useMemo(() => dealsQuery.deals.filter((deal) =>
    ['active', 'draft', ''].includes(getDealStatusValue(deal.status) || '') &&
    !String(deal.description ?? '').toLowerCase().includes('lead-cente')
  ), [dealsQuery.deals])

  useEffect(() => {
    if (!open) {
      sessionRef.current.open = false
      return
    }
    const session = sessionRef.current
    const sameCustomer = session.open && String(session.leadId) === String(leadId)
    if (!sameCustomer) completedWinRef.current = null
    if (!sameCustomer) setStep(0)
    if (sameCustomer && session.edited) return
    sessionRef.current = { open: true, leadId, edited: false }
    setForm({ ...initialForm(linesFromInterests(customer, productsQuery.data || []), getLeadOpenDeal(customer)?.dealId), saleStatusId: initialSaleStatusId == null ? '' : String(initialSaleStatusId) })
    setErrors({})
    setServerError('')
  }, [customer, leadId, open, productsQuery.data, initialSaleStatusId])

  const setField = (key, value) => {
    sessionRef.current.edited = true
    setForm((current) => ({ ...current, [key]: value }))
  }
  const total = itemsTotal(form.items)
  const showTerms = isInstallmentPayment(form.payment_type)
  const preview = useMemo(() => (showTerms ? previewInstallments({
    total,
    downPayment: form.down_payment,
    count: form.number_of_installments,
    frequency: form.frequency,
    interestRate: form.payment_type === 'installment_no_interest' ? 0 : form.interest_rate,
    firstDueDate: form.first_due_date,
  }) : []), [form, showTerms, total])

  const advanceStep = () => {
    const validation = validateWonForm(form).errors
    const stageErrors = step === 0
      ? (validation.items ? { items: validation.items } : {})
      : Object.fromEntries(Object.entries(validation).filter(([key]) => key !== 'items'))
    setErrors(stageErrors)
    if (!Object.keys(stageErrors).length) setStep((current) => Math.min(2, current + 1))
  }

  const submit = async () => {
    if (step < 2) {
      advanceStep()
      return
    }
    const selectedStatus = saleStatuses.length === 1 ? saleStatuses[0] : saleStatuses.find((status) => String(status.id) === String(form.saleStatusId))
    const check = validateWonForm(form)
    if (saving) return
    const nextErrors = { ...check.errors, ...(form.belongsToDeal && !form.dealId ? { dealId: 'dealRequired' } : {}), ...(!selectedStatus ? { saleStatusId: 'required' } : {}) }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length || !leadId) {
      if (check.errors.items) setStep(0)
      else if (Object.keys(check.errors).length) setStep(1)
      return
    }
    sessionRef.current.edited = true
    setServerError('')
    setSaving(true)
    try {
      let dealId = completedWinRef.current?.dealId || form.dealId
      if (!form.belongsToDeal && !dealId) {
        const productNames = form.items.map((item) => products.find((product) => String(product.id) === String(item.product_id))?.name).filter(Boolean)
        const response = await dealsApi.create({
          name: [leadNameOf(customer), ...new Set(productNames)].filter(Boolean).join(' - '),
          description: `${leadNameOf(customer)} - Lead-Center`,
          type: 'sales',
          status: 'active',
          owner_id: customer?.agent_id ?? customer?.lead?.owner_id ?? user?.id,
        })
        dealId = response?.data?.id
        if (!dealId) throw new Error(t('customers.wonDealFlow.createFailed'))
        // Retain the created deal so retrying a failed won request cannot create it twice.
        setForm((current) => ({ ...current, dealId }))
        queryClient.invalidateQueries({ queryKey: ['deals'] })
      }
      if (!completedWinRef.current) {
        const payload = buildWonPayload(form)
        await markWon.mutateAsync({ dealId, leadId, payload })
        completedWinRef.current = { dealId, payload, documentAction: form.documentAction }
      }
      const win = completedWinRef.current
      const previousStatus = customer?.lead?.status ?? customer?.status
      const previousStatusId = customer?.lead?.status_type_id ?? customer?.status_type_id
      const definitions = statusesQuery.data?.data?.lead || []
      const oldTitle = typeof previousStatus === 'string' ? previousStatus : previousStatus?.status || previousStatus?.name || definitions.find((status) => String(status.id) === String(previousStatusId))?.status || ''
      const now = new Date()
      const pad = (value) => String(value).padStart(2, '0')
      const activityAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
      const title = t('customers.wonStatusSync.activityTitle')
      const description = t('customers.wonStatusSync.activityDescription', { name: leadNameOf(customer), status: selectedStatus.status || selectedStatus.name })
      await leadsApi.saveAction({
        lead_id: leadId,
        action: 'create_activity',
        type: 'status_change',
        title,
        description,
        note: description,
        new_status_id: selectedStatus.id,
        new_status_title: selectedStatus.status || selectedStatus.name || '',
        old_status_title: oldTitle,
        activity_at: activityAt,
        data: { source: 'lead_center_won', close_type: 'won', deal_id: win.dealId, customer_id: customer?.id, lead_id: leadId, ...win.payload, document_action: win.documentAction, old_status_id: previousStatusId ?? null, new_status_id: selectedStatus.id },
      })
      await Promise.all(['customers', 'leads', 'deals'].map((key) => queryClient.invalidateQueries({ queryKey: [key] })))
      toast.success(t('customers.leadOutcome.won.success'))
      onDone?.({ status: selectedStatus, dealId })
      onClose?.()
      if (win.documentAction === 'contract') navigate(customerDealsPath(customer.id, dealId))
    } catch (error) {
      setServerError(completedWinRef.current ? t('customers.wonStatusSync.partialFailure', { error: extractMessage(error, t('customers.leadOutcome.won.failed')) }) : extractMessage(error, t('customers.leadOutcome.won.failed')))
    } finally {
      setSaving(false)
    }
  }

  const err = (key) => {
    if (!errors[key]) return null
    return key === 'dealId' ? t('customers.leadOutcome.won.dealRequired') : t(`dealWorkspace.closing.won.errors.${errors[key]}`)
  }

  return (
    <FormDialog
      open={open}
      onClose={saving ? undefined : onClose}
      onSubmit={submit}
      loading={saving || markWon.isPending}
      closeOnBackdrop={false}
      closeOnEscape={false}
      showCancel={false}
      submitDisabled={!leadId}
      size="lg"
      className="max-w-3xl"
      title={t('customers.leadOutcome.won.title')}
      description={t('customers.leadOutcome.won.description', { name: leadNameOf(customer) })}
      submitText={step === 2 ? t('customers.leadOutcome.won.submit') : t('customers.wonSteps.next')}
      footerActions={step > 0 && <Button type="button" variant="outline" disabled={saving || Boolean(completedWinRef.current)} onClick={() => setStep((current) => current - 1)}><ArrowLeft size={15} className="rtl:rotate-180" />{t('customers.wonSteps.previous')}</Button>}
    >
      <div className="space-y-4">
        <nav aria-label={t('customers.wonSteps.label')} className="grid grid-cols-3 gap-2 border-b border-[var(--border)] pb-4">
          {[{ id: 'products', icon: Package }, { id: 'payment', icon: CreditCard }, { id: 'settings', icon: Settings }].map(({ id, icon: Icon }, index) => <button key={id} type="button" aria-current={step === index ? 'step' : undefined} disabled={saving || Boolean(completedWinRef.current) || index > step + 1} onClick={() => index <= step ? setStep(index) : advanceStep()} className={`flex min-w-0 items-center gap-2 rounded-md border px-2 py-3 text-start text-xs font-bold transition disabled:opacity-50 ${step === index ? 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)] text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]'}`}><span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)]">{index < step ? <Check size={15} /> : <Icon size={15} />}</span><span className="min-w-0 break-words">{t(`customers.wonSteps.${id}`)}</span></button>)}
        </nav>
        {!leadId && <p role="alert" className="text-sm text-[#EF4444]">{t('customers.leadOutcome.noLead')}</p>}
        {serverError && <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">{serverError}</p>}
        <div hidden={step !== 2}>
        <FieldLabel label={t('customers.wonStatusSync.label')} error={errors.saleStatusId ? t('customers.wonStatusSync.required') : null}>
          {statusesQuery.isLoading ? <p className="text-xs text-[var(--text-muted)]">{t('common.loading')}</p> : statusesQuery.isError ? <button type="button" onClick={() => statusesQuery.refetch()} className="text-sm text-red-600">{t('common.retry')}</button> : saleStatuses.length === 1 ? <p className="text-sm font-semibold text-[var(--text)]">{saleStatuses[0].status || saleStatuses[0].name}</p> : <select className={dealInputClass} value={form.saleStatusId} disabled={saving} onChange={(event) => setField('saleStatusId', event.target.value)}><option value="">{t('customers.wonStatusSync.choose')}</option>{saleStatuses.map((status) => <option key={status.id} value={status.id}>{status.status || status.name}</option>)}</select>}
          {!statusesQuery.isLoading && !statusesQuery.isError && !saleStatuses.length && <p className="text-xs text-red-600">{t('customers.wonStatusSync.noStatuses')}</p>}
        </FieldLabel>
        </div>

        <fieldset disabled={saving || Boolean(completedWinRef.current)} className="space-y-4">
        <fieldset hidden={step !== 2} disabled={saving} className="space-y-3">
        <legend className="mb-2 text-sm font-bold">{t('customers.leadOutcome.won.deal')}</legend>
        <div className="space-y-2">
          <p className="text-sm text-[var(--text)]">{t('customers.wonDealFlow.question')}</p>
          <div className="flex flex-wrap gap-4">
            {[true, false].map((value) => <label key={String(value)} className="flex items-center gap-2 text-sm"><input type="radio" name="belongs-to-deal" checked={form.belongsToDeal === value} onChange={() => { sessionRef.current.edited = true; setForm((current) => ({ ...current, belongsToDeal: value, dealId: '' })) }} />{t(value ? 'customers.wonDealFlow.yes' : 'customers.wonDealFlow.no')}</label>)}
          </div>
        </div>
        {form.belongsToDeal ? <FieldLabel label={t('customers.leadOutcome.won.deal')} error={err('dealId')} hint={dealsQuery.isLoading ? t('customers.leadClose.loadingDeals') : deals.length ? t('customers.leadOutcome.won.dealHint') : t('customers.leadClose.noDeals')}>
          <select className={dealInputClass} value={form.dealId} onChange={(event) => setField('dealId', event.target.value)} disabled={!deals.length}>
            <option value="">{t('customers.leadClose.chooseDeal')}</option>
            {deals.map((deal) => <option key={deal.id} value={String(deal.id)}>{deal.name || `#${deal.id}`}</option>)}
          </select>
        </FieldLabel> : <p className="text-xs text-[var(--text-muted)]">{t('customers.wonDealFlow.autoHint')}</p>}
        </fieldset>

        <section hidden={step !== 0} className="space-y-2">
          <h3 className="text-sm font-bold text-[var(--text)]">{t('customers.leadOutcome.won.products')}</h3>
          <LineItemsEditor items={form.items} onChange={(items) => setField('items', items)} products={products} />
          {err('items') && <p className="text-xs text-red-600 dark:text-red-400">{err('items')}</p>}
        </section>

        <div hidden={step !== 1} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldLabel label={t('dealWorkspace.closing.won.paymentType')} error={err('payment_type')}>
            <select className={dealInputClass} value={form.payment_type} onChange={(event) => setField('payment_type', event.target.value)}>
              {DIRECT_WON_PAYMENT_TYPES.map((value) => <option key={value} value={value}>{t(`dealWorkspace.options.paymentType.${value}`)}</option>)}
            </select>
          </FieldLabel>
          <FieldLabel label={t('dealWorkspace.closing.won.downPayment')} error={err('down_payment')} hint={form.payment_type === 'cash' ? t('dealWorkspace.closing.won.cashHint') : null}>
            <input type="number" min="0" step="0.01" className={dealInputClass} value={form.down_payment} onChange={(event) => setField('down_payment', event.target.value)} />
          </FieldLabel>
        </div>
        {showTerms && <InstallmentFields form={form} setField={setField} errors={errors} preview={preview} />}
        </div>
        <fieldset hidden={step !== 2} disabled={saving} className="space-y-2 border-t border-[var(--border)] pt-3">
          <legend className="text-sm font-bold">{t('customers.wonDealFlow.document')}</legend>
          <div className="flex flex-wrap gap-4">
            {['none', 'contract', 'invoice'].map((value) => <label key={value} className={`flex items-center gap-2 text-sm ${value === 'invoice' ? 'text-[var(--text-muted)]' : ''}`} title={value === 'invoice' ? t('customers.wonDealFlow.invoiceUnavailable') : undefined}><input type="radio" name="won-document" value={value} disabled={value === 'invoice'} checked={form.documentAction === value} onChange={() => setField('documentAction', value)} />{t(`customers.wonDealFlow.${value}`)}</label>)}
          </div>
          <p className="text-xs text-[var(--text-muted)]">{t('customers.wonDealFlow.documentHint')}</p>
        </fieldset>
        <p className="text-xs text-[var(--text-muted)]">{t('dealWorkspace.closing.won.serverTotalNote', { total: new Intl.NumberFormat(i18n.language).format(total) })}</p>
        </fieldset>
      </div>
    </FormDialog>
  )
}
