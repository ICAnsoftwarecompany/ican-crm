import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'

import { ACTIVITY_VIEW_MODES } from '../constants/activityConstants'
import { AfterMeetingReportDrawer, ScheduleActivityDialog } from '../../call-meetings'
import { customersApi } from '../../customers/api/customersApi'
import { definitionsApi } from '../../definitions/api/definitionsApi'
import { useActivities } from '../hooks/useActivities'
import { useActivityFilters } from '../hooks/useActivityFilters'
import { useActivityMutations } from '../hooks/useActivityMutations'
import { useActivityStatistics } from '../hooks/useActivityStatistics'
import { ActivityCalendar } from '../components/ActivityCalendar/ActivityCalendar'
import { ActivityDrawer } from '../components/ActivityDrawer/ActivityDrawer'
import { ActivityFormDialog } from '../components/ActivityForm/ActivityFormDialog'
import { ActivityHeader } from '../components/ActivityHeader/ActivityHeader'
import { ActivityReportDialog } from '../components/ActivityReport/ActivityReportDialog'
import { ActivityStats } from '../components/ActivityStats/ActivityStats'
import { ActivityTable } from '../components/ActivityTable/ActivityTable'
import { ActivityTabs } from '../components/ActivityTabs/ActivityTabs'
import { EmptyActivitiesState } from '../components/common/EmptyActivitiesState'
import { extractLeadStatuses } from '../../../pages/customers/utils/customerStatus'
import { extractList, extractMessage } from '../../../shared/utils/apiResponse'

function parseActivityDateTime(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '')
}

function getReminderWindowMs(activity) {
  const before = Number(firstValue(activity?.reminderBefore, activity?.raw?.reminder_before))
  if (!Number.isFinite(before) || before <= 0) return 0

  const unit = String(firstValue(activity?.reminderUnit, activity?.raw?.reminder_unit, '')).trim().toLowerCase()
  const map = {
    minute: 60 * 1000,
    minutes: 60 * 1000,
    min: 60 * 1000,
    mins: 60 * 1000,
    hour: 60 * 60 * 1000,
    hours: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
  }

  return before * (map[unit] || 60 * 1000)
}

function getPriorityAlertRowClass(priority, { overdue = false } = {}) {
  const normalizedPriority = String(priority || '').trim().toLowerCase()

  if (normalizedPriority === 'urgent') {
    return overdue
      ? 'bg-[#FCA5A5] hover:!bg-[#F87171]'
      : 'bg-[#FEE2E2] hover:!bg-[#FECACA]'
  }

  if (normalizedPriority === 'high') {
    return overdue
      ? 'bg-[#FECACA] hover:!bg-[#FCA5A5]'
      : 'bg-[#FFF1F2] hover:!bg-[#FFE4E6]'
  }

  if (normalizedPriority === 'medium') {
    return overdue
      ? 'bg-[#FED7AA] hover:!bg-[#FDBA74]'
      : 'bg-[#FFF7ED] hover:!bg-[#FFEDD5]'
  }

  return overdue
    ? 'bg-[#FEF3C7] hover:!bg-[#FDE68A]'
    : 'bg-[#FFFBEB] hover:!bg-[#FEF3C7]'
}

function getActivityAlertRowClass(activity, nowTimestamp = Date.now()) {
  const status = String(activity?.status || '').trim().toLowerCase()
  const priority = firstValue(activity?.priority, activity?.raw?.priority, 'low')

  if (status === 'cancelled' || status === 'completed') return ''

  if (status === 'in_progress') {
    return getPriorityAlertRowClass(priority, { overdue: true })
  }

  if (status !== 'scheduled') return ''

  const startAt = parseActivityDateTime(firstValue(activity?.startAt, activity?.raw?.start_at))
  if (!startAt) return ''

  const msUntilStart = startAt.getTime() - nowTimestamp
  const reminderWindow = getReminderWindowMs(activity)

  if (msUntilStart <= 0) {
    return getPriorityAlertRowClass(priority, { overdue: true })
  }

  if (reminderWindow > 0 && msUntilStart <= reminderWindow) {
    return getPriorityAlertRowClass(priority)
  }

  return ''
}

