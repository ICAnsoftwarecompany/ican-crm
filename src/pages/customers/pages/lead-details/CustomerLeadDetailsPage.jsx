import { useParams, useSearchParams } from 'react-router-dom'

import { AfterMeetingReportDrawer, PreMeetingReportDrawer } from '../../../../features/call-meetings'
import { CustomerDetailsContent } from '../../components/CustomerDetailsDrawer/CustomerDetailsDrawer'
import { LeadDetailsBreadcrumbs } from './LeadDetailsBreadcrumbs'
import { LeadPageSwitcher } from './LeadPageSwitcher'

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <LeadDetailsBreadcrumbs />
        <LeadPageSwitcher activeCustomerId={customerId} />
      </div>

      <CustomerDetailsContent
        customer={{ id: customerId }}
        enabled={Boolean(customerId)}
        mode="page"
        initialTab={initialTab}
      />

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
