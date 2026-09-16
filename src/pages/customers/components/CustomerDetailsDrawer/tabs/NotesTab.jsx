import { useMemo, useState } from 'react'
import { ArrowDownWideNarrow, ArrowUpWideNarrow, Clock3, FileText, Search, StickyNote, UserRound, X } from 'lucide-react'

import { useUsers } from '../../../../../features/users/hooks/useUsers'
import { EmptyPanel } from '../CustomerDetailsTabPrimitives'
import { fieldValue, formatDateTime12 } from '../customerDetailsUtils'

function normalizeText(value) {
  return String(value || '').trim().toLowerCase()
}

function getLead(customer) {
  return customer?.lead || {}
}

function getUserId(value) {
  return value?.user_id || value?.user?.id || value?.created_by_id || value?.created_by?.id || ''
}

function getEmbeddedUserName(value) {
  return (
    value?.user?.name ||
    value?.user?.username ||
    value?.user?.email ||
    value?.created_by?.name ||
    value?.created_by?.username ||
    value?.created_by?.email ||
    ''
  )
}

function isRequestedLeadNote(activity) {
  const type = normalizeText(activity?.type)
  const title = normalizeText(activity?.title)

  return type === 'note-to-lead' || title === 'customer note added'
}

function getActivityNote(activity) {
  return (
    activity?.data?.note ||
    activity?.note ||
    activity?.notes ||
    activity?.description ||
    ''
  )
}

function getActivityTime(activity) {
  return activity?.activity_at || activity?.created_at || activity?.updated_at || ''
}

