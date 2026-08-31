import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { leadsApi } from '../api/leadsApi'
import { leadAssignmentApi } from '../api/leadAssignmentApi'
import { interestedsApi } from '../api/interestedsApi'
import { QUERY_KEYS } from '../../../shared/constants/queryKeys'
import { extractList } from '../../../shared/utils/apiResponse'

export function useLeadLogs(params, options = {}) {
  const { select, ...queryOptions } = options

  return useQuery({
    queryKey: [...QUERY_KEYS.leads.all, 'logs', params],
    queryFn: () => leadsApi.getLogs(params),
    select: select || ((data) => extractList(data, ['logs', 'leads'])),
    ...queryOptions,
  })
}

export function useLeadLog(leadId, params, options = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.leads.detail(leadId), 'log', params],
    queryFn: () => leadsApi.getLeadLog(leadId, params),
    enabled: Boolean(leadId) && (options.enabled ?? true),
    select: (data) => extractList(data, ['logs', 'lead_log', 'activities']),
    ...options,
  })
}

export function useAssignmentRules() {
  return useQuery({
    queryKey: QUERY_KEYS.assignmentRules.list,
    queryFn: () => leadAssignmentApi.getRules(),
    select: (data) => extractList(data, ['rules']),
  })
}

export function useLeadMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leads.all })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers.all })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignmentRules.all })
  }

  return {
    saveAction: useMutation({ mutationFn: leadsApi.saveAction, onSuccess: invalidate }),
    updateTag: useMutation({ mutationFn: leadsApi.updateTag, onSuccess: invalidate }),
    distribute: useMutation({ mutationFn: leadsApi.distributeManually, onSuccess: invalidate }),
    createRule: useMutation({ mutationFn: leadAssignmentApi.createRule, onSuccess: invalidate }),
    updateRule: useMutation({
      mutationFn: ({ id, payload }) => leadAssignmentApi.updateRule(id, payload),
      onSuccess: invalidate,
    }),
    saveInterested: useMutation({ mutationFn: interestedsApi.save, onSuccess: invalidate }),
    updateInterested: useMutation({ mutationFn: interestedsApi.update, onSuccess: invalidate }),
    deleteInterested: useMutation({ mutationFn: interestedsApi.delete, onSuccess: invalidate }),
  }
}
