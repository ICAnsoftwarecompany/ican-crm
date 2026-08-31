import { UserRound } from 'lucide-react'
import { getCustomerPerson } from './customerMarketingUtils'

export function CustomerPersonCell({ row, field }) {
  const person = getCustomerPerson(row, field)

  if (!person?.name) {
    return <span className="text-xs font-semibold text-[var(--text-muted)]">-</span>
  }

  const teamLabel = person.teamName || (person.teamId ? `Team ${person.teamId}` : '')
  const statusLabel = person.active !== undefined && person.active !== null
    ? (Number(person.active) === 1 ? 'Active' : 'Inactive')
    : ''

  return (
    <div className="flex min-w-[240px] max-w-full flex-wrap items-center gap-1.5">
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#D7EEF0] bg-[#F8FEFF] text-[#007A80]">
        <UserRound size={14} />
      </span>
      <span className="min-w-0 max-w-[140px] truncate text-xs font-black text-[var(--text)]" title={person.name}>
        {person.name}
      </span>
      {teamLabel ? (
        <span className="rounded-full bg-[#E8F9FA] px-1.5 py-0.5 text-[10px] font-bold text-[#007A80]">
          {teamLabel}
        </span>
      ) : null}
      {statusLabel ? (
        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${Number(person.active) === 1 ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEE2E2] text-[#991B1B]'}`}>
          {statusLabel}
        </span>
      ) : null}
      {person.role ? (
        <span className="rounded-full bg-[#F1F5F9] px-1.5 py-0.5 text-[10px] font-bold text-[#475569]">
          {person.role}
        </span>
      ) : null}
      {person.type ? (
        <span className="rounded-full bg-[#F1F5F9] px-1.5 py-0.5 text-[10px] font-bold text-[#475569]">
          {person.type}
        </span>
      ) : null}
    </div>
  )
}
