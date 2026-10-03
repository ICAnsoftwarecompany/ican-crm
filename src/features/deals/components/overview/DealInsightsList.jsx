import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, ArrowLeft, Info, Lightbulb } from 'lucide-react'
import { cn } from '../../../../shared/utils/cn'
import { getDealPagePath } from '../../constants/dealWorkspacePages'

const TONES = {
  high: { icon: AlertTriangle, className: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200' },
  medium: { icon: Lightbulb, className: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200' },
  low: { icon: Info, className: 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]' },
}

/** Rule-based hints (utils/dealInsights) with a link that opens the right page already filtered. */
export function DealInsightsList({ dealId, insights, emptyText }) {
  const { t } = useTranslation()
  if (!insights.length) return <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--text-muted)]">{emptyText}</p>
  return (
    <ul className="space-y-2">
      {insights.map((insight) => {
        const tone = TONES[insight.severity] || TONES.low
        const Icon = tone.icon
        const to = `${getDealPagePath(dealId, insight.action.page)}${insight.action.query ? `?${insight.action.query}` : ''}`
        return (
          <li key={insight.id} className={cn('flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm', tone.className)}>
            <span className="flex min-w-0 items-start gap-2"><Icon size={16} className="mt-0.5 shrink-0" />{t(`dealWorkspace.insights.${insight.id}`, { count: insight.count })}</span>
            <Link to={to} className="inline-flex items-center gap-1 text-xs font-semibold underline-offset-2 hover:underline">
              {t(`dealWorkspace.insights.actions.${insight.action.page}`)}<ArrowLeft size={13} className="ltr:rotate-180" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
