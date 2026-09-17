import { Mail } from 'lucide-react'
import { WhatsappLogoIcon } from '../../conversations/components/WhatsappNavbarButton'
import { MessengerLogoIcon } from '../../conversations/components/MessengerNavbarButton'
import { GmailLogoIcon } from '../../conversations/components/GmailNavbarButton'

/**
 * Outreach channel registry — the single source of truth for what each
 * channel can/can't do inside the Outreach Campaigns wizard.
 *
 * UI code must branch on these capability flags, never on
 * `channel === 'whatsapp'` scattered through components. See
 * OUTREACH_CAMPAIGNS_ARCHITECTURE_AR.md section "Channel Registry" for the
 * full rationale and the "how to add a channel" checklist.
 *
 * @typedef {Object} OutreachChannelDefinition
 * @property {string} key - Backend `channel` value, sent as-is in the create/edit payload.
 * @property {string} labelKey - i18n key for the channel's display name.
 * @property {string} descriptionKey - i18n key for the short marketing blurb shown on the channel picker card.
 * @property {React.ComponentType} icon - Brand icon component (never rely on color alone for identification).
 * @property {string} accent - Brand color, used alongside the icon, not instead of it.
 * @property {boolean} supportsSubject - Whether the content step should render a subject field.
 * @property {boolean} supportsTemplates - Whether a pre-approved template must/can be picked (WhatsApp Business API rule).
 * @property {boolean} supportsAttachments - Whether campaign-level image attachments apply (today this is channel-agnostic on the backend — see docs).
 * @property {boolean} supportsVariables - Whether the content step should offer template variable inputs.
 * @property {'phone'|'email'|'unknown'} eligibilityField - What audience field determines whether a customer can receive this channel. 'unknown' means the backend does not currently expose enough data to compute eligibility (see docs "Backend Gaps").
 */

/** @type {Record<string, OutreachChannelDefinition>} */
export const CAMPAIGN_CHANNELS = {
  whatsapp: {
    key: 'whatsapp',
    labelKey: 'outreachCampaigns.channels.whatsapp.label',
    descriptionKey: 'outreachCampaigns.channels.whatsapp.description',
    icon: WhatsappLogoIcon,
    accent: '#25D366',
    supportsSubject: false,
    supportsTemplates: true,
    supportsAttachments: true,
    supportsVariables: true,
    eligibilityField: 'phone',
  },
  gmail: {
    key: 'gmail',
    labelKey: 'outreachCampaigns.channels.gmail.label',
    descriptionKey: 'outreachCampaigns.channels.gmail.description',
    icon: GmailLogoIcon,
    accent: '#EA4335',
    supportsSubject: true,
    supportsTemplates: false,
    supportsAttachments: true,
    supportsVariables: false,
    eligibilityField: 'email',
  },
  messenger: {
    key: 'messenger',
    labelKey: 'outreachCampaigns.channels.messenger.label',
    descriptionKey: 'outreachCampaigns.channels.messenger.description',
    icon: MessengerLogoIcon,
    accent: '#0A7CFF',
    supportsSubject: false,
    supportsTemplates: false,
    supportsAttachments: true,
    supportsVariables: false,
    // Backend clarification required: `external_id` on a Messenger campaign is
    // documented only as "a number", with no confirmed link to a customer
    // field. We can't compute per-customer eligibility for Messenger today —
    // see docs "Backend Gaps / Required Evolution".
    eligibilityField: 'unknown',
  },
}

export const CAMPAIGN_CHANNEL_LIST = Object.values(CAMPAIGN_CHANNELS)

export function getChannelDefinition(channelKey) {
  return CAMPAIGN_CHANNELS[channelKey] || null
}

/** Generic fallback icon for an unrecognized/legacy channel value. */
export const UNKNOWN_CHANNEL_ICON = Mail
