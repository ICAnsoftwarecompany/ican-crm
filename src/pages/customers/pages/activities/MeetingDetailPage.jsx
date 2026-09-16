import { useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { MeetingDataDrawer } from '../../../../features/call-meetings/components/MeetingDataDrawer'
import { useMeetingInfo } from '../../../../features/meetings/hooks/useMeetings'

export function MeetingDetailPage() {
  const { meetingId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const meetingQuery = useMeetingInfo(meetingId, undefined, { enabled: Boolean(meetingId) })
  const meeting = useMemo(() => meetingQuery.data?.data || meetingQuery.data || null, [meetingQuery.data])

  const refresh = () => meetingQuery.refetch()
  const goBack = () => {
    const source = location.state?.from || '/LeadsCenter/activities'
    navigate(source)
  }

  return (
    <main className="space-y-4 p-4">
      {meetingQuery.isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-[#E5F7F8] bg-[#F8FEFF] p-6 text-xs font-bold text-[#007A80]">
          جاري تحميل بيانات الاجتماع...
        </div>
      ) : (
        <MeetingDataDrawer
          mode="page"
          schedule={meeting}
          meetingId={meetingId}
          onBack={goBack}
          onChanged={refresh}
        />
      )}
    </main>
  )
}
