import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function CustomerStatusBoardHeader({ children }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          {children && <div className="mt-2">{children}</div>}
        </div>

        <Link
          to="/LeadsCenter"
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm font-bold text-[var(--text)] transition-colors hover:bg-[#E8F9FA] hover:text-[#007A80]"
        >
          <ArrowRight size={16} />
          العودة لمركز العملاء المحتملين
        </Link>
      </div>
    </div>
  )
}
