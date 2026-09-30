import { useTranslation } from 'react-i18next'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { cn } from '../../utils/cn'
import { formatCompactNumber } from './reportUtils'

function DeltaBadge({ delta, positiveIsGood = true, periodLabel }) {
  const { t } = useTranslation()
  if (delta === null || delta === undefined) return null
  const direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
  const good = direction === 'flat' ? null : (direction === 'up') === positiveIsGood
  const Icon = direction === 'up' ? ArrowUpRight : direction === 'down' ? ArrowDownRight : Minus

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-medium',
        good === true && 'text-emerald-700 dark:text-emerald-300',
        good === false && 'text-red-700 dark:text-red-300',
        good === null && 'text-[var(--text-muted)]'
      )}
      title={periodLabel}
    >
      <Icon size={13} aria-hidden="true" />
      <span dir="ltr">{`${delta > 0 ? '+' : ''}${delta}%`}</span>
      <span className="sr-only">{t(`reports.delta.${direction}`)}</span>
    </span>
  )
}

/**
 * One headline number. `value` is formatted compactly unless it is already a string
 * (e.g. "63%"). `delta` is a signed percent vs the previous period of the same length.
 */
export function StatTile({ icon: Icon, label, value, delta, positiveIsGood = true, hint }) {
  const { t, i18n } = useTranslation()
  const display = typeof value === 'string' ? value : formatCompactNumber(value, i18n.language)

  return (
    <div className="flex min-w-0 items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      {Icon && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]">
          <Icon size={18} />
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-xs text-[var(--text-muted)]">{label}</p>
        <p className="mt-1 text-2xl font-semibold leading-none text-[var(--text)]">{display}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <DeltaBadge delta={delta} positiveIsGood={positiveIsGood} periodLabel={t('reports.delta.vsPrevious')} />
          {hint && <span className="text-xs text-[var(--text-light)]">{hint}</span>}
        </div>
      </div>
    </div>
  )
}

// Static class names so Tailwind generates them (no string-built classes).
const DESKTOP_COLUMNS = { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3' }

/** A row of stat tiles (2 columns on mobile, up to 4 on desktop). */
export function KpiRow({ items = [] }) {
  if (!items.length) return null
  return (
    <section className={cn('grid grid-cols-2 gap-3', DESKTOP_COLUMNS[items.length] || 'lg:grid-cols-4')}>
      {items.map(({ id, ...item }) => <StatTile key={id} {...item} />)}
    </section>
  )
}