function collectLeadNotes(customer) {
  const lead = getLead(customer)
  const activityNotes = [
    ...(Array.isArray(lead?.lead_activities) ? lead.lead_activities : []),
    ...(Array.isArray(customer?.lead_activities) ? customer.lead_activities : []),
  ]
    .filter(isRequestedLeadNote)
    .map((activity) => ({
      id: activity?.id,
      title: activity?.title || (activity?.type === 'note-to-lead' ? 'متابعة العميل' : 'ملاحظة العميل'),
      note: getActivityNote(activity),
      type: activity?.type,
      time: getActivityTime(activity),
      userId: getUserId(activity),
      userName: getEmbeddedUserName(activity),
      raw: activity,
    }))

  const directNotes = (Array.isArray(customer?.notes) ? customer.notes : []).map((note, index) => ({
    id: note?.id || `note-${index}`,
    title: note?.title || 'ملاحظة',
    note: note?.body || note?.note || note?.content || '',
    type: note?.type || 'note',
    time: note?.activity_at || note?.created_at || note?.updated_at || '',
    userId: getUserId(note),
    userName: getEmbeddedUserName(note),
    raw: note,
  }))

  const seen = new Set()
  return [...activityNotes, ...directNotes]
    .filter((note) => note.note || note.title)
    .filter((note) => {
      const key = String(note.id || `${note.type}-${note.time}-${note.note}`)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

function getTypeLabel(type) {
  if (type === 'note-to-lead') return 'متابعة'
  if (type === 'note') return 'ملاحظة'
  return fieldValue(type, 'ملاحظة')
}

function getTimestamp(value) {
  const timestamp = new Date(value || 0).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function getUserLabel(note, userById) {
  if (note.userName) return note.userName
  const user = userById.get(String(note.userId))
  if (user) return user.name || user.username || user.email || `User #${user.id}`
  if (note.userId) return `User #${note.userId}`
  return 'غير محدد'
}

function buildSearchText(note, userLabel) {
  return [
    note.title,
    note.note,
    note.type,
    getTypeLabel(note.type),
    userLabel,
    note.userId,
    note.time,
    note.time ? formatDateTime12(note.time) : '',
    JSON.stringify(note.raw || {}),
  ].filter(Boolean).join(' ').toLowerCase()
}

export function NotesTab({ customer, layoutMode = 'compact' }) {
  const [sortDirection, setSortDirection] = useState('desc')
  const [typeFilter, setTypeFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('all')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const usersQuery = useUsers()
  const users = usersQuery.data || []
  const userById = useMemo(
    () => new Map(users.map((user) => [String(user.id || user.user_id), user])),
    [users]
  )
  const notes = useMemo(() => collectLeadNotes(customer), [customer])
  const noteViewItems = useMemo(() => notes.map((note) => ({
    ...note,
    userLabel: getUserLabel(note, userById),
    searchText: buildSearchText(note, getUserLabel(note, userById)),
  })), [notes, userById])
  const typeOptions = useMemo(() => {
    const types = Array.from(new Set(noteViewItems.map((note) => note.type).filter(Boolean)))
    return types.map((type) => ({ value: type, label: getTypeLabel(type) }))
  }, [noteViewItems])
  const userOptions = useMemo(() => {
    const usersMap = new Map()
    noteViewItems.forEach((note) => {
      const key = String(note.userId || note.userLabel || 'unknown')
      if (!usersMap.has(key)) usersMap.set(key, note.userLabel)
    })
    return Array.from(usersMap.entries()).map(([value, label]) => ({ value, label }))
  }, [noteViewItems])
  const filteredNotes = useMemo(() => {
    const normalizedSearch = normalizeText(searchText)

    return noteViewItems
      .filter((note) => typeFilter === 'all' || String(note.type) === String(typeFilter))
      .filter((note) => userFilter === 'all' || String(note.userId || note.userLabel || 'unknown') === String(userFilter))
      .filter((note) => !normalizedSearch || note.searchText.includes(normalizedSearch))
      .sort((first, second) => {
        const diff = getTimestamp(second.time) - getTimestamp(first.time)
        return sortDirection === 'desc' ? diff : -diff
      })
  }, [noteViewItems, searchText, sortDirection, typeFilter, userFilter])

  if (!notes.length) {
    return (
      <EmptyPanel
        title="الملاحظات"
        description="لا توجد ملاحظات محفوظة لهذا العميل."
      />
    )
  }

  return (
    <div className="min-w-0 space-y-3 py-4">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        <h3 className="inline-flex items-center gap-2 text-base font-black text-[var(--text)]">
          <StickyNote size={17} className="text-[#007A80]" />
          الملاحظات
        </h3>
        <span className="rounded-full border border-[#BEEFF2] bg-[#E8F9FA] px-2.5 py-1 text-xs font-black text-[#007A80]">
          {filteredNotes.length} / {notes.length}
        </span>
      </div>

      <div className="rounded-xl border border-[#E5F7F8] bg-white/80 p-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSortDirection((value) => (value === 'desc' ? 'asc' : 'desc'))}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-[#BEEFF2] bg-[#F8FEFF] px-2 text-xs font-black text-[#007A80] transition-colors hover:bg-[#E8F9FA]"
            title={sortDirection === 'desc' ? 'الترتيب من الأحدث للأقدم' : 'الترتيب من الأقدم للأحدث'}
          >
            {sortDirection === 'desc' ? <ArrowDownWideNarrow size={14} /> : <ArrowUpWideNarrow size={14} />}
            <span>{sortDirection === 'desc' ? 'الأحدث' : 'الأقدم'}</span>
          </button>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="h-9 min-w-[130px] rounded-lg border border-[#E5F7F8] bg-white px-2 text-xs font-bold text-[var(--text)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00C2CB]"
            title="فلتر النوع"
          >
            <option value="all">كل الأنواع</option>
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select
            value={userFilter}
            onChange={(event) => setUserFilter(event.target.value)}
            className="h-9 min-w-[140px] rounded-lg border border-[#E5F7F8] bg-white px-2 text-xs font-bold text-[var(--text)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00C2CB]"
            title="فلتر المستخدم"
          >
            <option value="all">كل المستخدمين</option>
            {userOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setSearchOpen((value) => !value)}
            className="ms-auto inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#BEEFF2] bg-[#F8FEFF] text-[#007A80] transition-colors hover:bg-[#E8F9FA]"
            title="بحث في الملاحظات"
            aria-label="بحث في الملاحظات"
          >
            {searchOpen ? <X size={15} /> : <Search size={15} />}
          </button>
        </div>

        {searchOpen ? (
          <div className="mt-2">
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              autoFocus
              className="h-9 w-full rounded-lg border border-[#E5F7F8] bg-white px-3 text-sm font-semibold text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00C2CB]"
              placeholder="ابحث في النص، النوع، المستخدم، التاريخ أو البيانات..."
            />
          </div>
        ) : null}
      </div>

      {!filteredNotes.length ? (
        <EmptyPanel
          title="لا توجد نتائج"
          description="لا توجد ملاحظات تطابق الفلاتر الحالية."
        />
      ) : (
        <div className={layoutMode === 'wide' ? 'grid min-w-0 grid-cols-2 gap-3' : 'min-w-0 space-y-3'}>
          {filteredNotes.map((note, index) => (
            <article
              key={note.id || `${note.type}-${index}`}
              className="min-w-0 rounded-xl border border-[#E5F7F8] bg-[#F8FEFF] p-3 shadow-sm"
              title={[
                note.title,
                note.note,
                note.userLabel,
                note.time ? formatDateTime12(note.time) : '',
              ].filter(Boolean).join(' | ')}
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#007A80] shadow-sm">
                  <FileText size={15} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <h4 className="min-w-0 flex-1 break-words text-sm font-black text-[var(--text)]">
                      {fieldValue(note.title, 'ملاحظة')}
                    </h4>
                    <span className="shrink-0 rounded-full border border-[#BEEFF2] bg-white px-2 py-0.5 text-[10px] font-black text-[#007A80]">
                      {getTypeLabel(note.type)}
                    </span>
                  </div>

                  {note.note ? (
                    <p className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-white/80 px-2 py-1.5 text-sm font-semibold leading-6 text-[var(--text)]">
                      {note.note}
                    </p>
                  ) : null}

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-white px-2 py-1 text-[11px] font-bold text-[var(--text-muted)]">
                      <UserRound size={12} className="shrink-0 text-[#007A80]" />
                      <span className="truncate">{note.userLabel}</span>
                    </span>

                    {note.time ? (
                      <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-white px-2 py-1 text-[11px] font-bold text-[var(--text-muted)]">
                        <Clock3 size={12} className="shrink-0 text-[#007A80]" />
                        <span className="truncate">{formatDateTime12(note.time)}</span>
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
