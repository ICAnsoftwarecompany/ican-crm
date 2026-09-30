import { COMMUNICATION_MODULES } from '../../../features/communication'
import { DefinitionsSettingsPage } from '../pages/definitions/DefinitionsSettingsPage'
import { UsersSettingsPage } from '../pages/users/UsersSettingsPage'
import { IntegrationsSettingsPage } from '../pages/integrations/IntegrationsSettingsPage'
import { AppearanceSettingsPage } from '../pages/appearance/AppearanceSettingsPage'
import { CommunicationSettingsSection } from '../pages/communication/CommunicationSettingsSection'

/**
 * Single source of every settings section (added 2026-10-01).
 *
 * Both places render from here, so a section looks and behaves the same everywhere:
 * - the app-wide settings routes under /settings/*
 * - a module's own settings page (shared ModuleSettingsPage) that shows only the sections it
 *   lists, e.g. the Communication hub's `settingsSectionIds`.
 *
 * Add a section: add an entry here + `settings.sections.<id>` label/description keys (ar + en),
 * then reference its id from the module or add a /settings route.
 */
const SECTIONS = [
  { id: 'definitions', render: () => <DefinitionsSettingsPage /> },
  { id: 'users', render: () => <UsersSettingsPage /> },
  { id: 'integrations', render: () => <IntegrationsSettingsPage /> },
  { id: 'appearance', render: () => <AppearanceSettingsPage /> },
  ...COMMUNICATION_MODULES.map((module) => ({
    id: `communication.${module.id}`,
    render: () => <CommunicationSettingsSection moduleId={module.id} />,
  })),
]

export const SETTINGS_SECTION_IDS = SECTIONS.map((section) => section.id)

function labelKey(id) {
  return id.startsWith('communication.')
    ? `communication.modules.${id.slice('communication.'.length)}.title`
    : `settings.sections.${id}.label`
}

function descriptionKey(id) {
  return id.startsWith('communication.')
    ? 'settings.communication.sectionDescription'
    : `settings.sections.${id}.description`
}

/** Sections for the given ids, in the given order, ready for <ModuleSettingsPage sections>. Unknown ids are skipped. */
export function getSettingsSections(ids = [], t) {
  return ids
    .map((id) => SECTIONS.find((section) => section.id === id))
    .filter(Boolean)
    .map((section) => ({
      id: section.id,
      label: t(labelKey(section.id)),
      description: t(descriptionKey(section.id)),
      element: section.render(),
    }))
}

/** Renders one section by id (used by the /settings/communication/:moduleId routes). */
export function SettingsSectionOutlet({ sectionId }) {
  const section = SECTIONS.find((entry) => entry.id === sectionId)
  return section ? section.render() : null
}
