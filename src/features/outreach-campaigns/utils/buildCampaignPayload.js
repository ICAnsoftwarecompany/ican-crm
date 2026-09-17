import { formatCampaignStartsAt } from './campaignDateTime'

/**
 * Transforms the Campaign Wizard's shared form state into the exact,
 * channel-specific payload shape documented in
 * features/MessegeCampaign/CodeA1_API_BackEndDocumentation.md.
 *
 * This is the ONLY place backend payload shape knowledge should live —
 * wizard step components must never build request bodies themselves.
 *
 * Deliberately NOT included, because the backend doesn't accept them today
 * (see docs "Backend Gaps"): `description`, `objective`. Both are captured
 * in the wizard purely for the user's own organization and never leave the
 * browser.
 *
 * @param {object} formState
 */
export function buildCampaignPayload(formState = {}) {
  const { name, channel, schedule, content, audience, team } = formState

  const base = {
    name: (name || '').trim(),
    channel,
    starts_at: formatCampaignStartsAt(schedule?.startsAt),
    message: content?.message ?? '',
    customer_ids: audience?.customerIds || [],
    user_ids: team?.userIds || [],
  }

  if (channel === 'whatsapp') {
    return {
      ...base,
      whatsapp_templet_genral: content?.whatsapp?.templateGeneral ? 1 : 0,
      whatsapp_templete_id: content?.whatsapp?.templateId ? Number(content.whatsapp.templateId) : undefined,
      metadata: {
        phone_number_id: content?.whatsapp?.phoneNumberId || '',
        template_params: {
          header: content?.whatsapp?.headerParams || [],
          body: content?.whatsapp?.bodyParams || [],
        },
      },
    }
  }

  if (channel === 'gmail') {
    return {
      ...base,
      subject: content?.subject ?? '',
      metadata: {
        mailbox_email: content?.gmail?.mailboxEmail || '',
      },
    }
  }

  if (channel === 'messenger') {
    return {
      ...base,
      external_id: content?.messenger?.externalId ? Number(content.messenger.externalId) : undefined,
      metadata: {},
    }
  }

  return base
}

/**
 * The `updateCampaign`/`edite` endpoint accepts the same channel-conditional
 * body as create (per the docs) plus the campaign id in the URL — the body
 * builder is identical, only the API call differs. Kept as a thin alias so
 * call sites read clearly (`buildCampaignEditPayload` vs `buildCampaignPayload`).
 */
export const buildCampaignEditPayload = buildCampaignPayload
