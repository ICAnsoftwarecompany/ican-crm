import { capabilitiesHandlers } from './capabilitiesHandlers'
import { casesHandlers } from './casesHandlers'
import { communicationHandlers } from './communicationHandlers'
import { contactsHandlers } from './contactsHandlers'
import { myWorkHandlers } from './myWorkHandlers'
import { settingsHandlers } from './settingsHandlers'

/**
 * Every mock route of the Service area. A new sub-module adds ONE line here
 * with its `<module>Handlers.js` file.
 * @type {import('../router').MockRoute[]}
 */
export const mockRoutes = [
  ...capabilitiesHandlers,
  ...casesHandlers,
  ...communicationHandlers,
  ...contactsHandlers,
  ...myWorkHandlers,
  ...settingsHandlers,
]
