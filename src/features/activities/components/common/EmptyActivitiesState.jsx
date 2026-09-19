import { CalendarClock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../../../shared/components/ui/Button'

export function EmptyActivitiesState({ title, description, onCreate, onClearFilters }) {
  const { t } = useTranslation()
  const resolvedTitle = title ?? t('activities.emptyState.defaultTitle')
  const resolvedDescription = description ?? t('activities.emptyState.defaultDescription')

  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[#E8F9FA] text-[#007A80]">
        <CalendarClock size={22} />
      </div>
      <h3 className="text-base font-black text-[var(--text)]">{resolvedTitle}</h3>
      <p className="mt-1 max-w-md text-sm font-semibold text-[var(--text-muted)]">{resolvedDescription}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {onCreate ? (
          <Button variant="ai" onClick={onCreate}>
            {t('activities.emptyState.createActivity')}
          </Button>
        ) : null}
        {onClearFilters ? (
          <Button variant="outline" onClick={onClearFilters}>
            {t('activities.emptyState.clearFilters')}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
