import { AlertTriangle, Bell, BriefcaseBusiness, CalendarClock, CheckSquare, Eye, Mail, Megaphone, MessageCircle, Send, UserCheck, UserRoundPlus, Users } from 'lucide-react'

const leadTarget = (data) => data.lead_id ? `/lead/${data.lead_id}` : ''
const dealTarget = (data) => data.deal_id ? `/deals/${data.deal_id}` : leadTarget(data)

export const notificationRegistry = {
  deal_assigned: { category: 'sales', icon: UserCheck, tone: 'sales', titleKey: 'notifications.types.dealAssigned', getTarget: dealTarget },
  'alert.classification_sla_breached': { category: 'sales', icon: AlertTriangle, tone: 'warning', titleKey: 'notifications.types.classificationSlaBreached', getTarget: leadTarget },
  deal_lead_added: { category: 'sales', icon: BriefcaseBusiness, tone: 'sales', titleKey: 'notifications.types.dealLeadAdded', getTarget: dealTarget },
  'alert.stale_lead': { category: 'sales', icon: AlertTriangle, tone: 'warning', titleKey: 'notifications.types.staleLead', getTarget: leadTarget },
  'task.shared': { category: 'tasks', icon: CheckSquare, tone: 'tasks', titleKey: 'notifications.types.taskShared', getTarget: () => '/tasks' },
  'task.reminder': { category: 'tasks', icon: CalendarClock, tone: 'tasks', titleKey: 'notifications.types.taskReminder', getTarget: () => '/tasks' },
  'meeting.created': { category: 'calendar', icon: CalendarClock, tone: 'calendar', titleKey: 'notifications.types.meetingCreated', getTarget: (data) => data.lead_id ? `/lead/${data.lead_id}?tab=meetings` : '/meetings' },
  'meeting.reminder': { category: 'calendar', icon: CalendarClock, tone: 'calendar', titleKey: 'notifications.types.meetingReminder', getTarget: (data) => data.lead_id ? `/lead/${data.lead_id}?tab=meetings` : '/meetings' },
  'messenger.conversation.assigned': { category: 'communication', icon: MessageCircle, tone: 'communication', titleKey: 'notifications.types.messengerConversationAssigned', getTarget: () => '/conversations' },
  'gmail.conversation.assigned': { category: 'communication', icon: Mail, tone: 'communication', titleKey: 'notifications.types.gmailConversationAssigned', getTarget: () => '/conversations?channel=gmail' },
  'whatsapp.conversation.assigned': { category: 'communication', icon: MessageCircle, tone: 'communication', titleKey: 'notifications.types.whatsappConversationAssigned', getTarget: () => '/conversations?channel=whatsapp' },
  'chat.added_to_group': { category: 'communication', icon: Users, tone: 'communication', titleKey: 'notifications.types.chatAddedToGroup', getTarget: () => '/team-chat' },
  'proposal.viewed': { category: 'sales', icon: Eye, tone: 'info', titleKey: 'notifications.types.proposalViewed', getTarget: leadTarget },
  'proposal.option_selected': { category: 'sales', icon: CheckSquare, tone: 'success', titleKey: 'notifications.types.proposalOptionSelected', getTarget: leadTarget },
  'proposal.accepted': { category: 'sales', icon: UserCheck, tone: 'success', titleKey: 'notifications.types.proposalAccepted', getTarget: leadTarget },
  'campaign.chat.assigned': { category: 'marketing', icon: Send, tone: 'marketing', titleKey: 'notifications.types.campaignChatAssigned', getTarget: () => '/outreach-campaigns/all' },

  lead_assigned: { category: 'sales', icon: UserRoundPlus, tone: 'sales', titleKey: 'notifications.types.leadAssigned', getTarget: leadTarget },
  lead_created: { category: 'sales', icon: UserRoundPlus, tone: 'sales', titleKey: 'notifications.types.leadCreated', getTarget: leadTarget },
  task_assigned: { category: 'tasks', icon: CheckSquare, tone: 'tasks', titleKey: 'notifications.types.taskAssigned', getTarget: () => '/tasks' },
  task_due: { category: 'tasks', icon: CalendarClock, tone: 'tasks', titleKey: 'notifications.types.taskDue', getTarget: () => '/tasks' },
  meeting_reminder: { category: 'calendar', icon: CalendarClock, tone: 'calendar', titleKey: 'notifications.types.meetingReminder', getTarget: () => '/meetings' },
  call_reminder: { category: 'calendar', icon: CalendarClock, tone: 'calendar', titleKey: 'notifications.types.callReminder', getTarget: () => '/calls' },
  message_received: { category: 'communication', icon: MessageCircle, tone: 'communication', titleKey: 'notifications.types.messageReceived', getTarget: () => '/conversations' },
  campaign_finished: { category: 'marketing', icon: Megaphone, tone: 'marketing', titleKey: 'notifications.types.campaignFinished' },
  campaign_failed: { category: 'marketing', icon: Megaphone, tone: 'danger', titleKey: 'notifications.types.campaignFailed' },
}

export const fallbackNotificationDefinition = { category: 'system', icon: Bell, tone: 'system', titleKey: 'notifications.types.general' }

const filterTypeValues = [
  'deal_assigned',
  'alert.classification_sla_breached',
  'deal_lead_added',
  'alert.stale_lead',
  'task.shared',
  'task.reminder',
  'meeting.created',
  'meeting.reminder',
  'messenger.conversation.assigned',
  'gmail.conversation.assigned',
  'whatsapp.conversation.assigned',
  'chat.added_to_group',
  'proposal.viewed',
  'proposal.option_selected',
  'proposal.accepted',
  'campaign.chat.assigned',
]

export const notificationTypeOptions = filterTypeValues.map((value) => ({ value, labelKey: notificationRegistry[value].titleKey }))

export function getNotificationDefinition(type) {
  return notificationRegistry[String(type || '').toLowerCase()] || fallbackNotificationDefinition
}
