import { aiHandlers } from './aiHandlers'
import { aiAgentHandlers } from './aiAgentHandlers'
import { healthHandlers } from './healthHandlers'
import { apiAccessHandlers } from './apiAccessHandlers'
import { assetsHandlers } from './assetsHandlers'
import { billingHandlers } from './billingHandlers'
import { billingSchedulesHandlers } from './billingSchedulesHandlers'
import { capabilitiesHandlers } from './capabilitiesHandlers'
import { casesHandlers } from './casesHandlers'
import { catalogHandlers } from './catalogHandlers'
import { communicationHandlers } from './communicationHandlers'
import { contactsHandlers } from './contactsHandlers'
import { contractsHandlers } from './contractsHandlers'
import { deliveriesHandlers } from './deliveriesHandlers'
import { followUpsHandlers } from './followUpsHandlers'
import { importsHandlers } from './importsHandlers'
import { kbHandlers } from './kbHandlers'
import { insightsHandlers } from './insightsHandlers'
import { myWorkHandlers } from './myWorkHandlers'
import { portalAdminHandlers } from './portalAdminHandlers'
import { portalHandlers } from './portalHandlers'
import { portalKbHandlers } from './portalKbHandlers'
import { qualityHandlers } from './qualityHandlers'
import { recordsHandlers } from './recordsHandlers'
import { settingsHandlers } from './settingsHandlers'
import { schedulingHandlers } from './schedulingHandlers'
import { setupHandlers } from './setupHandlers'
import { subscriptionsHandlers } from './subscriptionsHandlers'

/**
 * Every mock route of the Service area. A new sub-module adds ONE line here
 * with its `<module>Handlers.js` file.
 * @type {import('../router').MockRoute[]}
 */
export const mockRoutes = [
  ...aiHandlers,
  ...aiAgentHandlers,
  ...healthHandlers,
  ...apiAccessHandlers,
  ...assetsHandlers,
  ...billingHandlers,
  ...billingSchedulesHandlers,
  ...capabilitiesHandlers,
  ...casesHandlers,
  ...catalogHandlers,
  ...communicationHandlers,
  ...contactsHandlers,
  ...contractsHandlers,
  ...deliveriesHandlers,
  ...followUpsHandlers,
  ...importsHandlers,
  ...kbHandlers,
  ...insightsHandlers,
  ...myWorkHandlers,
  ...portalAdminHandlers,
  ...portalKbHandlers,
  ...portalHandlers,
  ...qualityHandlers,
  ...recordsHandlers,
  ...settingsHandlers,
  ...schedulingHandlers,
  ...setupHandlers,
  ...subscriptionsHandlers,
]
