import { assetsHandlers } from './assetsHandlers'
import { capabilitiesHandlers } from './capabilitiesHandlers'
import { casesHandlers } from './casesHandlers'
import { catalogHandlers } from './catalogHandlers'
import { communicationHandlers } from './communicationHandlers'
import { contactsHandlers } from './contactsHandlers'
import { insightsHandlers } from './insightsHandlers'
import { myWorkHandlers } from './myWorkHandlers'
import { recordsHandlers } from './recordsHandlers'
import { settingsHandlers } from './settingsHandlers'

/**
 * Every mock route of the Service area. A new sub-module adds ONE line here
 * with its `<module>Handlers.js` file.
 * @type {import('../router').MockRoute[]}
 */
export const mockRoutes = [
  ...assetsHandlers,
  ...capabilitiesHandlers,
  ...casesHandlers,
  ...catalogHandlers,
  ...communicationHandlers,
  ...contactsHandlers,
  ...insightsHandlers,
  ...myWorkHandlers,
  ...recordsHandlers,
  ...settingsHandlers,
]
