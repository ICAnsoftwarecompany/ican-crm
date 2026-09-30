import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'
import { getServiceErrorMessage } from '../../core/utils/serviceErrors'

const api = createServiceApi('quality')
const unwrap = (response) => response.data?.data ?? response.data
const Q = serviceEndpoints.quality

/**
 * Quality reviews (spec §42.2). Review: { id, checklist{ id, name, criteria[{ key, label, weight }], pass_score },
 * subject_type, subject{ id, number, title }, agent, reviewer, source (rule id | manual), status (pending|done),
 * scores{ key: 0..5 }, total (weighted %), passed, comments, root_cause, corrective_action, preventive_action }.
 * A failing review needs a root cause + corrective action (422 otherwise).
 */
export const qualityApi = {
  reviews: async (params) => unwrap(await api.get(Q.reviews, { params })) || [],
  summary: async (params) => unwrap(await api.get(Q.summary, { params })),
  queueCase: async (caseId) => unwrap(await api.post(Q.reviews, { subject_id: caseId })),
  submit: async ({ id, ...payload }) => unwrap(await api.patch(`${Q.reviews}/${id}`, payload)),
  remove: async (id) => api.delete(`${Q.reviews}/${id}`),
  sample: async () => unwrap(await api.post(Q.sample)),
}

export const useQualityReviews = (params) => useQuery({ queryKey: serviceKeys.qualityReviews(params), queryFn: () => qualityApi.reviews(params), placeholderData: (previous) => previous })
export const useQualitySummary = (params) => useQuery({ queryKey: serviceKeys.qualitySummary(params), queryFn: () => qualityApi.summary(params) })

export function useQualityMutations() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: serviceKeys.quality() })
    queryClient.invalidateQueries({ queryKey: [...serviceKeys.all, 'reports'] })
  }
  const onError = (error) => {
    if (error?.response?.status !== 422) toast.error(getServiceErrorMessage(error, t))
  }
  return {
    queueCase: useMutation({ mutationFn: qualityApi.queueCase, onSuccess, onError }),
    submit: useMutation({ mutationFn: qualityApi.submit, onSuccess, onError }),
    remove: useMutation({ mutationFn: qualityApi.remove, onSuccess, onError }),
    sample: useMutation({ mutationFn: qualityApi.sample, onSuccess, onError }),
  }
}
