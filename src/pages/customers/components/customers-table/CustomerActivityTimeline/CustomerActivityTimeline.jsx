import { useMemo, useState } from 'react'
import { Activity, ArrowUpDown, CalendarRange, Search, X } from 'lucide-react'
import { ActivityDateGroup } from './ActivityDateGroup'
import { ActivityFilters } from './ActivityFilters'
import { ActivityHeader } from './ActivityHeader'
import { groupActivitiesByDate } from './utils/groupActivitiesByDate'

function toDayStartTimestamp(value) {
  if (!value) return Number.NaN
  const date = new Date(`${value}T00:00:00`)
  return date.getTime()
}

function getActivitySearchText(activity) {
  const products = Array.isArray(activity?.products) ? activity.products : []
  const productText = products.flatMap((product) => [
    product?.name,
    product?.note,
    product?.interestLevel,
    product?.productId,
  ])

  return [
    activity?.title,
    activity?.description,
    activity?.noteText,
    activity?.oldStatus,
    activity?.newStatus,
    activity?.userName,
    activity?.user?.name,
    ...productText,
  ].map((value) => String(value || '').toLowerCase()).join(' ')
}

function filterByCategory(activity, activeFilter) {
  if (activeFilter === 'all') return true
  return String(activity?.category || 'other') === activeFilter
}

function computeCounts(activities) {
  const counts = {
    all: activities.length,
    status: 0,
    notes: 0,
    products: 0,
    communication: 0,
  }

  activities.forEach((activity) => {
    const category = String(activity?.category || '')
    if (category in counts) {
      counts[category] += 1
    }
  })

  return counts
}

