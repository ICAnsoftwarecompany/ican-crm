import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'
import { getServiceErrorMessage } from '../../core/utils/serviceErrors'

const api = createServiceApi('apiAccess')
const unwrap = (response) => response.data?.data ?? response.data
const C = serviceEndpoints.apiClients
const W = serviceEndpoints.webhookSubscriptions

/**
 * Public API clients (spec §16.5) and outbound webhooks (§16.4).
 * Client: { id, name, key_prefix, key_last4, scopes[], bound_customer_id, bound_customer, rate_limit (req/min),
 * ip_allowlist[], status (active|disabled), last_used_at, requests_24h }. Create / rotate answer `{ data, key }` —
 * the clear key exists only in that response. Webhook: { id, name, url, events[], api_client_id, secret_last4,
 * status (active|paused), consecutive_failures, deliveries_24h, failed_24h, last_delivery_at }; create / rotate-secret
 * answer `{ data, secret }`. Delivery: { id, event_id, event_name, status (delivered|retrying|failed), attempts,
 * response_code, duration_ms, error, next_retry_at, last_attempt_at, request (event contract §6.3) }.
 */
export const apiAccessApi = {
  catalog: async () => unwrap(await api.get(`${C}/catalog`)),
  clients: async () => unwrap(await api.get(C)) || [],
  createClient: async (payload) => (await api.post(C, payload)).data,
  updateClient: async ({ id, ...payload }) => unwrap(await api.patch(`${C}/${id}`, payload)),
  rotateKey: async (id) => (await api.post(`${C}/${id}/rotate`)).data,
  deleteClient: async (id) => api.delete(`${C}/${id}`),
  webhooks: async () => unwrap(await api.get(W)) || [],
  createWebhook: async (payload) => (await api.post(W, payload)).data,
  updateWebhook: async ({ id, ...payload }) => unwrap(await api.patch(`${W}/${id}`, payload)),
  rotateSecret: async (id) => (await api.post(`${W}/${id}/rotate-secret`)).data,
  deleteWebhook: async (id) => api.delete(`${W}/${id}`),
  testWebhook: async (id) => unwrap(await api.post(`${W}/${id}/test`)),
  deliveries: async (id, params) => unwrap(await api.get(`${W}/${id}/deliveries`, { params })) || [],
  redeliver: async (id) => unwrap(await api.post(`${serviceEndpoints.webhookDeliveries}/${id}/redeliver`)),
}

export const useApiCatalog = () => useQuery({ queryKey: [...serviceKeys.apiAccess(), 'catalog'], queryFn: apiAccessApi.catalog, staleTime: 10 * 60 * 1000 })
export const useApiClients = () => useQuery({ queryKey: [...serviceKeys.apiAccess(), 'clients'], queryFn: apiAccessApi.clients })
export const useWebhooks = () => useQuery({ queryKey: [...serviceKeys.apiAccess(), 'webhooks'], queryFn: apiAccessApi.webhooks })
export const useWebhookDeliveries = (id, params) => useQuery({ queryKey: serviceKeys.webhookDeliveries(id, params), queryFn: () => apiAccessApi.deliveries(id, params), enabled: Boolean(id), placeholderData: (previous) => previous })

export function useApiAccessMutations() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: serviceKeys.apiAccess() })
  const onError = (error) => {
    if (error?.response?.status !== 422) toast.error(getServiceErrorMessage(error, t))
  }
  const options = { onSuccess, onError }
  return {
    createClient: useMutation({ mutationFn: apiAccessApi.createClient, ...options }),
    updateClient: useMutation({ mutationFn: apiAccessApi.updateClient, ...options }),
    rotateKey: useMutation({ mutationFn: apiAccessApi.rotateKey, ...options }),
    deleteClient: useMutation({ mutationFn: apiAccessApi.deleteClient, ...options }),
    createWebhook: useMutation({ mutationFn: apiAccessApi.createWebhook, ...options }),
    updateWebhook: useMutation({ mutationFn: apiAccessApi.updateWebhook, ...options }),
    rotateSecret: useMutation({ mutationFn: apiAccessApi.rotateSecret, ...options }),
    deleteWebhook: useMutation({ mutationFn: apiAccessApi.deleteWebhook, ...options }),
    testWebhook: useMutation({ mutationFn: apiAccessApi.testWebhook, ...options }),
    redeliver: useMutation({ mutationFn: apiAccessApi.redeliver, ...options }),
  }
}
