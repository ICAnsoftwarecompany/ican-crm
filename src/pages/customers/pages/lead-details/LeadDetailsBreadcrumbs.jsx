import { Link } from 'react-router-dom'

export function LeadDetailsBreadcrumbs() {
  return (
    <nav className="text-sm text-[var(--text-muted)]" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link to="/LeadsCenter" className="font-semibold text-[#007A80] hover:underline">
            العملاء
          </Link>
        </li>
        <li>/</li>
        <li className="font-semibold text-[var(--text)]">تفاصيل العميل</li>
      </ol>
    </nav>
  )
}
