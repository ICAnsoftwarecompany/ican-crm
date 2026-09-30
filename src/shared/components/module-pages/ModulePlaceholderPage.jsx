import { useTranslation } from 'react-i18next'
import { CircleDashed } from 'lucide-react'
import { ModulePageHeader } from './ModulePageHeader'
import { ModuleNotice } from './ModuleNotice'

/**
 * A module page whose UI or backend is not built yet. Shows what the page WILL contain
 * (`plannedItems`, already translated) instead of fake data, so the route exists, the sub-sidebar
 * link works, and nobody mistakes it for a finished feature.
 */
export function ModulePlaceholderPage({ icon, title, description, plannedItems = [], notice, actions, children }) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <ModulePageHeader icon={icon} title={title} description={description} actions={actions} />
      <ModuleNotice tone="warning">{notice || t('modulePages.placeholder.notConnected')}</ModuleNotice>

      {plannedItems.length > 0 && (
        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <h2 className="mb-3 text-sm font-bold text-[var(--text)]">{t('modulePages.placeholder.plannedTitle')}</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {plannedItems.map((item) => (
              <li key={item} className="flex items-start gap-2 rounded-md bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text-muted)]">
                <CircleDashed size={15} className="mt-0.5 shrink-0 text-[var(--text-light)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {children}
    </div>
  )
}
