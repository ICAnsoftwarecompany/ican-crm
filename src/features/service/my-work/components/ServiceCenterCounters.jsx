import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ResourceState } from '../../../../shared/components/data/ResourceState'
import { useServiceTerminology } from '../../core/capabilities/useServiceCapabilities'
import { SERVICE_CENTER_VIEWS } from '../../cases/constants/caseViews'
import { useCaseSummary } from '../../cases/hooks/useCases'

/** Counters for the Service Center; each opens the matching case view. */
export function ServiceCenterCounters() {
  const { t } = useTranslation()
  const term = useServiceTerminology()
  const summary = useCaseSummary()
  const counts = summary.data?.views || {}

  return (
    <ResourceState isLoading={summary.isLoading} error={summary.error} onRetry={summary.refetch}>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {SERVICE_CENTER_VIEWS.map((view) => (
          <Link
            key={view}
            to={`/service/cases?view=${view}`}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-brand-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
          >
            <p className="text-xs text-[var(--text-muted)]">{t(`service.cases.views.${view}`)}</p>
            <p className="mt-1 text-2xl font-bold text-[var(--text)]" dir="ltr">{counts[view] ?? 0}</p>
            <p className="text-xs text-[var(--text-muted)]">{term('case', 'other')}</p>
          </Link>
        ))}
      </div>
    </ResourceState>
  )
}
