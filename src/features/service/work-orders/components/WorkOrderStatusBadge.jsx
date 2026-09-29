import { useTranslation } from 'react-i18next'
import { cn } from '../../../../shared/utils/cn'

const TONE = { new: 'bg-status-new', scheduled: 'bg-status-contacted', on_the_way: 'bg-sla-at-risk', in_progress: 'bg-status-qualified', completed: 'bg-status-won', cancelled: 'bg-status-lost' }
export const WORK_ORDER_STATUSES = Object.keys(TONE)
export const WORK_ORDER_TYPES = ['installation', 'repair', 'maintenance', 'inspection', 'delivery', 'pickup', 'custom']

export function WorkOrderStatusBadge({ status }) {
  const { t } = useTranslation()
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 text-xs font-medium text-[var(--text)]">
      <span className={cn('h-2 w-2 rounded-full', TONE[status] || 'bg-[var(--text-muted)]')} aria-hidden="true" />
      {t(`service.workOrders.statuses.${status}`, { defaultValue: status })}
    </span>
  )
}
