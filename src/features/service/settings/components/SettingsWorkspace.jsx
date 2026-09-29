import { NavLink, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../../shared/utils/cn'
import { EmptyState } from '../../../../shared/components/feedback/EmptyState'
import { SETTINGS_GROUPS, getSettingsResource, getSettingsSlug } from '../resources'
import { ResourceSettingsPanel } from './ResourceSettingsPanel'

/**
 * Settings shell: grouped internal navigation + the selected resource panel.
 * `basePath` is supplied by the page so the feature never hardcodes routes.
 */
export function SettingsWorkspace({ section, basePath }) {
  const { t } = useTranslation()
  const firstSlug = getSettingsSlug(SETTINGS_GROUPS[0].resources[0].key)
  if (!section) return <Navigate to={`${basePath}/${firstSlug}`} replace />
  const resource = getSettingsResource(section)

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav aria-label={t('service.settings.title')} className="grid content-start gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
        {SETTINGS_GROUPS.map((group) => (
          <div key={group.key} className="grid gap-1">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              {t(`service.settings.groups.${group.key}`)}
            </p>
            {group.resources.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.key}
                  to={`${basePath}/${getSettingsSlug(item.key)}`}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                      isActive ? 'bg-[var(--surface-2)] font-medium text-[var(--text)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
                    )
                  }
                >
                  <Icon size={15} aria-hidden="true" />
                  {t(`${item.i18nKey}.title`)}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>
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
