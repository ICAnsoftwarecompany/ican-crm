import { useTranslation } from 'react-i18next'
import { Building2, Mail, Phone, UserRound } from 'lucide-react'

export function CustomerDealsOverview({ customer, summary }) {
  const { t, i18n } = useTranslation()
  const number = (value) => new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 2 }).format(Number(value) || 0)
  return (
    <section className="border-y border-[var(--border)] py-5">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 break-words text-lg font-bold"><UserRound size={20} className="shrink-0" />{customer.name || t('customers.deals360.customer')}</h2>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--text-muted)]">
            {customer.code && <span dir="ltr">{customer.code}</span>}
            {customer.company && <span className="inline-flex items-center gap-2"><Building2 size={15} />{customer.company}</span>}
            {customer.phone && <a className="inline-flex items-center gap-2" href={`tel:${customer.phone}`}><Phone size={15} /><span dir="ltr">{customer.phone}</span></a>}
            {customer.email && <a className="inline-flex min-w-0 items-center gap-2" href={`mailto:${customer.email}`}><Mail size={15} className="shrink-0" /><span dir="ltr" className="break-all">{customer.email}</span></a>}
          </div>
        </div>
        <dl className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
          {['deals_count', 'open', 'won', 'lost', 'total_won_value'].map((key) => (
            <div key={key}><dt className="text-[var(--text-muted)]">{t(`customers.deals360.${key}`)}</dt><dd className="mt-1 text-base font-bold tabular-nums">{number(summary[key])}</dd></div>
          ))}
        </dl>
      </div>
    </section>
  )
}
