import { Link } from 'react-router-dom'

export function CustomerStatusBoardBreadcrumbs() {
  return (
    <nav className="text-sm text-[var(--text-muted)]" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link to="/LeadsCenter" className="font-semibold text-[#007A80] hover:underline">
            مركز العملاء المحتملين
          </Link>
        </li>
        <li>/</li>
        <li className="font-semibold text-[var(--text)]">العرض المتعدد للحالات</li>
      </ol>
    </nav>
  )
}
