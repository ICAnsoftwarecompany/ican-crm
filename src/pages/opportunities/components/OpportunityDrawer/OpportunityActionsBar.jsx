import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Eye, Rocket, UserCog, XCircle } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { useOpportunityMutations } from '../../../../features/opportunities/hooks/useOpportunities'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { ActivateOpportunityDialog } from './dialogs/ActivateOpportunityDialog'
import { WatchOpportunityDialog } from './dialogs/WatchOpportunityDialog'
import { DismissOpportunityDialog } from './dialogs/DismissOpportunityDialog'
import { AssignOpportunityDialog } from './dialogs/AssignOpportunityDialog'

export function OpportunityActionsBar({ opportunity }) {
  const { t } = useTranslation()
  const mutations = useOpportunityMutations()
  const [activeDialog, setActiveDialog] = useState(null)
  const isFinalized = ['activated', 'dismissed', 'expired'].includes(opportunity.status)

  const handleQualify = async () => {
    try {
      await mutations.qualify.mutateAsync(opportunity.id)
      toast.success(t('opportunities.actionsBar.qualifySuccess'))
    } catch (error) {
      toast.error(extractMessage(error, t('opportunities.actionsBar.qualifyError')))
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
        <Button variant="danger" onClick={() => setActiveDialog('dismiss')} disabled={isFinalized}>
          <XCircle size={16} />
          {t('opportunities.dismiss')}
        </Button>
        <Button variant="outline" onClick={() => setActiveDialog('watch')} disabled={isFinalized}>
          <Eye size={16} />
          {t('opportunities.watch')}
        </Button>
        <Button
          variant="outline"
          onClick={handleQualify}
          loading={mutations.qualify.isPending}
          disabled={isFinalized || opportunity.status === 'qualified'}
        >
          <CheckCircle2 size={16} />
          {t('opportunities.qualify')}
        </Button>
        <Button variant="outline" onClick={() => setActiveDialog('assign')}>
          <UserCog size={16} />
          {t('opportunities.assign')}
        </Button>
        <Button variant="accent" onClick={() => setActiveDialog('activate')} disabled={opportunity.status === 'activated'}>
          <Rocket size={16} />
          {t('opportunities.activate')}
        </Button>
      </div>

      {activeDialog === 'activate' && (
        <ActivateOpportunityDialog opportunity={opportunity} onClose={() => setActiveDialog(null)} />
      )}
      {activeDialog === 'watch' && (
        <WatchOpportunityDialog opportunity={opportunity} onClose={() => setActiveDialog(null)} />
      )}
      {activeDialog === 'dismiss' && (
        <DismissOpportunityDialog opportunity={opportunity} onClose={() => setActiveDialog(null)} />
      )}
      {activeDialog === 'assign' && (
        <AssignOpportunityDialog opportunity={opportunity} onClose={() => setActiveDialog(null)} />
      )}
    </>
  )
}