export function CustomerActivityTimeline({ activities = [] }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchText, setSearchText] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [selectedUser, setSelectedUser] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [sortDirection, setSortDirection] = useState('desc')
  const [dateFilterOpen, setDateFilterOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const sortedActivities = useMemo(() => {
    const sorted = [...activities].sort((a, b) => {
      const first = new Date(a?.date || 0).getTime()
      const second = new Date(b?.date || 0).getTime()
      const result = (Number.isNaN(second) ? 0 : second) - (Number.isNaN(first) ? 0 : first)
      return sortDirection === 'asc' ? -result : result
    })
    return sorted
  }, [activities, sortDirection])

  const availableUsers = useMemo(() => {
    const usersMap = new Map()
    sortedActivities.forEach((activity) => {
      const user = activity?.user
      const normalizedName = String(activity?.userName || user?.name || '').trim()
      const key = String(user?.id || normalizedName || '').trim()
      const name = normalizedName
      if (!key || !name || usersMap.has(key)) return
      usersMap.set(key, name)
    })
    return Array.from(usersMap.entries()).map(([id, name]) => ({ id, name }))
  }, [sortedActivities])

  const counts = useMemo(() => computeCounts(sortedActivities), [sortedActivities])

  const filteredActivities = useMemo(() => {
    const query = String(searchText || '').trim().toLowerCase()
    const fromTimestamp = toDayStartTimestamp(fromDate)
    const toTimestamp = toDayStartTimestamp(toDate)

    return sortedActivities.filter((activity) => {
      if (!filterByCategory(activity, activeFilter)) return false

      if (selectedUser !== 'all') {
        const activityUserId = String(activity?.user?.id || activity?.userName || activity?.user?.name || '')
        if (activityUserId !== selectedUser) return false
      }

      const activityTimestamp = new Date(activity?.date || 0).getTime()
      if (!Number.isNaN(fromTimestamp) && (Number.isNaN(activityTimestamp) || activityTimestamp < fromTimestamp)) {
        return false
      }

      if (!Number.isNaN(toTimestamp)) {
        const inclusiveEnd = toTimestamp + (24 * 60 * 60 * 1000) - 1
        if (Number.isNaN(activityTimestamp) || activityTimestamp > inclusiveEnd) return false
      }

      if (!query) return true
      return getActivitySearchText(activity).includes(query)
    })
  }, [activeFilter, searchText, selectedUser, fromDate, toDate, sortedActivities])

  const grouped = useMemo(() => groupActivitiesByDate(filteredActivities), [filteredActivities])
  const lastActivityDate = sortedActivities[0]?.date || null
  const hasDateFilter = Boolean(fromDate || toDate)

  return (
    <div className="flex h-full min-h-0 flex-col gap-3" dir="rtl">
      <ActivityHeader totalCount={sortedActivities.length} lastActivityDate={lastActivityDate} />

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex flex-wrap items-center gap-2">
          <ActivityFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} counts={counts} />

          <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
            <div className="relative flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSearchOpen((value) => !value)}
                className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-black transition ${searchText ? 'border-[#BEEFF2] bg-[#E8F9FA] text-[#007A80]' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                <Search size={14} />
                بحث
              </button>

              {searchOpen && (
                <div className="absolute left-0 top-full z-[999] mt-2 w-[260px] rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
                  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <Search size={15} className="text-slate-400" />
                    <input
                      type="search"
                      value={searchText}
                      autoFocus
                      onChange={(event) => setSearchText(event.target.value)}
                      placeholder="بحث في الأنشطة"
                      className="h-7 w-full border-0 bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#BEEFF2] bg-[#E8F9FA] px-3 text-xs font-black text-[#007A80] transition hover:bg-[#d9f3f5]"
            >
              <ArrowUpDown size={14} />
              {sortDirection === 'desc' ? 'الأحدث' : 'الأقدم'}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setDateFilterOpen((value) => !value)}
                className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-black transition ${hasDateFilter ? 'border-[#BEEFF2] bg-[#E8F9FA] text-[#007A80]' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                <CalendarRange size={14} />
                {hasDateFilter ? 'تاريخ محدد' : 'تاريخ'}
              </button>

              {dateFilterOpen && (
                <div className="absolute left-0 top-full z-20 mt-2 w-[280px] rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="space-y-1 text-[11px] font-black text-slate-700">
                      <span>من</span>
                      <input
                        type="date"
                        value={fromDate}
                        max={toDate || undefined}
                        onChange={(event) => setFromDate(event.target.value)}
                        className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-[#00AEB8] focus:bg-white"
                      />
                    </label>

                    <label className="space-y-1 text-[11px] font-black text-slate-700">
                      <span>إلى</span>
                      <input
                        type="date"
                        value={toDate}
                        min={fromDate || undefined}
                        onChange={(event) => setToDate(event.target.value)}
                        className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-[#00AEB8] focus:bg-white"
                      />
                    </label>
                  </div>

                  {hasDateFilter && (
                    <button
                      type="button"
                      onClick={() => {
                        setFromDate('')
                        setToDate('')
                      }}
                      className="mt-3 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-black text-slate-600 transition hover:bg-slate-100"
                    >
                      <X size={12} />
                      مسح التاريخ
                    </button>
                  )}
                </div>
              )}
            </div>

            <select
              value={selectedUser}
              onChange={(event) => setSelectedUser(event.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#00AEB8] focus:bg-white"
            >
              <option value="all">المستخدمين</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                setSelectedUser('all')
                setFromDate('')
                setToDate('')
                setSearchText('')
                setSearchOpen(false)
              }}
              className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:bg-slate-50"
            >
              مسح الفلاتر
            </button>
          </div>
        </div>
      </div>

      {grouped.length ? (
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pe-1">
          {grouped.map((group) => (
            <ActivityDateGroup
              key={group.key}
              group={group}
              expandedId={expandedId}
              onToggleExpanded={setExpandedId}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-500">
            <Activity size={22} />
          </div>
          <h4 className="mt-3 text-sm font-black text-slate-800">لا توجد أنشطة مسجلة حتى الآن</h4>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            سيظهر هنا سجل التفاعلات والتغييرات التي تتم على العميل.
          </p>
        </div>
      )}
    </div>
  )
}
