import { useMemo, useState } from 'react'
import { BadgeDollarSign, CalendarDays, Eye, ImageIcon, Package, Pencil, StickyNote } from 'lucide-react'

import { AppModal } from '../../../../../../shared/components/overlays/AppModal'
import { buildCustomerAssetUrl } from '../../../customers-table/CustomerTableDetailsDialogs/CustomerTableDetailsDialogs'
import { InterestFormDialog } from '../../quick-actions/interests'
import { EmptyPanel } from '../../CustomerDetailsTabPrimitives'
import { fieldValue, formatDateTime12 } from '../../customerDetailsUtils'

const INTEREST_LEVEL_META = {
  high: { label: 'H', text: 'High', className: 'border-[#FCA5A5] bg-[#FEF2F2] text-[#B91C1C]' },
  hight: { label: 'H', text: 'High', className: 'border-[#FCA5A5] bg-[#FEF2F2] text-[#B91C1C]' },
  medium: { label: 'M', text: 'Medium', className: 'border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]' },
  low: { label: 'L', text: 'Low', className: 'border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]' },
}

function getInterestMeta(value = '') {
  const key = String(value || '').trim().toLowerCase()
  return INTEREST_LEVEL_META[key] || {
    label: key ? key.slice(0, 1).toUpperCase() : '-',
    text: value || 'غير محدد',
    className: 'border-[#E2E8F0] bg-white text-[#475569]',
  }
}

function getLead(customer) {
  return customer?.lead || {}
}

