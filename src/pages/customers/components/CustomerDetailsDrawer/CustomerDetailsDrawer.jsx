import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  CalendarPlus,
  Check,
  CheckSquare,
  ChevronDown,
  Clock3,
  ExternalLink,
  FileText,
  Home,
  Mail,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Tag,
  UserCheck,
  UsersRound,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { definitionsApi } from '../../../../features/definitions/api/definitionsApi'
import { useCustomerInfo } from '../../../../features/customers/hooks/useCustomers'
import { useLeadMutations } from '../../../../features/leads/hooks/useLeads'
import { AppDrawer } from '../../../../shared/components/overlays/AppDrawer'
import { Badge } from '../../../../shared/components/ui/Badge'
import { cn } from '../../../../shared/utils/cn'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { extractLeadStatuses } from '../../utils/customerStatus'
import { CustomerSourceBadge } from '../../../../shared/components/Icons/CustomerSourceBadge'
import { CustomerStatusChanger } from './CustomerStatusChanger'
import { FloatingMailChat } from './floating-chats/mail/FloatingMailChat'
import { FloatingMessengerChat } from './floating-chats/messenger/FloatingMessengerChat'
import { FloatingSmsChat } from './floating-chats/sms/FloatingSmsChat'
import { FloatingWhatsappChat } from './floating-chats/whatsapp/FloatingWhatsappChat'
import { CustomerQuickActions } from './quick-actions/CustomerQuickActions'
import { fieldValue, formatDateTime12 } from './customerDetailsUtils'
import { CalendarTab } from './tabs/CalendarTab'
import { EmailsTab } from './tabs/EmailsTab'
import { FilesTab } from './tabs/FilesTab'
import { HomeTab } from './tabs/HomeTab'
import { NotesTab } from './tabs/NotesTab'
import { TasksTab } from './tabs/TasksTab'
import { TimelineTab } from './tabs/TimeLineTap/TimelineTab'

const DRAWER_TABS_ORDER_KEY = 'customer-details-drawer-tabs-order'
const DRAWER_TABS_LONG_PRESS_MS = 280

const DRAWER_TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'timeline', label: 'Timeline', icon: Clock3 },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'files', label: 'Files', icon: Paperclip },
  { id: 'emails', label: 'Emails', icon: Mail },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
]

const PAGE_TABS = DRAWER_TABS.filter((tab) => tab.id !== 'home')

function useElementWidth(ref, enabled = true) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    if (!enabled) return undefined
    const element = ref.current
    if (!element || typeof ResizeObserver === 'undefined') return undefined

    const updateWidth = () => {
      setWidth(Math.round(element.getBoundingClientRect().width || 0))
    }

    updateWidth()
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      setWidth(Math.round(entry?.contentRect?.width || element.getBoundingClientRect().width || 0))
    })
    observer.observe(element)

    return () => observer.disconnect()
  }, [enabled, ref])

  return width
}

function getDrawerVisibleTabsCount(width, totalTabs) {
  if (!width) return Math.min(3, totalTabs)
  if (width >= 860) return totalTabs
  if (width >= 740) return Math.min(6, totalTabs)
  if (width >= 630) return Math.min(5, totalTabs)
  if (width >= 520) return Math.min(4, totalTabs)
  return Math.min(3, totalTabs)
}

function getDetailsLayoutMode(width, mode) {
  if (mode === 'page' || width >= 760) return 'wide'
  if (width >= 560) return 'roomy'
  return 'compact'
}

function getDefaultDrawerTabOrder() {
  return DRAWER_TABS.map((tab) => tab.id)
}

function getStoredDrawerTabOrder() {
  if (typeof window === 'undefined') return getDefaultDrawerTabOrder()

  try {
    const parsed = JSON.parse(window.localStorage.getItem(DRAWER_TABS_ORDER_KEY) || '[]')
    if (!Array.isArray(parsed)) return getDefaultDrawerTabOrder()

    const knownIds = new Set(DRAWER_TABS.map((tab) => tab.id))
    const storedIds = parsed.filter((id) => knownIds.has(id))
    const missingIds = getDefaultDrawerTabOrder().filter((id) => !storedIds.includes(id))

    return [...storedIds, ...missingIds]
  } catch {
    return getDefaultDrawerTabOrder()
  }
}

function saveDrawerTabOrder(order) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(DRAWER_TABS_ORDER_KEY, JSON.stringify(order))
}

