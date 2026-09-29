import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Wallet } from 'lucide-react'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { useScheduleList } from '../../billing/api/schedulesApi'
import { ScheduleStatusBadge } from '../../billing/components/ScheduleStatusBadge'
import { useMoney } from '../../billing/utils/money'
import { Section, rowClass } from './CustomerHubSections'

/** Customer 360: payment schedules with outstanding / overdue (Billing Lite, F4). */
export function CustomerPaymentsSection({ customer }) {
  const { t } = useTranslation()
  const money = useMoney('EGP', 0)
  const schedules = useScheduleList({ customer_id: String(customer.id) })
  return (
    <Section icon={Wallet} title={t('service.hub.billing')}>
      <ResourceState isLoading={schedules.isLoading} error={schedules.error} onRetry={schedules.refetch} empty={!schedules.schedules.length} emptyTitle={t('service.billing.empty')}>
        <ul className="grid gap-2">
          {schedules.schedules.map((schedule) => (
            <li key={schedule.id}>
              <Link to={`/service/billing/schedules/${schedule.id}`} className={rowClass}>
                <span className="min-w-0 flex-1 text-sm text-[var(--text)]">
                  <span dir="ltr" className="font-mono text-xs text-[var(--text-muted)]">{schedule.schedule_number}</span>{' '}
                  {t('service.billing.totals.outstanding')}: <span dir="ltr">{money(schedule.totals?.outstanding)}</span>
                  {schedule.totals?.overdue > 0 && (
                    <span className="ms-2 text-xs font-semibold text-sla-breached">
                      {t('service.billing.totals.overdue')}: <span dir="ltr">{money(schedule.totals.overdue)}</span>
                    </span>
                  )}
                </span>
                <ScheduleStatusBadge status={schedule.status} />
              </Link>
            </li>
          ))}
        </ul>
      </ResourceState>
    </Section>
  )
}
