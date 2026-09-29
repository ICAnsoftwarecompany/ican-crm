import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { ResourceState } from '../../../../../shared/components/data/ResourceState'
import { useServiceTerminology } from '../../../core/capabilities/useServiceCapabilities'
import { useCase, useCaseActivities, useCaseSetup } from '../../hooks/useCases'
import { useCaseTransitionFlow } from '../../hooks/useCaseTransitionFlow'
import { isCaseOpen } from '../../utils/caseStatus'
import { CasePriorityBadge, CaseStatusBadge } from '../CaseBadges'
import { CaseTypeIcon } from '../CaseTypeIcon'
import { CaseActivityFeed } from './CaseActivityFeed'
import { CaseComposer } from './CaseComposer'
import { CasePropertiesPanel } from './CasePropertiesPanel'
import { CustomerContactsPanel } from '../../../contacts/components/CustomerContactsPanel'
import { CaseTransitionMenu } from './CaseTransitionMenu'
import { SlaBadge, SlaPanel } from '../../../sla'
import { MacroMenu } from '../../../replies'
import { SuggestedArticlesPanel } from '../../../knowledge'

/** Full case screen: header + transitions, timeline + composer, properties. */
export function CaseDetailView({ caseId }) {
  const { t } = useTranslation()
  const term = useServiceTerminology()
  const caseQuery = useCase(caseId)
  const setup = useCaseSetup()
  const activities = useCaseActivities(caseId)
  const { requestTransition, transitionDialog, isTransitioning } = useCaseTransitionFlow(setup.data)
  const caseItem = caseQuery.data

  return (
    <div className="grid gap-4">
      <Link to="/service/cases" className="inline-flex w-fit items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
        <ArrowLeft size={16} aria-hidden="true" className="rtl:-scale-x-100" />
        {t('service.cases.detail.back', { entity: term('case', 'other') })}
      </Link>

      <ResourceState
        isLoading={caseQuery.isLoading || setup.isLoading}
        error={caseQuery.error || setup.error}
        onRetry={() => {
          caseQuery.refetch()
          setup.refetch()
        }}
      >
        {caseItem && (
          <>
            <header className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                  <span dir="ltr" className="font-mono">{caseItem.case_number}</span>
                  <CaseStatusBadge status={caseItem.status} />
                  <CasePriorityBadge priority={caseItem.priority} />
                  <SlaBadge sla={caseItem.sla} />
                </div>
                <h1 className="flex items-center gap-2 text-lg font-bold text-[var(--text)]">
                  <CaseTypeIcon icon={caseItem.type?.icon} size={18} className="shrink-0 text-[var(--text-muted)]" />
                  <span className="min-w-0 break-words">{caseItem.subject}</span>
                </h1>
                {caseItem.description && <p className="mt-1 text-sm text-[var(--text-muted)]">{caseItem.description}</p>}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <MacroMenu caseItem={caseItem} disabled={!isCaseOpen(caseItem)} />
                <CaseTransitionMenu caseItem={caseItem} setup={setup.data} onSelect={requestTransition} disabled={isTransitioning} />
              </div>
            </header>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <section className="grid content-start gap-4">
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                  <h2 className="mb-3 text-sm font-semibold text-[var(--text)]">{t('service.cases.detail.activity')}</h2>
                  <ResourceState isLoading={activities.isLoading} error={activities.error} onRetry={activities.refetch}>
                    <CaseActivityFeed activities={activities.data} />
                  </ResourceState>
                </div>
                <CaseComposer caseItem={caseItem} disabled={!isCaseOpen(caseItem) && caseItem.status?.category !== 'resolved'} />
              </section>
              <div className="grid content-start gap-4">
                <SlaPanel sla={caseItem.sla} />
                <CasePropertiesPanel caseItem={caseItem} setup={setup.data} />
                <SuggestedArticlesPanel caseId={caseItem.id} />
                <CustomerContactsPanel customerId={caseItem.customer?.id} compact />
              </div>
            </div>
          </>
        )}
      </ResourceState>
      {transitionDialog}
    </div>
  )
}
