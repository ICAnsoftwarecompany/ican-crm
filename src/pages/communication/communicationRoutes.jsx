import { ActivitiesPage } from '../../features/activities'
import { CommunicationModuleLayout } from '../../features/communication'
import { ConversationsPage } from '../conversations/ConversationsPage'
import { InternalChatPage } from '../chat/InternalChatPage'
import {
  CommunicationAiPage,
  CommunicationAutomationPage,
  CommunicationCalendarPage,
  CommunicationCreatePage,
  CommunicationCustomizationPage,
  CommunicationModuleSettingsPage,
  CommunicationReportsPage,
} from './CommunicationPages'

/** The main ("view") page of each module. Conversations and team chat keep their existing pages. */
const INDEX_ELEMENTS = {
  conversations: <ConversationsPage />,
  calls: <ActivitiesPage lockedType="call" embedded />,
  meetings: <ActivitiesPage lockedType="meeting" embedded />,
  'team-chat': <InternalChatPage />,
}

function buildModuleRoute(moduleId, path) {
  return {
    path,
    element: <CommunicationModuleLayout moduleId={moduleId} />,
    children: [
      { index: true, element: INDEX_ELEMENTS[moduleId] },
      { path: 'create', element: <CommunicationCreatePage moduleId={moduleId} /> },
      { path: 'reports', element: <CommunicationReportsPage moduleId={moduleId} /> },
      { path: 'calendar', element: <CommunicationCalendarPage moduleId={moduleId} /> },
      { path: 'automation', element: <CommunicationAutomationPage moduleId={moduleId} /> },
      { path: 'customization', element: <CommunicationCustomizationPage moduleId={moduleId} /> },
      { path: 'ai', element: <CommunicationAiPage moduleId={moduleId} /> },
      { path: 'settings', element: <CommunicationModuleSettingsPage moduleId={moduleId} /> },
    ],
  }
}

/**
 * Route objects for the Communication hub (added 2026-10-01). Spread into the MainLayout children
 * in app/router. `/conversations` and `/team-chat` keep their URLs; `/calls` and `/meetings` are new.
 * Paths must match features/communication COMMUNICATION_MODULES[].basePath.
 */
export const communicationRoutes = [
  buildModuleRoute('conversations', 'conversations'),
  buildModuleRoute('calls', 'calls'),
  buildModuleRoute('meetings', 'meetings'),
  buildModuleRoute('team-chat', 'team-chat'),
]
