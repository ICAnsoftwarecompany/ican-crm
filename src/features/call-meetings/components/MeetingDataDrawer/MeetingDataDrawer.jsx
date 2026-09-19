import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Loader2,
  MapPin,
  Paperclip,
  Phone,
  Radio,
  Receipt,
  StickyNote,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import { useMeetingInfo, useMeetingMutations } from '../../../meetings/hooks/useMeetings'
import { AppDrawer } from '../../../../shared/components/overlays/AppDrawer'
import { Button } from '../../../../shared/components/ui/Button'
import { buildScheduleStatusPayload, fieldValue, formatDateTime12, formatElapsedDuration, formatElapsedSince } from '../../utils/scheduleUiUtils'
import {
  getMeetingInfoPayload,
  getParticipantUserId,
  getScheduleStatusBadgeClasses,
  getScheduleStatusLabel,
  getScheduleTypeLabel,
} from '../ScheduleDetails/scheduleDetailsUtils'
import { PreMeetingReportDrawer } from '../PreMeetingReportDrawer'
import { AfterMeetingReportDrawer } from '../AfterMeetingReportDrawer'

const MAIN_DRAWER_WIDTH = 980
const SIDE_DRAWER_OFFSET_VAR = '--meeting-data-drawer-offset'

function hasValue(value) {
  return !(value === null || value === undefined || value === '')
}

function getPersonName(person) {
  return person?.name || person?.username || person?.email || '-'
}

function getNormalizedType(type) {
  return String(type || '').trim().toLowerCase()
}

function getNormalizedStatus(status) {
  return String(status || '').trim().toLowerCase()
}

function getCountdown(startAt, nowTimestamp, t) {
  if (!startAt) return ''
  const startTime = new Date(startAt).getTime()
  if (Number.isNaN(startTime)) return ''

  const diff = startTime - nowTimestamp
  if (diff > 0) return t('activities.meetingDrawer.countdown.startsIn', { value: formatElapsedDuration(diff, { includeSeconds: true }, t) })
  return t('activities.meetingDrawer.countdown.overdue', { value: formatElapsedDuration(Math.abs(diff), { includeSeconds: true }, t) })
}

function getElapsedDurationLabel(meeting, nowTimestamp, t) {
  const started = meeting?.actual_start_at || meeting?.start_at
  if (!started) return ''

  const startedAt = new Date(started).getTime()
  if (Number.isNaN(startedAt) || nowTimestamp < startedAt) return ''
  return formatElapsedDuration(nowTimestamp - startedAt, { includeSeconds: true }, t)
}

function InfoRow({ label, value, href }) {
  if (!hasValue(value)) return null

  return (
    <div className="min-w-0 rounded-lg border border-[#E5F7F8] bg-white p-3">
      <div className="text-[11px] font-black text-[#007A80]">{label}</div>
      {href && value ? (
        <a href={href} target="_blank" rel="noreferrer" className="mt-1 inline-flex max-w-full items-center gap-1 break-all text-xs font-bold text-[#0F766E] hover:underline">
          <span className="min-w-0 break-all">{fieldValue(value)}</span>
          <ExternalLink size={12} className="shrink-0" />
        </a>
      ) : (
        <div className="mt-1 break-words text-xs font-bold text-[var(--text)]">{fieldValue(value)}</div>
      )}
    </div>
  )
}

