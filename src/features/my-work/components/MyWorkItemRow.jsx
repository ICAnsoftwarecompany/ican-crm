import { Link } from 'react-router-dom'
import { cn } from '../../../shared/utils/cn'

const rowClass = cn(
  'flex w-full items-start gap-3 rounded-md px-2 py-2 text-start transition-colors',
  'hover:bg-[var(--surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]'
)

function RowBody({ icon: Icon, title, meta, time, overdue }) {
  return (
    <>
      {Icon && <Icon size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--text-muted)]" />}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-[var(--text)]">{title}</span>
        {meta && <span className="block truncate text-xs text-[var(--text-muted)]">{meta}</span>}
      </span>
      {time && (
        <span className={cn('shrink-0 text-xs', overdue ? 'font-bold text-red-600 dark:text-red-300' : 'text-[var(--text-muted)]')}>
          {time}
        </span>
      )}
    </>
  )
}

/** One actionable line in a section: opens a drawer (`onClick`) or navigates (`to`). */
export function MyWorkItemRow({ to, onClick, ...body }) {
  if (to) {
    return (
      <li>
        <Link to={to} className={rowClass}>
          <RowBody {...body} />
        </Link>
      </li>
    )
  }

  return (
    <li>
      <button type="button" onClick={onClick} className={rowClass}>
        <RowBody {...body} />
      </button>
    </li>
  )
}

export function MyWorkItemList({ children }) {
  return <ul className="space-y-0.5">{children}</ul>
}
