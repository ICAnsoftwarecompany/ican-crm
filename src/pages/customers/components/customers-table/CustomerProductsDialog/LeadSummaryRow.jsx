import { CalendarDays, Mail, Phone, UserRound } from 'lucide-react'
import { formatDateTime, getCustomerLead, getCustomerName } from './customerProductsDialogUtils'

function SummaryItem({ icon: Icon, label, value }) {
  if (!value) return null

  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-full border border-[#D7EEF0] bg-white px-2.5 py-1 text-[11px] font-bold text-[#334155]">
      <Icon size={13} className="shrink-0 text-[#007A80]" />
      <span className="shrink-0 text-[#64748B]">{label}</span>
      <span className="min-w-0 break-words text-[var(--text)]">{value}</span>
    </span>
  )
}

export function LeadSummaryRow({ row, interestedCount = 0, availableCount = 0 }) {
  const lead = getCustomerLead(row)
  const customerName = getCustomerName(row)
  const createdAt = formatDateTime(lead?.created_at || row?.created_at)
  const status = lead?.status?.status || lead?.status?.name || lead?.status_title || lead?.status || ''

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2 rounded-xl border border-[#D7EEF0] bg-[#F8FEFF] px-3 py-2">
      <SummaryItem icon={UserRound} label="العميل" value={customerName || lead?.id || row?.id} />
      <SummaryItem icon={Phone} label="الهاتف" value={lead?.phone || row?.phone} />
      <SummaryItem icon={Mail} label="البريد" value={lead?.email || row?.email} />
      <SummaryItem icon={CalendarDays} label="الإضافة" value={createdAt} />
      {status ? (
        <span className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-full border border-[#E2E8F0] bg-white px-2.5 py-1 text-[11px] font-black text-[#475569]">
          <span className="shrink-0">الحالة</span>
          <span className="min-w-0 break-words text-[var(--text)]">{status}</span>
        </span>
      ) : null}
      <span className="ms-auto inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-black text-[#007A80]">
        مهتم: {interestedCount}
        <span className="text-[#CBD5E1]">|</span>
        غير مهتم: {availableCount}
      </span>
    </div>
  )
}
