import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../../shared/utils/cn'
import { FeedbackList } from '../../feedback/components/FeedbackList'
import { REPORT_PERIODS } from '../api/reportsApi'
import { ReportsOverview } from './ReportsOverview'
import { QualityWorkspace } from '../../quality/components/QualityWorkspace'

const TABS = ['overview', 'feedback', 'quality']

/** Reports shell: tab + period in the URL (?tab=&period=), filters in one row. */
export function ReportsWorkspace() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const tab = TABS.includes(params.get('tab')) ? params.get('tab') : 'overview'
  const period = REPORT_PERIODS.includes(params.get('period')) ? params.get('period') : '30d'
  const update = (key, value, fallback) => {
    const next = new URLSearchParams(params)
    if (value === fallback) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)]">
        <div role="tablist" aria-label={t('service.reports.title')} className="flex gap-1">
          {TABS.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => update('tab', key, 'overview')}
              className={cn(
                'border-b-2 px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent',
                tab === key ? 'border-brand-accent font-semibold text-[var(--text)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
              )}
            >
              {t(`service.reports.tabs.${key}`)}
            </button>
          ))}
        </div>
        <div role="group" aria-label={t('service.reports.period')} className="mb-2 flex rounded-lg bg-[var(--surface-2)] p-0.5">
          {REPORT_PERIODS.map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={period === key}
              onClick={() => update('period', key, '30d')}
              className={cn(
                'rounded-md px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent',
                period === key ? 'bg-[var(--surface)] font-semibold text-[var(--text)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              )}
            >
              {t(`service.reports.periods.${key}`)}
            </button>
          ))}
        </div>
      </div>
      {tab === 'overview' && <ReportsOverview period={period} />}
      {tab === 'feedback' && <FeedbackList period={period} />}
      {tab === 'quality' && <QualityWorkspace period={period} />}
    </div>
  )
}
