import { extractList } from '../../../shared/utils/apiResponse'

/**
 * Adapter between the backend's campaign shape and the frontend domain model.
 *
 * The backend's response shape for campaign objects is NOT documented
 * anywhere (CodeA1_API_BackEndDocumentation.md explicitly has no response
 * examples for list/detail endpoints). This function must therefore read
 * every plausible key spelling defensively and never throw on a missing
 * field, so the UI keeps working once real response shapes are confirmed
 * and can be tightened later — see docs "Backend Gaps".
 *
 * @param {object} apiCampaign
 */
export function normalizeCampaign(apiCampaign) {
  const campaign = apiCampaign || {}

  const customers = extractList(campaign, ['customers', 'campaign_customers'])
  const users = extractList(campaign, ['users', 'assigned_users', 'campaign_users'])
  const attachments = extractList(campaign, ['attachments', 'images', 'media'])

  return {
    id: campaign.id ?? campaign.campaign_id ?? null,
    name: campaign.name ?? campaign.title ?? '',
    channel: campaign.channel ?? '',
    status: campaign.status ?? campaign.state ?? '',
    message: campaign.message ?? '',
    subject: campaign.subject ?? '',
    startsAt: campaign.starts_at ?? campaign.startsAt ?? '',
    createdAt: campaign.created_at ?? campaign.createdAt ?? '',
    updatedAt: campaign.updated_at ?? campaign.updatedAt ?? '',
    createdBy: campaign.created_by ?? campaign.creator ?? campaign.creator_name ?? null,
    metadata: campaign.metadata ?? {},
    whatsappTemplateGeneral: campaign.whatsapp_templet_genral ?? null,
    whatsappTemplateId: campaign.whatsapp_templete_id ?? null,
    externalId: campaign.external_id ?? null,
    customers,
    users,
    attachments,
    customersCount: campaign.customers_count ?? customers.length,
    usersCount: campaign.users_count ?? users.length,
    // Kept for anything not explicitly mapped above (e.g. once response
    // shapes are confirmed, or for engagement metrics as they become real).
    raw: campaign,
  }
}

export function normalizeCampaignList(response) {
  const list = extractList(response, ['campaigns', 'data', 'items'])
  return list.map(normalizeCampaign)
}
