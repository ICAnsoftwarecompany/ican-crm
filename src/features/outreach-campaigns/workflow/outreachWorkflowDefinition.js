/**
 * Outreach Campaigns' Workflow Engine registration.
 *
 * Reuses the existing Outreach Campaign architecture entirely — no
 * WhatsApp/Gmail/Messenger code is rebuilt here, only registry
 * descriptions pointing at real APIs already used elsewhere in this
 * feature (`features/integrations/whatsapp`, `features/conversations/api/
 * gmailApi.js`) or at outreach-campaigns' customer-removal
 * endpoint.
 *
 * Per OUTREACH_CAMPAIGNS_ARCHITECTURE_AR.md, Sequence/Automation/Campaign
 * Events/CampaignMember are explicitly NOT implemented on the backend —
 * respected here: every trigger is `backendSupport: false` (campaign
 * lifecycle events don't exist), `outreach.send_messenger` is
 * `backendSupport: false` (messengerMetaApi is dead/commented-out code —
 * no real ad-hoc Messenger send API exists), while WhatsApp/Gmail sends
 * and campaign-customer removal are real, callable APIs today.
 */
import { registerWorkflowModule } from '../../workflow-engine/registry/workflowRegistry'

const outreachWorkflowDefinition = {
  module: 'outreach-campaigns',
  labelKey: 'workflow.modules.outreachCampaigns',
  icon: 'Send',

  triggers: [
    {
      id: 'campaign.started',
      type: 'trigger',
      module: 'outreach-campaigns',
      category: 'campaign',
      labelKey: 'workflow.outreach.triggers.started.label',
      icon: 'Play',
      eventName: 'campaign.started',
      fields: [{ key: 'campaign_id', type: 'select', labelKey: 'workflow.outreach.fields.campaign', source: 'outreach_campaigns' }],
      backendSupport: false,
    },
    {
      id: 'campaign.customer_added',
      type: 'trigger',
      module: 'outreach-campaigns',
      category: 'campaign',
      labelKey: 'workflow.outreach.triggers.customerAdded.label',
      icon: 'UserPlus',
      eventName: 'campaign.customer_added',
      fields: [],
      backendSupport: false,
    },
    {
      id: 'campaign.message_sent',
      type: 'trigger',
      module: 'outreach-campaigns',
      category: 'campaign',
      labelKey: 'workflow.outreach.triggers.messageSent.label',
      icon: 'Send',
      eventName: 'campaign.message_sent',
      fields: [],
      backendSupport: false,
    },
    {
      id: 'campaign.message_delivered',
      type: 'trigger',
      module: 'outreach-campaigns',
      category: 'campaign',
      labelKey: 'workflow.outreach.triggers.messageDelivered.label',
      icon: 'CheckCheck',
      eventName: 'campaign.message_delivered',
      fields: [],
      backendSupport: false,
    },
    {
      id: 'campaign.message_read',
      type: 'trigger',
      module: 'outreach-campaigns',
      category: 'campaign',
      labelKey: 'workflow.outreach.triggers.messageRead.label',
      icon: 'Eye',
      eventName: 'campaign.message_read',
      fields: [],
      backendSupport: false,
    },
    {
      id: 'campaign.message_replied',
      type: 'trigger',
      module: 'outreach-campaigns',
      category: 'campaign',
      labelKey: 'workflow.outreach.triggers.messageReplied.label',
      icon: 'MessageSquare',
      eventName: 'campaign.message_replied',
      fields: [],
      backendSupport: false,
    },
    {
      id: 'campaign.customer_exited',
      type: 'trigger',
      module: 'outreach-campaigns',
      category: 'campaign',
      labelKey: 'workflow.outreach.triggers.customerExited.label',
      icon: 'UserMinus',
      eventName: 'campaign.customer_exited',
      fields: [],
      backendSupport: false,
    },
    {
      id: 'campaign.completed',
      type: 'trigger',
      module: 'outreach-campaigns',
      category: 'campaign',
      labelKey: 'workflow.outreach.triggers.completed.label',
      icon: 'Flag',
      eventName: 'campaign.completed',
      fields: [],
      backendSupport: false,
    },
  ],

  conditions: [
    {
      id: 'campaign.channel',
      type: 'condition',
      module: 'outreach-campaigns',
      labelKey: 'workflow.outreach.conditions.channel',
      operators: ['equals', 'not_equals'],
      fields: [{ key: 'value', type: 'select', source: 'outreach_channels' }],
      backendSupport: true,
    },
  ],

  actions: [
    {
      id: 'outreach.send_whatsapp',
      type: 'action',
      module: 'outreach-campaigns',
      labelKey: 'workflow.outreach.actions.sendWhatsapp.label',
      icon: 'MessageCircle',
      recommended: true,
      fields: [
        { key: 'phone_number_id', type: 'select', labelKey: 'workflow.outreach.fields.phoneNumber', source: 'whatsapp_phone_numbers', required: true },
        { key: 'template_id', type: 'select', labelKey: 'workflow.outreach.fields.template', source: 'whatsapp_templates', required: true },
      ],
      backendSupport: true,
    },
    {
      id: 'outreach.send_gmail',
      type: 'action',
      module: 'outreach-campaigns',
      labelKey: 'workflow.outreach.actions.sendGmail.label',
      icon: 'Mail',
      recommended: true,
      fields: [
        { key: 'mailbox_email', type: 'select', labelKey: 'workflow.outreach.fields.mailbox', source: 'gmail_mailboxes', required: true },
        { key: 'subject', type: 'text', labelKey: 'workflow.outreach.fields.subject', required: true },
        { key: 'message', type: 'variable_text', labelKey: 'workflow.outreach.fields.message', required: true },
      ],
      backendSupport: true,
    },
    {
      id: 'outreach.send_messenger',
      type: 'action',
      module: 'outreach-campaigns',
      labelKey: 'workflow.outreach.actions.sendMessenger.label',
      icon: 'MessageCircle',
      recommended: true,
      fields: [
        { key: 'page_id', type: 'select', labelKey: 'workflow.outreach.fields.messengerPage', source: 'messenger_pages', required: true },
        { key: 'message', type: 'variable_text', labelKey: 'workflow.outreach.fields.message', required: true },
      ],
      backendSupport: false,
    },
    {
      id: 'outreach.remove_customer',
      type: 'action',
      module: 'outreach-campaigns',
      labelKey: 'workflow.outreach.actions.removeCustomer.label',
      icon: 'UserMinus',
      fields: [],
      backendSupport: true,
    },
    {
      id: 'outreach.stop_campaign_for_customer',
      type: 'action',
      module: 'outreach-campaigns',
      labelKey: 'workflow.outreach.actions.stopForCustomer.label',
      icon: 'CircleStop',
      fields: [],
      backendSupport: true,
    },
  ],

  variables: [
    { key: 'campaign.name', labelKey: 'workflow.variables.campaignName' },
    { key: 'campaign.channel', labelKey: 'workflow.variables.campaignChannel' },
    { key: 'customer.name', labelKey: 'workflow.variables.customerName' },
    { key: 'customer.phone', labelKey: 'workflow.variables.customerPhone' },
    { key: 'customer.email', labelKey: 'workflow.variables.customerEmail' },
  ],
}

registerWorkflowModule(outreachWorkflowDefinition)

export default outreachWorkflowDefinition
