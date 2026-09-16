import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useQuery } from '@tanstack/react-query'
import {
  BadgeInfo,
  ExternalLink,
  GripHorizontal,
  ImageIcon,
  Loader2,
  Package,
  Pin,
  PinOff,
  X,
} from 'lucide-react'
import { AppModal } from '../../../../../shared/components/overlays/AppModal'
import { CustomerActivityTimeline, normalizeCustomerActivities } from '../CustomerActivityTimeline'
import { leadsApi } from '../../../../../features/leads/api/leadsApi'
import { resolveApiBaseURL } from '../../../../../services/apiBaseUrl'
import {
  getCustomerLeadActivities,
  parseMarketingData,
  renderSafeValue,
} from '../customerMarketingUtils'

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
  const leadId = useMemo(() => {
    const value = row?.lead?.id ?? row?.lead_id ?? row?.lead?.lead_id
    if (value === null || value === undefined || value === '') return null
    return value
  }, [row])

  const leadLogQuery = useQuery({
    queryKey: ['customers', 'lead-activities-dialog', leadId],
    queryFn: () => leadsApi.getLeadLog(leadId),
    enabled: Boolean(open && leadId),
    staleTime: 1000 * 60,
  })

  const fetchedLogs = useMemo(() => {
    const payload = leadLogQuery.data?.data ?? leadLogQuery.data
    return Array.isArray(payload) ? payload : []
  }, [leadLogQuery.data])

  const fallbackLogs = useMemo(() => getCustomerLeadActivities(row), [row])
  const logs = fetchedLogs.length ? fetchedLogs : fallbackLogs
  const activities = useMemo(() => normalizeCustomerActivities(logs), [logs])

  const customerName = useMemo(() => (
    row?.name
    || row?.customer_name
    || row?.full_name
    || row?.customer?.name
    || row?.lead?.name
    || row?.lead?.customer?.name
    || row?.lead?.customer_name
    || 'عميل غير معروف'
  ), [row])

  const dragStateRef = useRef(null)
  const resizeStateRef = useRef(null)
  const layoutRef = useRef(null)

  const [layout, setLayout] = useState(() => {
    if (typeof window === 'undefined') {
      return { x: 24, y: 24, width: 900, height: 680 }
    }

    const width = Math.min(900, window.innerWidth - 24)
    const height = Math.min(680, window.innerHeight - 24)
    return {
      width,
      height,
      x: Math.max(12, Math.round((window.innerWidth - width) / 2)),
      y: Math.max(12, Math.round((window.innerHeight - height) / 2)),
    }
  })

  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isPinned, setIsPinned] = useState(false)

  const clampLayout = useCallback((nextLayout) => {
    if (typeof window === 'undefined') return nextLayout

    const width = Math.min(Math.max(Number(nextLayout.width) || 900, 720), window.innerWidth - 24)
    const height = Math.min(Math.max(Number(nextLayout.height) || 680, 420), window.innerHeight - 24)

    return {
      width,
      height,
      x: Math.min(Math.max(Number(nextLayout.x) || 12, 12), Math.max(12, window.innerWidth - width - 12)),
      y: Math.min(Math.max(Number(nextLayout.y) || 12, 12), Math.max(12, window.innerHeight - height - 12)),
    }
  }, [])

  const updateLayout = useCallback((nextLayout) => {
    setLayout((current) => {
      const resolved = typeof nextLayout === 'function' ? nextLayout(current) : nextLayout
      const clamped = clampLayout(resolved)
      layoutRef.current = clamped
      return clamped
    })
  }, [clampLayout])

  const stopInteraction = useCallback(() => {
    dragStateRef.current = null
    resizeStateRef.current = null
    setIsDragging(false)
    setIsResizing(false)
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  }, [])

  const onPointerMove = useCallback((event) => {
    const resizeState = resizeStateRef.current
    if (resizeState?.active) {
      updateLayout({
        ...resizeState.startLayout,
        width: resizeState.startLayout.width + event.clientX - resizeState.startPointer.x,
        height: resizeState.startLayout.height + event.clientY - resizeState.startPointer.y,
      })
      return
    }

    const dragState = dragStateRef.current
    if (!dragState?.active) return

    updateLayout({
      ...dragState.startLayout,
      x: dragState.startLayout.x + event.clientX - dragState.startPointer.x,
      y: dragState.startLayout.y + event.clientY - dragState.startPointer.y,
    })
  }, [updateLayout])

  const onHeaderPointerDown = useCallback((event) => {
    if (event.button !== undefined && event.button !== 0) return

    dragStateRef.current = {
      active: true,
      startPointer: { x: event.clientX, y: event.clientY },
      startLayout: layoutRef.current || layout,
    }

    setIsDragging(true)
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'
  }, [layout])

  const onResizePointerDown = useCallback((event) => {
    if (event.button !== undefined && event.button !== 0) return

    event.preventDefault()
    event.stopPropagation()

    resizeStateRef.current = {
      active: true,
      startPointer: { x: event.clientX, y: event.clientY },
      startLayout: layoutRef.current || layout,
    }

    setIsResizing(true)
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'nwse-resize'
  }, [layout])

  useEffect(() => {
    layoutRef.current = layout
  }, [layout])

  useEffect(() => {
    if (!open) return undefined

    const handleResize = () => {
      updateLayout((current) => ({ ...current }))
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose?.()
    }

    document.body.style.overflow = isPinned ? 'unset' : 'hidden'
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', stopInteraction)
    window.addEventListener('pointercancel', stopInteraction)
    window.addEventListener('resize', handleResize)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = 'unset'
      stopInteraction()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', stopInteraction)
      window.removeEventListener('pointercancel', stopInteraction)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isPinned, onClose, onPointerMove, open, stopInteraction, updateLayout])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className={`fixed inset-0 z-50 ${isPinned ? 'pointer-events-none bg-transparent p-0' : 'bg-black/50 p-2 sm:p-4'}`}
      onClick={isPinned ? undefined : onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal={isPinned ? 'false' : 'true'}
        aria-label="خط سير نشاط العميل"
        className="pointer-events-auto absolute overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
        style={{
          left: 0,
          top: 0,
          width: layout.width,
          height: layout.height,
          transform: `translate3d(${layout.x}px, ${layout.y}px, 0)`,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`flex cursor-grab touch-none select-none items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 ${isDragging ? 'cursor-grabbing bg-[var(--surface-2)]' : ''}`}
          onPointerDown={onHeaderPointerDown}
          title="اسحب لتحريك النافذة"
        >
          <div className="min-w-0">
            <h2 className="font-bold font-arabic text-lg text-[var(--text)]">خط سير نشاط العميل</h2>
            <p className="text-sm text-[var(--text-light)] font-arabic mt-1">{customerName}</p>
          </div>

          <div className="flex items-center gap-2">
            <GripHorizontal size={16} className="text-[var(--text-light)]" />
            <button
              type="button"
              onClick={() => setIsPinned((value) => !value)}
              onPointerDown={(event) => event.stopPropagation()}
              className={`inline-flex h-8 items-center justify-center gap-1 rounded-md border px-2 text-xs font-black transition ${isPinned ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-2)]'}`}
              aria-label={isPinned ? 'إلغاء التثبيت' : 'تثبيت الديالوج'}
              title={isPinned ? 'إلغاء التثبيت' : 'تثبيت الديالوج'}
            >
              {isPinned ? <PinOff size={14} /> : <Pin size={14} />}
              {isPinned ? 'مثبت' : 'تثبيت'}
            </button>
            <button
              type="button"
              onClick={onClose}
              onPointerDown={(event) => event.stopPropagation()}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text)] transition hover:bg-[var(--surface-2)]"
              aria-label="إغلاق"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-4" style={{ height: layout.height - 74 }}>
          {leadLogQuery.isLoading ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
              <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-600">
                <Loader2 size={16} className="animate-spin" />
                جاري تحميل سجل الأنشطة...
              </div>
            </div>
          ) : leadLogQuery.isError && !fallbackLogs.length ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 text-center text-sm font-bold text-rose-700">
              تعذر تحميل سجل الأنشطة حاليا.
            </div>
          ) : (
            <CustomerActivityTimeline activities={activities} />
          )}
        </div>

        <button
          type="button"
          onPointerDown={onResizePointerDown}
          title="تغيير عرض وارتفاع النافذة"
          aria-label="تغيير عرض وارتفاع النافذة"
          className={`absolute bottom-2 right-2 h-4 w-4 rounded-sm border border-[#BEEFF2] bg-[#E8F9FA] ${isResizing ? 'bg-[#c6ecef]' : ''}`}
        />
      </div>
    </div>,
    document.body
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
