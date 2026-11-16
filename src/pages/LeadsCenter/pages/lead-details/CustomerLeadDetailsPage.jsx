import { useParams, useSearchParams } from 'react-router-dom'

import { AfterMeetingReportDrawer, PreMeetingReportDrawer } from '../../../../features/call-meetings'
import { Customer360Page } from './customer-360/Customer360Page'

export function CustomerLeadDetailsPage() {
  const { customerId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') || 'timeline'
  const reportMeetingId = searchParams.get('meetingId')
  const shouldOpenPreMeetingReport = searchParams.get('preMeetingReport') === '1' && Boolean(reportMeetingId)
  const shouldOpenAfterMeetingReport = searchParams.get('afterMeetingReport') === '1' && Boolean(reportMeetingId)

  const closePreMeetingReport = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('preMeetingReport')
    nextParams.delete('meetingId')
    setSearchParams(nextParams, { replace: true })
  }

  const closeAfterMeetingReport = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('afterMeetingReport')
    nextParams.delete('meetingId')
    setSearchParams(nextParams, { replace: true })
  }

  return (
    <div className="space-y-4">
      <Customer360Page customerId={customerId} initialTab={initialTab} />

      <PreMeetingReportDrawer
        open={shouldOpenPreMeetingReport}
        meetingId={reportMeetingId}
        onClose={closePreMeetingReport}
        onSaved={closePreMeetingReport}
      />

      <AfterMeetingReportDrawer
        open={shouldOpenAfterMeetingReport}
        meetingId={reportMeetingId}
        onClose={closeAfterMeetingReport}
        onSaved={closeAfterMeetingReport}
      />
    </div>
  )
}
