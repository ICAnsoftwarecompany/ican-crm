import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ExternalLink } from 'lucide-react'
import { customerDealsPath } from './customerDealsModel'

export function CustomerDealTimelineActivity({ activity }) {
  const { t, i18n } = useTranslation()
  const entry = activity.customerDeal
  const dealId = entry.deal_id ?? entry.deal?.id
  const value = entry.won_value ?? entry.estimated_value
  return <div className="space-y-2 text-sm text-[var(--text)]">
    <p>{t(`customers.deals360.states.${entry.status}`, { defaultValue: String(entry.status || '-') })}{value != null ? ` · ${new Intl.NumberFormat(i18n.language).format(Number(value) || 0)}` : ''}</p>
    {Array.isArray(entry.products) && <p className="break-words text-xs text-[var(--text-muted)]">{entry.products.map((line) => line.product?.name).filter(Boolean).join(', ')}</p>}
    {dealId != null && <Link to={customerDealsPath(activity.customerId, dealId)} className="inline-flex items-center gap-2 underline"><ExternalLink size={14} />{t('customers.deals360.openDeal')}</Link>}
  </div>
}
