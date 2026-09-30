import { MessageSquare, MessagesSquare, PhoneCall, Presentation } from 'lucide-react'

/**
 * The Communication hub ("التواصل والتعاون"): four modules that serve Sales AND Customer Hub
 * (and, for meetings/team chat, internal teamwork). Each one gets the same sub-sidebar pages
 * (see COMMUNICATION_PAGES). Everything module-specific lives in this one registry.
 *
 * @typedef {Object} CommunicationModule
 * @property {string} id - Stable id; also the i18n key under `communication.modules.<id>`.
 * @property {string} basePath - Existing/new top-level route. Never change `/conversations` or `/team-chat`.
 * @property {React.ComponentType} icon
 * @property {string[]} calendarSourceIds - Ids from features/calendar's source registry shown on its calendar page.
 * @property {{ module: string, entity: string }} workflowContext - Context passed to the shared WorkflowBuilder.
 * @property {string[]} settingsSectionIds - Section ids from pages/settings/registry/settingsSections.jsx.
 * @property {string[]} aiCapabilities - Capability ids; labels at `communication.modules.<id>.ai.<capability>`.
 * @property {string[]} plannedCustomization - Keys under `communication.modules.<id>.customization.items`.
 * @property {boolean} fullBleedIndex - The main view is a full-height workspace (chat inboxes): no page padding.
 */

/** @type {CommunicationModule[]} */
export const COMMUNICATION_MODULES = [
  {
    id: 'conversations',
    basePath: '/conversations',
    icon: MessageSquare,
    calendarSourceIds: [],
    workflowContext: { module: 'conversations', entity: 'conversation' },
    settingsSectionIds: ['communication.conversations', 'integrations'],
    aiCapabilities: ['suggestReplies', 'summarizeThread', 'detectIntent', 'autoTag', 'autoReply'],
    plannedCustomization: ['quickReplies', 'labels', 'channelsOrder', 'threadColumns'],
    fullBleedIndex: true,
  },
  {
    id: 'calls',
    basePath: '/calls',
    icon: PhoneCall,
    calendarSourceIds: ['calls'],
    workflowContext: { module: 'calls', entity: 'call' },
    settingsSectionIds: ['communication.calls', 'users'],
    aiCapabilities: ['prepareBrief', 'summarizeCall', 'suggestNextAction', 'scoreOutcome'],
    plannedCustomization: ['outcomes', 'reportFields', 'tableColumns', 'priorities'],
    fullBleedIndex: false,
  },
  {
    id: 'meetings',
    basePath: '/meetings',
    icon: Presentation,
    calendarSourceIds: ['meetings'],
    workflowContext: { module: 'meetings', entity: 'meeting' },
    settingsSectionIds: ['communication.meetings', 'users'],
    aiCapabilities: ['prepareAgenda', 'summarizeMeeting', 'extractActionItems', 'suggestNextAction'],
    plannedCustomization: ['meetingTypes', 'reportTemplates', 'agendaTemplates', 'tableColumns'],
    fullBleedIndex: false,
  },
  {
    id: 'team-chat',
    basePath: '/team-chat',
    icon: MessagesSquare,
    calendarSourceIds: [],
    workflowContext: { module: 'team-chat', entity: 'chat_conversation' },
    settingsSectionIds: ['communication.team-chat', 'users'],
    aiCapabilities: ['summarizeUnread', 'suggestReplies', 'createTasksFromMessages'],
    plannedCustomization: ['channelTypes', 'reactions', 'pinnedLimits', 'notificationDefaults'],
    fullBleedIndex: true,
  },
]

/** Sub-pages every communication module exposes, in sub-sidebar order. `path: ''` is the index view. */
export const COMMUNICATION_PAGES = [
  { id: 'view', path: '' },
  { id: 'create', path: 'create' },
  { id: 'reports', path: 'reports' },
  { id: 'calendar', path: 'calendar' },
  { id: 'automation', path: 'automation' },
  { id: 'customization', path: 'customization' },
  { id: 'ai', path: 'ai' },
  { id: 'settings', path: 'settings' },
]

export const COMMUNICATION_MODULE_IDS = COMMUNICATION_MODULES.map((module) => module.id)

export function getCommunicationModule(moduleId) {
  return COMMUNICATION_MODULES.find((module) => module.id === moduleId) || null
}

export function getCommunicationPagePath(module, pageId) {
  const page = COMMUNICATION_PAGES.find((entry) => entry.id === pageId)
  if (!module || !page) return null
  return page.path ? `${module.basePath}/${page.path}` : module.basePath
}
