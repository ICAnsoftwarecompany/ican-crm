import { useState } from 'react'
import { BadgeCheck, FileText, Megaphone, MousePointerClick, UploadCloud } from 'lucide-react'
import { getCustomerMarketingSource } from './customerMarketingUtils'
import { OpenDetailsButton, SourceDetailsDialog } from './CustomerTableDetailsDialogs'

const SOURCE_META = {
  form: {
    label: 'Form',
    icon: FileText,
    className: 'border-[#BBD7FF] bg-[#EFF6FF] text-[#145DBF]',
  },
  ad: {
    label: 'Ad',
    icon: MousePointerClick,
    className: 'border-[#FED7AA] bg-[#FFF7ED] text-[#C2410C]',
  },
  campaign: {
    label: 'Campaign',
    icon: Megaphone,
    className: 'border-[#C4B5FD] bg-[#F5F3FF] text-[#6D28D9]',
  },
  manual: {
    label: 'Manual',
    icon: UploadCloud,
    className: 'border-[#D7EEF0] bg-[#F8FEFF] text-[#007A80]',
  },
}

function renderValue(value) {
  if (value === null || value === undefined || value === '') return null
  return String(value)
}

export function CustomerMarketingSourceCell({ row }) {
  const [detailsSource, setDetailsSource] = useState(null)
  const source = getCustomerMarketingSource(row)
  const meta = SOURCE_META[source.kind] || SOURCE_META.manual
  const Icon = meta.icon
  const secondaryItems = [
    source.code ? `Code: ${source.code}` : '',
    source.platform ? `Platform: ${source.platform}` : '',
    source.status ? `Status: ${source.status}` : '',
    source.budget ? `Budget: ${source.budget}` : '',
  ].filter(Boolean)
  const dateRange = [source.startDate, source.endDate].filter(Boolean).join(' -> ')

  return (
    <>
      <div className="flex max-h-[64px] min-w-[280px] max-w-full flex-wrap items-center gap-1.5 overflow-hidden">
        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-black ${meta.className}`}>
          <Icon size={13} />
          {meta.label}
        </span>
        <span className="min-w-[140px] flex-1 break-words text-xs font-black text-[var(--text)]" title={source.title}>
          {source.title || '-'}
        </span>
        {secondaryItems.map((item) => (
          <span key={item} className="rounded-full border border-[#E2E8F0] bg-white px-2 py-0.5 text-[10px] font-bold text-[#475569]">
            {item}
          </span>
        ))}
        {dateRange ? (
          <span className="rounded-full border border-[#E2E8F0] bg-white px-2 py-0.5 text-[10px] font-bold text-[#475569]">
            {dateRange}
          </span>
        ) : null}
        {renderValue(source.externalId) ? (
          <span className="rounded-full border border-[#E2E8F0] bg-white px-2 py-0.5 text-[10px] font-bold text-[#475569]">
            External: {source.externalId}
          </span>
        ) : null}
        {source.linkedProducts?.length ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-2 py-0.5 text-[10px] font-black text-[#166534]">
            <BadgeCheck size={11} />
            {source.linkedProducts.length} products
          </span>
        ) : null}
        <OpenDetailsButton onClick={() => setDetailsSource(source)} label="عرض" />
      </div>
      <SourceDetailsDialog source={detailsSource} onClose={() => setDetailsSource(null)} />
    </>
  )
}
