import { Search, X } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { ActivityAdvancedFilters } from './ActivityAdvancedFilters'
import { ActivityDateFilter } from './ActivityDateFilter'

const inputClassName = 'h-10 w-full min-w-0 rounded-lg border border-[var(--border)] bg-white px-3 text-sm font-semibold text-[var(--text)] outline-none transition focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]'

export function ActivityFilters({ filters, onChange, onClear }) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="grid gap-3 lg:grid-cols-[minmax(220px,1.2fr)_repeat(6,minmax(140px,1fr))_auto]">
        <label className="min-w-0 space-y-1 text-xs font-bold text-[var(--text)]">
          <span>بحث</span>
          <span className="relative block">
            <Search className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
            <input
              value={filters.search}
              onChange={(event) => onChange({ search: event.target.value })}
              placeholder="بحث في العنوان، العميل، الشركة..."
              className={`${inputClassName} ps-9`}
            />
          </span>
        </label>

        <ActivityDateFilter filters={filters} onChange={onChange} inputClassName={inputClassName} />
        <ActivityAdvancedFilters filters={filters} onChange={onChange} inputClassName={inputClassName} />

        <div className="flex items-end">
          <Button variant="outline" className="h-10 w-full" onClick={onClear}>
            <X size={15} />
            مسح
          </Button>
        </div>
      </div>
    </section>
  )
}
