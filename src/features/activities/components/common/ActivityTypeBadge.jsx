import { useTranslation } from 'react-i18next'
import { getActivityTypes } from '../../constants/activityConstants'

export function ActivityTypeBadge({ type }) {
  const { t } = useTranslation()
  const types = getActivityTypes(t)
  const meta = types[type] || types.meeting
  const Icon = meta.icon

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-black ${meta.badgeClassName || 'border-slate-200 bg-slate-50 text-slate-700'}`}>
      <Icon size={13} />
      {meta.label}
    </span>
  )
}
