import { registerDataSource } from '../registry/workflowRegistry'

/**
 * Records which data-source keys exist (for the registry/docs to
 * introspect). The actual fetching per key lives in
 * hooks/useDataSourceOptions.js, mapped to real project hooks — never
 * hard-coded fetching inside field components.
 */
registerDataSource('users', { labelKey: 'workflow.dataSources.users' })
registerDataSource('teams', { labelKey: 'workflow.dataSources.teams' })
registerDataSource('lead_statuses', { labelKey: 'workflow.dataSources.leadStatuses' })
registerDataSource('tags', { labelKey: 'workflow.dataSources.tags' })
registerDataSource('opportunity_statuses', { labelKey: 'workflow.dataSources.opportunityStatuses' })
registerDataSource('outreach_campaigns', { labelKey: 'workflow.dataSources.outreachCampaigns' })
registerDataSource('whatsapp_templates', { labelKey: 'workflow.dataSources.whatsappTemplates' })
registerDataSource('outreach_channels', { labelKey: 'workflow.dataSources.outreachChannels' })
registerDataSource('whatsapp_phone_numbers', { labelKey: 'workflow.dataSources.whatsappPhoneNumbers' })
registerDataSource('messenger_pages', { labelKey: 'workflow.dataSources.messengerPages' })
registerDataSource('gmail_mailboxes', { labelKey: 'workflow.dataSources.gmailMailboxes' })
