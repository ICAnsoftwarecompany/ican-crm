import { useTranslation } from 'react-i18next'
import { formatActivityDateTime } from '../../utils/activityDateHelpers'
import { activityText } from '../../utils/activityHelpers'
import { getOutcomeLabel } from '../../utils/activityOutcomes'

export function ReportSummary({ report, activity }) {
  const { t } = useTranslation()

  if (!report) {
    return <p className="text-sm font-semibold text-[var(--text-muted)]">{t('activities.report.noReportSaved')}</p>
  }

  return (
    <div className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">
          {getOutcomeLabel(report.outcome, activity?.type, t)}
        </span>
        <span className="text-xs font-semibold text-[var(--text-muted)]">{formatActivityDateTime(report.created_at)}</span>
      </div>
      <p className="font-bold text-[var(--text)]">
        {activityText(report.summary || report.notes || report.note, '-')}
      </p>
      {report.next_action ? (
        <p className="text-xs font-semibold text-[var(--text-muted)]">{t('activities.meetingDrawer.fields.nextAction')}: {report.next_action}</p>
      ) : null}
    </div>
  )
}
