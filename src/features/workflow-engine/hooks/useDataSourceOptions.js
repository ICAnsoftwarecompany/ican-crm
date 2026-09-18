import { useMemo } from 'react'
import { useUsers } from '../../users/hooks/useUsers'
import { useTeams } from '../../teams/hooks/useTeams'
import { useStatuses, useTags } from '../../definitions/hooks/useDefinitions'
import { useOutreachCampaigns } from '../../outreach-campaigns/hooks/useOutreachCampaigns'
import { useWhatsappTemplates } from '../../integrations/whatsapp'
import { useFacebookIntegrations } from '../../meta-integrations/hooks/useFacebookIntegrations'
import { useGmailMailboxes } from '../../conversations/hooks/useGmailConversations'
import { useAuthStore } from '../../../store/authStore'
import { resolveTenantId } from '../../../services/tenantResolver'
import { OPPORTUNITY_STATUSES } from '../../opportunities/constants/opportunityTypes'
import { CAMPAIGN_CHANNEL_LIST } from '../../outreach-campaigns/config/campaignChannels'

/**
 * Adapter between a field's `source` key and the project's real data hooks.
 * This is the ONLY place a workflow field component is allowed to know
 * about concrete feature hooks — see docs section "Dynamic Data Sources".
 *
 * All underlying hooks are called unconditionally (React Query dedupes
 * identical concurrent queries by key, so this has no real network cost
 * beyond the one the app already pays elsewhere) and the result for the
 * requested `source` is picked out — this avoids calling hooks
 * conditionally, which would break the Rules of Hooks if a field's
 * `source` ever changed after mount.
 *
 * @param {string} source
 * @returns {{ options: {value:string,label:string}[], isLoading: boolean }}
 */
export function useDataSourceOptions(source) {
  const user = useAuthStore((state) => state.user)
  const tenant = resolveTenantId(user)

  const usersQuery = useUsers()
  const teamsQuery = useTeams()
  const statusesQuery = useStatuses()
  const tagsQuery = useTags()
  const campaignsQuery = useOutreachCampaigns()
  const templatesQuery = useWhatsappTemplates()
  const integrationsQuery = useFacebookIntegrations(tenant)
  const gmailMailboxesQuery = useGmailMailboxes()

  return useMemo(() => {
    switch (source) {
      case 'users':
        return {
          options: (usersQuery.data || []).map((user) => ({ value: String(user.id), label: user.name || user.email || `#${user.id}` })),
          isLoading: usersQuery.isLoading,
        }
      case 'teams':
        return {
          options: (teamsQuery.data || []).map((team) => ({ value: String(team.id), label: team.name || `#${team.id}` })),
          isLoading: teamsQuery.isLoading,
        }
      case 'lead_statuses':
        return {
          options: (statusesQuery.data || []).map((status) => ({ value: String(status.id), label: status.status || status.name || String(status.id) })),
          isLoading: statusesQuery.isLoading,
        }
      case 'tags':
        return {
          options: (tagsQuery.data || []).map((tag) => ({ value: String(tag.id), label: tag.name || tag.tag || String(tag.id) })),
          isLoading: tagsQuery.isLoading,
        }
      case 'opportunity_statuses':
        return { options: OPPORTUNITY_STATUSES.map((status) => ({ value: status.value, label: status.label })), isLoading: false }
      case 'outreach_campaigns':
        return {
          options: (campaignsQuery.campaigns || []).map((campaign) => ({ value: String(campaign.id), label: campaign.name || `#${campaign.id}` })),
          isLoading: campaignsQuery.isLoading,
        }
      case 'whatsapp_templates':
        return {
          options: (templatesQuery.data || []).map((template) => ({
            value: String(template.id ?? template.name),
            label: template.name || String(template.id),
          })),
          isLoading: templatesQuery.isLoading,
        }
      case 'outreach_channels':
        return { options: CAMPAIGN_CHANNEL_LIST.map((definition) => ({ value: definition.key, labelKey: definition.labelKey })), isLoading: false }
      case 'whatsapp_phone_numbers':
        return {
          options: (integrationsQuery.data?.whatsapp || []).map((phone) => ({
            value: phone.phone_number_id,
            label: `${phone.verified_name || phone.name} — ${phone.display_phone_number || ''}`,
          })),
          isLoading: integrationsQuery.isLoading,
        }
      case 'messenger_pages':
        return {
          options: (integrationsQuery.data?.messenger || []).map((page) => ({ value: String(page.id), label: page.name })),
          isLoading: integrationsQuery.isLoading,
        }
      case 'gmail_mailboxes':
        return {
          options: (gmailMailboxesQuery.data || []).map((mailbox) => ({
            value: mailbox.email || mailbox.mailbox_email,
            label: mailbox.email || mailbox.mailbox_email,
          })),
          isLoading: gmailMailboxesQuery.isLoading,
        }
      default:
        return { options: [], isLoading: false }
    }
  }, [
    source,
    usersQuery.data, usersQuery.isLoading,
    teamsQuery.data, teamsQuery.isLoading,
    statusesQuery.data, statusesQuery.isLoading,
    tagsQuery.data, tagsQuery.isLoading,
    campaignsQuery.campaigns, campaignsQuery.isLoading,
    templatesQuery.data, templatesQuery.isLoading,
    integrationsQuery.data, integrationsQuery.isLoading,
    gmailMailboxesQuery.data, gmailMailboxesQuery.isLoading,
  ])
}
