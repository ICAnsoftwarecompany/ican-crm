import { useMemo, useState } from 'react'
import {
  Activity,
  BadgeInfo,
  Boxes,
  CalendarClock,
  ExternalLink,
  FileText,
  ImageIcon,
  Package,
} from 'lucide-react'
import { AppModal } from '../../../../shared/components/overlays/AppModal'
import { resolveApiBaseURL } from '../../../../services/apiBaseUrl'
import {
  getCustomerLeadActivities,
  parseMarketingData,
  renderSafeValue,
} from './customerMarketingUtils'

function getTenantBaseURL() {
  try {
    return resolveApiBaseURL()
  } catch {
    return typeof window !== 'undefined' ? window.location.origin : ''
  }
}

export function buildCustomerAssetUrl(path) {
  const value = String(path || '').trim()
  if (!value) return ''
  if (/^(https?:)?\/\//i.test(value) || /^data:/i.test(value) || /^blob:/i.test(value)) return value

  const baseUrl = getTenantBaseURL().replace(/\/+$/, '')
  return `${baseUrl}/${encodeURI(value.replace(/^\/+/, ''))}`
}

function DetailGrid({ data }) {
  const entries = Object.entries(data || {}).filter(([, value]) => (
    value !== null && value !== undefined && value !== ''
  ))

  if (!entries.length) {
    return <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-500">لا توجد بيانات تفصيلية</div>
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {entries.map(([key, value]) => (
        <div key={key} className="min-w-0 rounded-xl border border-slate-200 bg-white p-3">
          <div className="mb-1 text-[11px] font-black uppercase tracking-wide text-[#007A80]">{key}</div>
          <div className="break-words text-sm font-bold text-slate-800">{renderSafeValue(value)}</div>
        </div>
      ))}
    </div>
  )
}

function DataItemsList({ items = [] }) {
  const normalizedItems = items
    .flatMap((item) => Object.entries(item || {}).map(([key, value]) => ({ key, value })))
    .filter((item) => item.key)

  if (!normalizedItems.length) return null

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-black text-slate-900">البيانات الإضافية</h4>
      <div className="flex flex-wrap gap-2">
        {normalizedItems.map((item) => (
          <span
            key={`${item.key}-${renderSafeValue(item.value)}`}
            className="inline-flex max-w-full items-center gap-1 rounded-full border border-[#D7EEF0] bg-[#F8FEFF] px-2.5 py-1 text-xs font-bold text-slate-700"
          >
            <span className="text-[#007A80]">{item.key}</span>
            <span className="text-slate-400">:</span>
            <span className="min-w-0 truncate">{renderSafeValue(item.value)}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export function ProductDetailsDialog({ product, onClose }) {
  const imageUrl = buildCustomerAssetUrl(product?.image)
  const dataItems = parseMarketingData(product?.data)

  return (
    <AppModal
      isOpen={Boolean(product)}
      onClose={onClose}
      title={product?.name || 'تفاصيل المنتج'}
      description={product?.note || product?.description || ''}
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
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-[#BEEFF2] bg-[#E8F9FA] px-3 py-1 text-xs font-black text-[#007A80]">
                <Package size={14} />
                {product?.sourceKind || 'product'}
              </span>
              {product?.price ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                  السعر: {product.price}
                </span>
              ) : null}
              {product?.interestLevel ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                  الاهتمام: {product.interestLevel}
                </span>
              ) : null}
            </div>
            <DetailGrid
              data={{
                id: product?.productId || product?.id,
                code: product?.code,
                name: product?.name,
                description: product?.description,
                note: product?.note,
                status: product?.status,
                isMain: product?.isMain ? 'Yes' : '',
              }}
            />
          </div>
        </div>

        <DataItemsList items={dataItems} />

        <div className="space-y-2">
          <h4 className="text-sm font-black text-slate-900">البيانات الخام</h4>
          <pre className="max-h-72 overflow-auto rounded-xl bg-slate-950 p-3 text-xs leading-6 text-slate-100">
            {JSON.stringify(product?.raw || product?.linkRaw || product || {}, null, 2)}
          </pre>
        </div>
      </div>
    </AppModal>
  )
}

export function SourceDetailsDialog({ source, onClose }) {
  const imageUrl = buildCustomerAssetUrl(source?.image || source?.raw?.image)
  const raw = source?.raw || {}

  return (
    <AppModal
      isOpen={Boolean(source)}
      onClose={onClose}
      title={source?.title || 'تفاصيل المصدر'}
      description={source?.description || ''}
      size="lg"
      className="max-w-5xl"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-[#BEEFF2] bg-[#E8F9FA] px-3 py-1 text-xs font-black text-[#007A80]">
            <BadgeInfo size={14} />
            {source?.label || source?.kind || 'Source'}
          </span>
          {source?.status ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{source.status}</span> : null}
          {source?.platform ? <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{source.platform}</span> : null}
        </div>

        {imageUrl ? (
          <img src={imageUrl} alt={source?.title || 'Source'} className="max-h-72 w-full rounded-2xl border border-slate-200 object-cover" loading="lazy" />
        ) : null}

        <DetailGrid
          data={{
            id: raw.id,
            name: source?.title,
            description: source?.description,
            code: source?.code,
            external_id: source?.externalId,
            campaign_id: raw.campaign_id,
            ads_id: raw.ads_id,
            platform: source?.platform,
            status: source?.status,
            start_date: source?.startDate,
            end_date: source?.endDate,
            budget: source?.budget,
            target_audience: source?.targetAudience,
          }}
        />

        {raw.fields ? (
          <div className="space-y-2">
            <h4 className="text-sm font-black text-slate-900">حقول الفورم</h4>
            <DetailGrid data={raw.fields} />
          </div>
        ) : null}

        {Array.isArray(source?.linkedProducts) && source.linkedProducts.length ? (
          <div className="space-y-2">
            <h4 className="text-sm font-black text-slate-900">المنتجات المرتبطة</h4>
            <div className="grid gap-2 md:grid-cols-2">
              {source.linkedProducts.map((product) => (
                <div key={product.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="font-black text-slate-900">{product.name || `Product ${product.productId || ''}`}</div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">{product.note || product.description || '-'}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <h4 className="text-sm font-black text-slate-900">البيانات الخام</h4>
          <pre className="max-h-72 overflow-auto rounded-xl bg-slate-950 p-3 text-xs leading-6 text-slate-100">
            {JSON.stringify(raw, null, 2)}
          </pre>
        </div>
      </div>
    </AppModal>
  )
}

export function LeadActivitiesDialog({ row, open, onClose }) {
  const activities = useMemo(() => getCustomerLeadActivities(row), [row])

  return (
    <AppModal
      isOpen={Boolean(open)}
      onClose={onClose}
      title="خط سير نشاط العميل"
      description="كل العمليات المسجلة على العميل بالترتيب من الأحدث إلى الأقدم"
      size="lg"
      className="max-w-5xl"
    >
      <div className="space-y-3">
        {activities.length ? activities.map((activity, index) => (
          <div key={activity.id || index} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E8F9FA] text-[#007A80]">
                  <Activity size={17} />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-black text-slate-900">{activity.title || activity.type || 'Activity'}</div>
                  <div className="text-xs font-semibold text-slate-500">{activity.description || '-'}</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">
                <CalendarClock size={13} />
                {renderSafeValue(activity.activity_at || activity.created_at)}
              </span>
            </div>
            {activity.data ? (
              <pre className="mt-3 max-h-52 overflow-auto rounded-xl bg-slate-50 p-3 text-xs leading-6 text-slate-700">
                {JSON.stringify(activity.data, null, 2)}
              </pre>
            ) : null}
          </div>
        )) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-sm font-bold text-slate-500">
            لا توجد أنشطة مسجلة
          </div>
        )}
      </div>
    </AppModal>
  )
}

export function OpenDetailsButton({ onClick, label = 'فتح' }) {
  return (
    <button
      type="button"
      data-no-cell-copy="true"
      onClick={(event) => {
        event.stopPropagation()
        onClick?.()
      }}
      className="inline-flex h-7 shrink-0 items-center gap-1 rounded-full border border-[#BEEFF2] bg-white px-2 text-[10px] font-black text-[#007A80] transition hover:bg-[#E8F9FA]"
      title={label}
    >
      <ExternalLink size={12} />
      {label}
    </button>
  )
}

export function EmptyInfoState({ label = '-' }) {
  return <span className="text-xs font-semibold text-[var(--text-muted)]">{label}</span>
}
