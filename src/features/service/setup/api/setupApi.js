import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'

const api = createServiceApi('setup')

/**
 * Industry templates (spec §47.2). `GET /settings/templates` → [{ key, models[], terminology{}, preview{ case_types[],
 * queues[], record_types[], item_types[], sla_policies[] } }] + meta.active.
 * `POST /settings/templates/{key}/apply { models[], terminology{}, dry_run }` — the server seeds configuration
 * idempotently (existing data kept); dry_run returns the same summary without changes.
 */
export const setupApi = {
  templates: async () => (await api.get(serviceEndpoints.setupTemplates)).data,
  apply: async ({ key, ...payload }) => (await api.post(serviceEndpoints.setupApply(key), payload)).data?.data,
}

export const useSetupTemplates = () => useQuery({ queryKey: [...serviceKeys.all, 'setup-templates'], queryFn: setupApi.templates, staleTime: 5 * 60 * 1000 })

export function useApplyTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: setupApi.apply,
    onSuccess: (result) => {
      // A real apply changes configuration everywhere: refresh the whole Customer Hub.
      if (!result?.dry_run) queryClient.invalidateQueries({ queryKey: serviceKeys.all })
    },
  })
}
