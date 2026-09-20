export function Metric({ label, value }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="text-xs text-[var(--text-muted)]">{label}</div>
      <div className="mt-1 text-lg font-bold text-[var(--text)]">{value}</div>
    </div>
  )
}
