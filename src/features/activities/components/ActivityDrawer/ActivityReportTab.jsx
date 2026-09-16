import { useActivityReports } from '../../hooks/useActivityReports'
import { ReportSummary } from '../ActivityReport/ReportSummary'

export function ActivityReportTab({ activity, onFinish }) {
  const reportsQuery = useActivityReports(activity?.id)
  const reports = reportsQuery.data || []
  const currentReport = activity.report || reports[0]

  return (
    <div className="space-y-3">
      {activity.status !== 'completed' ? (
        <button
          type="button"
          onClick={onFinish}
          className="rounded-lg border border-[#A0ECF0] bg-[#E8F9FA] px-3 py-2 text-sm font-black text-[#007A80] hover:bg-[#D8F4F6]"
        >
          إنهاء النشاط وإضافة تقرير
        </button>
      ) : null}
      <ReportSummary report={currentReport} activity={activity} />
      {reports.length > 1 ? (
        <div className="space-y-2">
          {reports.slice(1).map((report) => (
            <ReportSummary key={report.id || report.created_at} report={report} activity={activity} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
