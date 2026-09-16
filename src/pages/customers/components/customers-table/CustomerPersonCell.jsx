import { UserRound } from 'lucide-react'
import { getCustomerPerson } from './customerMarketingUtils'
import { CustomerPersonHoverDetails, CustomerTableHoverCard } from './CustomerTableHovers'

function normalizePerson(user) {
  if (!user || typeof user !== 'object') return null

  return {
    id: user.id || '',
    name: user.name || user.username || user.email || '',
    username: user.username || '',
    role: user.role || '',
    type: user.type || '',
    active: user.active,
    phone: user.phone || '',
    priority: user.priority,
    managerId: user.manager_id || '',
    teamId: user.team_id || '',
    teamName: user.team?.name || user.team_name || '',
    email: user.email || '',
    createdAt: user.created_at || '',
    updatedAt: user.updated_at || '',
    raw: user,
  }
}

function resolvePersonId(row, field) {
  const lead = row?.lead || {}

  if (field === 'agent') {
    return row?.agent_id || lead?.agent_id || row?.agent?.id || lead?.agent?.id || ''
  }

  return (
    row?.linked_by_id ||
    lead?.linked_by_id ||
    (typeof row?.linked_by === 'object' ? row.linked_by?.id : row?.linked_by) ||
    (typeof lead?.linked_by === 'object' ? lead.linked_by?.id : lead?.linked_by) ||
    ''
  )
}

export function CustomerPersonCell({ row, field, userById }) {
  const person = getCustomerPerson(row, field) || normalizePerson(userById?.get?.(String(resolvePersonId(row, field))))

  if (!person?.name) {
    return <span className="text-xs font-semibold text-[var(--text-muted)]">-</span>
  }

  const hoverTitle = field === 'agent' ? 'بيانات السيلز / الوكيل' : 'بيانات المستخدم المرتبط'

  return (
    <CustomerTableHoverCard
      content={<CustomerPersonHoverDetails person={person} title={hoverTitle} />}
      width={440}
      estimatedHeight={340}
      wrapperClassName="min-w-0"
    >
      <div className="flex w-full min-w-0 max-w-full items-center gap-1.5">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#D7EEF0] bg-[#F8FEFF] text-[#007A80]">
          <UserRound size={14} />
        </span>
        <span className="min-w-0 flex-1 break-words text-xs font-black text-[var(--text)]" title={person.name}>
          {person.name}
        </span>
      </div>
    </CustomerTableHoverCard>
  )
}
