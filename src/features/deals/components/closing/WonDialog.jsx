import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FormDialog } from '../../../../shared/components/overlays/FormDialog'
import { ModuleNotice } from '../../../../shared/components/module-pages'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { PAYMENT_TYPES } from '../../constants/dealOptions'
import { useDealLeadMutations, useDealLeadProducts } from '../../hooks/useDealLeads'
import { unwrapEntity } from '../../hooks/dealResponse'
import { normalizeContract } from '../../utils/dealContracts'
import { buildWonPayload, isInstallmentPayment, itemsTotal, previewInstallments, validateWonForm } from '../../utils/dealMoney'
import { FieldLabel, dealInputClass } from '../common/FieldLabel'
import { useProductOptions } from '../common/useProductOptions'
import { InstallmentFields } from './InstallmentFields'
import { LineItemsEditor, toEditorLines } from './LineItemsEditor'

const initialForm = () => ({
  items: toEditorLines([]),
  payment_type: 'cash',
  down_payment: '',
  number_of_installments: 6,
  frequency: 'monthly',
  interest_rate: 0,
  first_due_date: '',
  notes: '',
})

/**
 * "Mark as won": products + payment terms → ONE request (`POST /deals/leads/{id}/won`). The backend creates
 * the contract, the payment plan, the installments and the follow-up tasks in one transaction; the dialog
 * never creates any of them itself. On success `onWon(contract)` gets the normalized contract.
 */
export function WonDialog({ dealId, lead, open, onClose, onWon }) {
  const { t, i18n } = useTranslation()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const productsQuery = useDealLeadProducts(lead?.id, { enabled: open })
  const { options } = useProductOptions(dealId)
  const { markWon } = useDealLeadMutations(dealId)

  useEffect(() => {
    if (!open) return
    setForm({ ...initialForm(), items: toEditorLines(productsQuery.items) })
    setErrors({})
    setServerError('')
  }, [open, productsQuery.items])

  const total = itemsTotal(form.items)
  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const showTerms = isInstallmentPayment(form.payment_type) && form.payment_type !== 'custom_staged'
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
    setErrors(check.errors)
    if (!check.ok || !lead) return
    setServerError('')
    try {
      const response = await markWon.mutateAsync({ dealLeadId: lead.id, payload: buildWonPayload(form) })
      const entity = unwrapEntity(response, 'contract')
      const contract = entity ? normalizeContract(entity) : null
      toast.success(contract?.number ? t('dealWorkspace.closing.won.successWithContract', { number: contract.number }) : t('dealWorkspace.closing.won.success'))
      onWon?.(contract)
      onClose()
    } catch (error) {
      // Backend message as-is (e.g. "الـ Lead ده مقفول بالفعل"); one transaction → nothing was created.
      setServerError(extractMessage(error, t('dealWorkspace.closing.won.failed')))
    }
  }

  const err = (key) => (errors[key] ? t(`dealWorkspace.closing.won.errors.${errors[key]}`) : null)

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={submit}
      size="lg"
      loading={markWon.isPending}
      title={t('dealWorkspace.closing.won.title')}
      description={lead ? t('dealWorkspace.closing.won.description', { name: lead.name || `#${lead.id}` }) : ''}
      submitText={t('dealWorkspace.closing.won.submit')}
    >
      <div className="space-y-4">
        {serverError && <ModuleNotice tone="warning">{serverError}</ModuleNotice>}
        <section className="space-y-2">
          <h3 className="text-sm font-bold text-[var(--text)]">{t('dealWorkspace.closing.won.products')}</h3>
          <LineItemsEditor items={form.items} onChange={(items) => setField('items', items)} products={options} />
          {err('items') && <p className="text-xs text-red-600 dark:text-red-400">{err('items')}</p>}
        </section>
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldLabel label={t('dealWorkspace.closing.won.paymentType')} error={err('payment_type')}>
            <select className={dealInputClass} value={form.payment_type} onChange={(event) => setField('payment_type', event.target.value)}>
              {PAYMENT_TYPES.map((value) => <option key={value} value={value}>{t(`dealWorkspace.options.paymentType.${value}`)}</option>)}
            </select>
          </FieldLabel>
          <FieldLabel label={t('dealWorkspace.closing.won.downPayment')} error={err('down_payment')} hint={form.payment_type === 'cash' ? t('dealWorkspace.closing.won.cashHint') : null}>
            <input type="number" min="0" step="0.01" className={dealInputClass} value={form.down_payment} onChange={(event) => setField('down_payment', event.target.value)} />
          </FieldLabel>
        </div>
        {showTerms && <InstallmentFields form={form} setField={setField} errors={errors} preview={preview} />}
        {form.payment_type === 'custom_staged' && (
          <FieldLabel label={t('dealWorkspace.closing.won.stagesNotes')} hint={t('dealWorkspace.closing.won.customStagedHint')}>
            <textarea className={`${dealInputClass} h-20 py-2`} value={form.notes} onChange={(event) => setField('notes', event.target.value)} />
          </FieldLabel>
        )}
        <p className="text-xs text-[var(--text-muted)]">{t('dealWorkspace.closing.won.serverTotalNote', { total: new Intl.NumberFormat(i18n.language).format(total) })}</p>
      </div>
    </FormDialog>
  )
}