function getInteresteds(customer) {
  const lead = getLead(customer)
  const items = [
    ...(Array.isArray(customer?.interesteds) ? customer.interesteds : []),
    ...(Array.isArray(lead?.interesteds) ? lead.interesteds : []),
  ]
  const seen = new Set()

  return items.filter((item) => {
    const key = String(item?.id || `${item?.lead_id || ''}-${item?.product_id || ''}-${item?.created_at || ''}`)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function parseProductData(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'object') return [value]

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : [parsed]
  } catch {
    return []
  }
}

function renderSafeValue(value) {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

function DetailGrid({ title, data }) {
  const entries = Object.entries(data || {}).filter(([, value]) => (
    value !== null && value !== undefined && value !== ''
  ))

  if (!entries.length) return null

  return (
    <section className="space-y-2">
      <h4 className="text-sm font-black text-slate-900">{title}</h4>
      <div className="grid gap-2 sm:grid-cols-2">
        {entries.map(([key, value]) => (
          <div key={key} className="min-w-0 rounded-xl border border-slate-200 bg-white p-3">
            <div className="mb-1 text-[11px] font-black uppercase text-[#007A80]">{key}</div>
            <div className="break-words text-sm font-bold text-slate-800">{renderSafeValue(value)}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ProductDataChips({ items = [] }) {
  const chips = items
    .flatMap((item) => Object.entries(item || {}).map(([key, value]) => ({ key, value })))
    .filter((item) => item.key)

  if (!chips.length) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((item) => (
        <span
          key={`${item.key}-${renderSafeValue(item.value)}`}
          className="inline-flex max-w-full items-center gap-1 rounded-full border border-[#D7EEF0] bg-white px-2 py-1 text-[10px] font-bold text-slate-600"
        >
          <span className="text-[#007A80]">{item.key}</span>
          <span className="text-slate-400">:</span>
          <span className="min-w-0 truncate">{renderSafeValue(item.value)}</span>
        </span>
      ))}
    </div>
  )
}

function InterestDetailsDialog({ interest, onClose }) {
  const product = interest?.product || interest?.products || {}
  const productDataItems = parseProductData(product?.data)
  const imageUrl = buildCustomerAssetUrl(product?.image)

  return (
    <AppModal
      isOpen={Boolean(interest)}
      onClose={onClose}
      title={product?.name || 'تفاصيل الاهتمام'}
      description={interest?.notes || product?.desc || ''}
      size="lg"
      className="max-w-5xl"
    >
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            {imageUrl ? (
              <img src={imageUrl} alt={product?.name || 'Product'} className="h-56 w-full object-cover" loading="lazy" />
            ) : (
              <div className="flex h-56 items-center justify-center text-[#007A80]">
                <ImageIcon size={44} />
              </div>
            )}
          </div>

          <div className="min-w-0 space-y-4">
            <DetailGrid
              title="بيانات المنتج"
              data={{
                id: product?.id,
                code: product?.code,
                name: product?.name,
                description: product?.desc,
                price: product?.price,
                status: product?.status,
                category_id: product?.category_id,
              }}
            />
            <DetailGrid
              title="بيانات الاهتمام"
              data={{
                id: interest?.id,
                lead_id: interest?.lead_id,
                product_id: interest?.product_id,
                notes: interest?.notes,
                interest_level: interest?.interest_level,
                is_lost: interest?.is_lost,
                is_deal: interest?.is_deal,
                created_at: interest?.created_at,
                updated_at: interest?.updated_at,
              }}
            />
          </div>
        </div>

        <ProductDataChips items={productDataItems} />

        <section className="space-y-2">
          <h4 className="text-sm font-black text-slate-900">البيانات الخام</h4>
          <pre className="max-h-72 overflow-auto rounded-xl bg-slate-950 p-3 text-xs leading-6 text-slate-100">
            {JSON.stringify(interest || {}, null, 2)}
          </pre>
        </section>
      </div>
    </AppModal>
  )
}

export function InterestsTab({ customer, layoutMode = 'compact' }) {
  const [selectedInterest, setSelectedInterest] = useState(null)
  const [editingInterest, setEditingInterest] = useState(null)
  const interesteds = useMemo(() => getInteresteds(customer), [customer])
  const isWide = layoutMode === 'wide'

  if (!interesteds.length) {
    return (
      <EmptyPanel
        title="لا توجد اهتمامات"
        description="لم يتم تسجيل منتجات أو اهتمامات لهذا العميل حتى الآن."
      />
    )
  }

  return (
    <>
      <div className="min-w-0 space-y-3 py-4">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-black text-[var(--text)]">الاهتمامات</h3>
          <span className="rounded-full border border-[#BEEFF2] bg-[#E8F9FA] px-2.5 py-1 text-xs font-black text-[#007A80]">
            {interesteds.length} منتج
          </span>
        </div>

        <div className={isWide ? 'grid min-w-0 grid-cols-2 gap-3' : 'space-y-3'}>
          {interesteds.map((interest) => {
            const product = interest?.product || interest?.products || {}
            const imageUrl = buildCustomerAssetUrl(product?.image)
            const levelMeta = getInterestMeta(interest?.interest_level)
            const productDataItems = parseProductData(product?.data)
            const title = [
              product?.name,
              product?.price ? `price: ${product.price}` : '',
              interest?.notes,
              interest?.interest_level,
            ].filter(Boolean).join(' | ')

            return (
              <article
                key={interest?.id || `${interest?.lead_id}-${interest?.product_id}`}
                className="min-w-0 rounded-xl border border-[#D7EEF0] bg-white p-3 shadow-sm"
                title={title}
              >
                <div className="flex min-w-0 gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#E5F7F8] bg-[#F8FEFF]">
                    {imageUrl ? (
                      <img src={imageUrl} alt={product?.name || 'Product'} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#007A80]">
                        <Package size={24} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                      <span className="min-w-0 flex-1 break-words text-sm font-black text-[var(--text)]">
                        {fieldValue(product?.name, `Product ${interest?.product_id || ''}`)}
                      </span>
                      {product?.price ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-2 py-0.5 text-[10px] font-black text-[#166534]">
                          <BadgeDollarSign size={12} />
                          {product.price}
                        </span>
                      ) : null}
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-black ${levelMeta.className}`} title={levelMeta.text}>
                        {levelMeta.label}
                      </span>
                    </div>

                    {interest?.notes || product?.desc ? (
                      <div className="mt-2 flex min-w-0 items-start gap-1.5 rounded-lg bg-[#F8FEFF] px-2 py-1.5 text-xs font-semibold text-[var(--text-muted)]">
                        <StickyNote size={13} className="mt-0.5 shrink-0 text-[#007A80]" />
                        <span className="min-w-0 break-words">{interest?.notes || product?.desc}</span>
                      </div>
                    ) : null}

                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-[var(--text-muted)]">
                      {interest?.created_at ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#F8FEFF] px-2 py-1">
                          <CalendarDays size={12} />
                          {formatDateTime12(interest.created_at)}
                        </span>
                      ) : null}
                      {interest?.is_deal ? (
                        <span className="rounded-full bg-[#DCFCE7] px-2 py-1 text-[#166534]">Deal</span>
                      ) : null}
                      {interest?.is_lost ? (
                        <span className="rounded-full bg-[#FEE2E2] px-2 py-1 text-[#B91C1C]">Lost</span>
                      ) : null}
                    </div>

                    {productDataItems.length ? (
                      <div className="mt-2">
                        <ProductDataChips items={productDataItems.slice(0, 1)} />
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-3 flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditingInterest(interest)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#BEEFF2] bg-white px-2.5 text-xs font-black text-[#007A80] transition-colors hover:bg-[#E8F9FA]"
                  >
                    <Pencil size={14} />
                    تعديل
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedInterest(interest)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#BEEFF2] bg-[#F8FEFF] px-2.5 text-xs font-black text-[#007A80] transition-colors hover:bg-[#E8F9FA]"
                  >
                    <Eye size={14} />
                    عرض
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </div>

      <InterestDetailsDialog interest={selectedInterest} onClose={() => setSelectedInterest(null)} />
      <InterestFormDialog
        open={Boolean(editingInterest)}
        customer={customer}
        interest={editingInterest}
        onClose={() => setEditingInterest(null)}
        onSaved={() => setEditingInterest(null)}
      />
    </>
  )
}
