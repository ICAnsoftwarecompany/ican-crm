import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { integrationsApi } from '../api/integrationsApi'
import { extractList } from '../../../shared/utils/apiResponse'

export function useIntegrations() {
  return useQuery({
    queryKey: ['integrations', 'list'],
    queryFn: () => integrationsApi.getIntegrations(),
    select: (data) => extractList(data, ['integrations']),
  })
}

export function useIntegrationMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['integrations'] })

  return {
    save: useMutation({ mutationFn: integrationsApi.saveIntegration, onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, payload }) => integrationsApi.updateIntegration(id, payload),
      onSuccess: invalidate,
    }),
  }
}
