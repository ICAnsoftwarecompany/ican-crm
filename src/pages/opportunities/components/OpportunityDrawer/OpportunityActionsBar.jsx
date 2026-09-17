import { useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle2, Eye, Rocket, UserCog, XCircle } from 'lucide-react'
import { Button } from '../../../../shared/components/ui/Button'
import { useOpportunityMutations } from '../../../../features/opportunities/hooks/useOpportunities'
import { extractMessage } from '../../../../shared/utils/apiResponse'
import { ActivateOpportunityDialog } from './dialogs/ActivateOpportunityDialog'
import { WatchOpportunityDialog } from './dialogs/WatchOpportunityDialog'
import { DismissOpportunityDialog } from './dialogs/DismissOpportunityDialog'
import { AssignOpportunityDialog } from './dialogs/AssignOpportunityDialog'

export function OpportunityActionsBar({ opportunity }) {
  const mutations = useOpportunityMutations()
  const [activeDialog, setActiveDialog] = useState(null)
  const isFinalized = ['activated', 'dismissed', 'expired'].includes(opportunity.status)

  const handleQualify = async () => {
    try {
      await mutations.qualify.mutateAsync(opportunity.id)
      toast.success('تم تأهيل الفرصة')
    } catch (error) {
      toast.error(extractMessage(error, 'تعذر تأهيل الفرصة'))
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
        <Button variant="danger" onClick={() => setActiveDialog('dismiss')} disabled={isFinalized}>
          <XCircle size={16} />
          رفض
        </Button>
        <Button variant="outline" onClick={() => setActiveDialog('watch')} disabled={isFinalized}>
          <Eye size={16} />
          مراقبة
        </Button>
        <Button
          variant="outline"
          onClick={handleQualify}
          loading={mutations.qualify.isPending}
          disabled={isFinalized || opportunity.status === 'qualified'}
        >
          <CheckCircle2 size={16} />
          تأهيل
        </Button>
        <Button variant="outline" onClick={() => setActiveDialog('assign')}>
          <UserCog size={16} />
          إسناد
        </Button>
        <Button variant="accent" onClick={() => setActiveDialog('activate')} disabled={opportunity.status === 'activated'}>
          <Rocket size={16} />
          تفعيل
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
