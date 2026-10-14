import { useTranslation } from 'react-i18next'
import { HelpScope } from '../components/common/HelpTip'
import { QuickAddForm } from './components/QuickAddForm'
import { QuickAddSidebar } from './components/QuickAddSidebar'
import { useQuickAdd } from './hooks/useQuickAdd'

/** Quick add mode of `/products/new` (2026-10-15): the one-row form next to the list of what was added. */
export function QuickAddMode({ kind, lookups }) {
  const { t } = useTranslation()
  const quick = useQuickAdd({ kind, t })
  return (
    <HelpScope>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <QuickAddForm kind={kind} quick={quick} lookups={lookups} />
        <QuickAddSidebar kind={kind} added={quick.added} categories={lookups.categories} />
      </div>
    </HelpScope>
  )
}
