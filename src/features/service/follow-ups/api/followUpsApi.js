import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'
import { getServiceErrorMessage } from '../../core/utils/serviceErrors'

const api = createServiceApi('followUps')
const unwrap = (response) => response.data?.data ?? response.data
const F = serviceEndpoints.followUps

/**
 * Follow-up enrollments (spec §39.3). Item: { id, program{ id, name, version }, program_version, customer, owner,
 * status (active|completed|exited), current_step, step{ key, offset, channel, task_title, checklist[], outcomes[],
 * on_outcome }, step_number, steps_total, attempts, next_due_at, bucket (overdue|due_today|upcoming), history[
 * { step_key, outcome, note, checklist, at, by, case? }], exit_reason }. List response adds `summary` counts.
 */
export const followUpsApi = {
  list: async (params) => (await api.get(F, { params: { per_page: 100, ...params } })).data,
  enroll: async (payload) => unwrap(await api.post(F, payload)),
  outcome: async ({ id, ...payload }) => unwrap(await api.post(`${F}/${id}/outcome`, payload)),
  exit: async ({ id, reason }) => unwrap(await api.post(`${F}/${id}/exit`, { reason })),
}

export const useFollowUpList = (params) => useQuery({ queryKey: serviceKeys.followUpList(params), queryFn: () => followUpsApi.list(params) })

export function useFollowUpMutations() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const onError = (error) => {
    if (error?.response?.status !== 422) toast.error(getServiceErrorMessage(error, t))
  }
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: serviceKeys.followUps() })
    queryClient.invalidateQueries({ queryKey: serviceKeys.cases() })
  }
  return {
    enroll: useMutation({ mutationFn: followUpsApi.enroll, onSuccess: refresh, onError }),
    outcome: useMutation({ mutationFn: followUpsApi.outcome, onSuccess: refresh, onError }),
    exit: useMutation({ mutationFn: followUpsApi.exit, onSuccess: refresh, onError }),
  }
}
