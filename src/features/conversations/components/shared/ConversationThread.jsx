import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  ExternalLink,
  FileText,
  Filter,
  Image as ImageIcon,
  Link2,
  Lock,
  Play,
  Search,
  Unlock,
  UserRound,
  UserPlus,
  Volume2,
  X,
} from 'lucide-react'
import { CreateTaskButton, taskableFromCrmRecord } from '../../../tasks'
import { ConversationComposer } from './ConversationComposer'
import { ConversationMessages } from './ConversationMessages'
import { MediaGalleryDialog } from './MediaGalleryDialog'

function isOutgoingMessage(message = {}) {
  const direction = String(message?.direction || '').toLowerCase()
  const status = String(message?.status || '').toLowerCase()
  return direction === 'outgoing' || direction === 'outbound' || status === 'sent' || status === 'read'
}

function toDateInputValue(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = String(date.getFullYear())
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getMessageDate(message = {}) {
  const value = message?.raw?.sent_at || message?.createdAt || message?.raw?.created_at
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function getMessageUserName(message = {}) {
  const raw = message?.raw || {}
  const senderName = raw?.sent_by?.name || raw?.sent_by_user?.name || raw?.sender?.name
  const incomingName = raw?.from_name || raw?.contact_name || raw?.contact?.name || raw?.customer?.name
  if (isOutgoingMessage(message)) {
    return senderName || 'CRM Agent'
  }
  return incomingName || senderName || 'العميل'
}

function getMessageReceiverName(message = {}) {
  const raw = message?.raw || {}
  return raw?.to_name || raw?.recipient_name || raw?.recipient?.name || raw?.receiver?.name || ''
}

function normalizeSearchValue(value = '') {
  return String(value || '').trim().toLowerCase()
}

function formatFileSize(size) {
  const value = Number(size || 0)
  if (!value) return ''
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

function getMessageTextValue(message = {}) {
  const value = message?.text || message?.raw?.body || message?.raw?.text || message?.raw?.message || ''
  if (value === null || value === undefined) return ''
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object') {
    return String(value.body || value.text || value.message || value.title || '')
  }
  return String(value)
}

function extractLinksFromText(text = '') {
  const matches = String(text || '').match(/https?:\/\/[^\s<>"')]+/gi)
  return Array.from(new Set(matches || []))
}

function getAttachmentGroup(type = '') {
  const normalizedType = String(type || '').toLowerCase()
  if (normalizedType === 'image') return 'images'
  if (normalizedType === 'video') return 'videos'
  if (normalizedType === 'audio') return 'audios'
  return 'files'
}

function formatDisplayDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function ConversationThread({
  title = '',
  contactText = 'بدون بيانات تواصل',
  avatarUrl = '',
  contactDetails = null,
  headerActions = null,
  messages = [],
  isLoadingMessages = false,
  error = '',
  hasMoreMessages = false,
  onLoadMore,
  isSending = false,
  onSend,
  onReact,
  onRemoveReaction,
  channelColor = '#0A7CFF',
  autoFocusKey,
  highlightedMessageId = '',
  composerDisabled = false,
  supportsAttachments = false,
  supportsReply = false,
  supportsReactions = false,
  onConvertToLead,
  onToggleConversationStatus,
  onClose,
  isTogglingConversationStatus = false,
  emptyMessage = 'لا توجد رسائل بعد.',
  emptyDescription = '',
}) {
  const [query, setQuery] = useState('')
  const [searchScope, setSearchScope] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [userFilter, setUserFilter] = useState('all')
  const [openPanel, setOpenPanel] = useState('')
  const [viewMode, setViewMode] = useState('chat')
  const [replyToMessage, setReplyToMessage] = useState(null)
  const [detailsMediaIndex, setDetailsMediaIndex] = useState(-1)

  useEffect(() => {
    setReplyToMessage(null)
  }, [autoFocusKey])

  const participantOptions = useMemo(() => {
    const unique = new Map()
    messages.forEach((message) => {
      const name = getMessageUserName(message)
      if (!name) return
      const key = normalizeSearchValue(name)
      if (!unique.has(key)) {
        unique.set(key, name)
      }
    })
    return Array.from(unique.entries()).map(([value, label]) => ({ value, label }))
  }, [messages])

  const dateRange = useMemo(() => {
    const firstDate = messages[0] ? getMessageDate(messages[0]) : null
    const lastDate = messages[messages.length - 1] ? getMessageDate(messages[messages.length - 1]) : null
    return {
      first: firstDate ? toDateInputValue(firstDate) : '',
      last: lastDate ? toDateInputValue(lastDate) : '',
    }
  }, [messages])

  const filteredMessages = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query)
    const normalizedSelectedUser = normalizeSearchValue(userFilter)
    const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null
    const to = toDate ? new Date(`${toDate}T23:59:59`) : null

    return messages.filter((message) => {
      const messageDate = getMessageDate(message)
      if (from && messageDate && messageDate < from) return false
      if (to && messageDate && messageDate > to) return false
      if (from && !messageDate) return false
      if (to && !messageDate) return false

      const userName = normalizeSearchValue(getMessageUserName(message))
      if (normalizedSelectedUser !== 'all' && userName !== normalizedSelectedUser) {
        return false
      }

      if (!normalizedQuery) return true

      const messageText = normalizeSearchValue(message?.text || '')
      const receiverName = normalizeSearchValue(getMessageReceiverName(message))
      const searchInUser = `${userName} ${receiverName}`.trim()

      if (searchScope === 'message') {
        return messageText.includes(normalizedQuery)
      }

      if (searchScope === 'user') {
        return searchInUser.includes(normalizedQuery)
      }

      return messageText.includes(normalizedQuery) || searchInUser.includes(normalizedQuery)
    })
  }, [fromDate, messages, query, searchScope, toDate, userFilter])

  const hasActiveFilters = Boolean(query || fromDate || toDate || userFilter !== 'all')
  const hasSearchFilter = Boolean(query)
  const hasDateFilter = Boolean(fromDate || toDate)
  const hasUserFilter = userFilter !== 'all'

  const selectedUserLabel = useMemo(() => {
    if (userFilter === 'all') return 'كل المستخدمين'
    const matched = participantOptions.find((option) => option.value === userFilter)
    return matched?.label || 'مستخدم'
  }, [participantOptions, userFilter])

  const detailsItems = useMemo(() => {
    const source = contactDetails && typeof contactDetails === 'object' ? contactDetails : {}
    const items = [
      { key: 'name', label: 'الاسم', value: source.name || title || '-' },
      { key: 'contact', label: 'التواصل', value: source.contact || contactText || '-' },
      { key: 'phone', label: 'الهاتف', value: source.phone || '' },
      { key: 'email', label: 'البريد', value: source.email || '' },
      { key: 'channel', label: 'القناة', value: source.channel || '' },
      { key: 'conversationId', label: 'المحادثة', value: source.conversationId ? `#${source.conversationId}` : '' },
    ]
    return items.filter((item) => item.value)
  }, [contactDetails, contactText, title])

  const detailsSource = contactDetails && typeof contactDetails === 'object' ? contactDetails : {}
  const linkedCustomer = detailsSource.customer || null
  const assignedUser = detailsSource.assignedUser || detailsSource.assigned_user || null
  const conversationUsers = Array.isArray(detailsSource.users) ? detailsSource.users : []
  const conversationStatus = String(detailsSource.status || '').toLowerCase()
  const isConversationClosed = conversationStatus === 'closed'

  const mediaGroups = useMemo(() => {
    const groups = {
      images: [],
      videos: [],
      audios: [],
      files: [],
      links: [],
    }

    messages.forEach((message, messageIndex) => {
      const attachments = Array.isArray(message?.attachments) ? message.attachments : []
      const messageTime = message?.raw?.sent_at || message?.createdAt || message?.raw?.created_at || ''

      attachments.forEach((attachment, attachmentIndex) => {
        const type = String(attachment?.type || '').toLowerCase()
        const url = attachment?.url || ''
        if (!url) return

        const group = getAttachmentGroup(type)
        groups[group].push({
          ...attachment,
          type,
          url,
          key: attachment?.key || attachment?.id || `${message?.id || messageIndex}-${attachmentIndex}-${url}`,
          label: attachment?.name || attachment?.mimeType || attachment?.mime_type || type || 'file',
          sizeLabel: formatFileSize(attachment?.size),
          createdAt: messageTime,
        })
      })

      extractLinksFromText(getMessageTextValue(message)).forEach((url, linkIndex) => {
        groups.links.push({
          key: `${message?.id || messageIndex}-link-${linkIndex}-${url}`,
          url,
          label: url.replace(/^https?:\/\//i, ''),
          createdAt: messageTime,
        })
      })
    })

    return groups
  }, [messages])

  const mediaSections = useMemo(() => ([
    { key: 'images', title: 'الصور', icon: ImageIcon, items: mediaGroups.images },
    { key: 'videos', title: 'الفيديوهات', icon: Play, items: mediaGroups.videos },
    { key: 'audios', title: 'الملفات الصوتية', icon: Volume2, items: mediaGroups.audios },
    { key: 'files', title: 'الملفات', icon: FileText, items: mediaGroups.files },
    { key: 'links', title: 'اللينكات', icon: Link2, items: mediaGroups.links },
  ]), [mediaGroups])

  const detailsGalleryItems = useMemo(() => ([
    ...mediaGroups.images,
    ...mediaGroups.videos,
    ...mediaGroups.audios,
    ...mediaGroups.files,
  ]), [mediaGroups])

  const openDetailsGallery = (item) => {
    const index = detailsGalleryItems.findIndex((media) => media.key === item.key || media.url === item.url)
    setDetailsMediaIndex(index >= 0 ? index : 0)
  }

  const togglePanel = (panel) => {
    setOpenPanel((current) => (current === panel ? '' : panel))
  }

  const clearFilters = () => {
    setQuery('')
    setSearchScope('all')
    setFromDate('')
    setToDate('')
    setUserFilter('all')
  }

  const openContactDetails = () => {
    setOpenPanel('')
    setViewMode('details')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--surface-2)]">
      <div className="border-b border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={openContactDetails}
            className="group inline-flex min-w-0 max-w-[68%] items-center gap-2 rounded-lg px-1.5 py-1 text-start transition hover:bg-[var(--surface)]/70"
            title="عرض بيانات جهة الاتصال"
          >
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#DFF7F8] text-[11px] font-black text-[var(--brand-accent)]">
              {avatarUrl ? <img src={avatarUrl} alt={title || 'جهة الاتصال'} className="h-full w-full object-cover" referrerPolicy="no-referrer" /> : (title?.trim()?.charAt(0) || '?').toUpperCase()}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-black text-[var(--text)] group-hover:text-[#0369A1]">{title || 'جهة الاتصال'}</span>
              <span className="block truncate text-[10px] font-semibold text-[var(--text-muted)]">{contactText}</span>
              {assignedUser?.name ? (
                <span className="mt-1 inline-flex max-w-full items-center gap-1 rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-black text-[var(--text-muted)]">
                  <UserRound size={11} />
                  <span className="truncate">المسؤول: {assignedUser.name}</span>
                </span>
              ) : null}
            </span>
          </button>

          <div className="flex items-center gap-1">
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition hover:border-[#FCA5A5] hover:bg-[#FEF2F2] hover:text-[#DC2626] dark:hover:bg-[#451E28]"
                title="إغلاق المحادثة (Esc)"
                aria-label="إغلاق المحادثة"
              >
                <X size={13} />
              </button>
            ) : null}
            {detailsSource.conversationId ? (
              <button
                type="button"
                onClick={() => onToggleConversationStatus?.(detailsSource)}
                disabled={isTogglingConversationStatus}
                className={`inline-flex h-7 items-center gap-1 rounded-full border px-2 text-[10px] font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isConversationClosed
                    ? 'border-[var(--brand-accent)] bg-[var(--surface)] text-[var(--brand-accent)] hover:border-[#00C2CB] hover:bg-[var(--brand-accent-soft)]'
                    : 'border-[#FAD1D1] bg-[var(--surface)] text-[#B91C1C] hover:border-[#FCA5A5] hover:bg-[#FEF2F2] dark:hover:bg-[#451E28]'
                }`}
                title={isConversationClosed ? 'إعادة فتح المحادثة' : 'إنهاء المحادثة'}
              >
                {isTogglingConversationStatus ? (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : isConversationClosed ? (
                  <Unlock size={12} />
                ) : (
                  <Lock size={12} />
                )}
                {isConversationClosed ? 'فتح' : 'إنهاء المحادثة'}
              </button>
            ) : null}
            {!linkedCustomer && detailsSource.conversationId ? (
              <button
                type="button"
                onClick={() => onConvertToLead?.(detailsSource)}
                className="inline-flex h-7 items-center gap-1 rounded-full border border-[var(--brand-accent)] bg-[var(--surface)] px-2 text-[10px] font-black text-[var(--brand-accent)] transition hover:border-[#00C2CB] hover:bg-[var(--brand-accent-soft)]"
                title="تحويل عميل محتمل"
              >
                <UserPlus size={12} />
                تحويل
              </button>
            ) : null}
            {linkedCustomer ? (
              // Follow-up task linked to the conversation's customer (tasks F2, 2026-10-02).
              <CreateTaskButton taskable={taskableFromCrmRecord(linkedCustomer)} action="follow_up" compact />
            ) : null}
            {typeof headerActions === 'function' ? headerActions(detailsSource) : headerActions}
            <button
              type="button"
              onClick={() => togglePanel('search')}
              className={`relative inline-flex h-7 w-7 items-center justify-center rounded-full border transition ${openPanel === 'search' || hasSearchFilter ? 'border-[#00C2CB] bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--border)]'}`}
              title="اختصار البحث"
            >
              <Search size={12} />
              {hasSearchFilter ? <span className="absolute -top-0.5 -end-0.5 h-2 w-2 rounded-full bg-[#00C2CB]" /> : null}
            </button>

            <button
              type="button"
              onClick={() => togglePanel('date')}
              className={`relative inline-flex h-7 w-7 items-center justify-center rounded-full border transition ${openPanel === 'date' || hasDateFilter ? 'border-[#00C2CB] bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--border)]'}`}
              title="اختصار التاريخ"
            >
              <CalendarDays size={12} />
              {hasDateFilter ? <span className="absolute -top-0.5 -end-0.5 h-2 w-2 rounded-full bg-[#00C2CB]" /> : null}
            </button>

            <button
              type="button"
              onClick={() => togglePanel('user')}
              className={`relative inline-flex h-7 w-7 items-center justify-center rounded-full border transition ${openPanel === 'user' || hasUserFilter ? 'border-[#00C2CB] bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--border)]'}`}
              title="اختصار المستخدم"
            >
              <UserRound size={12} />
              {hasUserFilter ? <span className="absolute -top-0.5 -end-0.5 h-2 w-2 rounded-full bg-[#00C2CB]" /> : null}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#FFD5D5] bg-[var(--surface)] text-[#DC2626] transition hover:bg-[#FFF5F5] dark:hover:bg-[#450a0a]"
                title="مسح كل الفلاتر"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {openPanel && (
          <div className="mt-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 shadow-sm">
            {openPanel === 'search' && (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_132px]">
                <label className="relative">
                  <Search size={14} className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="ابحث بالمحتوى أو المستخدم"
                    className="h-8 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] ps-8 pe-2 text-xs font-semibold text-[var(--text)] outline-none transition focus:border-[#00C2CB] focus:ring-2 focus:ring-[#00C2CB]/20"
                  />
                </label>

                <label className="relative">
                  <Filter size={14} className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <select
                    value={searchScope}
                    onChange={(event) => setSearchScope(event.target.value)}
                    className="h-8 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] ps-8 pe-2 text-xs font-bold text-[var(--text)] outline-none transition focus:border-[#00C2CB] focus:ring-2 focus:ring-[#00C2CB]/20"
                  >
                    <option value="all">شامل</option>
                    <option value="message">رسائل</option>
                    <option value="user">مستخدمين</option>
                  </select>
                </label>
              </div>
            )}

            {openPanel === 'date' && (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <input
                  type="date"
                  value={fromDate}
                  min={dateRange.first || undefined}
                  max={toDate || dateRange.last || undefined}
                  onChange={(event) => setFromDate(event.target.value)}
                  className="h-8 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-xs font-bold text-[var(--text)] outline-none transition focus:border-[#00C2CB] focus:ring-2 focus:ring-[#00C2CB]/20"
                />
                <input
                  type="date"
                  value={toDate}
                  min={fromDate || dateRange.first || undefined}
                  max={dateRange.last || undefined}
                  onChange={(event) => setToDate(event.target.value)}
                  className="h-8 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-xs font-bold text-[var(--text)] outline-none transition focus:border-[#00C2CB] focus:ring-2 focus:ring-[#00C2CB]/20"
                />
              </div>
            )}

            {openPanel === 'user' && (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
                <select
                  value={userFilter}
                  onChange={(event) => setUserFilter(event.target.value)}
                  className="h-8 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-xs font-bold text-[var(--text)] outline-none transition focus:border-[#00C2CB] focus:ring-2 focus:ring-[#00C2CB]/20"
                >
                  <option value="all">كل المستخدمين</option>
                  {participantOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                {userFilter !== 'all' ? <span className="inline-flex items-center rounded-lg bg-[var(--brand-accent-soft)] px-2 text-[10px] font-black text-[var(--brand-accent)]">{selectedUserLabel}</span> : null}
              </div>
            )}
          </div>
        )}

        <div className="mt-2 inline-flex rounded-full bg-[var(--brand-accent-soft)] px-2.5 py-1 text-[10px] font-black text-[var(--brand-accent)]">
          {filteredMessages.length}/{messages.length}
        </div>
      </div>
      {viewMode === 'chat' && (
        <ConversationMessages
          messages={filteredMessages}
          isLoadingMessages={isLoadingMessages}
          error={error}
          hasMoreMessages={hasMoreMessages}
          onLoadMore={onLoadMore}
          channelColor={channelColor}
          highlightedMessageId={highlightedMessageId}
          autoScrollKey={autoFocusKey}
          emptyMessage={emptyMessage}
          emptyDescription={emptyDescription}
          supportsReply={supportsReply}
          supportsReactions={supportsReactions}
          onReply={setReplyToMessage}
          onReact={onReact}
          onRemoveReaction={onRemoveReaction}
        />
      )}

      {viewMode === 'details' && (
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-black text-[var(--text)]">بيانات جهة الاتصال</h3>
              <button
                type="button"
                onClick={() => setViewMode('chat')}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-xs font-black text-[var(--brand-accent)] transition hover:border-[#00C2CB] hover:text-[var(--brand-accent)]"
              >
                <ArrowRight size={14} />
                عودة للمحادثة
              </button>
            </div>

            <div className="space-y-2">
              {detailsItems.map((item) => (
                <div key={item.key} className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-2">
                  <div className="text-[10px] font-black text-[var(--text-muted)]">{item.label}</div>
                  <div className="mt-0.5 break-all text-xs font-bold text-[var(--text)]">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 space-y-2">
              {linkedCustomer ? (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="text-xs font-black text-[var(--text)]">{'\u0627\u0644\u0639\u0645\u064a\u0644 \u0627\u0644\u0645\u0631\u062a\u0628\u0637'}</div>
                    <span className="rounded-full bg-[#ECFDF5] dark:bg-[#052e16] px-2 py-0.5 text-[10px] font-black text-[#047857]">
                      {linkedCustomer.type || 'customer'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
                    <div>
                      <div className="text-[10px] font-black text-[var(--text-muted)]">الاسم</div>
                      <div className="font-bold text-[var(--text)]">{linkedCustomer.name || '-'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-[var(--text-muted)]">الشركة</div>
                      <div className="font-bold text-[var(--text)]">{linkedCustomer.company || '-'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-[var(--text-muted)]">الهاتف</div>
                      <div className="break-all font-bold text-[var(--text)]">{linkedCustomer.phone || '-'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-[var(--text-muted)]">البريد</div>
                      <div className="break-all font-bold text-[var(--text)]">{linkedCustomer.email || '-'}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-[var(--brand-accent)] bg-[var(--surface-2)] px-3 py-3">
                  <div className="mb-2 text-xs font-black text-[var(--text)]">{'\u0644\u0627 \u064a\u0648\u062c\u062f \u0639\u0645\u064a\u0644 \u0645\u0631\u062a\u0628\u0637 \u0628\u0647\u0630\u0647 \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0629'}</div>
                  <button
                    type="button"
                    onClick={() => onConvertToLead?.(detailsSource)}
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-[#00A8B0] px-3 text-xs font-black text-white shadow-sm transition hover:bg-[#008E96]"
                  >
                    تحويل عميل محتمل
                  </button>
                </div>
              )}

              {assignedUser ? (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
                  <div className="text-[10px] font-black text-[var(--text-muted)]">المستخدم المسؤول</div>
                  <div className="mt-1 text-xs font-black text-[var(--text)]">{assignedUser.name || '-'}</div>
                  {assignedUser.email ? <div className="mt-0.5 break-all text-[11px] font-semibold text-[var(--text-muted)]">{assignedUser.email}</div> : null}
                </div>
              ) : null}

              {conversationUsers.length ? (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="text-[10px] font-black text-[var(--text-muted)]">مستخدمو المحادثة</div>
                    <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-black text-[var(--text-muted)]">{conversationUsers.length}</span>
                  </div>
                  <div className="space-y-2">
                    {conversationUsers.map((user) => (
                      <div key={user.id || user.email || user.name} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate text-xs font-black text-[var(--text)]">{user.name || '-'}</div>
                            {user.email ? <div className="truncate text-[11px] font-semibold text-[var(--text-muted)]">{user.email}</div> : null}
                          </div>
                          {user.is_current ? (
                            <span className="shrink-0 rounded-full bg-[var(--brand-accent-soft)] px-2 py-0.5 text-[10px] font-black text-[var(--brand-accent)]">حالي</span>
                          ) : null}
                        </div>
                        {(user.started_at || user.last_activity_at) ? (
                          <div className="mt-1 grid grid-cols-1 gap-1 text-[10px] font-semibold text-[var(--text-muted)] md:grid-cols-2">
                            {user.started_at ? <span>بدأ: {formatDisplayDateTime(user.started_at)}</span> : null}
                            {user.last_activity_at ? <span>{'\u0622\u062e\u0631 \u0646\u0634\u0627\u0637'}: {formatDisplayDateTime(user.last_activity_at)}</span> : null}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-3 space-y-3">
            {mediaSections.map((section) => {
              const Icon = section.icon
              const count = section.items.length

              return (
                <section key={section.key} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]">
                        <Icon size={15} />
                      </span>
                      <h4 className="text-xs font-black text-[var(--text)]">{section.title}</h4>
                    </div>
                    <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-black text-[var(--text-muted)]">
                      {count}
                    </span>
                  </div>

                  {count === 0 ? (
                    <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-3 py-3 text-center text-xs font-bold text-[var(--text-muted)]">
                      لا يوجد محتوى في هذا القسم
                    </div>
                  ) : null}

                  {section.key === 'images' && count > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {section.items.map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => openDetailsGallery(item)}
                          className="block aspect-square overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-start transition hover:border-[#00C2CB]"
                          title={item.label}
                        >
                          <img src={item.url} alt={item.label || 'image'} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {section.key === 'videos' && count > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {section.items.map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => openDetailsGallery(item)}
                          className="relative block aspect-video overflow-hidden rounded-lg border border-[var(--border)] bg-black text-start transition hover:border-[#00C2CB]"
                          title={item.label}
                        >
                          <video src={item.url} className="h-full w-full object-cover opacity-80" muted />
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface)]/90 text-[var(--text)] shadow">
                              <Play size={17} />
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {section.key === 'audios' && count > 0 ? (
                    <div className="space-y-2">
                      {section.items.map((item) => (
                        <div key={item.key} className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2">
                          <div className="mb-1 flex items-center justify-between gap-2 text-[10px] font-black text-[var(--brand-accent)]">
                            <button
                              type="button"
                              onClick={() => openDetailsGallery(item)}
                              className="min-w-0 flex-1 truncate text-start transition hover:text-[var(--brand-accent)]"
                              title="فتح في المعرض"
                            >
                              {item.label || 'Voice note'}
                            </button>
                            {item.sizeLabel ? <span className="shrink-0 text-[var(--text-muted)]">{item.sizeLabel}</span> : null}
                          </div>
                          <audio src={item.url} controls className="h-9 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {section.key === 'files' && count > 0 ? (
                    <div className="space-y-2">
                      {section.items.map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => openDetailsGallery(item)}
                          className="flex w-full items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-start text-xs font-bold text-[var(--text)] transition hover:border-[#00C2CB] hover:text-[var(--brand-accent)]"
                        >
                          <FileText size={14} className="shrink-0" />
                          <span className="min-w-0 flex-1 truncate">{item.label || 'file'}</span>
                          {item.sizeLabel ? <span className="shrink-0 text-[10px] text-[var(--text-muted)]">{item.sizeLabel}</span> : null}
                          <ExternalLink size={13} className="shrink-0" />
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {section.key === 'links' && count > 0 ? (
                    <div className="space-y-2">
                      {section.items.map((item) => (
                        <a
                          key={item.key}
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs font-bold text-[var(--text)] transition hover:border-[#00C2CB] hover:text-[var(--brand-accent)]"
                        >
                          <Link2 size={14} className="shrink-0" />
                          <span className="min-w-0 flex-1 truncate">{item.label}</span>
                          <ExternalLink size={13} className="shrink-0" />
                        </a>
                      ))}
                    </div>
                  ) : null}
                </section>
              )
            })}
          </div>
        </div>
      )}

      {viewMode === 'chat' && (
        isConversationClosed ? (
          <div className="border-t border-[#FDE2E2] bg-[#FFF7F7] dark:bg-[#450a0a] px-3 py-2 text-center text-xs font-black text-[#B91C1C]">
            {'\u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0629 \u0645\u0646\u062a\u0647\u064a\u0629\u060c \u0627\u0641\u062a\u062d\u0647\u0627 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649 \u0644\u0625\u0631\u0633\u0627\u0644 \u0631\u0633\u0627\u0626\u0644 \u062c\u062f\u064a\u062f\u0629.'}
          </div>
        ) : null
      )}

      {viewMode === 'chat' && (
        <ConversationComposer
          isSending={isSending}
          onSend={onSend}
          channelColor={channelColor}
          autoFocusKey={autoFocusKey}
          disabled={composerDisabled || isConversationClosed}
          supportsAttachments={supportsAttachments}
          replyToMessage={replyToMessage}
          onCancelReply={() => setReplyToMessage(null)}
        />
      )}

      <MediaGalleryDialog
        open={detailsMediaIndex >= 0}
        items={detailsGalleryItems}
        activeIndex={detailsMediaIndex}
        onIndexChange={setDetailsMediaIndex}
        onClose={() => setDetailsMediaIndex(-1)}
      />
    </div>
  )
}
