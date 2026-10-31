import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ExternalLink, FileText } from 'lucide-react'
import { formatDate } from '../../../shared/utils/dateTime'
import { ContractDrawer } from '../../deals'

export function CustomerDealDetails({ entry }) {
  const [contractId, setContractId] = useState(null)
  const { t, i18n } = useTranslation()
  const tr = (key) => t(`customers.deals360.${key}`)
  const number = (value) => value == null ? tr('unavailable') : new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 2 }).format(Number(value) || 0)
  const date = (value) => value ? formatDate(value, i18n.language) || tr('unavailable') : tr('unavailable')
  const status = (value) => t(`customers.deals360.states.${value}`, { defaultValue: String(value || tr('unavailable')) })
  const products = Array.isArray(entry.products) ? entry.products : []
  const contracts = Array.isArray(entry.contracts) ? entry.contracts : []
  return (
    <div className="space-y-5 border-t border-[var(--border)] p-4">
      <dl className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
        {[[tr('owner'), entry.owner?.name], [tr('stage'), entry.stage?.name], [tr('value'), number(entry.won_value ?? entry.estimated_value)], [tr('date'), date(entry.won_at ?? entry.added_at)]].map(([label, value]) => <div key={label}><dt className="text-[var(--text-muted)]">{label}</dt><dd className="mt-1 break-words font-medium">{value || tr('unavailable')}</dd></div>)}
      </dl>
      {entry.lost_reason && <p className="text-sm">{tr('lostReason')}: {entry.lost_reason}{entry.lost_note ? ` - ${entry.lost_note}` : ''}</p>}
      <div>
        <h3 className="mb-2 text-sm font-bold">{tr('products')}</h3>
        {products.length ? <div className="overflow-x-auto"><table className="w-full text-start text-sm"><thead className="bg-[var(--surface-2)] text-[var(--text-muted)]"><tr>{['product', 'quantity', 'unitPrice', 'discount', 'total'].map((key) => <th key={key} className="p-2 text-start font-medium">{tr(key)}</th>)}</tr></thead><tbody>{products.map((line, index) => <tr key={line.id ?? index} className="border-b border-[var(--border)]"><td className="min-w-32 p-2">{line.product?.name || line.product?.code || tr('unavailable')}</td>{['quantity', 'unit_price', 'discount', 'total_price'].map((key) => <td key={key} className="p-2 tabular-nums">{number(line[key])}</td>)}</tr>)}</tbody></table></div> : <p className="text-sm text-[var(--text-muted)]">{tr('noProducts')}</p>}
      </div>
      <div>
        <h3 className="mb-2 text-sm font-bold">{tr('contracts')}</h3>
        {!contracts.length && <p className="text-sm text-[var(--text-muted)]">{tr('noContracts')}</p>}
        {contracts.map((contract) => {
          const plan = contract.payment_plan
          const installments = Array.isArray(plan?.installments) ? plan.installments : []
          return <section key={contract.id} className="border-t border-[var(--border)] py-3">
            <div className="flex flex-wrap items-center justify-between gap-3"><h4 className="inline-flex items-center gap-2 font-semibold"><FileText size={16} /><button type="button" dir="ltr" onClick={() => setContractId(contract.id)} className="underline underline-offset-4" title={tr('viewContract')}>{contract.contract_number}</button></h4><button type="button" className="inline-flex items-center gap-2 text-sm text-[var(--text)] underline" onClick={() => setContractId(contract.id)}><ExternalLink size={14} />{tr('viewContract')}</button></div>
            <dl className="my-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">{[[tr('total'), number(contract.total_amount)], [tr('downPayment'), number(contract.down_payment)], [tr('payment'), status(contract.payment_type)], [tr('status'), status(contract.status)], [tr('signedAt'), date(contract.signed_at)], ...(plan ? [[tr('frequency'), status(plan.frequency)], [tr('installmentCount'), number(plan.number_of_installments)], [tr('firstDue'), date(plan.first_due_date)]] : [])].map(([label, value]) => <div key={label}><dt className="text-[var(--text-muted)]">{label}</dt><dd className="mt-1">{value}</dd></div>)}</dl>
            {installments.length > 0 && <div className="overflow-x-auto"><table className="w-full text-sm"><caption className="mb-2 text-start font-semibold">{tr('installments')}</caption><thead className="bg-[var(--surface-2)] text-[var(--text-muted)]"><tr>{['installment', 'dueDate', 'amount', 'paidAmount', 'status', 'paidAt'].map((key) => <th key={key} className="whitespace-nowrap p-2 text-start font-medium">{tr(key)}</th>)}</tr></thead><tbody>{installments.map((item) => <tr key={item.id} className="border-b border-[var(--border)]"><td className="p-2">{number(item.installment_number)}</td><td className="whitespace-nowrap p-2">{date(item.due_date)}</td><td className="p-2">{number(item.amount)}</td><td className="p-2">{number(item.paid_amount)}</td><td className="p-2">{status(item.status)}</td><td className="whitespace-nowrap p-2">{date(item.paid_at)}</td></tr>)}</tbody></table></div>}
          </section>
        })}
      </div>
      {contractId != null && <ContractDrawer contractId={contractId} open onClose={() => setContractId(null)} showDealLink />}
    </div>
  )
}