function DocumentPreview({ report }) {
  const { t } = useTranslation()
  const lines = String(report?.notes || report?.note || '').split('\n').map((line) => line.trim()).filter(Boolean)

  return (
    <section className="rounded-xl border border-[#BEEFF2] bg-[#F8FEFF] p-4">
      <div className="mb-3 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-center">
        <div className="text-base font-black text-[#0F172A]">{fieldValue(report?.title, t('activities.meetingDrawer.reportFallback'))}</div>
        <div className="mt-1 text-xs font-semibold text-[#64748B]">{formatDateTime12(report?.created_at)}</div>
      </div>

      {lines.length ? (
        <div className="space-y-2">
          {lines.map((line, index) => (
            <div key={`${report?.id || 'report'}-${index}`} className="rounded-lg border border-[#E5F7F8] bg-white p-2 text-xs font-semibold leading-6 text-[var(--text)]">
              {line}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs font-semibold text-[var(--text-muted)]">{t('activities.meetingDrawer.noReportContent')}</p>
      )}
    </section>
  )
}

function Section({ title, icon: Icon, children }) {
  return (
    <section className="space-y-2 rounded-xl border border-[#E5F7F8] bg-[#F8FEFF] p-3">
      <div className="flex items-center gap-2 text-sm font-black text-[var(--text)]">
        <Icon size={15} className="text-[#007A80]" />
        {title}
      </div>
      {children}
    </section>
  )
}

function ReportsSection({ reports = [], onOpenReport, onOpenPreForm, onOpenAfterForm }) {
  const { t } = useTranslation()

  if (!reports.length) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold text-[var(--text-muted)]">{t('activities.meetingDrawer.noReportsYet')}</p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onOpenPreForm}>{t('activities.meetingDrawer.addPreReport')}</Button>
          <Button type="button" variant="ai" onClick={onOpenAfterForm}>{t('activities.meetingDrawer.addAfterReport')}</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={onOpenPreForm}>{t('activities.meetingDrawer.addPreReport')}</Button>
        <Button type="button" variant="ai" onClick={onOpenAfterForm}>{t('activities.meetingDrawer.addAfterReport')}</Button>
      </div>

      {reports.map((report) => (
        <div key={report.id || `${report.created_at}-${report.title}`} className="rounded-lg border border-[#E5F7F8] bg-white p-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-black text-[var(--text)]">{fieldValue(report.title, t('activities.meetingDrawer.untitledReport'))}</span>
            <span className="rounded-full bg-[#F8FEFF] px-2 py-0.5 text-[10px] font-bold text-[var(--text-muted)]">#{fieldValue(report.id)}</span>
          </div>
          <div className="mt-1 text-[11px] font-semibold text-[var(--text-muted)]">
            {t('activities.meetingDrawer.byPrefix', { name: getPersonName(report.user), date: formatDateTime12(report.created_at) })}
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <InfoRow label={t('activities.meetingDrawer.fields.outcome')} value={report.outcome} />
            <InfoRow label={t('activities.meetingDrawer.fields.nextAction')} value={report.next_action} />
            <InfoRow label={t('activities.meetingDrawer.fields.rating')} value={report.rating} />
            <InfoRow label={t('activities.meetingDrawer.fields.updatedAt')} value={formatDateTime12(report.updated_at)} />
          </div>
          <div className="mt-2 flex justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenReport(report)}>
              <Receipt size={14} />
              {t('activities.meetingDrawer.viewReport')}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export function MeetingDataDrawer({
  open = false,
  onClose,
  meetingId,
  schedule,
  mode = 'drawer',
  onBack,
  onChanged,
  allowComplete = false,
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const mutations = useMeetingMutations()
  const resolvedMeetingId = String(meetingId || schedule?.id || '').trim()
  const [activeTab, setActiveTab] = useState('overview')
  const [openPreReportDrawer, setOpenPreReportDrawer] = useState(false)
  const [openAfterReportDrawer, setOpenAfterReportDrawer] = useState(false)
  const [previewReport, setPreviewReport] = useState(null)
  const [expandedParticipantId, setExpandedParticipantId] = useState(null)
  const [creatorHoverOpen, setCreatorHoverOpen] = useState(false)
  const [hoveredTab, setHoveredTab] = useState(null)
  const [isDrawerLocked, setIsDrawerLocked] = useState(false)
  const [nowTimestamp, setNowTimestamp] = useState(Date.now())
  const [finishElapsedDuration, setFinishElapsedDuration] = useState('')

  const infoQuery = useMeetingInfo(resolvedMeetingId, undefined, {
    enabled: mode === 'page' ? Boolean(resolvedMeetingId) : Boolean(open && resolvedMeetingId),
  })

  const meeting = getMeetingInfoPayload(infoQuery.data, schedule)
  const participants = Array.isArray(meeting?.participants) ? meeting.participants : []
  const attachments = Array.isArray(meeting?.attachments) ? meeting.attachments : []
  const notes = Array.isArray(meeting?.notes) ? meeting.notes : []
  const reports = Array.isArray(meeting?.reports) ? meeting.reports : []
  const isInProgress = getNormalizedStatus(meeting?.status) === 'in_progress'
  const isScheduled = getNormalizedStatus(meeting?.status) === 'scheduled'
  const isMeetingType = getNormalizedType(meeting?.type || schedule?.type) === 'meeting'
  const isCallType = getNormalizedType(meeting?.type || schedule?.type) === 'call'
  const countdownLabel = isScheduled ? getCountdown(meeting?.start_at, nowTimestamp, t) : ''
  const elapsedLabel = isInProgress ? getElapsedDurationLabel(meeting, nowTimestamp, t) : formatElapsedSince(meeting?.actual_start_at, nowTimestamp, { includeSeconds: true }, t)

  const reportCounts = useMemo(() => {
    const pre = reports.filter((report) => String(report?.title || '').toLowerCase().includes('pre')).length
    const after = reports.filter((report) => String(report?.title || '').toLowerCase().includes('after')).length
    return { pre, after }
  }, [reports])

  const tabs = useMemo(() => {
    const baseTabs = [
      { id: 'overview', label: t('activities.meetingDrawer.tabs.overview') },
      { id: 'timing', label: t('activities.meetingDrawer.tabs.timing') },
      { id: 'participants', label: t('activities.meetingDrawer.tabs.participants') },
      { id: 'notes', label: t('activities.meetingDrawer.tabs.notes') },
      { id: 'attachments', label: t('activities.meetingDrawer.tabs.attachments') },
    ]

    if (isMeetingType) {
      return [...baseTabs.slice(0, 3), { id: 'reports', label: t('activities.meetingDrawer.tabs.reports') }, ...baseTabs.slice(3)]
    }

    if (isCallType) {
      return [...baseTabs.slice(0, 2), { id: 'call', label: t('activities.meetingDrawer.tabs.call') }, ...baseTabs.slice(2)]
    }

    return baseTabs
  }, [isCallType, isMeetingType, t])

  const tabHoverContent = useMemo(() => {
    const timingLines = [
      [t('activities.meetingDrawer.fields.startAt'), formatDateTime12(meeting?.start_at)],
      [t('activities.meetingDrawer.fields.endAt'), formatDateTime12(meeting?.end_at)],
      [t('activities.meetingDrawer.fields.actualStart'), formatDateTime12(meeting?.actual_start_at)],
      [t('activities.meetingDrawer.fields.actualEnd'), formatDateTime12(meeting?.actual_end_at)],
    ].filter(([, value]) => hasValue(value))

    const participantNames = participants
      .map((participant) => getPersonName(participant.user || participant))
      .filter((name) => name !== '-')
      .slice(0, 8)

    const noteItems = notes
      .map((note) => fieldValue(note.note || note.body || note.text, t('activities.meetingDrawer.fields.noteFallback')))
      .filter(Boolean)
      .slice(0, 3)

    const attachmentItems = attachments
      .map((attachment) => attachment.name || attachment.file_name || attachment.filename || attachment.path || t('activities.meetingDrawer.attachmentFallback'))
      .filter(Boolean)
      .slice(0, 5)

    const reportTitles = reports
      .map((report) => fieldValue(report.title, t('activities.meetingDrawer.untitledReport')))
      .filter(Boolean)
      .slice(0, 5)

    return {
      timing: timingLines,
      participants: participantNames,
      notes: noteItems,
      attachments: attachmentItems,
      reports: reportTitles,
    }
  }, [attachments, meeting, notes, participants, reports, t])

  const refresh = async () => {
    await infoQuery.refetch()
    onChanged?.()
  }

  useEffect(() => {
    const shouldTick = mode === 'page' || open
    if (!shouldTick) return undefined

    const timer = window.setInterval(() => setNowTimestamp(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [mode, open])

  useEffect(() => {
    if (!tabs.some((tab) => tab.id === activeTab)) {
      setActiveTab('overview')
    }
  }, [activeTab, tabs])

  const openMeetingPage = () => {
    if (!resolvedMeetingId) return
    navigate(`/LeadsCenter/activities/meeting/${resolvedMeetingId}`, {
      state: { from: `${location.pathname}${location.search}` },
    })
  }

  const handleDrawerClose = isDrawerLocked ? () => {} : onClose

  const handleComplete = async () => {
    if (!resolvedMeetingId) return

    const elapsedAtFinish = getElapsedDurationLabel(meeting, Date.now(), t)
    await mutations.changeStatus.mutateAsync({
      meetingId: resolvedMeetingId,
      payload: buildScheduleStatusPayload('completed'),
    })
    toast.success(t('activities.meetingDrawer.meetingFinished'))
    if (isMeetingType) {
      setFinishElapsedDuration(elapsedAtFinish)
      setOpenAfterReportDrawer(true)
    }
    await refresh()
  }

  useEffect(() => {
    if (!open || !isDrawerLocked) return undefined

    const handleBeforeUnload = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDrawerLocked, open])

  const handleStart = async () => {
    if (!resolvedMeetingId) return

    await mutations.changeStatus.mutateAsync({
      meetingId: resolvedMeetingId,
      payload: buildScheduleStatusPayload('in_progress'),
    })
    toast.success(t('activities.meetingDrawer.meetingStarted'))
    await refresh()
  }

  const handleCancel = async () => {
    if (!resolvedMeetingId) return

    await mutations.changeStatus.mutateAsync({
      meetingId: resolvedMeetingId,
      payload: buildScheduleStatusPayload('cancelled'),
    })
    toast.success(t('activities.meetingDrawer.meetingCancelled'))
    await refresh()
  }

  const body = (
    <div className="space-y-3">
      {infoQuery.isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-[#E5F7F8] bg-[#F8FEFF] p-5 text-xs font-bold text-[#007A80]">
          <Loader2 size={15} className="animate-spin" />
          {t('activities.meetingDrawer.loadingMeeting')}
        </div>
      ) : null}

      {!infoQuery.isLoading && meeting ? (
        <>
          <section className="rounded-xl border border-[#BEEFF2] bg-[#F8FEFF] p-3">
            <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                {isInProgress ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-black text-[#0F766E]">
                    <Radio size={13} />
                    {t('activities.meetingDrawer.live')}
                  </span>
                ) : null}
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#007A80]">{getScheduleTypeLabel(meeting.type, t)}</span>
                <span className={`rounded-full border px-3 py-1 text-xs font-black ${getScheduleStatusBadgeClasses(meeting.status)}`}>
                  {getScheduleStatusLabel(meeting.status, t)}
                </span>
                <span className="rounded-full border border-[#FDE68A] bg-[#FEF3C7] px-3 py-1 text-xs font-black text-[#92400E]">{fieldValue(meeting.priority)}</span>
              </div>

              {isScheduled ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" variant="ai" size="sm" onClick={handleStart} loading={mutations.changeStatus.isPending}>
                    {t('activities.meetingDrawer.start')}
                  </Button>
                  <Button type="button" variant="danger" size="sm" onClick={handleCancel} loading={mutations.changeStatus.isPending}>
                    {t('actions.cancel')}
                  </Button>
                </div>
              ) : null}

              {(allowComplete || isMeetingType || isCallType) && isInProgress ? (
                <Button type="button" variant="danger" size="sm" onClick={handleComplete} loading={mutations.changeStatus.isPending}>
                  <CheckCircle2 size={14} />
                  {t('activities.meetingDrawer.finish')}
                </Button>
              ) : null}
            </div>

            <h3 className="mt-3 break-words text-base font-black text-[var(--text)]">{fieldValue(meeting.title, t('activities.preMeetingReport.untitled'))}</h3>
            {hasValue(meeting.description) ? (
              <p className="mt-1 whitespace-pre-wrap break-words text-xs font-semibold text-[var(--text-muted)]">{meeting.description}</p>
            ) : null}

            {isScheduled && countdownLabel ? (
              <div className="mt-3 rounded-lg border border-[#CFEFF1] bg-white px-3 py-2 text-xs font-black text-[#0F766E]">
                {countdownLabel}
              </div>
            ) : null}

            {isInProgress && elapsedLabel ? (
              <div className="mt-3 rounded-lg border border-[#BBF7D0] bg-white px-3 py-2 text-xs font-black text-[#166534]">
                {t('activities.meetingDrawer.elapsedSinceStart', { value: elapsedLabel })}
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
              <span className={`rounded-full border px-2 py-1 ${reportCounts.pre ? 'border-[#BBF7D0] bg-[#ECFDF5] text-[#166534]' : 'border-[#E2E8F0] bg-white text-[#475569]'}`}>
                {t('activities.preMeetingReport.title')}: {reportCounts.pre ? t('activities.meetingDrawer.available', { count: reportCounts.pre }) : t('activities.meetingDrawer.notAvailable')}
              </span>
              <span className={`rounded-full border px-2 py-1 ${reportCounts.after ? 'border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]' : 'border-[#E2E8F0] bg-white text-[#475569]'}`}>
                {t('activities.meetingDrawer.afterMeetingReportLabel')}: {reportCounts.after ? t('activities.meetingDrawer.available', { count: reportCounts.after }) : t('activities.meetingDrawer.notAvailable')}
              </span>
            </div>
          </section>

          <div className="relative flex flex-wrap gap-2 rounded-xl border border-[#E5F7F8] bg-white p-2">
            {tabs.map((tab) => {
              const countMap = {
                participants: participants.length,
                notes: notes.length,
                reports: reports.length,
                attachments: attachments.length,
              }
              const count = countMap[tab.id] || 0
              const hoverItems = tabHoverContent[tab.id] || []
              const hasHover = hoverItems.length > 0

              return (
                <div key={tab.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    onMouseEnter={() => setHoveredTab(tab.id)}
                    onMouseLeave={() => setHoveredTab(null)}
                    onFocus={() => setHoveredTab(tab.id)}
                    onBlur={() => setHoveredTab(null)}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-black ${activeTab === tab.id ? 'bg-[#E8F9FA] text-[#007A80]' : 'bg-[#F8FEFF] text-[var(--text-muted)]'}`}
                  >
                    <span>{tab.label}</span>
                    {count > 0 ? (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${tab.id === 'notes' || tab.id === 'attachments' ? 'bg-[#FEF3C7] text-[#92400E]' : 'bg-[#E0F2FE] text-[#0F766E]'}`}>
                        {count}
                      </span>
                    ) : null}
                    {(tab.id === 'notes' || tab.id === 'attachments') && count > 0 ? (
                      <span className="h-2 w-2 rounded-full bg-[#F59E0B]" aria-label={t('activities.meetingDrawer.importantContentAlert')} title={t('activities.meetingDrawer.importantContentTitle')} />
                    ) : null}
                  </button>

                  {hoveredTab === tab.id && hasHover ? (
                    <div className="absolute left-0 top-full z-[180000] mt-2 w-72 max-w-[80vw] rounded-xl border border-[#BEEFF2] bg-white p-3 shadow-xl">
                      <div className="space-y-2">
                        {hoverItems.map((item) => {
                          const label = Array.isArray(item) ? item[0] : t('activities.meetingDrawer.itemFallback')
                          const value = Array.isArray(item) ? item[1] : item

                          return (
                            <div key={`${tab.id}-${String(label)}-${String(value)}`} className="rounded-lg border border-[#E5F7F8] bg-[#F8FEFF] px-2 py-1 text-[11px] font-semibold text-[var(--text)]">
                              {Array.isArray(item) ? (
                                <><span className="font-black text-[#007A80]">{label}:</span> {value}</>
                              ) : (
                                <span className="block truncate">{value}</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>

          {activeTab === 'overview' ? (
            <>
              <Section title={t('activities.meetingDrawer.sections.basicData')} icon={CalendarClock}>
                <div className="grid gap-2 sm:grid-cols-2">
                  <InfoRow label={t('activities.meetingDrawer.fields.mode')} value={meeting.mode} />
                  <InfoRow label={t('activities.meetingDrawer.fields.scope')} value={meeting.scope} />
                  {isMeetingType ? <InfoRow label={t('activities.meetingDrawer.fields.meetingLink')} value={meeting.meeting_link} href={meeting.meeting_link} /> : null}
                  {isMeetingType ? <InfoRow label={t('activities.meetingDrawer.fields.location')} value={meeting.location} /> : null}
                  {isMeetingType ? <InfoRow label={t('activities.meetingDrawer.fields.longitude')} value={meeting.longitude} /> : null}
                  {isMeetingType ? <InfoRow label={t('activities.meetingDrawer.fields.latitude')} value={meeting.latitude} /> : null}
                </div>
              </Section>

              <Section title={t('activities.meetingDrawer.sections.meetingCreator')} icon={UserRound}>
                <div className="relative">
                  <button
                    type="button"
                    onMouseEnter={() => setCreatorHoverOpen(true)}
                    onMouseLeave={() => setCreatorHoverOpen(false)}
                    onFocus={() => setCreatorHoverOpen(true)}
                    onBlur={() => setCreatorHoverOpen(false)}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#E5F7F8] bg-white px-3 py-2 text-xs font-black text-[var(--text)]"
                  >
                    {getPersonName(meeting.creator)}
                  </button>

                  {creatorHoverOpen ? (
                    <div className="absolute z-20 mt-2 w-72 max-w-[90vw] rounded-xl border border-[#BEEFF2] bg-white p-3 shadow-xl">
                      <div className="grid gap-2">
                        <InfoRow label={t('customers.email')} value={meeting.creator?.email} />
                        <InfoRow label={t('customers.phone')} value={meeting.creator?.phone} />
                        <InfoRow label="username" value={meeting.creator?.username} />
                        <InfoRow label="team_id" value={meeting.creator?.team_id} />
                        <InfoRow label="created_by" value={meeting.created_by} />
                      </div>
                    </div>
                  ) : null}
                </div>
              </Section>

              <Section title={t('activities.meetingDrawer.sections.linkedCustomer')} icon={MapPin}>
                <div className="grid gap-2 sm:grid-cols-2">
                  <InfoRow label={t('customers.name')} value={meeting.taskable?.name} />
                  <InfoRow label={t('customers.email')} value={meeting.taskable?.email} />
                  <InfoRow label={t('customers.phone')} value={meeting.taskable?.phone} />
                  <InfoRow label={t('activities.meetingDrawer.fields.source')} value={meeting.taskable?.source} />
                  <InfoRow label="team_id" value={meeting.team_id || meeting.team?.id} />
                </div>
              </Section>
            </>
          ) : null}

          {activeTab === 'timing' ? (
            <>
              <Section title={t('activities.meetingDrawer.sections.timing')} icon={CalendarClock}>
                <div className="grid gap-2 sm:grid-cols-2">
                  <InfoRow label={t('activities.meetingDrawer.fields.startAt')} value={formatDateTime12(meeting.start_at)} />
                  <InfoRow label={t('activities.meetingDrawer.fields.endAt')} value={formatDateTime12(meeting.end_at)} />
                  <InfoRow label={t('activities.meetingDrawer.fields.actualStart')} value={formatDateTime12(meeting.actual_start_at)} />
                  <InfoRow label={t('activities.meetingDrawer.fields.actualEnd')} value={formatDateTime12(meeting.actual_end_at)} />
                  <InfoRow label={t('activities.meetingDrawer.fields.elapsedTime')} value={elapsedLabel} />
                </div>
              </Section>

              <Section title={t('activities.meetingDrawer.sections.reminders')} icon={CalendarClock}>
                <div className="grid gap-2 sm:grid-cols-3">
                  <InfoRow label={t('activities.meetingDrawer.fields.reminderType')} value={meeting.reminder_type} />
                  <InfoRow label={t('activities.meetingDrawer.fields.reminderBefore')} value={meeting.reminder_before} />
                  <InfoRow label={t('activities.meetingDrawer.fields.reminderUnit')} value={meeting.reminder_unit} />
                  <InfoRow label={t('activities.meetingDrawer.fields.reminderSentAt')} value={formatDateTime12(meeting.reminder_sent_at)} />
                </div>
              </Section>
            </>
          ) : null}

          {activeTab === 'call' && isCallType ? (
            <Section title={t('activities.meetingDrawer.sections.callData')} icon={Phone}>
              <div className="grid gap-2 sm:grid-cols-2">
                <InfoRow label={t('activities.meetingDrawer.fields.callProvider')} value={meeting.call_provider} />
                <InfoRow label={t('activities.meetingDrawer.fields.callerNumber')} value={meeting.caller_number} />
                <InfoRow label={t('activities.meetingDrawer.fields.calleeNumber')} value={meeting.callee_number} />
                <InfoRow label={t('activities.meetingDrawer.fields.callStatus')} value={meeting.call_status} />
                <InfoRow label={t('activities.meetingDrawer.fields.callDurationSeconds')} value={meeting.call_duration_seconds} />
                <InfoRow label={t('activities.meetingDrawer.fields.externalCallId')} value={meeting.external_call_id} />
                <InfoRow label={t('activities.meetingDrawer.fields.recordingUrl')} value={meeting.recording_url} href={meeting.recording_url} />
              </div>
            </Section>
          ) : null}

          {activeTab === 'participants' ? (
            <Section title={t('activities.meetingDrawer.sections.participantsTitle', { count: participants.length })} icon={UsersRound}>
              {participants.length ? (
                <div className="space-y-2">
                  {participants.map((participant) => {
                    const rowId = participant.id || getParticipantUserId(participant)
                    const expanded = expandedParticipantId === rowId
                    const ToggleIcon = expanded ? ChevronUp : ChevronDown

                    return (
                      <div key={rowId} className="rounded-lg border border-[#E5F7F8] bg-white p-3 text-xs">
                        <button type="button" onClick={() => setExpandedParticipantId(expanded ? null : rowId)} className="flex w-full items-center justify-between gap-2 text-start">
                          <div className="min-w-0 flex flex-wrap items-center gap-2">
                            <span className="font-black text-[var(--text)]">{getPersonName(participant.user || participant)}</span>
                            {hasValue(participant.role) ? <span className="rounded-full bg-[#F8FEFF] px-2 py-0.5 text-[10px] font-bold text-[#007A80]">role: {participant.role}</span> : null}
                            {hasValue(participant.status) ? <span className="rounded-full bg-[#F8FAFC] px-2 py-0.5 text-[10px] font-bold text-[#64748B]">status: {participant.status}</span> : null}
                          </div>
                          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F8FEFF] text-[#007A80]"><ToggleIcon size={14} /></span>
                        </button>

                        {expanded ? (
                          <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            <InfoRow label="user_id" value={participant.user_id} />
                            <InfoRow label="meeting_id" value={participant.meeting_id} />
                            <InfoRow label="joined_at" value={formatDateTime12(participant.joined_at)} />
                            <InfoRow label="left_at" value={formatDateTime12(participant.left_at)} />
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs font-semibold text-[var(--text-muted)]">{t('activities.meetingDrawer.noParticipants')}</p>
              )}
            </Section>
          ) : null}

          {activeTab === 'reports' && isMeetingType ? (
            <Section title={t('activities.meetingDrawer.sections.reportsTitle', { count: reports.length })} icon={FileText}>
              <ReportsSection
                reports={reports}
                onOpenReport={setPreviewReport}
                onOpenPreForm={() => setOpenPreReportDrawer(true)}
                onOpenAfterForm={() => setOpenAfterReportDrawer(true)}
              />
            </Section>
          ) : null}

          {activeTab === 'notes' ? (
            <Section title={t('activities.meetingDrawer.sections.notesTitle', { count: notes.length })} icon={StickyNote}>
              {notes.length ? (
                <div className="space-y-2">
                  {notes.map((note) => (
                    <div key={note.id || note.created_at} className="rounded-lg border border-[#E5F7F8] bg-white p-2 text-xs font-semibold text-[var(--text)] whitespace-pre-wrap break-words">
                      {fieldValue(note.note || note.body || note.text)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-semibold text-[var(--text-muted)]">{t('activities.meetingDrawer.noNotes')}</p>
              )}
            </Section>
          ) : null}

          {activeTab === 'attachments' ? (
            <Section title={t('activities.meetingDrawer.sections.attachmentsTitle', { count: attachments.length })} icon={Paperclip}>
              {attachments.length ? (
                <div className="space-y-2">
                  {attachments.map((attachment) => (
                    <div key={attachment.id || attachment.path || attachment.file_name} className="rounded-lg border border-[#E5F7F8] bg-white p-2 text-xs font-semibold text-[var(--text)]">
                      <InfoRow label={t('customers.name')} value={attachment.name || attachment.file_name || attachment.filename || attachment.path} />
                      <InfoRow label={t('activities.meetingDrawer.fields.link')} value={attachment.url || attachment.file_url || attachment.path || attachment.file_path} href={attachment.url || attachment.file_url || attachment.path || attachment.file_path} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-semibold text-[var(--text-muted)]">{t('activities.meetingDrawer.noAttachments')}</p>
              )}
            </Section>
          ) : null}

        </>
      ) : null}

      <AppDrawer
        open={Boolean(previewReport)}
        onClose={() => setPreviewReport(null)}
        title={t('activities.meetingDrawer.previewReportTitle')}
        description={previewReport?.title || ''}
        size="lg"
        drawerKey="meeting-report-preview"
        portal
        closeOnBackdrop={false}
        inlineEndOffset={`var(${SIDE_DRAWER_OFFSET_VAR}, ${MAIN_DRAWER_WIDTH}px)`}
        containerClassName="z-[170000]"
      >
        {previewReport ? <DocumentPreview report={previewReport} /> : null}
      </AppDrawer>

      <PreMeetingReportDrawer
        open={openPreReportDrawer}
        meetingId={resolvedMeetingId}
        meetingTitle={meeting?.title}
        onClose={() => setOpenPreReportDrawer(false)}
        onSaved={() => {
          setOpenPreReportDrawer(false)
          refresh()
        }}
        inlineEndOffset={`var(${SIDE_DRAWER_OFFSET_VAR}, ${MAIN_DRAWER_WIDTH}px)`}
      />

      <AfterMeetingReportDrawer
        open={openAfterReportDrawer}
        meetingId={resolvedMeetingId}
        meetingTitle={meeting?.title}
        elapsedDuration={finishElapsedDuration}
        onClose={() => setOpenAfterReportDrawer(false)}
        onSaved={() => {
          setOpenAfterReportDrawer(false)
          refresh()
        }}
        inlineEndOffset={`var(${SIDE_DRAWER_OFFSET_VAR}, ${MAIN_DRAWER_WIDTH}px)`}
      />
    </div>
  )

  if (mode === 'page') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-lg border border-[#E5F7F8] bg-white px-3 py-2 text-sm font-black text-[#007A80]">
            {t('activities.meetingDrawer.back')}
          </button>
        </div>
        {body}
      </div>
    )
  }

  return (
    <AppDrawer
      open={open}
      onClose={handleDrawerClose}
      title={t('activities.meetingDrawer.detailsTitlePrefix', { type: getScheduleTypeLabel(meeting?.type || schedule?.type, t) })}
      description={meeting?.title || (resolvedMeetingId ? t('activities.meetingDrawer.scheduleNumberFallback', { id: resolvedMeetingId }) : '')}
      size="xl"
      drawerKey="meeting-data-drawer"
      resizable
      minWidth={560}
      maxWidth={MAIN_DRAWER_WIDTH}
      closeOnBackdrop={false}
      portal
      className="z-[160000]"
      containerClassName="z-[160000]"
      offsetCssVariable={SIDE_DRAWER_OFFSET_VAR}
      headerActions={(
        <div className="flex items-center gap-1">
          {isMeetingType ? (
            <Button type="button" variant="outline" size="sm" onClick={openMeetingPage}>
              <ArrowUpRight size={14} />
              {t('activities.meetingDrawer.openPage')}
            </Button>
          ) : null}
          <Button
            type="button"
            variant={isDrawerLocked ? 'ai' : 'outline'}
            size="sm"
            onClick={() => setIsDrawerLocked((current) => !current)}
          >
            {isDrawerLocked ? t('activities.meetingDrawer.unlockAction') : t('activities.meetingDrawer.lockAction')}
          </Button>
        </div>
      )}
    >
      {body}
    </AppDrawer>
  )
}