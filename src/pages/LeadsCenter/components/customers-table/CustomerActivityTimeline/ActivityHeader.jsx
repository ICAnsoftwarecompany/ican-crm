import { formatRelativeActivityTime } from './utils/formatActivityDate'
import { useTranslation } from 'react-i18next'

export function ActivityHeader({ totalCount, lastActivityDate }) {
  const { t } = useTranslation()
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <h3 className="text-sm font-black text-slate-900">{t('customers.activityTimeline.headerTitle')}</h3>
      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600">
        <span>{t('customers.activityTimeline.activitiesCount', { count: totalCount })}</span>
        <span className="text-slate-400">•</span>
        <span>{t('customers.activityTimeline.lastActivity', { value: lastActivityDate ? formatRelativeActivityTime(lastActivityDate) : '-' })}</span>
      </div>
    </div>
  )
}
