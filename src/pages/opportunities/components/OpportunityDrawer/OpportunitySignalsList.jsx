import { Radar } from 'lucide-react'
import { formatRelativeTime, getSignalTypeMeta } from '../../../../features/opportunities/utils/opportunityFormatters'

export function OpportunitySignalsList({ opportunity }) {
  const signals = Array.isArray(opportunity.signals) ? opportunity.signals : []

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Radar size={16} className="text-[var(--text-muted)]" />
        <h4 className="font-bold text-[var(--text)]">الإشارات ({signals.length})</h4>
      </div>

      {signals.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">لا توجد إشارات مسجلة لهذه الفرصة.</p>
      ) : (
        <div className="grid gap-2.5">
          {signals.map((signal) => {
            const meta = getSignalTypeMeta(signal.type)
            const Icon = meta.icon

            return (
              <div key={signal.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-[var(--surface-2)]">
                      {Icon ? <Icon size={15} className="text-[#00A8B0]" /> : null}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[var(--text)]">{signal.reason || meta.label}</p>
                      {signal.evidence && (
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">{signal.evidence}</p>
                      )}
                      <p className="text-[11px] text-[var(--text-light)] mt-1">{formatRelativeTime(signal.detected_at)}</p>
                    </div>
                  </div>

                  <div className="shrink-0 text-end">
                    <span className="inline-block rounded-full bg-[#E8F9FA] text-[#007A80] text-xs font-black px-2 py-0.5">
                      +{signal.score_contribution ?? 0}
                    </span>
                    {Number.isFinite(signal.confidence) && (
                      <p className="text-[10px] text-[var(--text-light)] mt-1">AI {signal.confidence}%</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
