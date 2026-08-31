import { Check } from 'lucide-react'

export function StatusTabsSelector({ statuses = [], selectedStatusIds = [], onToggleStatus }) {
  const selectedSet = new Set(selectedStatusIds.map(String))

  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="rounded-full bg-[#E8F9FA] px-2 py-0.5 text-[11px] font-bold text-[#007A80]">
          {selectedStatusIds.length} محدد
        </span>
      </div>

      <div className="flex max-w-full gap-1.5 overflow-x-auto pb-1">
        {statuses.map((status) => {
          const selected = selectedSet.has(String(status.id))
          const color = status.color || '#64748B'

          return (
            <button
              key={status.id}
              type="button"
              onClick={() => onToggleStatus?.(status.id)}
              className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-bold transition-colors ${
                selected
                  ? 'border-[#00C2CB] bg-[#E8F9FA] text-[#007A80]'
                  : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] hover:bg-[#F8FAFF]'
              }`}
            >
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
              <span className="max-w-28 truncate">{status.status}</span>
              {selected && <Check size={13} className="shrink-0" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
