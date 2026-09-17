import { useQuery } from '@tanstack/react-query'
import { facebookMetaApi } from '../api/facebookMetaApi'

export function useFacebookIntegrations(tenant, options = {}) {
  return useQuery({
    queryKey: ['meta-integrations', 'facebook-integrations', tenant],
    queryFn: () => facebookMetaApi.getIntegrations(),
    enabled: Boolean(tenant) && (options.enabled ?? true),
    select: (data) => data?.data ?? data,
    ...options,
  })
}
