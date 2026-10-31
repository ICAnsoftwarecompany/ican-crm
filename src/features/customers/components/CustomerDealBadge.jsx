import { Handshake } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useCustomerDeal } from '../hooks/useCustomerDeal'

export function CustomerDealBadge({ customer, expanded = false }) {
  const { t } = useTranslation()
  const { link: deal, dealId, deal: info, isLoading } = useCustomerDeal(customer)
  if (!deal || typeof deal !== 'object' || Array.isArray(deal)) return null
  if (deal.id == null && deal.deal_id == null) return null

  const status = typeof deal.status === 'string' ? deal.status : ''
  const knownStatuses = ['lost', 'won', 'open', 'active', 'pending', 'in_progress']
  const statusLabel = knownStatuses.includes(status) ? t(`customers.dealLink.statuses.${status}`) : status
  const addedAt = deal.added_at ? new Date(deal.added_at) : null
  const formatDate = (value) => {
    const date = value ? new Date(value) : null
    return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString() : ''
  }
  const extraDetails = [
    info?.start_date && t('customers.dealLink.startDate', { date: formatDate(info.start_date) }),
    info?.end_date && t('customers.dealLink.endDate', { date: formatDate(info.end_date) }),
    info?.target_revenue != null && t('customers.dealLink.targetRevenue', { value: Number(info.target_revenue).toLocaleString() }),
    info?.target_leads != null && t('customers.dealLink.targetLeads', { value: Number(info.target_leads).toLocaleString() }),
  ].filter(Boolean)
  const details = [
    t('customers.dealLink.linked'),
    info?.name || t('customers.dealLink.badge'),
    info?.description,
    statusLabel && t('customers.dealLink.status', { status: statusLabel }),
    addedAt && !Number.isNaN(addedAt.getTime()) && t('customers.dealLink.addedAt', { date: addedAt.toLocaleString() }),
    ...extraDetails,
  ].filter(Boolean).join('\n')

  return (
    <Link
      to={dealId != null ? `/deals/${encodeURIComponent(dealId)}` : '/deals'}
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      title={details}
      aria-label={details}
      className="inline-flex max-w-full items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
    >
      <Handshake size={13} className="shrink-0" aria-hidden="true" />
      <span className="min-w-0 break-words">{expanded ? info?.name || t('customers.dealLink.badge') : t('customers.dealLink.badge')}</span>
      {expanded && <span className="min-w-0 whitespace-pre-line text-[var(--text-muted)]">{isLoading ? t('common.loading') : [info?.description, statusLabel, ...extraDetails].filter(Boolean).join('\n')}</span>}
    </Link>
  )
}
