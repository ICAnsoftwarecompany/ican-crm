import httpClient from '../../../../services/httpClient'
import { toFormData } from '../../../../services/apiPayload'

/**
 * Winning / losing a lead outside a deal's board (Postman "Leads", 2026-10-15):
 * - lost: `POST /api/tenant/leads/{leadId}/lost`, multipart `lost_reason_id`, `note`.
 * - won:  `POST /api/tenant/deals/{dealId}/directe/won/{leadId}` (path as the backend has it, "directe"), JSON
 *   `{ items: [{ product_id, quantity, unit_price, discount }], payment_type, down_payment, number_of_installments?,
 *   frequency?, interest_rate?, first_due_date? }` — the same body as the deal "won" (`buildWonPayload`).
 */
export const leadOutcomeApi = {
  markLost: async (leadId, payload) => (await httpClient.post(`/api/tenant/leads/${leadId}/lost`, toFormData(payload))).data,
  markWon: async (dealId, leadId, payload) => (await httpClient.post(`/api/tenant/deals/${dealId}/directe/won/${leadId}`, payload)).data,
}
