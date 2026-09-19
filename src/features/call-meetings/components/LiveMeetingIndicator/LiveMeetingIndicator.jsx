import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarClock, Radio, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import { useMeetingInfo, useMeetings } from '../../../meetings/hooks/useMeetings'
import { fieldValue, formatDateTime12 } from '../../utils/scheduleUiUtils'
import { getMeetingInfoPayload, getParticipantUserId } from '../ScheduleDetails/scheduleDetailsUtils'
import { MeetingDataDrawer } from '../MeetingDataDrawer'
import { useAuthStore } from '../../../../store/authStore'

function isLiveMeeting(meeting) {
  return String(meeting?.type || '').toLowerCase() === 'meeting' &&
    String(meeting?.status || '').toLowerCase() === 'in_progress'
}

function getMeetingTime(meeting) {
  const value = meeting?.actual_start_at || meeting?.start_at || meeting?.created_at
  const time = new Date(value || 0).getTime()
  return Number.isNaN(time) ? 0 : time
}

function getCustomerName(meeting) {
  return meeting?.taskable?.name || meeting?.lead?.name || meeting?.customer?.name || '-'
}

function LiveMeetingPreview({ meeting, count, canOpenMeeting }) {
  const { t } = useTranslation()
  if (!meeting) return null

  return (
    <div className="w-80 max-w-[calc(100vw-1rem)] space-y-2 rounded-xl border border-[#BEEFF2] bg-white p-3 text-xs shadow-2xl">
      <div className="flex items-center gap-2 text-sm font-black text-[#0F766E]">
        <Radio size={15} />
        {t('callMeetings.liveIndicator.liveMeetingRunning')}
        {count > 1 ? <span className="rounded-full bg-[#EAFBFC] px-2 py-0.5 text-[10px] text-[#007A80]">+{count - 1}</span> : null}
      </div>
      <div className="break-words font-black text-[var(--text)]">{fieldValue(meeting.title, t('callMeetings.liveIndicator.untitled'))}</div>
      <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--text-muted)]">
        <UserRound size={12} />
        {getCustomerName(meeting)}
      </div>
      <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--text-muted)]">
        <CalendarClock size={12} />
        {t('callMeetings.liveIndicator.actualStartLabel', { value: formatDateTime12(meeting.actual_start_at || meeting.start_at) })}
      </div>
      {canOpenMeeting && meeting.meeting_link ? (
        <div className="break-all rounded-lg bg-[#F8FEFF] px-2 py-1 text-[11px] font-semibold text-[#007A80]">
          {meeting.meeting_link}
        </div>
      ) : null}
      {!canOpenMeeting ? (
        <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-2 py-1 text-[11px] font-semibold text-[#991B1B]">
          {t('callMeetings.liveIndicator.noPermissionToViewLink')}
        </div>
      ) : null}
    </div>
  )
}

export function LiveMeetingIndicator() {
  const { t } = useTranslation()
  const [previewPosition, setPreviewPosition] = useState(null)
  const [drawerMeetingId, setDrawerMeetingId] = useState(null)
  const currentUser = useAuthStore((state) => state.user)
  const currentUserId = String(currentUser?.id || '').trim()
  const meetingsQuery = useMeetings(
    { type: 'meeting', status: 'in_progress' },
    {
      refetchInterval: 15000,
      staleTime: 5000,
    },
  )

  const liveMeetings = useMemo(
    () => (meetingsQuery.data || [])
      .filter(isLiveMeeting)
      .sort((first, second) => getMeetingTime(second) - getMeetingTime(first)),
    [meetingsQuery.data],
  )
  const activeMeeting = liveMeetings[0]
  const activeMeetingId = String(activeMeeting?.id || '').trim()
  const activeMeetingInfoQuery = useMeetingInfo(activeMeetingId, undefined, {
    enabled: Boolean(activeMeetingId),
    staleTime: 5000,
  })
  const activeMeetingInfo = getMeetingInfoPayload(activeMeetingInfoQuery.data, activeMeeting)
  const participants = Array.isArray(activeMeetingInfo?.participants) ? activeMeetingInfo.participants : []
  const isCurrentUserParticipant = useMemo(() => {
    if (!currentUserId) return false

    return participants.some((participant) => String(getParticipantUserId(participant) || '') === currentUserId)
  }, [currentUserId, participants])

  if (!activeMeeting) return null

  const showPreview = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const width = Math.min(320, window.innerWidth - 16)
    setPreviewPosition({
      top: rect.bottom + 8,
      left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)),
      width,
    })
  }

  const handleOpenLiveMeetingDrawer = () => {
    if (!activeMeetingId) return

    if (!currentUserId) {
      toast.error(t('callMeetings.liveIndicator.userIdentifyError'))
      return
    }

    if (activeMeetingInfoQuery.isLoading) {
      toast.info(t('callMeetings.liveIndicator.checkingPermission'))
      return
    }

    if (activeMeetingInfoQuery.isError) {
      toast.error(t('callMeetings.liveIndicator.checkParticipantsFailed'))
      return
    }

    if (!isCurrentUserParticipant) {
      toast.error(t('callMeetings.liveIndicator.notParticipantError'))
      return
    }

    setDrawerMeetingId(activeMeetingId)
  }

  return (
    <>
      <button
        type="button"
        onMouseEnter={showPreview}
        onMouseLeave={() => setPreviewPosition(null)}
        onFocus={showPreview}
        onBlur={() => setPreviewPosition(null)}
        onClick={handleOpenLiveMeetingDrawer}
        className="relative inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#7FDDE1] bg-[#F3FDFF] px-2 text-xs font-black text-[#007A80] transition-colors hover:bg-[#E8F9FA]"
        aria-label={t('callMeetings.liveIndicator.ariaLabel')}
      >
        <span className="relative flex size-4 items-center justify-center">
          <span className="absolute inline-flex size-4 animate-ping rounded-full bg-[#00C2CB] opacity-40" />
          <Radio size={15} className="relative" />
        </span>
        <span className="hidden lg:inline">{t('callMeetings.liveIndicator.live')}</span>
        {liveMeetings.length > 1 ? (
          <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] text-[#0F766E]">
            {liveMeetings.length}
          </span>
        ) : null}
      </button>

      {previewPosition && typeof document !== 'undefined' ? createPortal(
        <div
          className="fixed z-[180000]"
          style={{
            top: previewPosition.top,
            left: previewPosition.left,
            width: previewPosition.width,
          }}
        >
          <LiveMeetingPreview
            meeting={activeMeetingInfo}
            count={liveMeetings.length}
            canOpenMeeting={isCurrentUserParticipant}
          />
        </div>,
        document.body,
      ) : null}

      <MeetingDataDrawer
        open={Boolean(drawerMeetingId)}
        onClose={() => setDrawerMeetingId(null)}
        meetingId={drawerMeetingId}
        allowComplete
      />
    </>
  )
}
