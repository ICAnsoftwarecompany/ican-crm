import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLeadLog } from '../../leads'
import { leadActivityContext } from '../utils/leadActivityContext'
import { CustomerDealBadge } from './CustomerDealBadge'

const selectContext = (response) => leadActivityContext(response)

export function CustomerActivityLinkBadge({ customer }) {
  const { t } = useTranslation()
  const query = useLeadLog(customer?.lead_id || customer?.lead?.id, undefined, { select: selectContext })
  const context = query.data
  const style = 'inline-flex max-w-full items-center rounded border px-2 py-1 text-xs text-[var(--text-muted)]'
  if (context?.linked === false) return <span className={style}>{t('customers.activityContext.unlinked')}</span>
  if (context?.linked === true) {
    const label = context.deal?.deal_name
      ? `${t('customers.activityContext.linked')}: ${context.deal.deal_name}`
      : t('customers.activityContext.linked')
    return context.deal?.deal_id
      ? <Link className={`${style} text-emerald-700`} to={`/deals/${encodeURIComponent(context.deal.deal_id)}`}>{label}</Link>
      : <span className={style}>{label}</span>
  }
  return <CustomerDealBadge customer={customer} />
}
