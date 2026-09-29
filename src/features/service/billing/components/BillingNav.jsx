import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../../shared/utils/cn'

const VIEWS = ['schedules', 'collections', 'calculator']

/** Segmented switch inside the Payments tab: schedules · collections · plan calculator. */
export function BillingNav({ basePath }) {
  const { t } = useTranslation()
  return (
    <nav aria-label={t('service.hub.billing')} className="inline-flex w-fit gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1">
      {VIEWS.map((view) => (
        <NavLink
          key={view}
          to={`${basePath}/${view}`}
          className={({ isActive }) =>
            cn(
              'rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent',
              isActive ? 'bg-[var(--surface-2)] font-semibold text-[var(--text)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            )
          }
        >
          {t(`service.billing.views.${view}`)}
        </NavLink>
      ))}
    </nav>
  )
}
