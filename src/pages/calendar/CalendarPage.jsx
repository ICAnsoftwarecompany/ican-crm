import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarDays } from 'lucide-react'
import { toast } from 'sonner'

import { Calendar } from '../../shared/components/calendar'
import { usePageHeader } from '../../shared/hooks/usePageHeader'
import { extractMessage } from '../../shared/utils/apiResponse'
import { formatDateInput, formatTimeInput } from '../../shared/utils/dateTime'

import { calendarSourceRegistry, CALENDAR_SOURCE_IDS } from '../../features/calendar/constants/calendarSources'
import { useCalendarEvents } from '../../features/calendar/hooks/useCalendarEvents'
import { useVisibleSources } from '../../features/calendar/hooks/useVisibleSources'
import { buildTaskUpdatePayload } from '../../features/calendar/adapters/taskEventAdapter'
import { CreateEventMenu } from '../../features/calendar/components/CreateEventMenu'
import { ActivityPreviewDrawer } from '../../features/calendar/components/ActivityPreviewDrawer'

import { useTaskMutations } from '../../features/tasks/hooks/useTasks'
import { TaskDrawer } from '../../features/tasks/components/TaskDrawer'
import { TaskFormDialog } from '../../features/tasks/components/TaskFormDialog'
import { ActivityFormDialog } from '../../features/activities'

const CALENDAR_SOURCES = calendarSourceRegistry.getAll()

export function CalendarPage() {
  const { t } = useTranslation()
  const { events, isLoading, error, refetch } = useCalendarEvents()
  const [visibleSourceIds, toggleSource] = useVisibleSources(CALENDAR_SOURCE_IDS)
  const taskMutations = useTaskMutations()

  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [selectedActivity, setSelectedActivity] = useState(null)

  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [createTaskInitialValues, setCreateTaskInitialValues] = useState(null)

  const [activityCreateType, setActivityCreateType] = useState(null)

  usePageHeader({ title: t('calendar.pageTitle'), icon: CalendarDays })

  const handleEventClick = (event) => {
    if (event.sourceId === 'tasks') setSelectedTaskId(event.rawId)
    else setSelectedActivity(event.raw)
  }

  const openCreateTask = (date) => {
    if (date) {
      const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0
      setCreateTaskInitialValues({
        due_date: formatDateInput(date),
        due_time: hasTime ? formatTimeInput(date) : '',
      })
    } else {
      setCreateTaskInitialValues(null)
    }
    setIsCreateTaskOpen(true)
  }

  const handleCreateTask = async (payload) => {
    try {
      await taskMutations.create.mutateAsync(payload)
      toast.success(t('calendar.taskCreated'))
      setIsCreateTaskOpen(false)
      setCreateTaskInitialValues(null)
      refetch()
    } catch (taskError) {
      toast.error(extractMessage(taskError))
    }
  }

  const handleEventDrop = async (event, newDate) => {
    if (event.sourceId !== 'tasks') return

    const payload = buildTaskUpdatePayload(event.raw, {
      due_date: formatDateInput(newDate),
      due_time: event.raw?.due_time || event.raw?.dueTime || '',
    })

    try {
      await taskMutations.update.mutateAsync({ taskId: event.rawId, payload })
      toast.success(t('calendar.eventRescheduled'))
      refetch()
    } catch (dropError) {
      toast.error(extractMessage(dropError))
    }
  }

  return (
    <>
      <Calendar
        events={events}
        sources={CALENDAR_SOURCES}
        visibleSourceIds={visibleSourceIds}
        onToggleSource={toggleSource}
        onEventClick={handleEventClick}
        onSlotClick={openCreateTask}
        onEventDrop={handleEventDrop}
        canDragEvent={(event) => event.sourceId === 'tasks'}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        className="h-[calc(100vh-var(--header-height)-3rem)]"
        createSlot={(
          <CreateEventMenu
            onCreateTask={() => openCreateTask(null)}
            onCreateMeeting={() => setActivityCreateType('meeting')}
            onCreateCall={() => setActivityCreateType('call')}
          />
        )}
      />

      <TaskDrawer
        open={Boolean(selectedTaskId)}
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onUpdated={refetch}
        onDeleted={() => {
          setSelectedTaskId(null)
          refetch()
        }}
      />

      <ActivityPreviewDrawer
        activity={selectedActivity}
        open={Boolean(selectedActivity)}
        onClose={() => setSelectedActivity(null)}
        onSaved={refetch}
      />

      <TaskFormDialog
        open={isCreateTaskOpen}
        onClose={() => {
          setIsCreateTaskOpen(false)
          setCreateTaskInitialValues(null)
        }}
        onSubmit={handleCreateTask}
        isSaving={taskMutations.create.isPending}
        initialValues={createTaskInitialValues}
      />

      <ActivityFormDialog
        isOpen={Boolean(activityCreateType)}
        initialType={activityCreateType || 'meeting'}
        onClose={() => setActivityCreateType(null)}
        onSaved={() => {
          setActivityCreateType(null)
          refetch()
        }}
      />
    </>
  )
}