function moveItem(items, sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) return items

  const sourceIndex = items.indexOf(sourceId)
  const targetIndex = items.indexOf(targetId)
  if (sourceIndex === -1 || targetIndex === -1) return items

  const nextItems = [...items]
  const [moved] = nextItems.splice(sourceIndex, 1)
  nextItems.splice(targetIndex, 0, moved)
  return nextItems
}

function getInitial(customer) {
  const name = fieldValue(customer?.name || customer?.email || customer?.phone, '?')
  return name.trim().charAt(0).toUpperCase()
}

function getCustomerInfoPayload(response) {
  return response?.data ?? response
}

function getCurrentLeadStatus(customer, statuses = []) {
  const statusTypeId = customer?.lead?.status_type_id ?? customer?.status_type_id
  if (statusTypeId === null || statusTypeId === undefined || statusTypeId === '') return null

  return statuses.find((status) => String(status.id) === String(statusTypeId)) || null
}

function extractTags(response) {
  const data = response?.data ?? response

  const collectTags = (value) => {
    if (!value) return []
    if (Array.isArray(value)) return value.flatMap(collectTags)
    if (typeof value !== 'object') return []

    if ('id' in value && ('tag' in value || 'name' in value || 'status' in value)) {
      return [value]
    }

    return Object.values(value).flatMap(collectTags)
  }

  return collectTags(data)
}

function getCurrentTag(customer, tags = []) {
  if (customer?.tag && typeof customer.tag === 'object') return customer.tag
  if (customer?.lead?.tag && typeof customer.lead.tag === 'object') return customer.lead.tag

  const tagId = customer?.lead?.tag_id ?? customer?.tag_id
  if (tagId === null || tagId === undefined || tagId === '') return null

  return tags.find((tag) => String(tag.id) === String(tagId)) || null
}

function getLeadId(customer) {
  return customer?.lead?.id ?? customer?.lead_id ?? customer?.id
}

function getCurrentTagId(customer, currentTag) {
  return currentTag?.id ?? customer?.lead?.tag_id ?? customer?.tag_id ?? ''
}

function getTagLabel(tag) {
  return tag?.tag || tag?.name || tag?.status || ''
}

function getLinkedByName(customer) {
  if (typeof customer?.linked_by === 'object') return customer.linked_by?.name
  return customer?.linked_by
}

function getLinkedByTeamName(customer) {
  return (
    customer?.linked_by?.team?.name ??
    customer?.linked_by?.team_name ??
    customer?.agent?.team?.name ??
    customer?.team?.name ??
    null
  )
}

