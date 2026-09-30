import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Settings } from 'lucide-react'
import { Tabs } from '../ui/Tabs'
import { ModulePageHeader } from './ModulePageHeader'
import { resolveActiveSectionId } from './moduleSettingsUtils'

/**
 * A module's own "Settings" page that renders SELECTED sections of the app-wide settings.
 * It never owns settings UI itself: callers pass sections taken from the settings registry
 * (pages/settings/registry/settingsSections.jsx), so the same section renders identically here and
 * under /settings.
 *
 * @param {object} props
 * @param {{ id: string, label: string, description?: string, element: React.ReactNode }[]} props.sections
 * @param {string} [props.fullSettingsPath] - Link to the full settings page (e.g. '/settings').
 */
export function ModuleSettingsPage({ icon = Settings, title, description, sections = [], fullSettingsPath }) {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeId = resolveActiveSectionId(sections, searchParams.get('section'))
  const activeSection = sections.find((section) => section.id === activeId)

  const selectSection = (id) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.set('section', id)
      return next
    }, { replace: true })
  }

  return (
    <div className="space-y-4">
      <ModulePageHeader
        icon={icon}
        title={title}
        description={description}
        actions={fullSettingsPath && (
          <Link
            to={fullSettingsPath}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--border)] px-4 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-2)]"
          >
            <Settings size={15} />
            {t('modulePages.settings.openAllSettings')}
          </Link>
        )}
      />

      {sections.length === 0 ? (
        <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--text-muted)]">
          {t('modulePages.settings.noSections')}
        </p>
      ) : (
        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          {sections.length > 1 && (
            <Tabs
              variant="underline"
              items={sections.map((section) => ({ id: section.id, label: section.label }))}
              active={activeId}
              onChange={selectSection}
            />
          )}
          <div className="p-4">
            {activeSection?.description && (
              <p className="mb-4 text-sm text-[var(--text-muted)]">{activeSection.description}</p>
            )}
            {activeSection?.element}
          </div>
        </section>
      )}
    </div>
  )
}
