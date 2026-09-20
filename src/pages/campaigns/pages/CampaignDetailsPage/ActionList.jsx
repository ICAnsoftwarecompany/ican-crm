import { LatinValue } from './LatinValue'

export function ActionList({ items, renderValue }) {
  return (
    <div className="grid gap-1 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div key={item.action_type} className="flex items-center justify-between gap-2 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs">
          <span className="text-[var(--text-muted)]">{item.label}</span>
          <LatinValue><span className="font-bold text-[var(--text)]">{renderValue(item.value)}</span></LatinValue>
        </div>
      ))}
    </div>
  )
}
