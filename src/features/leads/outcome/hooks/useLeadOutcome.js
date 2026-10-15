import { useMutation, useQueryClient } from '@tanstack/react-query'
import { leadOutcomeApi } from '../api/leadOutcomeApi'

/** Won / lost mutations; both refresh the Leads Center (customers, leads) and deals caches. */
export function useLeadOutcome() {
  const queryClient = useQueryClient()
  const invalidate = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: ['customers'] }),
    queryClient.invalidateQueries({ queryKey: ['leads'] }),
    queryClient.invalidateQueries({ queryKey: ['deals'] }),
  ])
  return {
    markLost: useMutation({ mutationFn: ({ leadId, payload }) => leadOutcomeApi.markLost(leadId, payload), onSuccess: invalidate }),
    markWon: useMutation({ mutationFn: ({ dealId, leadId, payload }) => leadOutcomeApi.markWon(dealId, leadId, payload), onSuccess: invalidate }),
  }
}
