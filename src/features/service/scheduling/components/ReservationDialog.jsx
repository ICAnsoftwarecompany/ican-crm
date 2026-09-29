import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { AppModal } from '../../../../shared/components/overlays/AppModal'
import { Button } from '../../../../shared/components/ui/Button'
import { localizeLabel } from '../../core/utils/localizeLabel'
import { useReservationMutations } from '../api/schedulingApi'
import { useZonedFormat } from '../utils/zonedTime'

/** Details of one reservation: confirm a hold, release a manual one; work-order bookings link to the work order. */
export function ReservationDialog({ reservation, onClose, timeZone, workOrderPath }) {
  const { t, i18n } = useTranslation()
  const format = useZonedFormat(timeZone)
  const { confirm, release } = useReservationMutations()
  if (!reservation) return null
  const active = ['hold', 'confirmed'].includes(reservation.status)
  const done = (key) => () => {
    toast.success(t(`service.scheduling.done.${key}`))
    onClose()
  }
  const rows = [
    ['resource', localizeLabel(reservation.resource?.name, i18n.language, reservation.resource_id)],
    ['time', <span key="time"><bdi>{format.dateTime(reservation.starts_at)}</bdi> – <bdi>{format.time(reservation.ends_at)}</bdi></span>],
    ['status', t(`service.scheduling.statuses.${reservation.status}`)],
    reservation.status === 'hold' && ['holdExpires', format.dateTime(reservation.hold_expires_at)],
    reservation.note && ['note', <bdi key="note">{reservation.note}</bdi>],
    reservation.created_by?.name && ['createdBy', reservation.created_by.name],
  ].filter(Boolean)

  return (
    <AppModal
      isOpen
      onClose={onClose}
      title={reservation.subject?.number || t('service.scheduling.reservation')}
      description={reservation.subject?.customer?.name}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          {reservation.subject_type === 'work_order' && workOrderPath && <Link to={workOrderPath({ id: reservation.subject_id })} className="inline-flex items-center rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--surface-2)]">{t('service.scheduling.openWorkOrder')}</Link>}
          {active && reservation.subject_type !== 'work_order' && <Button variant="outline" loading={release.isPending} onClick={() => release.mutate(reservation.id, { onSuccess: done('released') })}>{t('service.scheduling.actions.release')}</Button>}
          {reservation.status === 'hold' && <Button loading={confirm.isPending} onClick={() => confirm.mutate(reservation.id, { onSuccess: done('confirmed') })}>{t('service.scheduling.actions.confirm')}</Button>}
        </div>
      }
    >
      <dl className="grid gap-2 text-sm">
        {rows.map(([key, value]) => (
          <div key={key} className="flex justify-between gap-3">
            <dt className="text-[var(--text-muted)]">{t(`service.scheduling.fields.${key}`)}</dt>
            <dd className="text-end text-[var(--text)]">{value}</dd>
          </div>
        ))}
      </dl>
    </AppModal>
  )
}
