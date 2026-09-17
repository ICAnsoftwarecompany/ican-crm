import { AppDrawer } from '../../../../shared/components/overlays/AppDrawer'
import { useOpportunityDrawerStore } from '../../../../features/opportunities/store/opportunityDrawerStore'
import { useOpportunityInfo } from '../../../../features/opportunities/hooks/useOpportunities'
import { OpportunityDrawerHeader } from './OpportunityDrawerHeader'
import { OpportunityWhySection } from './OpportunityWhySection'
import { OpportunitySignalsList } from './OpportunitySignalsList'
import { OpportunityCustomerCard } from './OpportunityCustomerCard'
import { OpportunityActivityTimeline } from './OpportunityActivityTimeline'
import { OpportunityScoreBreakdown } from './OpportunityScoreBreakdown'
import { OpportunityActionsBar } from './OpportunityActionsBar'

export function OpportunityDrawer() {
  const openOpportunityId = useOpportunityDrawerStore((state) => state.openOpportunityId)
  const closeDrawer = useOpportunityDrawerStore((state) => state.close)
  const opportunityQuery = useOpportunityInfo(openOpportunityId, { enabled: Boolean(openOpportunityId) })
  const opportunity = opportunityQuery.data

  return (
    <AppDrawer
      open={Boolean(openOpportunityId)}
      onClose={closeDrawer}
      title="تفاصيل الفرصة"
      size="lg"
      drawerKey="opportunity-drawer"
    >
      {opportunity ? (
        <div className="grid gap-5">
          <OpportunityDrawerHeader opportunity={opportunity} />
          <OpportunityWhySection opportunity={opportunity} />
          <OpportunitySignalsList opportunity={opportunity} />
          <OpportunityCustomerCard opportunity={opportunity} />
          <OpportunityActivityTimeline opportunity={opportunity} />
          <OpportunityScoreBreakdown opportunity={opportunity} />
          <OpportunityActionsBar opportunity={opportunity} />
        </div>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">تعذر العثور على بيانات هذه الفرصة.</p>
      )}
    </AppDrawer>
  )
}
