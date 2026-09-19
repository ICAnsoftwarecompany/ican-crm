import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AppDrawer } from '../../../../shared/components/overlays/AppDrawer'
import { MeetingDataDrawer } from '../../../call-meetings/components/MeetingDataDrawer'
import { ActivityLifecycleActions } from '../ActivityStatus/ActivityLifecycleActions'
import { ActivityDrawerHeader } from './ActivityDrawerHeader'
import { ActivityFilesTab } from './ActivityFilesTab'
import { ActivityHistoryTab } from './ActivityHistoryTab'
import { ActivityNotesTab } from './ActivityNotesTab'
import { ActivityOverviewTab } from './ActivityOverviewTab'
import { ActivityParticipantsTab } from './ActivityParticipantsTab'
import { ActivityPreparationTab } from './ActivityPreparationTab'
import { ActivityReportTab } from './ActivityReportTab'

export function ActivityDrawer({
  activity,
  open,
  onClose,
  onOpenRelated,
  onEdit,
  onStart,
  onFinish,
  onCancel,
  onDelete,
  onFollowUp,
}) {
  const { t } = useTranslation()
  const isCallOrMeeting = activity?.type === 'call' || activity?.type === 'meeting'
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (open) setActiveTab('overview')
  }, [open, activity?.id])

  const baseTabs = useMemo(() => [
    { id: 'overview', label: t('activities.drawer.tabs.overview') },
    { id: 'preparation', label: t('activities.drawer.tabs.preparation') },
    { id: 'report', label: t('activities.table.report') },
    { id: 'notes', label: t('activities.meetingDrawer.tabs.notes') },
    { id: 'files', label: t('activities.drawer.tabs.files') },
    { id: 'history', label: t('activities.drawer.tabs.history') },
  ], [t])

  const tabs = useMemo(() => {
    if (activity?.type !== 'meeting') return baseTabs
    return [
      ...baseTabs.slice(0, 5),
      { id: 'participants', label: t('activities.meetingDrawer.tabs.participants') },
      ...baseTabs.slice(5),
    ]
  }, [activity?.type, baseTabs, t])

  const body = () => {
    if (!activity) return null

    if (activeTab === 'overview') return <ActivityOverviewTab activity={activity} />
    if (activeTab === 'preparation') return <ActivityPreparationTab activity={activity} />
    if (activeTab === 'report') return <ActivityReportTab activity={activity} onFinish={() => onFinish?.(activity)} />
    if (activeTab === 'notes') return <ActivityNotesTab activity={activity} />
    if (activeTab === 'files') return <ActivityFilesTab activity={activity} />
    if (activeTab === 'participants') return <ActivityParticipantsTab activity={activity} />
    if (activeTab === 'history') return <ActivityHistoryTab activity={activity} />
    return null
  }


  if (isCallOrMeeting) {
    return (
      <MeetingDataDrawer
        open={open}
        onClose={onClose}
        schedule={activity}
        customer={activity?.customer || activity?.relatedEntity || null}
      />
    )
  }
  
  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      title={t('activities.drawer.detailsTitle')}
      size="xl"
      drawerKey="activity-drawer"
      portal
      pushPage={false}
      maxWidth={980}
      headerActions={activity ? (
        <ActivityLifecycleActions
          activity={activity}
          onView={() => {}}
          onEdit={() => onEdit?.(activity)}
          onStart={() => onStart?.(activity)}
          onFinish={() => onFinish?.(activity)}
          onCancel={() => onCancel?.(activity)}
          onDelete={() => onDelete?.(activity)}
          onFollowUp={() => onFollowUp?.(activity)}
          compact
        />
      ) : null}
    >
      {activity ? (
        <div className="space-y-4">
          <ActivityDrawerHeader activity={activity} onOpenRelated={onOpenRelated} />
          <div className="flex gap-1 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`h-9 shrink-0 rounded-md px-3 text-xs font-black transition ${
                  activeTab === tab.id ? 'bg-[var(--surface)] text-[#007A80] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {body()}
        </div>
      ) : null}
    </AppDrawer>
  )
}
