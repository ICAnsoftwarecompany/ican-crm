import { BadgeCheck } from 'lucide-react'
import { getCustomerMarketingSource } from './customerMarketingUtils'
import {
  CUSTOMER_SOURCE_META,
  CustomerMarketingSourceHoverDetails,
  CustomerTableHoverCard,
  getSourceDisplayName,
  getSourceSpecificLabel,
} from './CustomerTableHovers'

function renderValue(value) {
  if (value === null || value === undefined || value === '') return null
  return String(value)
}

export function CustomerMarketingSourceCell({ row, t }) {
  const source = getCustomerMarketingSource(row)
  const meta = CUSTOMER_SOURCE_META[source.kind] || CUSTOMER_SOURCE_META.manual
  const Icon = meta.icon
  const displayName = getSourceDisplayName(source)
  const sourceLabel = getSourceSpecificLabel(source, t)
  const campaignName = renderValue(source.campaignName)
  const campaignNameLabel = t ? t('customers.table.source.campaignName') : 'Campaign'

  return (
    <div className="flex w-full min-w-0 max-w-full items-start gap-1.5">
      <CustomerTableHoverCard
        content={<CustomerMarketingSourceHoverDetails source={source} meta={meta} t={t} />}
        width={520}
        estimatedHeight={360}
        wrapperClassName="min-w-0 flex-1"
      >
        <div className="flex w-full min-w-0 flex-wrap items-center gap-1.5 rounded-lg border border-[#D7EEF0] bg-[#F8FEFF] px-2 py-1.5">
          <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-black ${meta.className}`}>
            <Icon size={13} />
            {sourceLabel}
          </span>
          <span className="min-w-0 flex-1 break-words text-xs font-black text-[var(--text)]" title={displayName}>
            {displayName}
          </span>
          {campaignName && source.kind !== 'campaign' ? (
            <span className="inline-flex max-w-full items-center rounded-full border border-[#E2E8F0] bg-white px-2 py-0.5 text-[10px] font-bold text-[#475569]">
              <span className="min-w-0 break-words">{campaignNameLabel}: {campaignName}</span>
            </span>
          ) : null}
          {source.linkedProducts?.length ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-2 py-0.5 text-[10px] font-black text-[#166534]">
              <BadgeCheck size={11} />
              {source.linkedProducts.length}
            </span>
          ) : null}
        </div>
      </CustomerTableHoverCard>
    </div>
  )
}
