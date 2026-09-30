import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SubSidebarFrame, SubSidebarNav } from '../../../../shared/components/sub-sidebar'
import { EmptyState } from '../../../../shared/components/feedback/EmptyState'
import { SETTINGS_GROUPS, getSettingsResource, getSettingsSlug } from '../resources'
import { ResourceSettingsPanel } from './ResourceSettingsPanel'

/**
 * Settings shell: grouped internal navigation (shared sub-sidebar, 2026-10-01) + the selected
 * resource panel. `basePath` is supplied by the page so the feature never hardcodes routes.
 */
export function SettingsWorkspace({ section, basePath }) {
  const { t } = useTranslation()
  const firstSlug = getSettingsSlug((SETTINGS_GROUPS.find((group) => group.key === 'cases') || SETTINGS_GROUPS[0]).resources[0].key)
  if (!section) return <Navigate to={`${basePath}/${firstSlug}`} replace />
  const resource = getSettingsResource(section)
  const groups = SETTINGS_GROUPS.map((group) => ({
    id: group.key,
    label: t(`service.settings.groups.${group.key}`),
    items: group.resources.map((item) => ({
      id: item.key,
      to: `${basePath}/${getSettingsSlug(item.key)}`,
      label: t(`${item.i18nKey}.title`),
      icon: item.icon,
    })),
  }))

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
      <SubSidebarFrame variant="framed" ariaLabel={t('service.settings.title')} className="self-start">
        <SubSidebarNav groups={groups} ariaLabel={t('service.settings.title')} />
      </SubSidebarFrame>
      <div className="min-w-0">
        {resource?.component ? (
          <resource.component key={resource.key} resource={resource} />
        ) : resource ? (
          <ResourceSettingsPanel key={resource.key} resource={resource} />
        ) : (
          <EmptyState title={t('service.settings.notFound')} />
        )}
      </div>
    </div>
  )
}
