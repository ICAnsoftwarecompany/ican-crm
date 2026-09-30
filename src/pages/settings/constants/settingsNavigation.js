import { Palette, Settings, Tags, UserPlus, Workflow } from 'lucide-react'
import { COMMUNICATION_MODULES } from '../../../features/communication'

export const SETTINGS_ROUTE = '/settings'

/**
 * Settings sub-sidebar groups. Labels are i18n keys since 2026-10-01 (they used to be hardcoded
 * Arabic). The "communication" group links to the same sections the Communication hub modules show
 * on their own /<module>/settings page (see ../registry/settingsSections.jsx).
 */
export function getSettingsNavigationGroups(t) {
  return [
    {
      id: 'general',
      label: t('settings.nav.groups.general'),
      items: [
        { to: `${SETTINGS_ROUTE}/definitions`, label: t('settings.sections.definitions.label'), icon: Tags },
        { to: `${SETTINGS_ROUTE}/users`, label: t('settings.sections.users.label'), icon: UserPlus },
        { to: `${SETTINGS_ROUTE}/integrations`, label: t('settings.sections.integrations.label'), icon: Workflow },
        { to: `${SETTINGS_ROUTE}/appearance`, label: t('branding.appearance.nav.title'), icon: Palette },
      ],
    },
    {
      id: 'communication',
      label: t('settings.nav.groups.communication'),
      items: COMMUNICATION_MODULES.map((module) => ({
        to: `${SETTINGS_ROUTE}/communication/${module.id}`,
        label: t(`communication.modules.${module.id}.title`),
        icon: module.icon,
      })),
    },
  ]
}

/** Everything <SubSidebarLayout sidebar={...}> needs for /settings. */
export function getSettingsSidebarConfig(t) {
  return {
    header: {
      icon: Settings,
      title: t('settings.nav.title'),
      description: t('settings.nav.subtitle'),
    },
    ariaLabel: t('settings.nav.menu'),
    groups: getSettingsNavigationGroups(t),
  }
}
