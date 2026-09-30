import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'
import { getServiceErrorMessage } from '../../core/utils/serviceErrors'

const api = createServiceApi('ai')
const unwrap = (response) => response.data?.data ?? response.data
const AI = serviceEndpoints.ai

/**
 * AI layer (spec §45) — signals, suggestions, classifications, summaries. The UI never applies a suggestion by itself:
 * the agent accepts it (and the acceptance is reported back as feedback). Settings: { features{ triage, sentiment,
 * suggested_reply, summaries, duplicates, smart_assignment, agent }, tone, language, auto_reply{ enabled, min_confidence,
 * max_per_conversation }, blocked_topics[], handoff_topics[], monthly_limit }. 403 FEATURE_DISABLED / 429 AI_LIMIT_REACHED.
 */
export const aiApi = {
  settings: async () => unwrap(await api.get(AI.settings)),
  saveSettings: async (payload) => unwrap(await api.put(AI.settings, payload)),
  usage: async () => unwrap(await api.get(AI.usage)),
  triage: async (payload) => unwrap(await api.post(AI.triage, payload)),
  insights: async (caseId) => unwrap(await api.get(AI.case(caseId, 'insights'))),
  summary: async (caseId) => unwrap(await api.post(AI.case(caseId, 'summary'))),
  suggestReply: async ({ caseId, language }) => unwrap(await api.post(AI.case(caseId, 'suggest-reply'), { language })),
  duplicates: async (caseId) => unwrap(await api.get(AI.case(caseId, 'duplicates'))) || [],
  assignment: async (caseId) => unwrap(await api.get(AI.case(caseId, 'assignment'))) || [],
  feedback: async ({ caseId, feature, accepted }) => unwrap(await api.post(AI.case(caseId, 'feedback'), { feature, accepted })),
  markDuplicate: async ({ caseId, ...payload }) => unwrap(await api.post(serviceEndpoints.caseMarkDuplicate(caseId), payload)),
}

export const useAiSettings = () => useQuery({ queryKey: serviceKeys.aiSettings(), queryFn: aiApi.settings, staleTime: 5 * 60 * 1000 })
export const useAiUsage = () => useQuery({ queryKey: [...serviceKeys.ai(), 'usage'], queryFn: aiApi.usage })
export const useAiInsights = (caseId, version) => useQuery({ queryKey: [...serviceKeys.aiCase(caseId, 'insights'), version], queryFn: () => aiApi.insights(caseId), enabled: Boolean(caseId) })
export const useAiDuplicates = (caseId, enabled = true) => useQuery({ queryKey: serviceKeys.aiCase(caseId, 'duplicates'), queryFn: () => aiApi.duplicates(caseId), enabled: Boolean(caseId) && enabled, staleTime: 60 * 1000 })
export const useAiAssignment = (caseId, enabled = true) => useQuery({ queryKey: serviceKeys.aiCase(caseId, 'assignment'), queryFn: () => aiApi.assignment(caseId), enabled: Boolean(caseId) && enabled, staleTime: 60 * 1000 })

export function useAiMutations() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const onError = (error) => {
    if (error?.response?.status !== 422) toast.error(getServiceErrorMessage(error, t))
  }
  const refreshUsage = () => queryClient.invalidateQueries({ queryKey: [...serviceKeys.ai(), 'usage'] })
  return {
    summary: useMutation({ mutationFn: aiApi.summary, onSuccess: refreshUsage, onError }),
    suggestReply: useMutation({ mutationFn: aiApi.suggestReply, onSuccess: refreshUsage, onError }),
    triage: useMutation({ mutationFn: aiApi.triage, onError: () => {} }),
    feedback: useMutation({ mutationFn: aiApi.feedback }),
    saveSettings: useMutation({ mutationFn: aiApi.saveSettings, onSuccess: () => queryClient.invalidateQueries({ queryKey: serviceKeys.ai() }), onError }),
    markDuplicate: useMutation({
      mutationFn: aiApi.markDuplicate,
      onSuccess: (item) => {
        queryClient.setQueryData(serviceKeys.caseDetail(item.id), item)
        queryClient.invalidateQueries({ queryKey: serviceKeys.cases() })
      },
      onError,
    }),
  }
}
