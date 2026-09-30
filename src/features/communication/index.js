// Public API of the Communication hub (Conversations, Calls, Meetings, Team chat).
// See README.md in this folder.
export {
  COMMUNICATION_MODULES,
  COMMUNICATION_MODULE_IDS,
  COMMUNICATION_PAGES,
  getCommunicationModule,
  getCommunicationPagePath,
} from './constants/communicationModules'
export { getCommunicationSidebarConfig } from './navigation/communicationNavigation'
export { CommunicationModuleLayout } from './components/CommunicationModuleLayout'
export { CommunicationCalendar } from './components/CommunicationCalendar'
export { CommunicationAutomation } from './components/CommunicationAutomation'
export { ActivityReports } from './components/ActivityReports'
export { buildAssigneeBreakdown, countBy } from './utils/activityReport'
