import { Info, TriangleAlert } from 'lucide-react'
import { cn } from '../../utils/cn'

const tones = {
  info: { icon: Info, className: 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]' },
  warning: {
    icon: TriangleAlert,
    className: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200',
  },
}

/** One-line banner for "not connected to the backend yet", "saved in this browser only", etc. */
export function ModuleNotice({ tone = 'info', children, className }) {
  const config = tones[tone] || tones.info
  const Icon = config.icon
  return (
    <div role="note" className={cn('flex items-start gap-2 rounded-lg border px-3 py-2 text-sm', config.className, className)}>
      <Icon size={16} className="mt-0.5 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  )
}
