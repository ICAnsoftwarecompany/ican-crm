import { useQuery } from '@tanstack/react-query'
import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'

const api = createServiceApi('feedback')

/**
 * GET /service/feedback/responses?score=&period=&page=&per_page=
 * → { data: [{ id, case_id, case: {id, case_number, subject, customer}, survey, score 1–5, comment, channel, responded_at }],
 *     meta: { current_page, last_page, total, summary: { count, average, satisfied_percent, distribution[] } } }
 * Responses are collected by the server (survey sent when a case is resolved; portal POST /feedback/responses).
 */
export function useFeedbackResponses(params) {
  return useQuery({
    queryKey: serviceKeys.feedbackResponses(params),
    queryFn: async () => (await api.get(serviceEndpoints.feedbackResponses, { params })).data,
    placeholderData: (previous) => previous,
  })
}
