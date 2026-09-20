import { useTranslation } from 'react-i18next'
import { formatMetric } from '../utils/socialFormatters'

/**
 * Generic small-metric grid reused across Overview / Profile / Engagement
 * sections. `items` is `{ labelKey, value, icon? }[]` — `value === null`
 * always renders "—", never a fake zero (see docs "Connected Profiles").
 */
export function SocialMetricsCards({ items = [] }) {
  const { t, i18n } = useTranslation()

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.labelKey} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            {item.icon}
            {t(item.labelKey)}
          </div>
          <p className="mt-1 text-lg font-bold text-[var(--text)]" dir="ltr">{formatMetric(item.value, i18n.language)}</p>
        </div>
      ))}
    </div>
  )
}
