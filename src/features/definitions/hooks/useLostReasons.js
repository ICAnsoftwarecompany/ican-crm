import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { lostReasonsApi } from '../api/lostReasonsApi'
import { extractList } from '../../../shared/utils/apiResponse'
import { normalizeLostReason, sortLostReasons } from '../utils/lostReasons'

export const lostReasonsKeys = { all: ['definitions', 'lost-reasons'] }

/** Lead lost reasons, normalized and sorted. `activeOnly` hides the turned-off ones (for picking a reason). */
export function useLostReasons({ activeOnly = false, enabled = true } = {}) {
  return useQuery({
    queryKey: lostReasonsKeys.all,
    queryFn: () => lostReasonsApi.list(),
    enabled,
    select: (response) => {
      const rows = sortLostReasons(extractList(response, ['lost_reasons', 'reasons']).map(normalizeLostReason))
      return activeOnly ? rows.filter((row) => row.active) : rows
    },
  })
}

export function useLostReasonMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: lostReasonsKeys.all })
  return {
    create: useMutation({ mutationFn: (payload) => lostReasonsApi.create(payload), onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, payload }) => lostReasonsApi.update(id, payload), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: (id) => lostReasonsApi.remove(id), onSuccess: invalidate }),
  }
}
