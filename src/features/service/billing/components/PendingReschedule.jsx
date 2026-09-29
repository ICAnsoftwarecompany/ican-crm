import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '../../../../shared/components/ui/Button'
import { formatDate } from '../../../../shared/utils/dateTime'
import { useScheduleMutations } from '../api/schedulesApi'
import { useMoney } from '../utils/money'
import { ReasonDialog } from './ReasonDialog'
import { ScheduleLinesTable } from './ScheduleLinesTable'

/**
 * A reschedule waiting for approval: the server-built new lines + approve / reject.
 * The approvals module (later phase) will route this to the right manager; the server checks the permission.
 */
export function PendingReschedule({ schedule, onApproved }) {
  const { t, i18n } = useTranslation()
  const money = useMoney(schedule.currency)
  const { action } = useScheduleMutations(schedule.id)
  const [rejecting, setRejecting] = useState(false)
  const request = schedule.pending_reschedule
  if (!request) return null

  const decide = (decision, payload = {}) =>
    action.mutate({ id: schedule.id, action: `reschedule/${decision}`, version: schedule.version, ...payload }, {
      onSuccess: (result) => {
        toast.success(t(`service.billing.done.${decision === 'approve' ? 'rescheduled' : 'rescheduleRejected'}`))
        setRejecting(false)
        if (decision === 'approve') onApproved?.(result)
      },
    })

  return (
    <section className="grid gap-3 rounded-lg border border-sla-at-risk bg-[var(--surface)] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-1">
          <h2 className="text-sm font-semibold text-[var(--text)]">{t('service.billing.pendingReschedule')}</h2>
          <p className="text-xs text-[var(--text-muted)]">
            {t('service.billing.pendingSummary', { count: request.count, amount: money(request.carried_amount), date: formatDate(request.first_due, i18n.language, { dateStyle: 'medium' }) })}
          </p>
          <p className="text-xs text-[var(--text-muted)]"><bdi>{request.reason}</bdi>{request.requested_by?.name ? ` · ${request.requested_by.name}` : ''}</p>
        </div>
        <div className="flex gap-2">
          <Button loading={action.isPending && action.variables?.action === 'reschedule/approve'} onClick={() => decide('approve')}>{t('service.billing.actions.approve')}</Button>
          <Button variant="outline" onClick={() => setRejecting(true)}>{t('service.billing.actions.reject')}</Button>
        </div>
      </div>
      <ScheduleLinesTable schedule={schedule} lines={request.preview_lines} readOnly />
      <ReasonDialog open={rejecting} onClose={() => setRejecting(false)} title={t('service.billing.actions.reject')} submitText={t('service.billing.actions.reject')} loading={action.isPending} onSubmit={(note) => decide('reject', { note })} />
    </section>
  )
}