function CustomerHeader({ customer, currentStatus, currentTag, statuses, isLoadingDetails, onStatusChanged }) {
  const source = customer.source || customer.lead?.source
  const linkedByName = getLinkedByName(customer)
  const linkedByTeamName = getLinkedByTeamName(customer)
  const linkDate = customer.link_date
  const statusColor = currentStatus?.color || '#64748B'
  const tagLabel = currentTag?.tag || currentTag?.name || currentTag?.status

  return (
    <div className="relative min-w-0 overflow-hidden rounded-xl border border-[#BEEFF2] bg-[#F8FEFF] p-3 shadow-sm">
      <div className="pointer-events-none absolute inset-y-0 end-0 w-24 bg-[#E8F9FA]" />
      <div className="relative flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#BEEFF2] bg-[#E8F9FA] text-sm font-black text-[#007A80] shadow-sm">
          {getInitial(customer)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="min-w-0 max-w-full truncate text-base font-black text-[var(--text)]">
              {fieldValue(customer.name || customer.email || customer.phone, 'عميل بدون اسم')}
            </h3>
            {isLoadingDetails && (
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-[#007A80]">
                Loading...
              </span>
            )}
            {(customer.created_at || customer.createdAt) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-[var(--text-muted)]">
                <CalendarPlus size={12} className="text-[#007A80]" />
                {formatDateTime12(customer.created_at || customer.createdAt)}
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {customer.type && <Badge>{fieldValue(customer.type)}</Badge>}
            {customer.status?.name && <Badge>{customer.status.name}</Badge>}
            {customer.status?.status && <Badge>{customer.status.status}</Badge>}
          </div>

          <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
            <CustomerSourceBadge source={source} />

            {currentStatus && (
              <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-[#E5F7F8] bg-white/80 px-2 py-1 text-[11px] font-bold text-[var(--text)]">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: statusColor }} />
                <span className="min-w-0 max-w-32 truncate">{currentStatus.status}</span>
              </span>
            )}

            {linkedByName && (
              <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-[#E5F7F8] bg-white/80 px-2 py-1 text-[11px] font-bold text-[var(--text)]">
                <UserCheck size={13} className="shrink-0 text-[#007A80]" />
                <span className="min-w-0 max-w-32 truncate">{linkedByName}</span>
              </span>
            )}

            {linkDate && (
              <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-[#E5F7F8] bg-white/80 px-2 py-1 text-[11px] font-bold text-[var(--text-muted)]">
                <CalendarDays size={13} className="shrink-0 text-[#007A80]" />
                <span className="min-w-0 max-w-36 truncate">ربط: {formatDateTime12(linkDate)}</span>
              </span>
            )}

            {linkedByTeamName && (
              <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-[#E5F7F8] bg-white/80 px-2 py-1 text-[11px] font-bold text-[var(--text-muted)]">
                <UsersRound size={13} className="shrink-0 text-[#007A80]" />
                <span className="min-w-0 max-w-32 truncate">{linkedByTeamName}</span>
              </span>
            )}

            {tagLabel && (
              <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-[#E5F7F8] bg-white/80 px-2 py-1 text-[11px] font-bold text-[var(--text)]">
                <Tag size={13} className="shrink-0 text-[#007A80]" />
                <span className="min-w-0 max-w-32 truncate">{tagLabel}</span>
              </span>
            )}
          </div>

          <CustomerStatusChanger
            customer={customer}
            statuses={statuses}
            currentStatus={currentStatus}
            onChanged={onStatusChanged}
          />
        </div>
      </div>
    </div>
  )
}

function CustomerTagChanger({ customer, currentTag, tags = [], onChanged }) {
  const mutations = useLeadMutations()
  const [editing, setEditing] = useState(false)
  const [selectedTagId, setSelectedTagId] = useState('')
  const leadId = getLeadId(customer)
  const currentTagId = getCurrentTagId(customer, currentTag)
  const tagLabel = getTagLabel(currentTag)
  const availableTags = tags.filter((tag) => String(tag.active ?? 1) !== '0')
  const selectedTag = availableTags.find((tag) => String(tag.id) === String(selectedTagId))
  const canSubmit = Boolean(leadId && selectedTagId && selectedTag && String(selectedTagId) !== String(currentTagId))

  useEffect(() => {
    if (editing) return
    setSelectedTagId(currentTagId ? String(currentTagId) : '')
  }, [currentTagId, editing])

  const closeEditor = () => {
    setEditing(false)
    setSelectedTagId(currentTagId ? String(currentTagId) : '')
  }

  const handleSave = async () => {
    if (!canSubmit) return

    try {
      await mutations.updateTag.mutateAsync({
        ids: [leadId],
        tag_id: Number(selectedTagId),
      })

      toast.success('تم تغيير تاج العميل')
      setEditing(false)
      onChanged?.({
        customer,
        actionType: 'tag',
        newTag: selectedTag,
        oldTag: currentTag,
      })
    } catch (error) {
      toast.error(extractMessage(error, 'تعذر تغيير تاج العميل'))
    }
  }

  if (editing) {
    return (
      <div className="inline-flex min-w-0 flex-wrap items-center gap-1.5 rounded-xl border border-[#BEEFF2] bg-[#F8FEFF] p-1 shadow-sm">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#007A80]">
          <Tag size={17} />
        </span>
        <select
          value={selectedTagId}
          onChange={(event) => setSelectedTagId(event.target.value)}
          className="h-8 min-w-0 max-w-40 rounded-lg border border-[#D7EEF0] bg-white px-2 text-xs font-bold text-[var(--text)] outline-none focus:border-[#00C2CB] focus:ring-2 focus:ring-[#BEEFF2]"
          autoFocus
        >
          <option value="">اختر التاج</option>
          {availableTags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {getTagLabel(tag)}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSubmit || mutations.updateTag.isPending}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#007A80] text-white transition-colors hover:bg-[#00656A] disabled:cursor-not-allowed disabled:bg-[#94A3B8]"
          title="حفظ التاج"
          aria-label="حفظ التاج"
        >
          <Check size={16} />
        </button>
        <button
          type="button"
          onClick={closeEditor}
          disabled={mutations.updateTag.isPending}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#D7EEF0] bg-white text-[#64748B] transition-colors hover:bg-[#F1F5F9]"
          title="إلغاء"
          aria-label="إلغاء"
        >
          <X size={16} />
        </button>
      </div>
    )
  }

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 rounded-xl border border-[#BEEFF2] bg-[#E8F9FA] px-2 py-1.5 text-sm font-black text-[#007A80] shadow-sm">
      <Tag size={19} className="shrink-0" />
      <span className="min-w-0 max-w-32 truncate">{tagLabel || 'بدون تاج'}</span>
      <button
        type="button"
        onClick={() => setEditing(true)}
        disabled={!leadId || availableTags.length === 0}
        className="ms-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/80 text-[#007A80] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:text-[#94A3B8]"
        title="تغيير تاج العميل"
        aria-label="تغيير تاج العميل"
      >
        <Pencil size={13} />
      </button>
    </span>
  )
}

function CustomerHeaderModern({
  customer,
  currentStatus,
  currentTag,
  tags,
  statuses,
  isLoadingDetails,
  onStatusChanged,
  onTagChanged,
  showOpenPageButton = false,
  detailsPageId,
}) {
  const source = customer.source || customer.lead?.source
  const linkedByName = getLinkedByName(customer)
  const linkedByTeamName = getLinkedByTeamName(customer)
  const linkDate = customer.link_date
  const statusColor = currentStatus?.color || '#64748B'
  const customerName = fieldValue(customer.name || customer.email || customer.phone, 'عميل بدون اسم')
  const createdAt = customer.created_at || customer.createdAt

  return (
    <div className="relative min-w-0 overflow-hidden rounded-2xl border border-[#BEEFF2] bg-white shadow-sm">
      <div className="pointer-events-none absolute inset-y-0 start-0 w-28 bg-[#F1FCFD]" />
      <div className="pointer-events-none absolute inset-y-0 end-0 w-20 bg-[#E8F9FA]" />

      <div className="relative grid min-w-0 grid-cols-[1fr_auto] gap-3 p-3">
        <div className="min-w-0 space-y-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="min-w-0 truncate text-base font-black text-[var(--text)]">
              {customerName}
            </h3>

            <CustomerTagChanger
              customer={customer}
              currentTag={currentTag}
              tags={tags}
              onChanged={onTagChanged}
            />
            {isLoadingDetails && (
              <span className="rounded-full bg-[#E8F9FA] px-2 py-0.5 text-[11px] font-semibold text-[#007A80]">
                Loading...
              </span>
            )}
          </div>

          {createdAt && (
            <div className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#F8FEFF] px-2 py-1 text-[11px] font-bold text-[var(--text-muted)]">
              <CalendarPlus size={12} className="shrink-0 text-[#007A80]" />
              <span className="truncate">{formatDateTime12(createdAt)}</span>
            </div>
          )}

          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <CustomerSourceBadge source={source} />

            {currentStatus && (
              <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-[#E5F7F8] bg-white px-2 py-1 text-[11px] font-bold text-[var(--text)]">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: statusColor }} />
                <span className="min-w-0 max-w-28 truncate">{currentStatus.status}</span>
              </span>
            )}

            {linkedByName && (
              <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-[#E5F7F8] bg-white px-2 py-1 text-[11px] font-bold text-[var(--text)]">
                <UserCheck size={13} className="shrink-0 text-[#007A80]" />
                <span className="min-w-0 max-w-28 truncate">{linkedByName}</span>
              </span>
            )}
          </div>

          {(linkDate || linkedByTeamName) && (
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              {linkDate && (
                <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-[#F8FEFF] px-2 py-1 text-[11px] font-bold text-[var(--text-muted)]">
                  <CalendarDays size={13} className="shrink-0 text-[#007A80]" />
                  <span className="min-w-0 max-w-36 truncate">ربط: {formatDateTime12(linkDate)}</span>
                </span>
              )}

              {linkedByTeamName && (
                <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-[#F8FEFF] px-2 py-1 text-[11px] font-bold text-[var(--text-muted)]">
                  <UsersRound size={13} className="shrink-0 text-[#007A80]" />
                  <span className="min-w-0 max-w-32 truncate">{linkedByTeamName}</span>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-center gap-1 self-start">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#BEEFF2] bg-[#E8F9FA] text-base font-black text-[#007A80] shadow-sm">
            {getInitial(customer)}
          </div>
          {showOpenPageButton && detailsPageId && (
            <Link
              to={`/lead/${detailsPageId}`}
              className="inline-flex h-7 items-center gap-1 rounded-lg border border-[#BEEFF2] bg-white px-2 text-[11px] font-black text-[#007A80] shadow-sm transition-colors hover:bg-[#E8F9FA]"
              title="فتح صفحة العميل"
            >
              <ExternalLink size={12} />
              فتح
            </Link>
          )}
        </div>
      </div>

      <div className="relative border-t border-[#E5F7F8] bg-[#F8FEFF] px-3 pb-3 pt-2">
        <CustomerStatusChanger
          customer={customer}
          statuses={statuses}
          currentStatus={currentStatus}
          onChanged={onStatusChanged}
        />
      </div>
    </div>
  )
}

function TabButton({ tab, active, dragging, onClick, onPointerDown, onPointerUp, onPointerCancel, onPointerEnter, onPointerLeave, onClickCapture }) {
  const Icon = tab.icon
  const hint = `${tab.label} - اضغط مطولًا واسحب يمين أو يسار لتغيير الترتيب`

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClickCapture={onClickCapture}
      title={hint}
      aria-label={hint}
      className={cn(
        'inline-flex h-9 min-w-0 select-none items-center justify-center gap-1 rounded-lg border px-2 text-xs font-semibold transition-colors sm:text-sm',
        active
          ? 'border-[#00C2CB] bg-[#E8F9FA] text-[#007A80] shadow-sm'
          : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
        dragging && 'scale-105 opacity-80 ring-2 ring-[#00C2CB] ring-offset-1'
      )}
    >
      <Icon size={16} className="shrink-0" />
      <span className="min-w-0 truncate">{tab.label}</span>
    </button>
  )
}

function MoreTabsMenu({ activeTab, tabs, onChange }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const activeMoreTab = tabs.find((tab) => tab.id === activeTab)

  useEffect(() => {
    if (!open) return undefined

    const closeOnOutsidePointerDown = (event) => {
      if (menuRef.current?.contains(event.target)) return
      setOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsidePointerDown, true)

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointerDown, true)
    }
  }, [open])

  return (
    <div ref={menuRef} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'inline-flex h-9 w-full min-w-0 items-center justify-center gap-1 rounded-lg border px-2 text-xs font-semibold transition-colors sm:text-sm',
          activeMoreTab
            ? 'border-[#00C2CB] bg-[#E8F9FA] text-[#007A80] shadow-sm'
            : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
        )}
      >
        <MoreHorizontal size={16} className="shrink-0" />
        <span className="min-w-0 truncate">{activeMoreTab ? activeMoreTab.label : `+${tabs.length} More`}</span>
        <ChevronDown size={14} className="shrink-0" />
      </button>

      {open && (
        <div className="absolute end-0 top-11 z-[70] w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-2xl">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onChange(tab.id)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start text-sm transition-colors',
                  activeTab === tab.id
                    ? 'bg-[#E8F9FA] text-[#007A80]'
                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                )}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function DrawerTabs({
  activeTab,
  onChange,
  tabOrder,
  onTabOrderChange,
  tabs = DRAWER_TABS,
  sticky = true,
  className,
  containerWidth = 0,
}) {
  const longPressTimerRef = useRef(null)
  const recentDragTimerRef = useRef(null)
  const [draggingTabId, setDraggingTabId] = useState(null)
  const [recentlyDragged, setRecentlyDragged] = useState(false)
  const [reorderMode, setReorderMode] = useState(false)
  const tabById = new Map(tabs.map((tab) => [tab.id, tab]))
  const orderedTabs = [
    ...tabOrder.map((id) => tabById.get(id)).filter(Boolean),
    ...tabs.filter((tab) => !tabOrder.includes(tab.id)),
  ]
  const visibleTabsCount = getDrawerVisibleTabsCount(containerWidth, orderedTabs.length)
  const visibleTabs = orderedTabs.slice(0, visibleTabsCount)
  const moreTabs = orderedTabs.slice(visibleTabsCount)
  const displayedTabs = reorderMode ? orderedTabs : visibleTabs
  const columnCount = Math.max(1, displayedTabs.length + (!reorderMode && moreTabs.length ? 1 : 0))

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current)
      if (recentDragTimerRef.current) window.clearTimeout(recentDragTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!draggingTabId) return undefined

    const stopDrag = () => finishDrag()
    window.addEventListener('pointerup', stopDrag)
    window.addEventListener('pointercancel', stopDrag)

    return () => {
      window.removeEventListener('pointerup', stopDrag)
      window.removeEventListener('pointercancel', stopDrag)
    }
  }, [draggingTabId])

  const clearLongPressTimer = () => {
    if (!longPressTimerRef.current) return
    window.clearTimeout(longPressTimerRef.current)
    longPressTimerRef.current = null
  }

  const startLongPress = (tabId) => {
    clearLongPressTimer()
    longPressTimerRef.current = window.setTimeout(() => {
      setReorderMode(true)
      setDraggingTabId(tabId)
      setRecentlyDragged(true)
    }, DRAWER_TABS_LONG_PRESS_MS)
  }

  const finishDrag = () => {
    clearLongPressTimer()
    if (!draggingTabId) return

    setDraggingTabId(null)
    setReorderMode(false)
    if (recentDragTimerRef.current) window.clearTimeout(recentDragTimerRef.current)
    recentDragTimerRef.current = window.setTimeout(() => {
      setRecentlyDragged(false)
    }, 220)
  }

  const handleEnterTab = (targetId) => {
    if (!draggingTabId || draggingTabId === targetId) return
    onTabOrderChange((currentOrder) => moveItem(currentOrder, draggingTabId, targetId))
  }

  return (
    <div
      className={cn(
        'z-30 min-w-0 overflow-visible border-y border-[#E5F7F8] bg-[#F8FEFF] py-2',
        sticky && 'sticky top-[73px] -mx-4 mt-3 px-4',
        !sticky && 'rounded-2xl border px-2',
        className
      )}
    >
      <div className={cn(
        'min-w-0 rounded-xl bg-white/70 p-1',
        reorderMode
          ? 'overflow-x-auto'
          : 'grid gap-1 overflow-visible'
      )}
        style={!reorderMode ? { gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` } : undefined}
      >
        <div className={cn(reorderMode ? 'flex min-w-max items-center gap-1' : 'contents')}>
        {displayedTabs.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            active={activeTab === tab.id}
            onClick={() => onChange(tab.id)}
            dragging={draggingTabId === tab.id}
            onPointerDown={() => startLongPress(tab.id)}
            onPointerUp={finishDrag}
            onPointerCancel={finishDrag}
            onPointerLeave={clearLongPressTimer}
            onPointerEnter={() => handleEnterTab(tab.id)}
            onClickCapture={(event) => {
              if (!draggingTabId && !recentlyDragged) return
              event.preventDefault()
              event.stopPropagation()
            }}
          />
        ))}
        </div>
        {!reorderMode && moreTabs.length > 0 && (
          <MoreTabsMenu activeTab={activeTab} tabs={moreTabs} onChange={onChange} />
        )}
      </div>
    </div>
  )
}

function ActiveTabContent({
  activeTab,
  customer,
  statuses,
  currentStatus,
  timelineActionRequest,
  onActionChanged,
  layoutMode,
  containerWidth,
}) {
  if (activeTab === 'timeline') {
    return (
      <TimelineTab
        customer={customer}
        statuses={statuses}
        currentStatus={currentStatus}
        actionRequest={timelineActionRequest}
        onActionChanged={onActionChanged}
        layoutMode={layoutMode}
        containerWidth={containerWidth}
      />
    )
  }
  if (activeTab === 'tasks') return <TasksTab customer={customer} layoutMode={layoutMode} />
  if (activeTab === 'notes') return <NotesTab customer={customer} layoutMode={layoutMode} />
  if (activeTab === 'files') return <FilesTab customer={customer} layoutMode={layoutMode} />
  if (activeTab === 'emails') return <EmailsTab customer={customer} layoutMode={layoutMode} />
  if (activeTab === 'calendar') return <CalendarTab customer={customer} layoutMode={layoutMode} />
  return <HomeTab customer={customer} layoutMode={layoutMode} />
}

export function CustomerDetailsContent({
  customer,
  enabled = true,
  onStatusChanged,
  showOpenPageButton = false,
  mode = 'drawer',
}) {
  const contentRef = useRef(null)
  const [activeTab, setActiveTab] = useState('home')
  const [timelineActionRequest, setTimelineActionRequest] = useState(null)
  const [openFloatingChats, setOpenFloatingChats] = useState([])
  const [drawerTabOrder, setDrawerTabOrder] = useState(getStoredDrawerTabOrder)
  const customerInfoQuery = useCustomerInfo(customer?.id, undefined, {
    enabled: Boolean(enabled && customer?.id),
  })
  const statusesQuery = useQuery({
    queryKey: ['customers', 'details-drawer', 'statuses'],
    queryFn: () => definitionsApi.getStatuses(),
    staleTime: 1000 * 60,
    enabled: Boolean(enabled),
  })
  const tagsQuery = useQuery({
    queryKey: ['customers', 'details-drawer', 'tags'],
    queryFn: () => definitionsApi.getTags(),
    staleTime: 1000 * 60,
    enabled: Boolean(enabled),
  })

  const detailedCustomer = getCustomerInfoPayload(customerInfoQuery.data) || customer
  const leadStatuses = extractLeadStatuses(statusesQuery.data)
  const currentStatus = getCurrentLeadStatus(detailedCustomer, leadStatuses)
  const tags = extractTags(tagsQuery.data)
  const currentTag = getCurrentTag(detailedCustomer, tags)
  const contentWidth = useElementWidth(contentRef, Boolean(enabled))
  const layoutMode = useMemo(
    () => getDetailsLayoutMode(contentWidth, mode),
    [contentWidth, mode]
  )
  const openTimelineAction = (actionId, actionOptions = {}) => {
    setActiveTab('timeline')
    setTimelineActionRequest({ actionId, ...actionOptions, requestedAt: Date.now() })
  }
  const focusFloatingChat = (channel) => {
    setOpenFloatingChats((currentChats) => [
      ...currentChats.filter((currentChannel) => currentChannel !== channel),
      channel,
    ])
  }
  const openFloatingChat = (channel) => focusFloatingChat(channel)
  const closeFloatingChat = (channel) => {
    setOpenFloatingChats((currentChats) => currentChats.filter((currentChannel) => currentChannel !== channel))
  }
  const getFloatingChatZIndex = (channel) => {
    const channelIndex = openFloatingChats.indexOf(channel)
    return 20000 + Math.max(channelIndex, 0) * 10
  }
  const refreshCustomerDetails = (payload) => {
    customerInfoQuery.refetch()
    onStatusChanged?.(payload)
  }
  const updatePageTabOrder = (updater) => {
    const pageTabIds = PAGE_TABS.map((tab) => tab.id)

    setDrawerTabOrder((currentOrder) => {
      const currentPageOrder = currentOrder.filter((id) => pageTabIds.includes(id))
      const nextPageOrder = typeof updater === 'function' ? updater(currentPageOrder) : updater
      const sanitizedPageOrder = [
        ...nextPageOrder.filter((id) => pageTabIds.includes(id)),
        ...pageTabIds.filter((id) => !nextPageOrder.includes(id)),
      ]
      const nonPageOrder = currentOrder.filter((id) => !pageTabIds.includes(id))

      return [...nonPageOrder, ...sanitizedPageOrder]
    })
  }

  useEffect(() => {
    saveDrawerTabOrder(drawerTabOrder)
  }, [drawerTabOrder])

  useEffect(() => {
    if (mode !== 'page' || activeTab !== 'home') return
    setActiveTab('timeline')
  }, [activeTab, mode])

  if (!detailedCustomer) {
    return (
      <div className="text-sm text-[var(--text-muted)]">لا يوجد عميل محدد.</div>
    )
  }

  const detailsPageId = detailedCustomer.id || customer?.id || getLeadId(detailedCustomer)
  const wrapperClassName = mode === 'page'
    ? 'min-h-[calc(100vh-180px)] min-w-0 overflow-x-hidden rounded-2xl border border-[#BEEFF2] bg-[#F8FEFF] p-4 shadow-sm'
    : '-m-4 min-h-[calc(100vh-73px)] min-w-0 overflow-x-hidden bg-[#F8FEFF] p-4'
  const pageActiveTab = activeTab === 'home' ? 'timeline' : activeTab
  const renderFloatingChats = () => (
    <>
      <FloatingWhatsappChat
        open={openFloatingChats.includes('whatsapp')}
        customer={detailedCustomer}
        onClose={() => closeFloatingChat('whatsapp')}
        zIndex={getFloatingChatZIndex('whatsapp')}
        onFocus={() => focusFloatingChat('whatsapp')}
      />
      <FloatingMessengerChat
        open={openFloatingChats.includes('messenger')}
        customer={detailedCustomer}
        onClose={() => closeFloatingChat('messenger')}
        zIndex={getFloatingChatZIndex('messenger')}
        onFocus={() => focusFloatingChat('messenger')}
      />
      <FloatingSmsChat
        open={openFloatingChats.includes('sms')}
        customer={detailedCustomer}
        onClose={() => closeFloatingChat('sms')}
        zIndex={getFloatingChatZIndex('sms')}
        onFocus={() => focusFloatingChat('sms')}
      />
      <FloatingMailChat
        open={openFloatingChats.includes('mail')}
        customer={detailedCustomer}
        onClose={() => closeFloatingChat('mail')}
        zIndex={getFloatingChatZIndex('mail')}
        onFocus={() => focusFloatingChat('mail')}
      />
    </>
  )

  if (mode === 'page') {
    return (
      <div className="min-w-0 overflow-hidden xl:h-[calc(100vh-112px)]">
        <div className="grid min-w-0 gap-4 xl:h-full xl:min-h-0 xl:grid-cols-[390px_minmax(0,1fr)]">
          <aside className="scrollbar-elegant min-w-0 space-y-3 xl:h-full xl:min-h-0 xl:overflow-y-auto xl:overscroll-contain xl:pe-1">
            <CustomerHeaderModern
              customer={detailedCustomer}
              currentStatus={currentStatus}
              currentTag={currentTag}
              tags={tags}
              statuses={leadStatuses}
              isLoadingDetails={customerInfoQuery.isFetching}
              onStatusChanged={refreshCustomerDetails}
              onTagChanged={refreshCustomerDetails}
              showOpenPageButton={false}
              detailsPageId={detailsPageId}
            />
            <CustomerQuickActions
              customer={detailedCustomer}
              currentStatus={currentStatus}
              onTimelineAction={openTimelineAction}
              onOpenChat={openFloatingChat}
              onFollowUpAdded={refreshCustomerDetails}
            />
            <section className="min-w-0 rounded-2xl border border-[#BEEFF2] bg-white p-4 shadow-sm">
              <HomeTab customer={detailedCustomer} layoutMode="compact" />
            </section>
          </aside>

          <main ref={contentRef} className="flex min-w-0 flex-col rounded-2xl border border-[#BEEFF2] bg-[#F8FEFF] p-4 shadow-sm xl:h-full xl:min-h-0 xl:overflow-hidden">
            <DrawerTabs
              activeTab={pageActiveTab}
              onChange={setActiveTab}
              tabOrder={drawerTabOrder}
              onTabOrderChange={updatePageTabOrder}
              tabs={PAGE_TABS}
              sticky={false}
              className="mb-4 shrink-0"
              containerWidth={contentWidth}
            />
            <div className="scrollbar-elegant min-w-0 xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:overscroll-contain xl:pe-1">
              <ActiveTabContent
                activeTab={pageActiveTab}
                customer={detailedCustomer}
                statuses={leadStatuses}
                currentStatus={currentStatus}
                timelineActionRequest={timelineActionRequest}
                onActionChanged={refreshCustomerDetails}
                layoutMode={layoutMode}
                containerWidth={contentWidth}
              />
            </div>
          </main>
        </div>

        {renderFloatingChats()}
      </div>
    )
  }

  return (
    <div ref={contentRef} className={wrapperClassName} data-customer-details-layout={layoutMode}>
      <CustomerHeaderModern
        customer={detailedCustomer}
        currentStatus={currentStatus}
        currentTag={currentTag}
        tags={tags}
        statuses={leadStatuses}
        isLoadingDetails={customerInfoQuery.isFetching}
        onStatusChanged={refreshCustomerDetails}
        onTagChanged={refreshCustomerDetails}
        showOpenPageButton={showOpenPageButton}
        detailsPageId={detailsPageId}
      />
      <CustomerQuickActions
        customer={detailedCustomer}
        currentStatus={currentStatus}
        onTimelineAction={openTimelineAction}
        onOpenChat={openFloatingChat}
        onFollowUpAdded={refreshCustomerDetails}
      />
      <DrawerTabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabOrder={drawerTabOrder}
        onTabOrderChange={setDrawerTabOrder}
        containerWidth={contentWidth}
      />
      <ActiveTabContent
        activeTab={activeTab}
        customer={detailedCustomer}
        statuses={leadStatuses}
        currentStatus={currentStatus}
        timelineActionRequest={timelineActionRequest}
        onActionChanged={refreshCustomerDetails}
        layoutMode={layoutMode}
        containerWidth={contentWidth}
      />
      {renderFloatingChats()}
    </div>
  )
}

export function CustomerDetailsDrawer({ customer, open, onClose, onStatusChanged }) {
  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      title="تفاصيل العميل"
      description={undefined}
      size="lg"
      className="w-full border-s border-[#BEEFF2] shadow-2xl"
      closeOnBackdrop={false}
      avoidRightSidebar
      pushPage
      pushPageMinWidth={1024}
      topOffset="calc(var(--layout-header-height, 48px) - 1px)"
    >
      <CustomerDetailsContent
        customer={customer}
        enabled={open}
        onStatusChanged={onStatusChanged}
        showOpenPageButton
        mode="drawer"
      />
    </AppDrawer>
  )
}
