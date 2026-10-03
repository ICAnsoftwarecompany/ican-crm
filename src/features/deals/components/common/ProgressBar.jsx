import { cn } from '../../../../shared/utils/cn'

/** Thin progress bar (0–100). `null` value renders an empty track. */
export function ProgressBar({ value, label, className }) {
  const width = typeof value === 'number' ? Math.max(0, Math.min(100, value)) : 0
  return (
    <div className={cn('min-w-0', className)}>
      {label && <div className="mb-1 flex items-center justify-between gap-2 text-xs text-[var(--text-muted)]">{label}</div>}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-2)]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={width}>
        <div className="h-full rounded-full bg-[var(--brand-accent)] transition-[width]" style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}
