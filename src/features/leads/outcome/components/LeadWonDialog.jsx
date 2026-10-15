import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
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
  validateWonForm,
} from '../../../deals'
import { useCatalogProducts } from '../../../products'
import { getLeadOpenDeal } from '../../close/leadClose'
import { useLeadOutcome } from '../hooks/useLeadOutcome'
import { DIRECT_WON_PAYMENT_TYPES, leadIdOf, leadNameOf, linesFromInterests } from '../utils/leadOutcome'

const EMPTY_LINE = { product_id: '', quantity: 1, unit_price: '', discount: 0 }
const initialForm = (lines, dealId) => ({
  dealId: dealId || '',
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
 * The backend creates the contract and the payment plan; the dialog creates nothing itself.
 */
export function LeadWonDialog({ open, customer, onClose, onDone }) {
  const { t, i18n } = useTranslation()
  const { markWon } = useLeadOutcome()
  const dealsQuery = useDeals()
  const productsQuery = useCatalogProducts()
  const [form, setForm] = useState(() => initialForm([], ''))
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const leadId = leadIdOf(customer)
  const products = useMemo(() => (productsQuery.data || []).filter((product) => product.status).map((product) => ({ id: product.id, name: product.name, price: product.price })), [productsQuery.data])
  const deals = useMemo(() => dealsQuery.deals.filter((deal) => ['active', 'draft', ''].includes(getDealStatusValue(deal.status) || '')), [dealsQuery.deals])

  useEffect(() => {
    if (!open) return
    setForm(initialForm(linesFromInterests(customer, productsQuery.data || []), getLeadOpenDeal(customer)?.dealId))
    setErrors({})
    setServerError('')
  }, [customer, open, productsQuery.data])

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }))
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

  const submit = async () => {
    const check = validateWonForm(form)
    const nextErrors = { ...check.errors, ...(form.dealId ? {} : { dealId: 'dealRequired' }) }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length || !leadId) return
    setServerError('')
    try {
      await markWon.mutateAsync({ dealId: form.dealId, leadId, payload: buildWonPayload(form) })
      toast.success(t('customers.leadOutcome.won.success'))
      onDone?.()
      onClose?.()
    } catch (error) {
      setServerError(extractMessage(error, t('customers.leadOutcome.won.failed')))
    }
  }

  const err = (key) => {
    if (!errors[key]) return null
    return key === 'dealId' ? t('customers.leadOutcome.won.dealRequired') : t(`dealWorkspace.closing.won.errors.${errors[key]}`)
  }

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={submit}
      loading={markWon.isPending}
      submitDisabled={!leadId}
      size="lg"
      className="max-w-3xl"
      title={t('customers.leadOutcome.won.title')}
      description={t('customers.leadOutcome.won.description', { name: leadNameOf(customer) })}
      submitText={t('customers.leadOutcome.won.submit')}
    >
      <div className="space-y-4">
        {!leadId && <p role="alert" className="text-sm text-[#EF4444]">{t('customers.leadOutcome.noLead')}</p>}
        {serverError && <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">{serverError}</p>}

        <FieldLabel label={t('customers.leadOutcome.won.deal')} error={err('dealId')} hint={dealsQuery.isLoading ? t('customers.leadClose.loadingDeals') : deals.length ? t('customers.leadOutcome.won.dealHint') : t('customers.leadClose.noDeals')}>
          <select className={dealInputClass} value={form.dealId} onChange={(event) => setField('dealId', event.target.value)} disabled={!deals.length}>
            <option value="">{t('customers.leadClose.chooseDeal')}</option>
            {deals.map((deal) => <option key={deal.id} value={String(deal.id)}>{deal.name || `#${deal.id}`}</option>)}
          </select>
        </FieldLabel>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-[var(--text)]">{t('customers.leadOutcome.won.products')}</h3>
          <LineItemsEditor items={form.items} onChange={(items) => setField('items', items)} products={products} />
          {err('items') && <p className="text-xs text-red-600 dark:text-red-400">{err('items')}</p>}
        </section>

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
        <p className="text-xs text-[var(--text-muted)]">{t('dealWorkspace.closing.won.serverTotalNote', { total: new Intl.NumberFormat(i18n.language).format(total) })}</p>
      </div>
    </FormDialog>
  )
}
