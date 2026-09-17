import { Avatar } from '../../../../shared/components/ui/Avatar'
import { Badge } from '../../../../shared/components/ui/Badge'
import {
  formatCurrency,
  getOpportunityPriorityMeta,
  getOpportunityStatusMeta,
  getOpportunityTypeLabel,
} from '../../../../features/opportunities/utils/opportunityFormatters'

export function OpportunityDrawerHeader({ opportunity }) {
  const statusMeta = getOpportunityStatusMeta(opportunity.status)
  const priorityMeta = getOpportunityPriorityMeta(opportunity.priority)

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[var(--text-muted)]">{opportunity.customer?.industry}</p>
          <h3 className="text-lg font-black text-[var(--text)] truncate">{opportunity.customer?.name}</h3>
          <p className="text-sm text-[var(--text-muted)]">
            {getOpportunityTypeLabel(opportunity.type)} · {opportunity.product?.name}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: priorityMeta.color }}>
            <span className="h-2 w-2 rounded-full" style={{ background: priorityMeta.color }} />
            {priorityMeta.label}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-[#00C2CB] text-white text-lg font-black font-latin">
            {opportunity.score?.total ?? '-'}
          </span>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Score / 100</p>
          </div>
        </div>

        <div className="h-8 w-px bg-[var(--border)]" />

        <div>
          <p className="text-lg font-black text-[var(--text)] font-latin" dir="ltr">
            {formatCurrency(opportunity.estimated_value, opportunity.currency)}
          </p>
          <p className="text-xs text-[var(--text-muted)]">القيمة المحتملة</p>
        </div>

        <div className="h-8 w-px bg-[var(--border)]" />

        <div className="flex items-center gap-2">
          <Avatar name={opportunity.assigned_user?.name || '?'} size="sm" />
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">{opportunity.assigned_user?.name || 'غير مسند'}</p>
            <p className="text-xs text-[var(--text-muted)]">{opportunity.assigned_team?.name || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
