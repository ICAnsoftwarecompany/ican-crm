import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

/** Presentational column shared by the native and long-press boards. */
export const PipelineColumn = forwardRef(function PipelineColumn(
  { stage, lane, count, isDropTarget = false, bodyClassName, children, ...props },
  ref
) {
  return (
    <section
      ref={ref}
      {...props}
      className={cn(
        'flex min-h-48 min-w-0 flex-col rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-2 transition-colors',
        isDropTarget && 'border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]'
      )}
    >
      <header className="mb-2 border-b border-[var(--border)] px-1 pb-2">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: stage.color || 'var(--text-muted)' }} />
          <h3 className="min-w-0 flex-1 truncate text-sm font-bold text-[var(--text)]" title={stage.label || stage.name}>
            {stage.label || stage.name}
          </h3>
          <span className="rounded-full bg-[var(--surface)] px-2 py-0.5 text-xs font-semibold text-[var(--text-muted)]">{count}</span>
        </div>
        {/* Optional per-column totals (e.g. sums of the cards' values), given by the board's owner. */}
        {stage.headerSummary && <div className="mt-1.5">{stage.headerSummary}</div>}
      </header>
      {lane?.label && <div className="mb-2 text-xs font-semibold text-[var(--text-muted)]">{lane.label}</div>}
      <div className={cn('min-h-0 flex-1 space-y-2', bodyClassName)}>{children}</div>
    </section>
  )
})
