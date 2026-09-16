const FILTERS = [
  { id: 'all', label: 'الكل' },
  { id: 'status', label: 'الحالات' },
  { id: 'notes', label: 'الملاحظات' },
  { id: 'products', label: 'المنتجات' },
  { id: 'communication', label: 'التواصل' },
]

export function ActivityFilters({ activeFilter, onFilterChange, counts }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {FILTERS.map((filter) => {
        const selected = activeFilter === filter.id
        const count = counts?.[filter.id] || 0

        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onFilterChange(filter.id)}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-black transition ${
              selected
                ? 'border-[#00AEB8] bg-[#E8F9FA] text-[#007A80]'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{filter.label}</span>
            <span className="rounded-full bg-white/80 px-1.5 py-0.5 text-[10px]">{count}</span>
          </button>
        )
      })}
    </div>
  )
}
