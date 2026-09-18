import { createEmptyWorkflow, createStep } from '../core/workflowDomainModel'

/**
 * Predefined workflow graphs (see docs "Workflow Templates"). A template
 * is just a `Workflow` value pre-filled with real, registered trigger/
 * action ids — there is no separate "template execution" concept; picking
 * one from the Automation Center simply opens the Builder with this as
 * `initialWorkflow`.
 *
 * `build()` is a factory (not a static object) so every use gets fresh
 * step ids — reusing the same ids across two workflows would corrupt tree
 * edits in utils/workflowTreeEditor.js.
 */
export const WORKFLOW_TEMPLATES = [
  {
    id: 'follow_up_new_lead',
    labelKey: 'workflow.templates.followUpNewLead.label',
    descriptionKey: 'workflow.templates.followUpNewLead.description',
    module: 'leads',
    build: () => {
      const workflow = createEmptyWorkflow({ module: 'leads', entity: 'lead' })
      workflow.trigger = { definitionId: 'lead.created', config: {} }
      const wait = createStep('wait', { config: { mode: 'duration', value: 10, unit: 'minutes' } })
      wait.next = createStep('action', { definitionId: 'task.create', config: { title: 'تواصل مع العميل الجديد' } })
      workflow.rootStep = wait
      return workflow
    },
  },
  {
    id: 'retarget_no_reply',
    labelKey: 'workflow.templates.retargetNoReply.label',
    descriptionKey: 'workflow.templates.retargetNoReply.description',
    module: 'outreach-campaigns',
    build: () => {
      const workflow = createEmptyWorkflow({ module: 'outreach-campaigns', entity: 'campaign' })
      workflow.trigger = { definitionId: 'campaign.message_sent', config: {} }
      const waitForReply = createStep('wait_for_event', {
        config: { eventTriggerId: 'campaign.message_replied', timeout: { value: 2, unit: 'days' } },
        branches: { resolved: createStep('end'), timeout: createStep('action', { definitionId: 'outreach.send_gmail', config: {} }) },
      })
      workflow.rootStep = waitForReply
      return workflow
    },
  },
  {
    id: 'high_intent_to_opportunity',
    labelKey: 'workflow.templates.highIntentToOpportunity.label',
    descriptionKey: 'workflow.templates.highIntentToOpportunity.description',
    module: 'outreach-campaigns',
    build: () => {
      const workflow = createEmptyWorkflow({ module: 'outreach-campaigns', entity: 'campaign' })
      workflow.trigger = { definitionId: 'campaign.message_replied', config: {} }
      const createOpportunity = createStep('action', { definitionId: 'opportunity.create', config: {} })
      createOpportunity.next = createStep('action', { definitionId: 'task.create', config: { title: 'تواصل مع العميل صاحب نية الشراء العالية' } })
      const condition = createStep('condition', {
        config: { conditions: [{ field: 'campaign.channel', fieldLabel: 'القناة', operator: 'equals', value: 'whatsapp', source: 'outreach_channels' }] },
        branches: { true: createOpportunity, false: createStep('end') },
      })
      workflow.rootStep = condition
      return workflow
    },
  },
  {
    id: 'task_overdue_reminder',
    labelKey: 'workflow.templates.taskOverdueReminder.label',
    descriptionKey: 'workflow.templates.taskOverdueReminder.description',
    module: 'tasks',
    build: () => {
      const workflow = createEmptyWorkflow({ module: 'tasks', entity: 'task' })
      workflow.trigger = { definitionId: 'task.overdue', config: {} }
      workflow.rootStep = createStep('action', { definitionId: 'notification.send', config: {} })
      return workflow
    },
  },
  {
    id: 'won_deal_follow_up',
    labelKey: 'workflow.templates.wonDealFollowUp.label',
    descriptionKey: 'workflow.templates.wonDealFollowUp.description',
    module: 'opportunities',
    build: () => {
      const workflow = createEmptyWorkflow({ module: 'opportunities', entity: 'opportunity' })
      workflow.trigger = { definitionId: 'opportunity.won', config: {} }
      const wait = createStep('wait', { config: { mode: 'duration', value: 1, unit: 'days' } })
      wait.next = createStep('action', { definitionId: 'task.create', config: { title: 'متابعة العميل بعد الفوز بالصفقة' } })
      workflow.rootStep = wait
      return workflow
    },
  },
]