function formatClockParts(totalMs) {
  const absMs = Math.max(0, Math.abs(totalMs))
  const totalSeconds = Math.floor(absMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function getElapsedDuration(activity, nowTimestamp = Date.now()) {
  const actualStartAt = parseActivityDateTime(firstValue(activity?.actualStartAt, activity?.raw?.actual_start_at))
  if (!actualStartAt) return ''
  return formatClockParts(nowTimestamp - actualStartAt.getTime())
}

const ACTIVITY_ROWS_BATCH_SIZE = 30

export function ActivitiesPage({ defaultType = 'all', defaultView = ACTIVITY_VIEW_MODES.list }) {
  const navigate = useNavigate()
  const filtersState = useActivityFilters(defaultType, defaultView)
  const activitiesQuery = useActivities(filtersState.apiParams)
  const customersQuery = useQuery({
    queryKey: ['activities', 'customers-name-lookup'],
    queryFn: () => customersApi.getCustomers(),
    staleTime: 1000 * 60,
  })
  const statusesQuery = useQuery({
    queryKey: ['activities', 'lead-statuses-lookup'],
    queryFn: () => definitionsApi.getStatuses(),
    staleTime: 1000 * 60,
    select: extractLeadStatuses,
  })
  const mutations = useActivityMutations()
  const [nowTimestamp, setNowTimestamp] = useState(Date.now())
  const [drawerActivity, setDrawerActivity] = useState(null)
  const [formState, setFormState] = useState({ open: false, type: 'call', activity: null })
  const [reportActivity, setReportActivity] = useState(null)
  const [afterMeetingReportActivity, setAfterMeetingReportActivity] = useState(null)
  const [scheduleDialogType, setScheduleDialogType] = useState(null)
  const [visibleRowsLimit, setVisibleRowsLimit] = useState(ACTIVITY_ROWS_BATCH_SIZE)

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNowTimestamp(Date.now())
    }, 1000)

    return () => {
      window.clearInterval(timerId)
    }
  }, [])

  const activities = activitiesQuery.data?.data || []
  const leadStatusesById = useMemo(() => {
    const map = new Map()
    ;(statusesQuery.data || []).forEach((status) => {
      const key = status?.id
      if (key === null || key === undefined || key === '') return
      map.set(String(key), status?.status || status?.name || '')
    })
    return map
  }, [statusesQuery.data])

  const customerDataLookup = useMemo(() => {
    const rows = Array.isArray(customersQuery.data?.data)
      ? customersQuery.data.data
      : extractList(customersQuery.data, ['data', 'customers'])

    const map = new Map()
    rows.forEach((item) => {
      const customerId = item?.id
      const leadId = item?.lead_id
      const statusTypeId = item?.lead?.status_type_id ?? item?.status_type_id ?? null
      const statusNameFromLookup = statusTypeId !== null && statusTypeId !== undefined && statusTypeId !== ''
        ? leadStatusesById.get(String(statusTypeId))
        : ''
      const statusName = statusNameFromLookup || item?.lead?.status?.status || item?.lead?.status?.name || ''

      const payload = {
        name: item?.name || item?.email || item?.phone || '',
        email: item?.email || item?.lead?.email || '',
        phone: item?.phone || item?.lead?.phone || '',
        company: item?.company || item?.lead?.company || '',
        source: item?.source || item?.lead?.source || '',
        agentName: item?.agent?.name || item?.agent?.username || item?.agent_name || '',
        statusTypeId,
        statusName,
      }

      if (customerId !== null && customerId !== undefined && customerId !== '') {
        map.set(`customer:${String(customerId)}`, payload)
      }

      if (leadId !== null && leadId !== undefined && leadId !== '') {
        map.set(`lead:${String(leadId)}`, payload)
      }
    })

    return map
  }, [customersQuery.data, leadStatusesById])

  const scopedActivities = useMemo(() => {
    const activeType = filtersState.filters.type
    if (!activeType || activeType === 'all') return activities
    return activities.filter((activity) => activity?.type === activeType)
  }, [activities, filtersState.filters.type])
  const visibleActivities = useMemo(() => (
    scopedActivities.slice(0, visibleRowsLimit)
  ), [scopedActivities, visibleRowsLimit])
  const hasMoreVisibleActivities = visibleRowsLimit < scopedActivities.length
  const apiParamsSignature = useMemo(() => JSON.stringify(filtersState.apiParams), [filtersState.apiParams])

  useEffect(() => {
    setVisibleRowsLimit(ACTIVITY_ROWS_BATCH_SIZE)
  }, [apiParamsSignature])

  const loadMoreVisibleActivities = useCallback(() => {
    setVisibleRowsLimit((current) => Math.min(current + ACTIVITY_ROWS_BATCH_SIZE, scopedActivities.length))
  }, [scopedActivities.length])

  const stats = useActivityStatistics(scopedActivities)
  const isFiltered = useMemo(() => (
    Boolean(filtersState.filters.search)
    || filtersState.filters.status !== 'all'
    || filtersState.filters.priority !== 'all'
    || Boolean(filtersState.filters.assigned_to)
    || Boolean(filtersState.filters.team_id)
    || Boolean(filtersState.filters.date_from)
    || Boolean(filtersState.filters.date_to)
  ), [filtersState.filters])

  const openCreateDialog = useCallback((type) => {
    setFormState({
      open: true,
      type: type || (filtersState.filters.type === 'meeting' ? 'meeting' : 'call'),
      activity: null,
    })
  }, [filtersState.filters.type])

  const openEditDialog = useCallback((activity) => {
    setFormState({
      open: true,
      type: activity?.type || 'call',
      activity,
    })
  }, [])

  const closeFormDialog = useCallback(() => {
    setFormState((current) => ({ ...current, open: false }))
  }, [])

  const handleStart = useCallback(async (activity) => {
    try {
      await mutations.start.mutateAsync(activity.id)
      toast.success(activity.type === 'call' ? 'تم بدء المكالمة.' : 'تم بدء الاجتماع.')
    } catch (error) {
      toast.error(extractMessage(error, 'تعذر بدء النشاط'))
    }
  }, [mutations.start])

  const handleCancel = useCallback(async (activity) => {
    const ok = window.confirm('هل تريد إلغاء هذا النشاط؟')
    if (!ok) return

    try {
      await mutations.cancel.mutateAsync(activity.id)
      toast.success('تم إلغاء النشاط.')
    } catch (error) {
      toast.error(extractMessage(error, 'تعذر إلغاء النشاط'))
    }
  }, [mutations.cancel])

  const handleDelete = useCallback(async (activity) => {
    const ok = window.confirm('هل تريد حذف هذا النشاط نهائيا؟')
    if (!ok) return

    try {
      await mutations.remove.mutateAsync(activity.id)
      toast.success('تم حذف النشاط.')
      if (drawerActivity?.id === activity.id) setDrawerActivity(null)
    } catch (error) {
      toast.error(extractMessage(error, 'تعذر حذف النشاط'))
    }
  }, [drawerActivity?.id, mutations.remove])

  const handleFollowUp = useCallback((activity) => {
    setFormState({
      open: true,
      type: activity?.type || 'call',
      activity: {
        ...activity,
        id: null,
        title: `متابعة - ${activity.title}`,
        status: 'scheduled',
        startAt: undefined,
        endAt: undefined,
      },
    })
  }, [])

  const handleOpenRelated = useCallback((activity) => {
    const id = activity?.relatedEntity?.id || activity?.raw?.taskable_id
    if (!id) return
    navigate(`/lead/${id}`)
  }, [navigate])

  const handleFinish = useCallback(async (activity) => {
    if (activity?.type === 'meeting') {
      try {
        await mutations.complete.mutateAsync(activity.id)
      } catch (error) {
        toast.error(extractMessage(error, 'تعذر إنهاء الاجتماع'))
        return
      }

      setAfterMeetingReportActivity(activity)
      return
    }

    setReportActivity(activity)
  }, [mutations.complete])

  const rowClassName = useCallback((activity) => {
    return getActivityAlertRowClass(activity, nowTimestamp)
  }, [nowTimestamp])

  const rowContextActions = useCallback(({ row }) => {
    if (!row) return []

    const status = String(row?.status || '').trim().toLowerCase()
    const activityLabel = row?.type === 'call' ? 'المكالمة' : 'الاجتماع'
    const actions = [
      {
        id: 'activities-view-details',
        label: `فتح تفاصيل ${activityLabel}`,
        section: 'إجراءات الصفحة',
        tab: 'actions',
        onClick: () => setDrawerActivity(row),
      },
    ]

    if (filtersState.filters.type === 'meeting') {
      actions.unshift({
        id: 'activities-create-meeting',
        label: 'إضافة اجتماع جديد',
        section: 'إجراءات الاجتماعات',
        tab: 'actions',
        onClick: () => setScheduleDialogType('meeting'),
      })
    }

    if (status === 'scheduled') {
      actions.push(
        {
          id: 'activities-start',
          label: `بدء ${activityLabel}`,
          section: 'إجراءات الصفحة',
          tab: 'actions',
          onClick: () => handleStart(row),
        },
        {
          id: 'activities-cancel',
          label: `إلغاء ${activityLabel}`,
          section: 'إجراءات الصفحة',
          tab: 'actions',
          onClick: () => handleCancel(row),
        }
      )
    }

    if (status === 'in_progress') {
      actions.push({
        id: 'activities-finish',
        label: `إنهاء ${activityLabel}`,
        section: 'إجراءات الصفحة',
        tab: 'actions',
        onClick: () => handleFinish(row),
      })
    }

    return actions
  }, [filtersState.filters.type, handleCancel, handleFinish, handleStart])

  const commonActions = {
    onView: setDrawerActivity,
    onEdit: openEditDialog,
    onStart: handleStart,
    onFinish: handleFinish,
    onCancel: handleCancel,
    onDelete: handleDelete,
    onFollowUp: handleFollowUp,
    onOpenRelated: handleOpenRelated,
  }

  return (
    <main className="space-y-4 p-4">
      <ActivityHeader
        onCreate={() => setScheduleDialogType(filtersState.filters.type === 'meeting' ? 'meeting' : 'call')}
        onCreateCall={() => setScheduleDialogType('call')}
        onCreateMeeting={() => setScheduleDialogType('meeting')}
      />

      <ActivityStats stats={stats} />

      <ActivityTabs
        type={filtersState.filters.type}
        view={filtersState.filters.view}
        onTypeChange={filtersState.setType}
        onViewChange={filtersState.setViewMode}
      />

      {activitiesQuery.isLoading ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-sm font-bold text-[var(--text-muted)]">
          جاري تحميل الأنشطة...
        </div>
      ) : !scopedActivities.length ? (
        <EmptyActivitiesState
          title={isFiltered ? 'لا توجد نتائج مطابقة' : 'لا توجد مكالمات أو اجتماعات بعد'}
          description={isFiltered ? 'غير الفلاتر أو امسحها لعرض أنشطة أخرى.' : 'أنشئ أول نشاط لإدارة متابعة العملاء من مكان واحد.'}
          onCreate={() => setScheduleDialogType(filtersState.filters.type === 'meeting' ? 'meeting' : 'call')}
          onClearFilters={isFiltered ? filtersState.clearFilters : undefined}
        />
      ) : filtersState.filters.view === ACTIVITY_VIEW_MODES.calendar ? (
        <ActivityCalendar activities={scopedActivities} onActivityClick={setDrawerActivity} />
      ) : (
        <ActivityTable
          activities={visibleActivities}
          isLoading={activitiesQuery.isFetching}
          error={activitiesQuery.error}
          onRetry={activitiesQuery.refetch}
          onRowClick={setDrawerActivity}
          customerDataLookup={customerDataLookup}
          rowClassName={rowClassName}
          rowContextActions={rowContextActions}
          nowTimestamp={nowTimestamp}
          hasMore={hasMoreVisibleActivities}
          isLoadingMore={false}
          onLoadMore={hasMoreVisibleActivities ? loadMoreVisibleActivities : undefined}
          {...commonActions}
        />
      )}

      <ActivityDrawer
        activity={drawerActivity}
        open={Boolean(drawerActivity)}
        onClose={() => setDrawerActivity(null)}
        {...commonActions}
      />

      <ActivityFormDialog
        isOpen={formState.open}
        onClose={closeFormDialog}
        initialType={formState.type}
        activity={formState.activity}
      />

      <ActivityReportDialog
        isOpen={Boolean(reportActivity)}
        activity={reportActivity}
        onClose={() => setReportActivity(null)}
      />

      <AfterMeetingReportDrawer
        open={Boolean(afterMeetingReportActivity)}
        meetingId={afterMeetingReportActivity?.id}
        meetingTitle={afterMeetingReportActivity?.title}
        elapsedDuration={getElapsedDuration(afterMeetingReportActivity, nowTimestamp)}
        onClose={() => setAfterMeetingReportActivity(null)}
        onSaved={async () => {
          setAfterMeetingReportActivity(null)
          await activitiesQuery.refetch()
        }}
      />

      <ScheduleActivityDialog
        type={scheduleDialogType || 'call'}
        isOpen={Boolean(scheduleDialogType)}
        onClose={() => setScheduleDialogType(null)}
        presentation="drawer"
        allowEntityBinding
        relatedType="lead"
        onCreated={async () => {
          setScheduleDialogType(null)
          await activitiesQuery.refetch()
        }}
      />
    </main>
  )
}
