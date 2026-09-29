import { useMutation, useQuery } from '@tanstack/react-query'
import { createServiceApi } from '../../core/api/serviceHttp'
import { serviceEndpoints } from '../../core/api/endpoints'
import { serviceKeys } from '../../core/constants/queryKeys'

const api = createServiceApi('billing')
const unwrap = (response) => response.data?.data ?? response.data

/**
 * Billing Lite plans (spec §29.4–29.6). Plans are rules; the **server** computes every amount.
 * Preview: POST /billing/payment-plans/{id}/preview { item_id?, price?, quantity, contract_date, delivery_date?,
 * overrides: { down_percent?, count?, discount_percent? } } → { final_price, lines[{ seq, line_type, due_date, amount,
 * in_price, includes_reservation?, interest_share? }], totals{ in_price, interest, outside_price, grand_total },
 * warnings[], requires_approval }. Nothing is saved.
 */
export const billingApi = {
  plansForItem: async (itemId) => unwrap(await api.get(serviceEndpoints.settings.paymentPlans, { params: { item_id: itemId } })) || [],
  allPlans: async () => unwrap(await api.get(serviceEndpoints.settings.paymentPlans)) || [],
  preview: async ({ planId, ...payload }) => unwrap(await api.post(serviceEndpoints.paymentPlanPreview(planId), payload)),
}

export const usePlansForItem = (itemId) =>
  useQuery({ queryKey: itemId ? serviceKeys.plansForItem(itemId) : [...serviceKeys.billing(), 'all-plans'], queryFn: () => (itemId ? billingApi.plansForItem(itemId) : billingApi.allPlans()) })

/** Preview is a POST that saves nothing — modelled as a mutation so every change re-runs it on demand. */
export const usePlanPreview = () => useMutation({ mutationFn: billingApi.preview })
