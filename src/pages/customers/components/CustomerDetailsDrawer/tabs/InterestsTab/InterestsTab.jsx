import { useMemo, useState } from 'react'
import { Eye, ImageIcon, Pencil } from 'lucide-react'

import { AppModal } from '../../../../../../shared/components/overlays/AppModal'
import { buildCustomerAssetUrl } from '../../../customers-table/CustomerTableDetailsDialogs/CustomerTableDetailsDialogs'
import { InterestCard, LeadInterestDialog, toInterestView, useInterestCatalogIndex } from '../../../../../../features/leads'
import { EmptyPanel } from '../../CustomerDetailsTabPrimitives'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
  const product = interest?.product || interest?.products || {}
  const productDataItems = parseProductData(product?.data)
  const imageUrl = buildCustomerAssetUrl(product?.image)

  return (
    <AppModal
      isOpen={Boolean(interest)}
      onClose={onClose}
      title={product?.name || t('customers.interestsTab.details')}
      description={interest?.notes || (product?.description || product?.desc) || ''}
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
              title={t('customers.interestsTab.productData')}
              data={{
                id: product?.id,
                code: product?.code,
                name: product?.name,
                description: (product?.description || product?.desc),
                price: product?.price,
                status: product?.status,
                category_id: product?.category_id,
              }}
            />
            <DetailGrid
              title={t('customers.interestsTab.interestData')}
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
          <h4 className="text-sm font-black text-slate-900">{t('customers.productsDialog.rawData')}</h4>
          <pre className="max-h-72 overflow-auto rounded-xl bg-slate-950 p-3 text-xs leading-6 text-slate-100">
            {JSON.stringify(interest || {}, null, 2)}
          </pre>
        </section>
      </div>
    </AppModal>
  )
}

export function InterestsTab({ customer, layoutMode = 'compact' }) {
  const { t } = useTranslation()
  const [selectedInterest, setSelectedInterest] = useState(null)
  const [editingInterest, setEditingInterest] = useState(null)
  const interesteds = useMemo(() => getInteresteds(customer), [customer])
  const { index: catalogIndex } = useInterestCatalogIndex()
  const isWide = layoutMode === 'wide'

  if (!interesteds.length) {
    return (
      <EmptyPanel
        title={t('customers.interestsTab.emptyTitle')}
        description={t('customers.interestsTab.emptyDescription')}
      />
    )
  }

  return (
    <>
      <div className="min-w-0 space-y-3 py-4">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-black text-[var(--text)]">{t('customers.interestsTab.title')}</h3>
          <span className="rounded-full border border-[#BEEFF2] bg-[#E8F9FA] px-2.5 py-1 text-xs font-black text-[#007A80]">
            {t('leads.interestView.itemsCount', { count: interesteds.length })}
          </span>
        </div>

        <div className={isWide ? 'grid min-w-0 grid-cols-2 gap-3' : 'space-y-3'}>
          {interesteds.map((interest) => (
            <InterestCard
              key={interest?.id || `${interest?.lead_id}-${interest?.product_id}`}
              view={toInterestView(interest, catalogIndex)}
              actions={(
                <>
                  <button
                    type="button"
                    onClick={() => setEditingInterest(interest)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs font-bold text-[#007A80] transition-colors hover:bg-[var(--surface-2)]"
                  >
                    <Pencil size={14} />
                    {t('customers.interestsTab.edit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedInterest(interest)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs font-bold text-[#007A80] transition-colors hover:bg-[var(--surface-2)]"
                  >
                    <Eye size={14} />
                    {t('customers.interestsTab.view')}
                  </button>
                </>
              )}
            />
          ))}
        </div>
      </div>

      <InterestDetailsDialog interest={selectedInterest} onClose={() => setSelectedInterest(null)} />
      <LeadInterestDialog
        open={Boolean(editingInterest)}
        customer={customer}
        interest={editingInterest}
        onClose={() => setEditingInterest(null)}
        onSaved={() => setEditingInterest(null)}
      />
    </>
  )
}
