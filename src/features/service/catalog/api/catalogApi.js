import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'

const api = createServiceApi('catalog')
const unwrap = (response) => response.data?.data ?? response.data

/**
 * Catalog API (spec §25–26).
 * - Capability registry: [{ code, version, applies_to: product|service|both, group, depends_on?, config_fields: [{ key, type: number|select|multiselect|switch|text, options?, default?, min? }] }]
 *   Code-owned on the backend; labels come from `service.capabilities.<code>.*`.
 * - Service models: [{ key: 'A'…'H', capabilities: [code], creates }] — presets only.
 * - Catalog items: existing Products & Services + `service_config { item_type_id, capability_overrides[],
 *   fulfillment { creates, record_type_id, default_queue_id, allowed_case_type_ids[], portal_visible }, relations[] }`.
 *   Only `service_config` is written from here (PATCH { service_config }); product fields stay in Products.
 */
export const catalogApi = {
  capabilities: async () => unwrap(await api.get(serviceEndpoints.catalogCapabilities)) || [],
  serviceModels: async () => unwrap(await api.get(serviceEndpoints.catalogServiceModels)) || [],
  items: async (params) => unwrap(await api.get(serviceEndpoints.catalogItems, { params })) || [],
  updateServiceConfig: async (itemId, serviceConfig) => unwrap(await api.patch(serviceEndpoints.catalogItem(itemId), { service_config: serviceConfig })),
}

const STATIC = { staleTime: 30 * 60 * 1000 }

export const useCapabilityRegistry = () => useQuery({ queryKey: serviceKeys.capabilityRegistry(), queryFn: catalogApi.capabilities, ...STATIC })
export const useServiceModels = () => useQuery({ queryKey: serviceKeys.serviceModels(), queryFn: catalogApi.serviceModels, ...STATIC })

export function useCatalogItems(params, { enabled = true } = {}) {
  return useQuery({ queryKey: serviceKeys.catalogItems(params), queryFn: () => catalogApi.items(params), placeholderData: (previous) => previous, enabled })
}

export function useUpdateServiceConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, serviceConfig }) => catalogApi.updateServiceConfig(itemId, serviceConfig),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...serviceKeys.catalog(), 'items'] }),
  })
}
