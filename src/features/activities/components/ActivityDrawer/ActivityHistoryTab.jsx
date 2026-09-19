import { useTranslation } from 'react-i18next'
import { formatActivityDateTime } from '../../utils/activityDateHelpers'
import { activityText } from '../../utils/activityHelpers'

export function ActivityHistoryTab({ activity }) {
  const { t } = useTranslation()
  const history = activity.raw?.history || activity.raw?.logs || []

  if (!Array.isArray(history) || !history.length) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border)] p-4 text-sm font-semibold text-[var(--text-muted)]">
        {t('activities.drawer.noDetailedHistory')}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {history.map((item) => (
        <article key={item.id || item.created_at} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
          <p className="text-sm font-black text-[var(--text)]">{item.title || item.action || item.type || t('activities.drawer.eventFallback')}</p>
          <p className="mt-1 text-xs font-semibold text-[var(--text-muted)]">{formatActivityDateTime(item.created_at || item.activity_at)}</p>
          <p className="mt-1 whitespace-normal break-words text-sm font-semibold text-[var(--text-muted)]">
            {activityText(item.description || item.note, '')}
          </p>
        </article>
      ))}
    </div>
  )
}
