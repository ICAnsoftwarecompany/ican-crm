import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowLeft, CalendarClock, CheckCircle2, LogIn, Truck, XCircle } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { ReasonDialog } from '../../billing/components/ReasonDialog'
import { useZonedFormat } from '../../scheduling/utils/zonedTime'
import { useWorkOrder, useWorkOrderMutations } from '../api/workOrdersApi'
import { CompleteWorkOrderDialog, ScheduleWorkOrderDialog } from './WorkOrderDialogs'
import { WorkOrderStatusBadge } from './WorkOrderStatusBadge'

const DONE_KEY = { 'on-the-way': 'onTheWay', 'check-in': 'checkIn', cancel: 'cancelled' }

function Section({ title, children }) {
  return (
    <section className="grid content-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2>
      {children}
    </section>
  )
}

function Facts({ rows }) {
  const { t } = useTranslation()
  return (
    <dl className="grid gap-2 text-sm">
      {rows.filter(Boolean).map(([key, value]) => (
        <div key={key} className="flex justify-between gap-3">
          <dt className="text-[var(--text-muted)]">{t(`service.workOrders.fields.${key}`)}</dt>
          <dd className="text-end text-[var(--text)]">{value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Case / contract → work order → slot → on the way → check-in → complete → entitlement consumed (spec §38.3). */
export function WorkOrderDetailView({ workOrderId, backTo, assetPath }) {
  const { t, i18n } = useTranslation()
  const format = useZonedFormat()
  const query = useWorkOrder(workOrderId)
  const item = query.data
  const { action } = useWorkOrderMutations(workOrderId)
  const [dialog, setDialog] = useState(null)
  const close = () => setDialog(null)
  const run = (name, payload = {}) =>
    action.mutate({ id: item.id, action: name, version: item.version, ...payload }, {
      onSuccess: () => {
        toast.success(t(`service.workOrders.done.${DONE_KEY[name]}`))
        close()
      },
    })

  return (
    <div className="grid gap-4">
      <Link to={backTo} className="inline-flex w-fit items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
        <ArrowLeft size={16} aria-hidden="true" className="rtl:-scale-x-100" />
        {t('service.workOrders.back')}
      </Link>
      <ResourceState isLoading={query.isLoading} error={query.error} onRetry={query.refetch}>
        {item && (
          <>
            <header className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="grid gap-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                  <span dir="ltr" className="font-mono">{item.number}</span>
                  <WorkOrderStatusBadge status={item.status} />
                  <span>{t(`service.workOrders.types.${item.type}`)}</span>
                </div>
                <h1 className="text-lg font-bold text-[var(--text)]">{item.customer?.name}</h1>
                <p className="text-sm text-[var(--text-muted)]"><bdi>{item.location?.address}</bdi>{item.customer?.phone ? <> · <span dir="ltr">{item.customer.phone}</span></> : null}</p>
                {item.asset && assetPath && <Link to={assetPath(item.asset)} className="w-fit text-xs text-[var(--text)] underline">{localizeLabel(item.asset.name, i18n.language, item.asset.id)} · <span dir="ltr">{item.asset.serial_number}</span></Link>}
              </div>
              <div className="flex flex-wrap gap-2">
                {['new', 'scheduled'].includes(item.status) && <Button variant={item.status === 'new' ? 'primary' : 'outline'} onClick={() => setDialog('schedule')}><CalendarClock size={16} aria-hidden="true" />{t(item.status === 'new' ? 'service.workOrders.actions.schedule' : 'service.workOrders.actions.reschedule')}</Button>}
                {item.status === 'scheduled' && <Button variant="outline" loading={action.isPending && action.variables?.action === 'on-the-way'} onClick={() => run('on-the-way')}><Truck size={16} aria-hidden="true" />{t('service.workOrders.actions.onTheWay')}</Button>}
                {['scheduled', 'on_the_way'].includes(item.status) && <Button loading={action.isPending && action.variables?.action === 'check-in'} onClick={() => run('check-in')}><LogIn size={16} aria-hidden="true" />{t('service.workOrders.actions.checkIn')}</Button>}
                {item.status === 'in_progress' && <Button onClick={() => setDialog('complete')}><CheckCircle2 size={16} aria-hidden="true" />{t('service.workOrders.actions.complete')}</Button>}
                {['new', 'scheduled', 'on_the_way'].includes(item.status) && <Button variant="outline" onClick={() => setDialog('cancel')}><XCircle size={16} aria-hidden="true" />{t('service.workOrders.actions.cancel')}</Button>}
              </div>
            </header>

            <div className="grid gap-4 lg:grid-cols-3">
              <Section title={t('service.workOrders.schedule')}>
                <Facts rows={[
                  ['technician', localizeLabel(item.resource?.name, i18n.language, '') || null],
                  ['scheduled', item.scheduled_start ? <><bdi>{format.dateTime(item.scheduled_start)}</bdi> – <bdi>{format.time(item.scheduled_end)}</bdi></> : t('service.workOrders.unscheduled')],
                  ['duration', t('service.scheduling.minutes', { count: item.duration_minutes })],
                  ['zone', item.location?.zone ? <span dir="ltr">{item.location.zone}</span> : null],
                ]} />
              </Section>
              <Section title={t('service.workOrders.visit')}>
                <Facts rows={[
                  ['checkIn', item.check_in_at ? format.dateTime(item.check_in_at) : null],
                  ['checkOut', item.check_out_at ? format.dateTime(item.check_out_at) : null],
                  item.completion_status && ['outcome', t(`service.workOrders.completion.${item.completion_status}`)],
                  item.failure_reason && ['failureReason', t(`service.workOrders.failures.${item.failure_reason}`, { defaultValue: item.failure_reason })],
                  item.labor_minutes && ['labor', t('service.scheduling.minutes', { count: item.labor_minutes })],
                  item.signature_name && ['signature', item.signature_name],
                ]} />
                {item.work_notes && <p className="text-sm text-[var(--text)]"><bdi>{item.work_notes}</bdi></p>}
                {item.parts?.length > 0 && (
                  <ul className="grid gap-1 text-xs text-[var(--text-muted)]">
                    {item.parts.map((part, index) => <li key={index}><bdi>{part.name}</bdi> <span dir="ltr">×{part.quantity}</span></li>)}
                  </ul>
                )}
              </Section>
              <Section title={t('service.workOrders.fields.coverage')}>
                {item.entitlement ? (
                  <Facts rows={[
                    ['entitlement', t(`service.entitlements.types.${item.entitlement.type}`)],
                    ['entitlementState', t(`service.entitlements.statuses.${item.entitlement.state}`)],
                    ['consumed', item.entitlement_transaction_id ? t('service.workOrders.consumedYes') : t('service.workOrders.consumedNo')],
                  ]} />
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">{t('service.workOrders.billableHint')}</p>
                )}
                {item.billable && item.entitlement && <p className="text-xs text-sla-at-risk">{t('service.workOrders.entitlementNotAvailable')}</p>}
              </Section>
            </div>

            <Section title={t('service.workOrders.history')}>
              <ol className="grid gap-2">
                {item.events.map((entry, index) => (
                  <li key={`${entry.type}-${index}`} className="text-xs">
                    <span className="text-[var(--text)]">{t(`service.workOrders.events.${entry.type}`, { defaultValue: entry.type })}</span>
                    {entry.reason && <span className="text-[var(--text-muted)]"> · <bdi>{t(`service.workOrders.failures.${entry.reason}`, { defaultValue: entry.reason })}</bdi></span>}
                    <span className="text-[var(--text-muted)]"> · {format.dateTime(entry.at)}{entry.by?.name ? ` · ${entry.by.name}` : ''}</span>
                  </li>
                ))}
              </ol>
            </Section>

            <ScheduleWorkOrderDialog open={dialog === 'schedule'} onClose={close} workOrder={item} />
            <CompleteWorkOrderDialog open={dialog === 'complete'} onClose={close} workOrder={item} />
            <ReasonDialog open={dialog === 'cancel'} onClose={close} title={t('service.workOrders.actions.cancel')} submitText={t('service.workOrders.actions.cancel')} loading={action.isPending} onSubmit={(reason) => run('cancel', { reason })} />
          </>
        )}
      </ResourceState>
    </div>
  )
}
