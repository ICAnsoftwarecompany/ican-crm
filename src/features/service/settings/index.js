/** Settings sub-module public surface (re-exported from features/service). */
export { SettingsWorkspace } from './components/SettingsWorkspace'
export { SETTINGS_GROUPS, SETTINGS_RESOURCES, getSettingsResource, getSettingsSlug } from './resources'
export { useResourceList, useResourceMutations } from './api/settingsApi'
