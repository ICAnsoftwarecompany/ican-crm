export function ActivityStatCard({ label, value, icon: Icon, tone = 'teal' }) {
  const toneClassNames = {
    teal: 'bg-[#E8F9FA] text-[#007A80]',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-700',
    slate: 'bg-slate-50 text-slate-600',
  }

  return (
    <article className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="flex items-center gap-3">
        {Icon ? (
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${toneClassNames[tone] || toneClassNames.teal}`}>
            <Icon size={18} />
          </span>
        ) : null}
        <div className="min-w-0">
          <p className="text-xs font-bold text-[var(--text-muted)]">{label}</p>
          <p className="mt-0.5 text-xl font-black text-[var(--text)]">{value}</p>
        </div>
      </div>
    </article>
  )
}
