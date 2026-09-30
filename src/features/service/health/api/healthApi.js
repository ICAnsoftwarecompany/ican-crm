import { useQuery } from '@tanstack/react-query'
import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'

const api = createServiceApi('ai')
const unwrap = (response) => response.data?.data ?? response.data

/**
 * Customer health / churn score (spec §45.2). { customer, score 0–100, band healthy|watch|at_risk,
 * factors[{ key, impact, value }], computed_at }. A signal for people and rules — it changes nothing by itself.
 */
export const healthApi = {
  customer: async (customerId) => unwrap(await api.get(serviceEndpoints.customerHealth(customerId))),
  list: async (params) => (await api.get(serviceEndpoints.health, { params })).data,
  advanced: async (period) => unwrap(await api.get(serviceEndpoints.reportAdvanced, { params: { period } })),
}

export const useCustomerHealth = (customerId) => useQuery({ queryKey: serviceKeys.customerHealth(customerId), queryFn: () => healthApi.customer(customerId), enabled: Boolean(customerId), staleTime: 60 * 1000 })
export const useHealthList = (params) => useQuery({ queryKey: serviceKeys.health(params), queryFn: () => healthApi.list(params), staleTime: 60 * 1000 })
export const useAdvancedReport = (period) => useQuery({ queryKey: serviceKeys.reportAdvanced(period), queryFn: () => healthApi.advanced(period) })
