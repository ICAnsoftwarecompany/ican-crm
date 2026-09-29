/**
 * Horizontal magnitude bars for a small categorical breakdown (single series,
 * one hue). Labels and values are text in ink colors; the bar only carries
 * magnitude. ≤ 24px thick, 4px rounded data end, grows from the start edge.
 */
export function BarList({ items = [], emptyText, formatValue = (value) => value }) {
  const max = Math.max(...items.map((item) => item.value), 0)
  if (!items.length || max === 0) return <p className="py-6 text-center text-xs text-[var(--text-muted)]">{emptyText}</p>
  return (
    <ul className="grid gap-2.5">
      {items.map((item) => (
        <li key={item.key} className="grid gap-1" title={`${item.label}: ${formatValue(item.value)}`}>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="truncate text-[var(--text)]">{item.label}</span>
            <span className="font-semibold text-[var(--text)]" dir="ltr">{formatValue(item.value)}</span>
          </div>
          <div className="h-2.5 rounded-e bg-[var(--surface-2)]" aria-hidden="true">
            <div className="h-full rounded-e bg-[var(--chart-1)]" style={{ width: item.value ? `${Math.max((item.value / max) * 100, 1)}%` : 0 }} />
          </div>
        </li>
      ))}
    </ul>
  )
}
