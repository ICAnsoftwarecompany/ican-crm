import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, FileSignature } from 'lucide-react'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { Select } from '../../../../shared/components/ui/Select'
import { formatDate } from '../../../../shared/utils/dateTime'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { useMoney } from '../../billing/utils/money'
import { useSubscription, useSubscriptionMutations } from '../api/subscriptionsApi'
import { cadenceLabel } from '../utils/cadence'
import { SubscriptionActions } from './SubscriptionActions'
import { SubscriptionPeriods } from './SubscriptionPeriods'
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge'

function Section({ title, children }) {
  return (
    <section className="grid content-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2>
      {children}
    </section>
  )
}

/** One subscription: plan, current period, notices (grace, cancel at period end, pending change), periods, history. */
export function SubscriptionDetailView({ subscriptionId, backTo, contractPath }) {
  const { t, i18n } = useTranslation()
  const query = useSubscription(subscriptionId)
  const item = query.data
  const money = useMoney(item?.plan?.currency)
  const { update } = useSubscriptionMutations(subscriptionId)
  const language = i18n.language
  const date = (value) => (value ? formatDate(value, language, { dateStyle: 'medium' }) : '—')
  const live = item && ['trial', 'active', 'past_due'].includes(item.status)

  const notices = item
    ? [
        item.status === 'trial' && t('service.subscriptions.notices.trial', { date: date(item.trial_ends_at) }),
        item.status === 'past_due' && t('service.subscriptions.notices.pastDue', { date: date(item.grace_until), amount: money(item.amount_due) }),
        item.status === 'suspended' && t(item.suspend_reason === 'non_payment' ? 'service.subscriptions.notices.suspendedDues' : 'service.subscriptions.notices.suspendedManual', { amount: money(item.amount_due) }),
        item.cancel_at_period_end && live && t('service.subscriptions.notices.cancelAtEnd', { date: date(item.current_period_end) }),
        item.renewal_due && t('service.subscriptions.notices.renewalDue', { count: item.days_to_period_end }),
        item.pending_change && t('service.subscriptions.notices.pendingChange', { amount: money(item.pending_change.price), date: date(item.pending_change.effective_date) }),
        item.credit_balance > 0 && t('service.subscriptions.notices.credit', { amount: money(item.credit_balance) }),
      ].filter(Boolean)
    : []

  return (
    <div className="grid gap-4">
      <Link to={backTo} className="inline-flex w-fit items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
        <ArrowLeft size={16} aria-hidden="true" className="rtl:-scale-x-100" />
        {t('service.subscriptions.back')}
      </Link>
      <ResourceState isLoading={query.isLoading} error={query.error} onRetry={query.refetch}>
        {item && (
          <>
            <header className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="grid gap-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                  <span dir="ltr" className="font-mono">{item.subscription_number}</span>
                  <SubscriptionStatusBadge status={item.status} />
                </div>
                <h1 className="text-lg font-bold text-[var(--text)]">{localizeLabel(item.item_name, language, item.item_id)} · {item.customer?.name}</h1>
                <p className="text-sm text-[var(--text-muted)]"><span dir="ltr">{money(item.plan.price)}</span> / {cadenceLabel(item.plan, t)}</p>
                {item.contract_id && contractPath && (
                  <Link to={contractPath(item.contract_id)} className="inline-flex w-fit items-center gap-1 text-xs text-[var(--text)] underline">
                    <FileSignature size={14} aria-hidden="true" />
                    {t('service.billing.contractLink')} <span dir="ltr">{item.contract_number}</span>
                  </Link>
                )}
              </div>
              <SubscriptionActions subscription={item} />
            </header>

            {notices.length > 0 && (
              <ul className="grid gap-1 rounded-lg border border-sla-at-risk bg-[var(--surface)] p-3 text-sm text-[var(--text)]">
                {notices.map((notice) => <li key={notice}>{notice}</li>)}
              </ul>
            )}

            <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <Section title={t('service.subscriptions.periods')}>
                <SubscriptionPeriods subscription={item} />
              </Section>
              <div className="grid content-start gap-4">
                <Section title={t('service.subscriptions.details')}>
                  <dl className="grid gap-2 text-sm">
                    {[
                      ['started', date(item.started_at)],
                      ['currentPeriod', item.current_period_end ? t('service.entitlements.range', { from: date(item.current_period_start), to: date(item.current_period_end) }) : '—'],
                      ['graceDays', item.plan.grace_days],
                      ['amountDue', <span key="due" dir="ltr">{money(item.amount_due)}</span>],
                      item.cancelled_at && ['cancelledAt', date(item.cancelled_at)],
                      item.cancel_reason && ['cancelReason', <bdi key="reason">{item.cancel_reason}</bdi>],
                    ].filter(Boolean).map(([key, value]) => (
                      <div key={key} className="flex justify-between gap-2">
                        <dt className="text-[var(--text-muted)]">{t(`service.subscriptions.fields.${key}`)}</dt>
                        <dd className="text-end text-[var(--text)]">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <Select label={t('service.subscriptions.fields.renewal')} value={item.renewal_type} disabled={!live || update.isPending} onChange={(renewal) => renewal && update.mutate({ id: item.id, version: item.version, renewal_type: renewal })} options={['auto', 'manual', 'none'].map((value) => ({ value, label: t(`service.subscriptions.renewals.${value}`) }))} />
                </Section>
                <Section title={t('service.subscriptions.history')}>
                  <ol className="grid gap-2">
                    {item.events.map((entry, index) => (
                      <li key={`${entry.type}-${entry.occurred_at}-${index}`} className="grid text-xs">
                        <span className="text-[var(--text)]">{t(`service.subscriptions.events.${entry.type}`, { defaultValue: entry.type })}{entry.reason && entry.reason !== 'non_payment' ? <> · <bdi>{entry.reason}</bdi></> : null}</span>
                        <span className="text-[var(--text-muted)]">{formatDate(entry.occurred_at, language, { dateStyle: 'medium' })}{entry.by?.name ? ` · ${entry.by.name}` : ''}</span>
                      </li>
                    ))}
                  </ol>
                </Section>
              </div>
            </div>
          </>
        )}
      </ResourceState>
    </div>
  )
}
